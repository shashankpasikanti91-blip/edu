import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { TenantType } from '@prisma/client';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from '../../shared/errors';
import {
  AuditAction,
  AccountType,
  MAX_LOGIN_ATTEMPTS,
  LOCK_DURATION_MINUTES,
  DEMO_EMAILS,
  EMAIL_TOKEN_EXPIRY_HOURS,
  PASSWORD_RESET_EXPIRY_HOURS,
  TokenType,
} from '../../shared/constants';
import { logger } from '../../shared/utils/logger';
import { emailService } from '../../shared/services/email.service';
import { ownerNotifyService } from '../../shared/services/ownerNotify.service';
import type {
  SignupInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  InstitutionSignupInput,
} from './auth.validation';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    accountType: string;
    emailVerified: boolean;
    tenantId: string | null;
    directStudentId: string | null;
  };
  tokens: TokenPair;
}

class AuthService {
  // Generate the next direct student ID (IND-STU-000001)
  private async generateDirectStudentId(): Promise<string> {
    const counter = await prisma.idCounter.upsert({
      where: { name: 'direct_student' },
      update: { lastValue: { increment: 1 } },
      create: { name: 'direct_student', lastValue: 1 },
    });
    return `IND-STU-${String(counter.lastValue).padStart(6, '0')}`;
  }

  // Generate a unique referral code
  private generateReferralCode(firstName: string): string {
    const prefix = firstName.slice(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  }

  async signup(
    data: SignupInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Determine account type
    const isB2C = !data.tenantId;
    const accountType = isB2C ? AccountType.B2C_STUDENT : AccountType.B2B_INSTITUTION;
    const directStudentId = isB2C ? await this.generateDirectStudentId() : null;
    const referralCode = isB2C ? this.generateReferralCode(data.firstName) : null;

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: isB2C ? 'STUDENT' : data.role,
        tenantId: data.tenantId || null,
        accountType,
        directStudentId,
        referralCode,
        referredBy: (data as Record<string, string>).referralCode || null,
        status: 'PENDING_VERIFICATION',
      },
    });

    // Create student profile for B2C students
    if (isB2C) {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          grade: (data as Record<string, string>).grade || null,
          goalDescription: (data as Record<string, string>).goal || null,
          courseName: (data as Record<string, string>).courseName || null,
        },
      });
    }

    // Generate email verification token
    const verificationToken = uuidv4();
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() + EMAIL_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });

    // Send verification email (non-blocking)
    emailService
      .sendVerificationEmail(user.email, user.firstName, verificationToken)
      .catch((err) => logger.error('Failed to send verification email', { err, userId: user.id }));

    // Create session and tokens
    const tokens = await this.createSession(user.id, user.email, user.role, ipAddress, userAgent, user.tenantId, user.accountType);

    // Audit log
    await this.createAuditLog(user.id, isB2C ? AuditAction.B2C_SIGNUP : AuditAction.SIGNUP, ipAddress, userAgent);

    // Handle referral conversion if referred
    if ((data as Record<string, string>).referralCode) {
      this.processReferral((data as Record<string, string>).referralCode, user.id)
        .catch((err) => logger.error('Failed to process referral', { err }));
    }

    logger.info('User signed up', { userId: user.id, role: user.role, accountType });

    // Notify system owner of new registration
    ownerNotifyService.onNewRegistration({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      accountType,
      tenantId: user.tenantId,
    }).catch((err) => logger.error('Owner notification failed', { err }));

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountType: user.accountType,
        emailVerified: user.emailVerified,
        tenantId: user.tenantId,
        directStudentId: user.directStudentId,
      },
      tokens,
    };
  }

  private async processReferral(referralCode: string, referredUserId: string) {
    const referral = await prisma.referral.findUnique({
      where: { referralCode: referralCode },
    });
    if (referral && referral.status === 'PENDING') {
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          referredId: referredUserId,
          status: 'CONVERTED',
          convertedAt: new Date(),
        },
      });
    }
  }

  /**
   * Register a new institution owner.
   * Creates Tenant → User (INSTITUTION_OWNER) → InstitutionProfile.
   */
  async signupInstitution(
    data: InstitutionSignupInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Generate slug from institution name
    const baseSlug = data.institutionName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);

    // Ensure slug uniqueness
    let slug = baseSlug;
    let counter = 0;
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    // Map institution type to tenant type
    const tenantTypeMap: Record<string, TenantType> = {
      SCHOOL: 'SCHOOL',
      COLLEGE: 'COLLEGE',
      UNIVERSITY: 'UNIVERSITY',
      COACHING_INSTITUTE: 'COACHING_INSTITUTE',
      TRAINING_CENTER: 'TRAINING_CENTER',
      POLYTECHNIC: 'COLLEGE',
      ITI: 'TRAINING_CENTER',
      DEEMED_UNIVERSITY: 'UNIVERSITY',
      AUTONOMOUS_COLLEGE: 'COLLEGE',
      AFFILIATED_COLLEGE: 'COLLEGE',
      RESEARCH_INSTITUTE: 'UNIVERSITY',
      OPEN_UNIVERSITY: 'UNIVERSITY',
      COMMUNITY_COLLEGE: 'COLLEGE',
      OTHER: 'TRAINING_CENTER',
    };

    // Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.institutionName,
          slug,
          type: tenantTypeMap[data.institutionType] || 'SCHOOL',
          status: 'ACTIVE',
          email: data.email,
          phone: data.phone,
          country: 'India',
          settings: {
            create: {
              allowStudentSignup: false,
              requireApproval: true,
              allowParentAccess: false,
              enableAiAssistant: true,
            },
          },
        },
      });

      // 2. Create User as INSTITUTION_OWNER
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'INSTITUTION_OWNER',
          tenantId: tenant.id,
          accountType: AccountType.B2B_INSTITUTION,
          phone: data.phone,
          status: 'PENDING_VERIFICATION',
        },
      });

      // 3. Create InstitutionProfile with NOT_STARTED onboarding
      await tx.institutionProfile.create({
        data: {
          tenantId: tenant.id,
          institutionName: data.institutionName,
          institutionType: data.institutionType as any,
          onboardingStatus: 'NOT_STARTED',
        },
      });

      return { user, tenant };
    });

    // Generate email verification token
    const verificationToken = uuidv4();
    await prisma.verificationToken.create({
      data: {
        userId: result.user.id,
        token: verificationToken,
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() + EMAIL_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });

    emailService
      .sendVerificationEmail(result.user.email, result.user.firstName, verificationToken)
      .catch((err) => logger.error('Failed to send verification email', { err, userId: result.user.id }));

    const tokens = await this.createSession(
      result.user.id, result.user.email, result.user.role,
      ipAddress, userAgent, result.tenant.id, AccountType.B2B_INSTITUTION
    );

    await this.createAuditLog(result.user.id, AuditAction.B2C_SIGNUP, ipAddress, userAgent);

    logger.info('Institution owner signed up', {
      userId: result.user.id,
      tenantId: result.tenant.id,
      institutionName: data.institutionName,
    });

    ownerNotifyService.onNewRegistration({
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      role: result.user.role,
      accountType: AccountType.B2B_INSTITUTION,
      tenantId: result.tenant.id,
    }).catch((err) => logger.error('Owner notification failed', { err }));

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        accountType: result.user.accountType,
        emailVerified: result.user.emailVerified,
        tenantId: result.user.tenantId,
        directStudentId: result.user.directStudentId,
      },
      tokens,
    };
  }

  async login(
    data: LoginInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isDemoAccount = DEMO_EMAILS.includes(user.email.toLowerCase());

    // Check if account is locked (demo accounts are never locked)
    if (!isDemoAccount && user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000
      );
      throw new UnauthorizedError(
        `Account is locked. Please try again in ${remainingMinutes} minutes.`
      );
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError(
        'Your account has been suspended. Please contact support.'
      );
    }

    // Verify password
    const isValid = await argon2.verify(user.passwordHash, data.password);

    if (!isValid) {
      // Demo accounts: never increment lockout counters
      if (isDemoAccount) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const attempts = user.loginAttempts + 1;
      const updateData: Record<string, unknown> = { loginAttempts: attempts };

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + LOCK_DURATION_MINUTES * 60 * 1000
        );
        updateData.status = 'LOCKED';

        await this.createAuditLog(user.id, AuditAction.ACCOUNT_LOCKED, ipAddress, userAgent);
        logger.warn('Account locked due to too many failed attempts', { userId: user.id });

        // Notify owner of security event
        ownerNotifyService.onSecurityAlert({
          event: 'Account Locked',
          userId: user.id,
          email: user.email,
          ipAddress,
          description: `Account locked after ${MAX_LOGIN_ATTEMPTS} failed login attempts.`,
        }).catch((err) => logger.error('Security alert notification failed', { err }));
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        status: user.status === 'LOCKED' ? 'ACTIVE' : user.status,
      },
    });

    const tokens = await this.createSession(user.id, user.email, user.role, ipAddress, userAgent, user.tenantId, user.accountType);

    await this.createAuditLog(user.id, AuditAction.LOGIN, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountType: user.accountType,
        emailVerified: user.emailVerified,
        tenantId: user.tenantId,
        directStudentId: user.directStudentId,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      if (session) {
        // Invalidate the compromised session
        await prisma.session.update({
          where: { id: session.id },
          data: { isActive: false },
        });
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Rotate refresh token
    const newRefreshToken = uuidv4();
    const expiresAt = new Date(Date.now() + this.parseExpiry(env.JWT_REFRESH_EXPIRY));

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt,
      },
    });

    const accessToken = this.generateAccessToken(
      session.user.id,
      session.user.email,
      session.user.role,
      session.id,
      session.user.tenantId,
      session.user.accountType
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRY,
    };
  }

  async logout(sessionId: string, userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    await this.createAuditLog(userId, AuditAction.LOGOUT, ipAddress, userAgent);
  }

  async logoutAllDevices(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    await this.createAuditLog(userId, AuditAction.LOGOUT, ipAddress, userAgent, {
      scope: 'all_devices',
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      throw new BadRequestError('Invalid verification token');
    }

    if (verificationToken.usedAt) {
      throw new BadRequestError('This token has already been used');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestError('Verification token has expired');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: true,
          status: 'ACTIVE',
        },
      }),
      prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.createAuditLog(verificationToken.userId, AuditAction.EMAIL_VERIFIED);

    logger.info('Email verified', { userId: verificationToken.userId });
  }

  async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return;
    }

    // Invalidate existing reset tokens
    await prisma.verificationToken.updateMany({
      where: {
        userId: user.id,
        type: TokenType.PASSWORD_RESET,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    const resetToken = uuidv4();
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        type: TokenType.PASSWORD_RESET,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });

    emailService
      .sendPasswordResetEmail(user.email, user.firstName, resetToken)
      .catch((err) => logger.error('Failed to send password reset email', { err, userId: user.id }));
  }

  async resetPassword(data: ResetPasswordInput): Promise<void> {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: data.token },
    });

    if (!verificationToken || verificationToken.type !== TokenType.PASSWORD_RESET) {
      throw new BadRequestError('Invalid reset token');
    }

    if (verificationToken.usedAt) {
      throw new BadRequestError('This token has already been used');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestError('Reset token has expired');
    }

    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { passwordHash },
      }),
      prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all active sessions for security
      prisma.session.updateMany({
        where: { userId: verificationToken.userId, isActive: true },
        data: { isActive: false },
      }),
    ]);

    await this.createAuditLog(verificationToken.userId, AuditAction.PASSWORD_RESET);

    logger.info('Password reset', { userId: verificationToken.userId });
  }

  async getActiveSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        deviceInfo: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Private helpers ───────────────────────────────────────

  private async createSession(
    userId: string,
    email: string,
    role: string,
    ipAddress?: string,
    userAgent?: string,
    tenantId?: string | null,
    accountType?: string
  ): Promise<TokenPair> {
    const refreshToken = uuidv4();
    const expiresAt = new Date(Date.now() + this.parseExpiry(env.JWT_REFRESH_EXPIRY));

    const session = await prisma.session.create({
      data: {
        userId,
        refreshToken,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    const accessToken = this.generateAccessToken(userId, email, role, session.id, tenantId, accountType);

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRY,
    };
  }

  private generateAccessToken(
    userId: string,
    email: string,
    role: string,
    sessionId: string,
    tenantId?: string | null,
    accountType?: string
  ): string {
    return jwt.sign(
      {
        sub: userId,
        email,
        role,
        accountType: accountType || AccountType.B2B_INSTITUTION,
        sessionId,
        tenantId: tenantId || undefined,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'] }
    );
  }

  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (multipliers[unit] || 0);
  }

  private async createAuditLog(
    userId: string,
    action: AuditAction,
    ipAddress?: string,
    userAgent?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    // Look up user's tenantId for audit logs
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    await prisma.auditLog.create({
      data: {
        userId,
        tenantId: user?.tenantId || undefined,
        action,
        ipAddress,
        userAgent,
        details: (details as any) ?? undefined,
      },
    });
  }
}

export const authService = new AuthService();
