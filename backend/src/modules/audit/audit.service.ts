import { prisma } from '../../config/database';

export class AuditService {
  static async log(data: {
    tenantId?: string;
    userId?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({ data: data as any });
  }

  static async getAuditLogs(params: {
    tenantId?: string;
    userId?: string;
    action?: string;
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) (where.createdAt as any).gte = params.startDate;
      if (params.endDate) (where.createdAt as any).lte = params.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: where as any,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where: where as any }),
    ]);

    return {
      logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
