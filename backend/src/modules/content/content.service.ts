import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

export class ContentService {
  static async createContent(data: {
    tenantId: string;
    createdById: string;
    title: string;
    description?: string;
    type: string;
    subjectId?: string;
    tags?: string[];
    isPublic?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const content = await prisma.contentItem.create({
      data: {
        tenantId: data.tenantId,
        createdById: data.createdById,
        title: data.title,
        description: data.description,
        type: data.type as any,
        subjectId: data.subjectId,
        tags: data.tags || [],
        isPublic: data.isPublic || false,
        metadata: (data.metadata as any) || undefined,
        status: 'DRAFT',
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, role: true } },
        subject: { select: { id: true, name: true } },
      },
    });

    logger.info(`Content created: ${content.id} by ${data.createdById}`);
    return content;
  }

  static async listContent(params: {
    tenantId: string;
    type?: string;
    status?: string;
    subjectId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      tenantId: params.tenantId,
      deletedAt: null,
    };
    if (params.type) where.type = params.type;
    if (params.status) where.status = params.status;
    if (params.subjectId) where.subjectId = params.subjectId;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.contentItem.findMany({
        where: where as any,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          subject: { select: { id: true, name: true } },
          _count: { select: { files: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contentItem.count({ where: where as any }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getContentById(id: string, tenantId: string) {
    const content = await prisma.contentItem.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, role: true } },
        subject: { select: { id: true, name: true } },
        files: true,
        permissions: true,
      },
    });

    if (!content) throw new NotFoundError('Content not found');
    return content;
  }

  static async updateContent(id: string, tenantId: string, data: Record<string, unknown>) {
    const content = await prisma.contentItem.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!content) throw new NotFoundError('Content not found');

    return prisma.contentItem.update({
      where: { id },
      data: data as any,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        subject: { select: { id: true, name: true } },
      },
    });
  }

  static async approveContent(id: string, tenantId: string, reviewedBy: string, note?: string) {
    const content = await prisma.contentItem.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!content) throw new NotFoundError('Content not found');

    return prisma.contentItem.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    });
  }

  static async rejectContent(id: string, tenantId: string, reviewedBy: string, note: string) {
    const content = await prisma.contentItem.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!content) throw new NotFoundError('Content not found');

    return prisma.contentItem.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    });
  }

  static async flagContent(id: string, tenantId: string, reason: string) {
    const content = await prisma.contentItem.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!content) throw new NotFoundError('Content not found');

    return prisma.contentItem.update({
      where: { id },
      data: { status: 'FLAGGED', reviewNote: reason },
    });
  }

  static async deleteContent(id: string, tenantId: string) {
    const content = await prisma.contentItem.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!content) throw new NotFoundError('Content not found');

    await prisma.contentItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
