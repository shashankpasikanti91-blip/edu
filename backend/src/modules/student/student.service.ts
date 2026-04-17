import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError } from '../../shared/errors';
import { logger } from '../../shared/utils/logger';

class StudentDirectService {
  // Get full B2C student dashboard data
  async getDashboard(userId: string) {
    const [user, profile, recentNotes, studyPlans, quizAttempts, unreadNotifs, aiChats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          directStudentId: true,
          preferredLang: true,
          referralCode: true,
          createdAt: true,
        },
      }),
      prisma.studentProfile.findUnique({
        where: { userId },
      }),
      prisma.note.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.studyPlan.findMany({
        where: { userId, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        orderBy: { date: 'asc' },
        take: 10,
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { quiz: { select: { title: true, subject: { select: { name: true } } } } },
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
      prisma.aiChat.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: { id: true, title: true, updatedAt: true },
      }),
    ]);

    if (!user) throw new NotFoundError('User not found');

    // Calculate progress stats
    const [totalNotes, totalQuizzes, completedPlans, totalPlans] = await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.studyPlan.count({ where: { userId, isCompleted: true } }),
      prisma.studyPlan.count({ where: { userId } }),
    ]);

    // Exam countdown
    let examCountdown = null;
    if (profile?.examCountdownDate && profile.examCountdownDate > new Date()) {
      const diff = profile.examCountdownDate.getTime() - Date.now();
      examCountdown = {
        date: profile.examCountdownDate,
        daysLeft: Math.ceil(diff / (1000 * 60 * 60 * 24)),
      };
    }

    return {
      user,
      profile,
      stats: {
        totalNotes,
        totalQuizzes,
        completedPlans,
        totalPlans,
        completionRate: totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0,
      },
      examCountdown,
      recentNotes,
      todayStudyPlans: studyPlans,
      recentQuizAttempts: quizAttempts,
      unreadNotifications: unreadNotifs,
      recentAiChats: aiChats,
    };
  }

  // Update student profile (for B2C)
  async updateProfile(userId: string, data: {
    grade?: string;
    goalDescription?: string;
    courseName?: string;
    examCountdownDate?: string;
    preferredLang?: string;
    board?: string;
    targetExams?: string[];
  }) {
    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        grade: data.grade,
        goalDescription: data.goalDescription,
        courseName: data.courseName,
        examCountdownDate: data.examCountdownDate ? new Date(data.examCountdownDate) : undefined,
        board: data.board,
        targetExams: data.targetExams,
      },
      create: {
        userId,
        grade: data.grade,
        goalDescription: data.goalDescription,
        courseName: data.courseName,
        examCountdownDate: data.examCountdownDate ? new Date(data.examCountdownDate) : undefined,
        board: data.board,
        targetExams: data.targetExams || [],
      },
    });

    if (data.preferredLang) {
      await prisma.user.update({
        where: { id: userId },
        data: { preferredLang: data.preferredLang },
      });
    }

    return profile;
  }

  // Get referral info
  async getReferralInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user) throw new NotFoundError('User not found');

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const converted = referrals.filter((r) => r.status === 'CONVERTED').length;

    return {
      referralCode: user.referralCode,
      totalReferrals: referrals.length,
      convertedReferrals: converted,
      referrals: referrals.map((r) => ({
        id: r.id,
        referredEmail: r.referredEmail,
        status: r.status,
        convertedAt: r.convertedAt,
        createdAt: r.createdAt,
      })),
    };
  }

  // Create a referral invite
  async createReferralInvite(userId: string, referredEmail: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, email: true },
    });

    if (!user?.referralCode) throw new BadRequestError('No referral code found');
    if (user.email === referredEmail) throw new BadRequestError('Cannot refer yourself');

    // Check if already referred
    const existing = await prisma.referral.findFirst({
      where: { referrerId: userId, referredEmail },
    });

    if (existing) throw new BadRequestError('This email has already been referred');

    const referral = await prisma.referral.create({
      data: {
        referrerId: userId,
        referralCode: user.referralCode,
        referredEmail,
      },
    });

    return referral;
  }

  // Progress tracking with weekly summary
  async getProgressSummary(userId: string, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [quizAttempts, studyPlans, noteCount] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId, createdAt: { gte: startDate } },
        include: { quiz: { select: { title: true, totalMarks: true, subject: { select: { name: true } } } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.studyPlan.findMany({
        where: { userId, date: { gte: startDate } },
        orderBy: { date: 'asc' },
      }),
      prisma.note.count({
        where: { userId, createdAt: { gte: startDate } },
      }),
    ]);

    // Average quiz score
    const completedQuizzes = quizAttempts.filter((a) => a.score !== null);
    const averageScore = completedQuizzes.length > 0
      ? Math.round(completedQuizzes.reduce((sum, a) => sum + (a.score! / a.totalMarks) * 100, 0) / completedQuizzes.length)
      : 0;

    // Study hours
    const totalStudyMinutes = studyPlans
      .filter((p) => p.isCompleted)
      .reduce((sum, p) => sum + p.duration, 0);

    return {
      period: { start: startDate, end: new Date(), days },
      quizzes: {
        total: quizAttempts.length,
        completed: completedQuizzes.length,
        averageScore,
      },
      studyPlans: {
        total: studyPlans.length,
        completed: studyPlans.filter((p) => p.isCompleted).length,
        totalStudyMinutes,
        totalStudyHours: Math.round(totalStudyMinutes / 60 * 10) / 10,
      },
      notesCreated: noteCount,
    };
  }

  // Link B2C account to an institution
  async linkToInstitution(userId: string, tenantId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    if (user.accountType !== 'B2C_STUDENT') throw new BadRequestError('Only direct student accounts can be linked');

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || tenant.status !== 'ACTIVE') throw new NotFoundError('Institution not found or inactive');

    await prisma.user.update({
      where: { id: userId },
      data: {
        tenantId,
        accountType: 'B2B_INSTITUTION',
      },
    });

    logger.info('B2C student linked to institution', { userId, tenantId });
  }

  // ─── INDIVIDUAL ACADEMIC PROFILE ───────────────────────────

  async getAcademicProfile(userId: string) {
    const academic = await prisma.individualStudentAcademic.findUnique({
      where: { userId },
    });
    return academic;
  }

  async upsertAcademicProfile(userId: string, data: {
    academicLevel: string;
    stream?: string;
    boardName?: string;
    courseName?: string;
    classYear?: string;
    semester?: string;
    subjectsOfInterest?: string[];
    targetExams?: string[];
    goals?: string;
    state?: string;
    preferredLang?: string;
  }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const academic = await prisma.individualStudentAcademic.upsert({
      where: { userId },
      update: {
        academicLevel: data.academicLevel as any,
        stream: data.stream as any || null,
        boardName: data.boardName,
        courseName: data.courseName,
        classYear: data.classYear,
        semester: data.semester,
        subjectsOfInterest: data.subjectsOfInterest || [],
        targetExams: data.targetExams || [],
        goals: data.goals,
        state: data.state,
        preferredLang: data.preferredLang || 'en',
      },
      create: {
        userId,
        academicLevel: data.academicLevel as any,
        stream: data.stream as any || null,
        boardName: data.boardName,
        courseName: data.courseName,
        classYear: data.classYear,
        semester: data.semester,
        subjectsOfInterest: data.subjectsOfInterest || [],
        targetExams: data.targetExams || [],
        goals: data.goals,
        state: data.state,
        preferredLang: data.preferredLang || 'en',
      },
    });

    // Also update preferredLang on user record
    if (data.preferredLang) {
      await prisma.user.update({
        where: { id: userId },
        data: { preferredLang: data.preferredLang },
      });
    }

    logger.info('Student academic profile updated', { userId });
    return academic;
  }

  // ─── NOTES CRUD ────────────────────────────────────────────

  async listNotes(userId: string, query: Record<string, string>) {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const search = query.search?.trim();

    const where: Record<string, unknown> = { userId };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (query.subject) where.subjectName = query.subject;
    if (query.favorite === 'true') where.isFavorite = true;

    const [items, total] = await Promise.all([
      prisma.note.findMany({
        where: where as any,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.note.count({ where: where as any }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async createNote(userId: string, data: { title: string; content: string; subjectName?: string; tags?: string[] }) {
    if (!data.title?.trim()) throw new BadRequestError('Title is required');
    if (!data.content?.trim()) throw new BadRequestError('Content is required');

    return prisma.note.create({
      data: {
        userId,
        title: data.title.trim(),
        content: data.content.trim(),
        subjectName: data.subjectName?.trim() || null,
        tags: data.tags || [],
        isDraft: false,
      },
    });
  }

  async getNote(userId: string, noteId: string) {
    const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
    if (!note) throw new NotFoundError('Note not found');
    return note;
  }

  async updateNote(userId: string, noteId: string, data: { title?: string; content?: string; subjectName?: string; tags?: string[]; isFavorite?: boolean }) {
    const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
    if (!note) throw new NotFoundError('Note not found');

    return prisma.note.update({
      where: { id: noteId },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.content !== undefined && { content: data.content.trim() }),
        ...(data.subjectName !== undefined && { subjectName: data.subjectName?.trim() || null }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.isFavorite !== undefined && { isFavorite: data.isFavorite }),
      },
    });
  }

  async deleteNote(userId: string, noteId: string) {
    const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
    if (!note) throw new NotFoundError('Note not found');
    await prisma.note.delete({ where: { id: noteId } });
  }

  // ─── STUDY PLAN CRUD ──────────────────────────────────────

  async listStudyPlans(userId: string, query: Record<string, string>) {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);

    const where: Record<string, unknown> = { userId };
    if (query.date) {
      const d = new Date(query.date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      where.date = { gte: start, lte: end };
    }
    if (query.completed === 'true') where.isCompleted = true;
    if (query.completed === 'false') where.isCompleted = false;

    const [items, total] = await Promise.all([
      prisma.studyPlan.findMany({
        where: where as any,
        orderBy: { date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.studyPlan.count({ where: where as any }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async createStudyPlan(userId: string, data: { title: string; date: string; subjectName: string; duration: number; notes?: string }) {
    if (!data.title?.trim()) throw new BadRequestError('Title is required');
    if (!data.date) throw new BadRequestError('Date is required');
    if (!data.subjectName?.trim()) throw new BadRequestError('Subject is required');
    if (!data.duration || data.duration < 1) throw new BadRequestError('Duration must be at least 1 minute');

    return prisma.studyPlan.create({
      data: {
        userId,
        title: data.title.trim(),
        date: new Date(data.date),
        subjectName: data.subjectName.trim(),
        duration: data.duration,
        notes: data.notes?.trim() || null,
      },
    });
  }

  async updateStudyPlan(userId: string, planId: string, data: { title?: string; date?: string; subjectName?: string; duration?: number; isCompleted?: boolean; notes?: string }) {
    const plan = await prisma.studyPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundError('Study plan not found');

    return prisma.studyPlan.update({
      where: { id: planId },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.subjectName !== undefined && { subjectName: data.subjectName.trim() }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.isCompleted !== undefined && { isCompleted: data.isCompleted }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
      },
    });
  }

  async deleteStudyPlan(userId: string, planId: string) {
    const plan = await prisma.studyPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundError('Study plan not found');
    await prisma.studyPlan.delete({ where: { id: planId } });
  }
}

export const studentDirectService = new StudentDirectService();
