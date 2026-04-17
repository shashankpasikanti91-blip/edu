import { prisma } from '../../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';
import argon2 from 'argon2';

const ASSIGNABLE_ROLES = [
  'STUDENT', 'PARENT', 'TEACHER', 'HOD', 'STAFF',
  'COORDINATOR', 'BRANCH_ADMIN', 'ACADEMIC_ADMIN',
  'DEPARTMENT_ADMIN', 'INSTITUTION_ADMIN',
];

export class SubUserService {
  /**
   * Create a sub-user under an institution.
   */
  static async createSubUser(tenantId: string, createdBy: string, data: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    departmentId?: string;
    password?: string;
  }) {
    if (!ASSIGNABLE_ROLES.includes(data.role)) {
      throw new BadRequestError(`Invalid role: ${data.role}`);
    }

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    // Generate default password if not provided
    const password = data.password || generateTempPassword();
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await prisma.user.create({
      data: {
        tenantId,
        email: data.email.toLowerCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as any,
        accountType: 'B2B_INSTITUTION',
        passwordHash,
        status: 'ACTIVE',
        emailVerified: true, // Admin-created users are pre-verified
        approvedAt: new Date(),
        approvedBy: createdBy,
      },
    });

    // Create role-specific profile
    if (['STUDENT'].includes(data.role)) {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          departmentId: data.departmentId,
        },
      });
    } else if (['TEACHER', 'HOD'].includes(data.role)) {
      await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          departmentId: data.departmentId,
        },
      });
    }

    logger.info(`Sub-user created: ${user.email} (${data.role}) in tenant ${tenantId} by ${createdBy}`);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tempPassword: data.password ? undefined : password,
    };
  }

  /**
   * List sub-users for a tenant with filters.
   */
  static async listSubUsers(tenantId: string, params: {
    page?: number;
    limit?: number;
    role?: string;
    departmentId?: string;
    status?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      deletedAt: null,
      role: { not: 'INSTITUTION_OWNER' }, // Don't list the owner themselves
    };

    if (params.role) where.role = params.role;
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          emailVerified: true,
          phone: true,
          lastLoginAt: true,
          createdAt: true,
          studentProfile: {
            select: { departmentId: true, grade: true, section: true, rollNumber: true },
          },
          teacherProfile: {
            select: { departmentId: true, designation: true, specialization: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a sub-user's role, department, or status.
   */
  static async updateSubUser(tenantId: string, userId: string, data: {
    role?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: string;
    departmentId?: string;
  }) {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError('User not found in this institution');
    }

    // Prevent changing owner role
    if (user.role === 'INSTITUTION_OWNER') {
      throw new BadRequestError('Cannot modify the institution owner');
    }

    if (data.role && !ASSIGNABLE_ROLES.includes(data.role)) {
      throw new BadRequestError(`Invalid role: ${data.role}`);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.role && { role: data.role as any }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.status && { status: data.status as any }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    logger.info(`Sub-user updated: ${userId} in tenant ${tenantId}`);
    return updated;
  }

  /**
   * Deactivate a sub-user (soft disable).
   */
  static async deactivateSubUser(tenantId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) throw new NotFoundError('User not found');
    if (user.role === 'INSTITUTION_OWNER') {
      throw new BadRequestError('Cannot deactivate the institution owner');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'DEACTIVATED' },
    });

    logger.info(`Sub-user deactivated: ${userId} in tenant ${tenantId}`);
    return { success: true };
  }

  /**
   * Activate a sub-user.
   */
  static async activateSubUser(tenantId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) throw new NotFoundError('User not found');

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });

    logger.info(`Sub-user activated: ${userId} in tenant ${tenantId}`);
    return { success: true };
  }

  /**
   * Reset a sub-user's password.
   */
  static async resetSubUserPassword(tenantId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) throw new NotFoundError('User not found');

    const newPassword = generateTempPassword();
    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({ where: { userId } });

    logger.info(`Password reset for sub-user: ${userId} in tenant ${tenantId}`);
    return { tempPassword: newPassword };
  }

  /**
   * Bulk create sub-users.
   */
  static async bulkCreateSubUsers(tenantId: string, createdBy: string, users: Array<{
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    departmentId?: string;
  }>) {
    const results: Array<{ email: string; success: boolean; error?: string; tempPassword?: string }> = [];

    for (const userData of users) {
      try {
        const result = await SubUserService.createSubUser(tenantId, createdBy, userData);
        results.push({
          email: result.email,
          success: true,
          tempPassword: result.tempPassword,
        });
      } catch (error: any) {
        results.push({
          email: userData.email,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    logger.info(`Bulk user creation: ${successCount}/${users.length} succeeded in tenant ${tenantId}`);

    return { results, successCount, failCount: users.length - successCount };
  }
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specials = '@#$!';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  password += specials.charAt(Math.floor(Math.random() * specials.length));
  return password;
}
