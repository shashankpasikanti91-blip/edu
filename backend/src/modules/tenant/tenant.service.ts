import { prisma } from '../../config/database';
import { ConflictError, NotFoundError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

export class TenantService {
  static async createTenant(data: {
    name: string;
    type: 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'COACHING_INSTITUTE' | 'TRAINING_CENTER';
    slug?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
  }) {
    const slug = data.slug || generateSlug(data.name);

    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictError('An institution with this identifier already exists');
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        slug,
        type: data.type,
        status: 'ACTIVE',
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        website: data.website,
        settings: {
          create: {
            allowStudentSignup: false,
            requireApproval: true,
            allowParentAccess: false,
            enableAiAssistant: true,
          },
        },
      },
      include: { settings: true },
    });

    logger.info(`Tenant created: ${tenant.id} (${tenant.name})`);
    return tenant;
  }

  static async getTenantById(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id, deletedAt: null },
      include: {
        settings: true,
        _count: {
          select: {
            users: true,
            departments: true,
            courses: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundError('Institution not found');
    }

    return tenant;
  }

  static async getTenantBySlug(slug: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug, deletedAt: null },
      include: { settings: true },
    });

    if (!tenant) {
      throw new NotFoundError('Institution not found');
    }

    return tenant;
  }

  static async listTenants(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { city: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where: where as any,
        include: {
          _count: { select: { users: true, departments: true, courses: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenant.count({ where: where as any }),
    ]);

    return {
      tenants,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateTenant(id: string, data: Record<string, unknown>) {
    const tenant = await prisma.tenant.findUnique({ where: { id, deletedAt: null } });
    if (!tenant) {
      throw new NotFoundError('Institution not found');
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: data as any,
      include: { settings: true },
    });

    logger.info(`Tenant updated: ${id}`);
    return updated;
  }

  static async updateTenantSettings(tenantId: string, data: Record<string, unknown>) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId, deletedAt: null } });
    if (!tenant) {
      throw new NotFoundError('Institution not found');
    }

    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: data as any,
      create: { tenantId, ...data } as any,
    });

    logger.info(`Tenant settings updated: ${tenantId}`);
    return settings;
  }

  static async suspendTenant(id: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id, deletedAt: null } });
    if (!tenant) {
      throw new NotFoundError('Institution not found');
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    logger.info(`Tenant suspended: ${id}`);
    return updated;
  }

  static async activateTenant(id: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id, deletedAt: null } });
    if (!tenant) {
      throw new NotFoundError('Institution not found');
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    logger.info(`Tenant activated: ${id}`);
    return updated;
  }

  static async deleteTenant(id: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id, deletedAt: null } });
    if (!tenant) {
      throw new NotFoundError('Institution not found');
    }

    await prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'SUSPENDED' },
    });

    logger.info(`Tenant soft-deleted: ${id}`);
  }

  static async getTenantStats(tenantId: string) {
    const [
      studentCount,
      teacherCount,
      courseCount,
      departmentCount,
      contentCount,
    ] = await Promise.all([
      prisma.user.count({ where: { tenantId, role: 'STUDENT', deletedAt: null } }),
      prisma.user.count({ where: { tenantId, role: 'TEACHER', deletedAt: null } }),
      prisma.course.count({ where: { tenantId } }),
      prisma.department.count({ where: { tenantId } }),
      prisma.contentItem.count({ where: { tenantId, deletedAt: null } }),
    ]);

    return { studentCount, teacherCount, courseCount, departmentCount, contentCount };
  }
}
