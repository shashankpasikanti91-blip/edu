import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors/AppError';

export class NotificationService {
  static async create(data: {
    tenantId?: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    data?: Record<string, unknown>;
  }) {
    return prisma.notification.create({ data: data as any });
  }

  static async createBulk(notifications: Array<{
    tenantId?: string;
    userId: string;
    title: string;
    message: string;
    type: string;
  }>) {
    return prisma.notification.createMany({ data: notifications as any });
  }

  static async getUserNotifications(userId: string, params: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (params.unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: where as any }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundError('Notification not found');

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
