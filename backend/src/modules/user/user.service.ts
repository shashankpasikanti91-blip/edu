import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import { logger } from '../../shared/utils/logger';

class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        avatarUrl: true,
        phone: true,
        dateOfBirth: true,
        preferredLang: true,
        tenantId: true,
        createdAt: true,
        tenant: { select: { id: true, name: true, slug: true } },
        studentProfile: true,
        parentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      dateOfBirth?: string;
      preferredLang?: string;
    }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone && { phone: data.phone }),
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
        ...(data.preferredLang && { preferredLang: data.preferredLang }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        preferredLang: true,
        updatedAt: true,
      },
    });

    logger.info('Profile updated', { userId });
    return user;
  }

  async getDashboardStats(userId: string) {
    const [quizAttempts, notesCount, studyPlans, notifications] = await Promise.all([
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.note.count({ where: { userId } }),
      prisma.studyPlan.findMany({
        where: { userId, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        orderBy: { date: 'asc' },
        take: 5,
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      totalQuizAttempts: quizAttempts,
      totalNotes: notesCount,
      todayStudyPlans: studyPlans,
      unreadNotifications: notifications,
    };
  }
}

export const userService = new UserService();
