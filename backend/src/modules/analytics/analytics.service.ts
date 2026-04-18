import { prisma } from '../../config/database';
import { logger } from '../../shared/utils/logger';

export class AnalyticsService {
  static async trackEvent(data: {
    tenantId?: string;
    userId?: string;
    event: string;
    resource?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  }) {
    await prisma.analyticsEvent.create({ data: data as any });
  }

  static async getPlatformStats() {
    const [
      totalTenants,
      activeTenants,
      totalUsers,
      activeUsers,
      totalContent,
      totalAssessments,
    ] = await Promise.all([
      prisma.tenant.count({ where: { deletedAt: null } }),
      prisma.tenant.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.contentItem.count({ where: { deletedAt: null } }),
      prisma.assessment.count(),
    ]);

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
      where: { deletedAt: null },
    });

    const tenantsByType = await prisma.tenant.groupBy({
      by: ['type'],
      _count: true,
      where: { deletedAt: null },
    });

    const contentByType = await prisma.contentItem.groupBy({
      by: ['type'],
      _count: true,
      where: { deletedAt: null },
    });

    const recentSignups = await prisma.user.count({
      where: {
        deletedAt: null,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    // Convert arrays to Record<string, number> for frontend consumption
    const usersByRoleMap: Record<string, number> = {};
    for (const r of usersByRole) {
      usersByRoleMap[r.role] = r._count;
    }

    const contentByTypeMap: Record<string, number> = {};
    for (const c of contentByType) {
      contentByTypeMap[c.type] = c._count;
    }

    const tenantsByTypeMap: Record<string, number> = {};
    for (const t of tenantsByType) {
      tenantsByTypeMap[t.type] = t._count;
    }

    return {
      totalTenants,
      activeTenants,
      totalUsers,
      activeUsers,
      totalContent,
      totalAssessments,
      recentSignups,
      usersByRole: usersByRoleMap,
      contentByType: contentByTypeMap,
      tenantsByType: tenantsByTypeMap,
    };
  }

  static async getTenantStats(tenantId: string) {
    const [
      studentCount,
      teacherCount,
      courseCount,
      contentCount,
      assessmentCount,
      enrollmentCount,
    ] = await Promise.all([
      prisma.user.count({ where: { tenantId, role: 'STUDENT', deletedAt: null } }),
      prisma.user.count({ where: { tenantId, role: 'TEACHER', deletedAt: null } }),
      prisma.course.count({ where: { tenantId } }),
      prisma.contentItem.count({ where: { tenantId, deletedAt: null } }),
      prisma.assessment.count({ where: { tenantId } }),
      prisma.enrollment.count({
        where: {
          user: { tenantId },
          status: 'ACTIVE',
        },
      }),
    ]);

    const pendingApprovals = await prisma.user.count({
      where: { tenantId, status: 'PENDING_VERIFICATION', deletedAt: null },
    });

    const recentActivity = await prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        resource: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, role: true } },
      },
    });

    return {
      totalStudents: studentCount,
      totalTeachers: teacherCount,
      totalCourses: courseCount,
      totalContent: contentCount,
      assessmentCount,
      enrollmentCount,
      pendingApprovals,
      recentActivity: recentActivity.length,
    };
  }

  static async getStudentProgress(userId: string) {
    const [enrollments, quizAttempts, notesCount, studyPlans] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId, status: 'ACTIVE' },
        include: { course: { select: { name: true } }, subject: { select: { name: true } } },
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { quiz: { select: { title: true, totalMarks: true } } },
      }),
      prisma.note.count({ where: { userId } }),
      prisma.studyPlan.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 10,
      }),
    ]);

    const totalQuizzes = quizAttempts.length;
    const avgScore = totalQuizzes > 0
      ? quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalQuizzes
      : 0;

    return {
      enrollments,
      quizStats: { totalAttempts: totalQuizzes, averageScore: Math.round(avgScore * 100) / 100 },
      notesCount,
      recentStudyPlans: studyPlans,
      recentQuizzes: quizAttempts.slice(0, 5),
    };
  }

  static async getTeacherStats(userId: string, tenantId: string) {
    const [contentCount, assessmentCount] = await Promise.all([
      prisma.contentItem.count({ where: { createdById: userId, tenantId, deletedAt: null } }),
      prisma.assessment.count({ where: { createdById: userId, tenantId } }),
    ]);

    const recentContent = await prisma.contentItem.findMany({
      where: { createdById: userId, tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, type: true, status: true, createdAt: true },
    });

    return { contentCount, assessmentCount, recentContent };
  }

  static async getGoals(params: { tenantId?: string; userId?: string }) {
    const where: Record<string, unknown> = {};
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.userId) where.userId = params.userId;

    return prisma.analyticsGoal.findMany({
      where: where as any,
      include: { progress: { orderBy: { date: 'desc' }, take: 10 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createGoal(data: {
    tenantId?: string;
    userId?: string;
    title: string;
    description?: string;
    targetValue: number;
    unit?: string;
    startDate: Date;
    endDate: Date;
  }) {
    return prisma.analyticsGoal.create({ data: data as any });
  }

  static async updateGoalProgress(goalId: string, value: number, note?: string) {
    const goal = await prisma.analyticsGoal.findUnique({ where: { id: goalId } });
    if (!goal) throw new Error('Goal not found');

    const [progress] = await Promise.all([
      prisma.analyticsGoalProgress.create({
        data: { goalId, value, date: new Date(), note },
      }),
      prisma.analyticsGoal.update({
        where: { id: goalId },
        data: {
          currentValue: value,
          status: value >= goal.targetValue ? 'ACHIEVED' : 'IN_PROGRESS',
        },
      }),
    ]);

    return progress;
  }

  static async getMonthlyGrowth(tenantId?: string) {
    const months = 12;
    const results = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const where: Record<string, unknown> = {
        createdAt: { gte: start, lte: end },
        deletedAt: null,
      };
      if (tenantId) where.tenantId = tenantId;

      const count = await prisma.user.count({ where: where as any });
      results.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        users: count,
      });
    }

    return results;
  }

  /**
   * Department-level analytics: students, teachers, avg quiz score per department
   */
  static async getDepartmentAnalytics(tenantId: string) {
    const departments = await prisma.department.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        _count: { select: { students: true, teachers: true, courses: true, subjects: true } },
      },
    });

    const result = [];
    for (const dept of departments) {
      // Get avg quiz score for students in this department
      const studentProfiles = await prisma.studentProfile.findMany({
        where: { departmentId: dept.id },
        select: { userId: true },
      });
      const ids = studentProfiles.map((s: { userId: string }) => s.userId);

      let avgScore = 0;
      if (ids.length > 0) {
        const agg = await prisma.quizAttempt.aggregate({
          where: { userId: { in: ids } },
          _avg: { score: true },
        });
        avgScore = Math.round(agg._avg.score || 0);
      }

      result.push({
        name: dept.name,
        students: dept._count.students,
        teachers: dept._count.teachers,
        courses: dept._count.courses,
        score: avgScore,
      });
    }

    return result;
  }

  /**
   * Subject performance: avg quiz score per subject across the tenant
   */
  static async getSubjectPerformance(tenantId: string) {
    const subjects = await prisma.subject.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });

    const result = [];
    for (const subj of subjects) {
      const quizzes = await prisma.quiz.findMany({
        where: { subjectId: subj.id },
        select: { id: true },
      });
      const quizIds = quizzes.map(q => q.id);

      let score = 0;
      if (quizIds.length > 0) {
        const agg = await prisma.quizAttempt.aggregate({
          where: { quizId: { in: quizIds } },
          _avg: { score: true },
        });
        score = Math.round(agg._avg.score || 0);
      }

      result.push({
        subject: subj.name,
        score,
        fullMark: 100,
      });
    }

    return result;
  }
}
