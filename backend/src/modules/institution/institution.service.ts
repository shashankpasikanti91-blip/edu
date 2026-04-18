import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

export class InstitutionService {
  /**
   * Get the full institution profile for a tenant.
   */
  static async getProfile(tenantId: string) {
    const profile = await prisma.institutionProfile.findUnique({
      where: { tenantId },
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        settings: true,
        subscription: { include: { plan: true } },
        _count: { select: { users: true, departments: true, courses: true } },
      },
    });

    if (!tenant) {
      throw new NotFoundError('Institution not found');
    }

    return { profile, tenant };
  }

  /**
   * Create or initialize an institution profile (during onboarding step 1).
   */
  static async createProfile(
    tenantId: string,
    data: {
      institutionName: string;
      shortName?: string;
      institutionType: string;
      institutionCategory?: string;
    }
  ) {
    const existing = await prisma.institutionProfile.findUnique({
      where: { tenantId },
    });
    if (existing) {
      throw new ConflictError('Institution profile already exists. Use update instead.');
    }

    const profile = await prisma.institutionProfile.create({
      data: {
        tenantId,
        institutionName: data.institutionName,
        shortName: data.shortName,
        institutionType: data.institutionType as any,
        institutionCategory: data.institutionCategory as any,
        onboardingStatus: 'STEP_1',
      },
    });

    logger.info(`Institution profile created for tenant ${tenantId}`);
    return profile;
  }

  /**
   * Update institution profile (used during onboarding steps and settings).
   */
  static async updateProfile(
    tenantId: string,
    data: {
      // Basic
      institutionName?: string;
      shortName?: string;
      institutionCode?: string;
      institutionType?: string;

      // Governance
      affiliationType?: string;
      affiliatedBody?: string;
      regulatoryBody?: string;
      institutionCategory?: string;

      // Location
      country?: string;
      state?: string;
      city?: string;
      fullAddress?: string;
      pincode?: string;

      // Academic Structure
      levelsOffered?: string[];
      streamsOffered?: string[];
      mediumOfInstruction?: string[];
      academicCalendarType?: string;
      yearModel?: string;

      // Contact / Branding
      officialEmail?: string;
      officialPhone?: string;
      website?: string;
      logoUrl?: string;
      bannerUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      supportContact?: string;

      // Operational
      maxTeachers?: number;
      maxStudents?: number;
      branchSupport?: boolean;
      attendanceModel?: string;
      examModel?: string;
      lmsEnabled?: boolean;
      aiEnabled?: boolean;

      // Onboarding
      onboardingStatus?: string;
    }
  ) {
    // Check for institution code uniqueness if provided
    if (data.institutionCode) {
      const existing = await prisma.institutionProfile.findUnique({
        where: { institutionCode: data.institutionCode },
      });
      if (existing && existing.tenantId !== tenantId) {
        throw new ConflictError('Institution code already in use');
      }
    }

    const profile = await prisma.institutionProfile.upsert({
      where: { tenantId },
      update: {
        ...(data.institutionName && { institutionName: data.institutionName }),
        ...(data.shortName !== undefined && { shortName: data.shortName }),
        ...(data.institutionCode !== undefined && { institutionCode: data.institutionCode }),
        ...(data.institutionType && { institutionType: data.institutionType as any }),
        ...(data.affiliationType !== undefined && { affiliationType: data.affiliationType as any || null }),
        ...(data.affiliatedBody !== undefined && { affiliatedBody: data.affiliatedBody }),
        ...(data.regulatoryBody !== undefined && { regulatoryBody: data.regulatoryBody }),
        ...(data.institutionCategory !== undefined && { institutionCategory: data.institutionCategory as any || null }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.fullAddress !== undefined && { fullAddress: data.fullAddress }),
        ...(data.pincode !== undefined && { pincode: data.pincode }),
        ...(data.levelsOffered && { levelsOffered: data.levelsOffered as any }),
        ...(data.streamsOffered && { streamsOffered: data.streamsOffered as any }),
        ...(data.mediumOfInstruction && { mediumOfInstruction: data.mediumOfInstruction }),
        ...(data.academicCalendarType !== undefined && { academicCalendarType: data.academicCalendarType }),
        ...(data.yearModel !== undefined && { yearModel: data.yearModel }),
        ...(data.officialEmail !== undefined && { officialEmail: data.officialEmail }),
        ...(data.officialPhone !== undefined && { officialPhone: data.officialPhone }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.bannerUrl !== undefined && { bannerUrl: data.bannerUrl }),
        ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
        ...(data.secondaryColor !== undefined && { secondaryColor: data.secondaryColor }),
        ...(data.supportContact !== undefined && { supportContact: data.supportContact }),
        ...(data.maxTeachers !== undefined && { maxTeachers: data.maxTeachers }),
        ...(data.maxStudents !== undefined && { maxStudents: data.maxStudents }),
        ...(data.branchSupport !== undefined && { branchSupport: data.branchSupport }),
        ...(data.attendanceModel !== undefined && { attendanceModel: data.attendanceModel }),
        ...(data.examModel !== undefined && { examModel: data.examModel }),
        ...(data.lmsEnabled !== undefined && { lmsEnabled: data.lmsEnabled }),
        ...(data.aiEnabled !== undefined && { aiEnabled: data.aiEnabled }),
        ...(data.onboardingStatus && { onboardingStatus: data.onboardingStatus as any }),
      },
      create: {
        tenantId,
        institutionName: data.institutionName || '',
        institutionType: (data.institutionType as any) || 'SCHOOL',
        shortName: data.shortName,
        institutionCode: data.institutionCode,
        affiliationType: data.affiliationType as any,
        affiliatedBody: data.affiliatedBody,
        regulatoryBody: data.regulatoryBody,
        institutionCategory: data.institutionCategory as any,
        country: data.country || 'India',
        state: data.state,
        city: data.city,
        fullAddress: data.fullAddress,
        pincode: data.pincode,
        levelsOffered: (data.levelsOffered as any) || [],
        streamsOffered: (data.streamsOffered as any) || [],
        mediumOfInstruction: data.mediumOfInstruction || ['English'],
        academicCalendarType: data.academicCalendarType,
        yearModel: data.yearModel,
        officialEmail: data.officialEmail,
        officialPhone: data.officialPhone,
        website: data.website,
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        supportContact: data.supportContact,
        maxTeachers: data.maxTeachers,
        maxStudents: data.maxStudents,
        branchSupport: data.branchSupport || false,
        attendanceModel: data.attendanceModel,
        examModel: data.examModel,
        lmsEnabled: data.lmsEnabled || false,
        aiEnabled: data.aiEnabled ?? true,
        onboardingStatus: (data.onboardingStatus as any) || 'STEP_1',
      },
    });

    logger.info(`Institution profile updated for tenant ${tenantId}`);
    return profile;
  }

  /**
   * Complete onboarding.
   */
  static async completeOnboarding(tenantId: string) {
    const profile = await prisma.institutionProfile.update({
      where: { tenantId },
      data: {
        onboardingStatus: 'COMPLETED',
        onboardingCompletedAt: new Date(),
      },
    });

    // Also update tenant status to ACTIVE
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'ACTIVE' },
    });

    logger.info(`Onboarding completed for tenant ${tenantId}`);
    return profile;
  }

  /**
   * Get institution's academic context (for exam prep, sub-user creation, etc.)
   */
  static async getAcademicContext(tenantId: string) {
    const profile = await prisma.institutionProfile.findUnique({
      where: { tenantId },
      select: {
        institutionType: true,
        levelsOffered: true,
        streamsOffered: true,
        affiliationType: true,
        affiliatedBody: true,
        mediumOfInstruction: true,
        yearModel: true,
        academicCalendarType: true,
      },
    });

    const departments = await prisma.department.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true, code: true },
    });

    const courses = await prisma.course.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true, code: true, departmentId: true },
    });

    const subjects = await prisma.subject.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true, code: true, courseId: true, departmentId: true },
    });

    return { profile, departments, courses, subjects };
  }

  /**
   * Get a single department with its related users, courses, and subjects.
   */
  static async getDepartmentById(tenantId: string, departmentId: string) {
    const department = await prisma.department.findFirst({
      where: { id: departmentId, tenantId },
      include: {
        teachers: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, role: true, status: true } },
          },
        },
        students: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, status: true } },
          },
        },
        courses: {
          where: { isActive: true },
          select: { id: true, name: true, code: true, isActive: true },
        },
        subjects: {
          where: { isActive: true },
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!department) throw new NotFoundError('Department not found');

    // Fetch head user separately if headId is set (headId is a plain FK with no Prisma relation)
    let head = null;
    if (department.headId) {
      head = await prisma.user.findUnique({
        where: { id: department.headId },
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      });
    }

    return { ...department, head };
  }
}
