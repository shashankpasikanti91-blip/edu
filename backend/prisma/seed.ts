import { prisma } from '../src/config/database';
import argon2 from 'argon2';

async function main() {
  console.log('Seeding database...');

  const hashPassword = async (password: string) =>
    argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

  // ─── SYSTEM OWNER (SUPER ADMIN) ─────────────────────────────
  // This is YOUR account — you see all new registrations, errors, and alerts
  const ownerHash = await hashPassword('SrpOwner@2025!');

  const systemOwner = await prisma.user.upsert({
    where: { email: 'owner@srpailabs.com' },
    update: { passwordHash: ownerHash, firstName: 'SRP', lastName: 'Owner', role: 'SUPER_ADMIN', status: 'ACTIVE', emailVerified: true, loginAttempts: 0, lockedUntil: null },
    create: {
      email: 'owner@srpailabs.com',
      passwordHash: ownerHash,
      firstName: 'SRP',
      lastName: 'Owner',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('System owner created:', systemOwner.email);

  // Keep the original admin too
  const adminHash = await hashPassword('Admin@12345');
  await prisma.user.upsert({
    where: { email: 'admin@srpeducation.ai' },
    update: { passwordHash: adminHash, firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN', status: 'ACTIVE', emailVerified: true, loginAttempts: 0, lockedUntil: null },
    create: {
      email: 'admin@srpeducation.ai',
      passwordHash: adminHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // ─── DEMO INSTITUTION ───────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-school' },
    update: {},
    create: {
      name: 'Demo School',
      slug: 'demo-school',
      type: 'SCHOOL',
      status: 'ACTIVE',
      email: 'info@demoschool.edu',
    },
  });

  await prisma.tenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
    },
  });

  // ─── DEMO INSTITUTION LOGIN ─────────────────────────────────
  // Use this for client demos — Institution Owner with premium features
  const demoInstHash = await hashPassword('DemoInst@2025!');
  const demoInstitution = await prisma.user.upsert({
    where: { email: 'demo-institution@srpailabs.com' },
    update: { passwordHash: demoInstHash, firstName: 'Demo', lastName: 'Institution', role: 'INSTITUTION_OWNER', accountType: 'B2B_INSTITUTION', status: 'ACTIVE', emailVerified: true, loginAttempts: 0, lockedUntil: null, tenantId: tenant.id },
    create: {
      email: 'demo-institution@srpailabs.com',
      passwordHash: demoInstHash,
      firstName: 'Demo',
      lastName: 'Institution',
      role: 'INSTITUTION_OWNER',
      accountType: 'B2B_INSTITUTION',
      status: 'ACTIVE',
      emailVerified: true,
      tenantId: tenant.id,
    },
  });
  console.log('Demo institution login created:', demoInstitution.email);

  // Keep original demo owner
  const demoOwnerHash = await hashPassword('Owner@12345');
  await prisma.user.upsert({
    where: { email: 'owner@demoschool.edu' },
    update: {},
    create: {
      email: 'owner@demoschool.edu',
      passwordHash: demoOwnerHash,
      firstName: 'Demo',
      lastName: 'Owner',
      role: 'INSTITUTION_OWNER',
      status: 'ACTIVE',
      emailVerified: true,
      tenantId: tenant.id,
    },
  });

  // ─── DEMO STUDENT LOGIN ─────────────────────────────────────
  // Use this for client demos — Student with Pro plan
  const demoStudentHash = await hashPassword('DemoStudent@2025!');

  // Generate student ID
  const studentCounter = await prisma.idCounter.upsert({
    where: { name: 'direct_student' },
    update: { lastValue: { increment: 1 } },
    create: { name: 'direct_student', lastValue: 1 },
  });
  const demoStudentId = `IND-STU-${String(studentCounter.lastValue).padStart(6, '0')}`;

  const demoStudent = await prisma.user.upsert({
    where: { email: 'demo-student@srpailabs.com' },
    update: { passwordHash: demoStudentHash, firstName: 'Demo', lastName: 'Student', role: 'STUDENT', accountType: 'B2C_STUDENT', status: 'ACTIVE', emailVerified: true, loginAttempts: 0, lockedUntil: null },
    create: {
      email: 'demo-student@srpailabs.com',
      passwordHash: demoStudentHash,
      firstName: 'Demo',
      lastName: 'Student',
      role: 'STUDENT',
      accountType: 'B2C_STUDENT',
      directStudentId: demoStudentId,
      referralCode: 'DEM-DEMO01',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('Demo student login created:', demoStudent.email);

  // Create student profile for demo student
  await prisma.studentProfile.upsert({
    where: { userId: demoStudent.id },
    update: {},
    create: {
      userId: demoStudent.id,
      grade: 'Class 12',
      goalDescription: 'Prepare for board exams and competitive entrances',
      courseName: 'Science Stream',
    },
  });

  // ─── SAMPLE SUBJECTS ────────────────────────────────────────
  const subjects = [
    { name: 'Mathematics', code: 'MATH', icon: '📐', color: '#6366f1' },
    { name: 'Physics', code: 'PHY', icon: '⚡', color: '#f59e0b' },
    { name: 'Chemistry', code: 'CHEM', icon: '🧪', color: '#10b981' },
    { name: 'Biology', code: 'BIO', icon: '🧬', color: '#ec4899' },
    { name: 'English', code: 'ENG', icon: '📖', color: '#3b82f6' },
    { name: 'Computer Science', code: 'CS', icon: '💻', color: '#8b5cf6' },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: { ...subject, tenantId: tenant.id },
    });
  }

  // ─── STUDENT PLANS ───────────────────────────────────────────

  await prisma.plan.upsert({
    where: { slug: 'student-free' },
    update: {},
    create: {
      name: 'Student Free',
      slug: 'student-free',
      category: 'STUDENT',
      description: 'Get started with basic learning tools',
      price: 0,
      yearlyPrice: 0,
      interval: 'MONTHLY',
      maxUsers: 1,
      maxStorage: 104857600, // 100MB
      maxAiCredits: 10,
      features: { dashboard: true, limitedAi: true, quizzesPerMonth: 3, notesLimit: '100MB' },
      brandingTier: 'BASIC',
      trialDays: 0,
      sortOrder: 1,
      isActive: true,
      isPopular: false,
    },
  });

  await prisma.plan.upsert({
    where: { slug: 'student-pro' },
    update: {},
    create: {
      name: 'Student Pro',
      slug: 'student-pro',
      category: 'STUDENT',
      description: 'Full-powered AI learning experience',
      price: 149,
      yearlyPrice: 1490,
      interval: 'MONTHLY',
      maxUsers: 1,
      maxStorage: 1073741824, // 1GB
      maxAiCredits: 500,
      features: { dashboard: true, fullAi: true, unlimitedQuizzes: true, studyPlanner: true, revisionTools: true, prioritySupport: true },
      brandingTier: 'BASIC',
      trialDays: 7,
      sortOrder: 2,
      isActive: true,
      isPopular: true,
    },
  });

  await prisma.plan.upsert({
    where: { slug: 'career-premium' },
    update: {},
    create: {
      name: 'Career Premium',
      slug: 'career-premium',
      category: 'STUDENT',
      description: 'IELTS, GRE, placement & career prep',
      price: 399,
      yearlyPrice: 3990,
      interval: 'MONTHLY',
      maxUsers: 1,
      maxStorage: 5368709120, // 5GB
      maxAiCredits: 2000,
      features: { dashboard: true, fullAi: true, unlimitedQuizzes: true, studyPlanner: true, revisionTools: true, ieltsPrep: true, grePrep: true, resumeAi: true, interviewPrep: true, careerMentoring: true, premiumSupport: true },
      brandingTier: 'BASIC',
      trialDays: 7,
      sortOrder: 3,
      isActive: true,
      isPopular: false,
    },
  });

  // ─── INSTITUTION PLANS ──────────────────────────────────────

  await prisma.plan.upsert({
    where: { slug: 'school-starter' },
    update: {},
    create: {
      name: 'School Starter',
      slug: 'school-starter',
      category: 'INSTITUTION',
      description: 'Essential tools for growing schools',
      price: 9999,
      yearlyPrice: 99990,
      interval: 'MONTHLY',
      maxUsers: 300,
      maxStorage: 5368709120, // 5GB
      maxAiCredits: 500,
      features: { institutionDashboard: true, studentLogin: true, teacherLogin: true, attendance: true, notices: true, basicReports: true, logoUpload: true },
      brandingTier: 'BASIC',
      trialDays: 14,
      sortOrder: 10,
      isActive: true,
      isPopular: false,
    },
  });

  await prisma.plan.upsert({
    where: { slug: 'campus-growth' },
    update: {},
    create: {
      name: 'Campus Growth',
      slug: 'campus-growth',
      category: 'INSTITUTION',
      description: 'Scale with AI-powered learning tools',
      price: 24999,
      yearlyPrice: 249990,
      interval: 'MONTHLY',
      maxUsers: 1000,
      maxStorage: 21474836480, // 20GB
      maxAiCredits: 5000,
      features: { institutionDashboard: true, studentLogin: true, teacherLogin: true, attendance: true, notices: true, aiLearningTools: true, parentPortal: true, advancedAnalytics: true, contentLibrary: true, prioritySupport: true, customLogo: true, customColors: true, subdomain: true },
      brandingTier: 'STANDARD',
      trialDays: 14,
      sortOrder: 11,
      isActive: true,
      isPopular: true,
    },
  });

  await prisma.plan.upsert({
    where: { slug: 'university-pro' },
    update: {},
    create: {
      name: 'University Pro',
      slug: 'university-pro',
      category: 'INSTITUTION',
      description: 'Enterprise-grade for universities',
      price: 79999,
      yearlyPrice: 799990,
      interval: 'MONTHLY',
      maxUsers: 5000,
      maxStorage: 107374182400, // 100GB
      maxAiCredits: 50000,
      features: { institutionDashboard: true, studentLogin: true, teacherLogin: true, attendance: true, notices: true, aiLearningTools: true, parentPortal: true, advancedAnalytics: true, contentLibrary: true, multiDepartment: true, apiIntegrations: true, multiCampus: true, ssoReady: true, dedicatedSupport: true, whiteLabel: true, dedicatedOnboarding: true },
      brandingTier: 'WHITE_LABEL',
      trialDays: 14,
      sortOrder: 12,
      isActive: true,
      isPopular: false,
    },
  });

  // Enterprise plan (custom pricing — represented as 0)
  await prisma.plan.upsert({
    where: { slug: 'enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      slug: 'enterprise',
      category: 'INSTITUTION',
      description: 'Custom solution for large organizations',
      price: 0,
      yearlyPrice: 0,
      interval: 'MONTHLY',
      maxUsers: 99999,
      maxStorage: 1099511627776, // 1TB
      maxAiCredits: 999999,
      features: { institutionDashboard: true, studentLogin: true, teacherLogin: true, attendance: true, notices: true, aiLearningTools: true, parentPortal: true, advancedAnalytics: true, contentLibrary: true, multiDepartment: true, apiIntegrations: true, multiCampus: true, ssoReady: true, dedicatedSupport: true, whiteLabel: true, dedicatedOnboarding: true, unlimitedUsers: true, customIntegrations: true, dedicatedAccountManager: true, sla: true, phoneSupport247: true, onPremise: true, customContracts: true },
      brandingTier: 'WHITE_LABEL',
      trialDays: 14,
      sortOrder: 13,
      isActive: true,
      isPopular: false,
    },
  });

  // ─── ADD-ON MODULES ─────────────────────────────────────────

  const addOnModules = [
    { slug: 'ATTENDANCE', name: 'Attendance Tracker', description: 'Digital attendance with reports', monthlyPrice: 499, yearlyPrice: 4999, trialDays: 14, sortOrder: 1 },
    { slug: 'BILLING_FINANCE', name: 'Billing & Finance', description: 'Fee management, invoicing, receipts', monthlyPrice: 999, yearlyPrice: 9999, trialDays: 14, sortOrder: 2 },
    { slug: 'PARENT_PORTAL', name: 'Parent Portal', description: 'Parent access to student data', monthlyPrice: 299, yearlyPrice: 2999, trialDays: 14, sortOrder: 3 },
    { slug: 'TRANSPORT', name: 'Transport Manager', description: 'Route management, tracking', monthlyPrice: 399, yearlyPrice: 3999, trialDays: 14, sortOrder: 4 },
    { slug: 'FEE_REMINDER', name: 'Fee Reminder', description: 'Automated fee notifications', monthlyPrice: 199, yearlyPrice: 1999, trialDays: 14, sortOrder: 5 },
    { slug: 'WHATSAPP', name: 'WhatsApp Integration', description: 'WhatsApp messaging and alerts', monthlyPrice: 599, yearlyPrice: 5999, trialDays: 14, sortOrder: 6 },
    { slug: 'LMS', name: 'LMS Module', description: 'Full learning management system', monthlyPrice: 799, yearlyPrice: 7999, trialDays: 14, sortOrder: 7 },
    { slug: 'AI_ANALYTICS', name: 'AI Analytics', description: 'AI-powered institutional insights', monthlyPrice: 699, yearlyPrice: 6999, trialDays: 14, sortOrder: 8 },
  ];

  for (const mod of addOnModules) {
    await prisma.addOnModule.upsert({
      where: { slug: mod.slug as any },
      update: {},
      create: mod as any,
    });
  }

  // ─── SAMPLE COUPON ──────────────────────────────────────────

  const now = new Date();
  const sixMonthsLater = new Date(now);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

  await prisma.coupon.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: {
      code: 'WELCOME20',
      description: '20% off for new institutions',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxUses: 100,
      validFrom: now,
      validUntil: sixMonthsLater,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'STUDENT50' },
    update: {},
    create: {
      code: 'STUDENT50',
      description: '₹50 off for students',
      discountType: 'FIXED',
      discountValue: 50,
      maxUses: 500,
      validFrom: now,
      validUntil: sixMonthsLater,
      isActive: true,
    },
  });

  // ─── DEMO SUBSCRIPTIONS (for client demos) ──────────────────

  // Get the plans for demo accounts
  const studentProPlan = await prisma.plan.findUnique({ where: { slug: 'student-pro' } });
  const campusGrowthPlan = await prisma.plan.findUnique({ where: { slug: 'campus-growth' } });

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  // Give demo student a Pro subscription
  if (studentProPlan) {
    const existingStudentSub = await prisma.subscription.findFirst({
      where: { userId: demoStudent.id, status: 'ACTIVE' },
    });
    if (!existingStudentSub) {
      await prisma.subscription.create({
        data: {
          userId: demoStudent.id,
          planId: studentProPlan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: oneYearFromNow,
        },
      });
      console.log('Demo student Pro subscription created');
    }
  }

  // Give demo institution a Campus Growth subscription
  if (campusGrowthPlan) {
    const existingInstSub = await prisma.subscription.findFirst({
      where: { tenantId: tenant.id, status: 'ACTIVE' },
    });
    if (!existingInstSub) {
      await prisma.subscription.create({
        data: {
          userId: demoInstitution.id,
          tenantId: tenant.id,
          planId: campusGrowthPlan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: oneYearFromNow,
        },
      });
      console.log('Demo institution Campus Growth subscription created');
    }
  }

  // ─── DEMO INSTITUTION PROFILE ─────────────────────────────
  await prisma.institutionProfile.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      institutionName: 'Demo School of Excellence',
      shortName: 'DSE',
      institutionCode: 'DSE-2025',
      institutionType: 'SCHOOL',
      affiliationType: 'CBSE',
      affiliatedBody: 'Central Board of Secondary Education',
      institutionCategory: 'CO_EDUCATION',
      country: 'India',
      state: 'Telangana',
      city: 'Hyderabad',
      fullAddress: '123 Education Lane, Madhapur, Hyderabad',
      pincode: '500081',
      levelsOffered: ['SECONDARY', 'HIGHER_SECONDARY'],
      streamsOffered: ['SCIENCE', 'COMMERCE', 'ARTS'],
      mediumOfInstruction: ['English', 'Hindi'],
      academicCalendarType: 'April-March',
      yearModel: 'Annual',
      officialEmail: 'info@demoschool.edu',
      officialPhone: '+91 40 12345678',
      website: 'https://demoschool.edu',
      primaryColor: '#4f46e5',
      secondaryColor: '#06b6d4',
      maxTeachers: 50,
      maxStudents: 500,
      attendanceModel: 'Daily',
      examModel: 'Term-based',
      lmsEnabled: true,
      aiEnabled: true,
      onboardingStatus: 'COMPLETED',
      onboardingCompletedAt: new Date(),
    },
  });
  console.log('Demo institution profile created');

  // ─── DEMO DEPARTMENTS ──────────────────────────────────────
  const scienceDept = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'SCI' } },
    update: {},
    create: { tenantId: tenant.id, name: 'Science Department', code: 'SCI', description: 'Physics, Chemistry, Biology, Mathematics' },
  });
  const commerceDept = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'COM' } },
    update: {},
    create: { tenantId: tenant.id, name: 'Commerce Department', code: 'COM', description: 'Accountancy, Business Studies, Economics' },
  });
  const artsDept = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'ARTS' } },
    update: {},
    create: { tenantId: tenant.id, name: 'Arts & Humanities', code: 'ARTS', description: 'History, Political Science, Sociology, English' },
  });
  console.log('Demo departments created');

  // ─── DEMO COURSES ──────────────────────────────────────────
  const scienceCourse = await prisma.course.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'SCI-12' } },
    update: {},
    create: { tenantId: tenant.id, departmentId: scienceDept.id, name: 'Class 12 Science', code: 'SCI-12', description: 'CBSE Class 12 Science Stream', duration: '1 Year' },
  });
  await prisma.course.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'COM-12' } },
    update: {},
    create: { tenantId: tenant.id, departmentId: commerceDept.id, name: 'Class 12 Commerce', code: 'COM-12', description: 'CBSE Class 12 Commerce Stream', duration: '1 Year' },
  });
  await prisma.course.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'ARTS-12' } },
    update: {},
    create: { tenantId: tenant.id, departmentId: artsDept.id, name: 'Class 12 Arts', code: 'ARTS-12', description: 'CBSE Class 12 Humanities Stream', duration: '1 Year' },
  });
  console.log('Demo courses created');

  // Retrieve subjects for linking
  const allSubjects = await prisma.subject.findMany({ where: { tenantId: tenant.id } });
  const subjectMap: Record<string, string> = {};
  for (const s of allSubjects) { subjectMap[s.code] = s.id; }

  // ─── DEMO ENROLLMENTS ──────────────────────────────────────
  const subjectCodes = ['MATH', 'PHY', 'CHEM', 'BIO', 'ENG', 'CS'];
  for (const code of subjectCodes) {
    if (subjectMap[code]) {
      await prisma.enrollment.upsert({
        where: { userId_courseId_subjectId: { userId: demoStudent.id, courseId: scienceCourse.id, subjectId: subjectMap[code] } },
        update: {},
        create: { userId: demoStudent.id, courseId: scienceCourse.id, subjectId: subjectMap[code], status: 'ACTIVE' },
      });
    }
  }
  console.log('Demo enrollments created');

  // ─── DEMO TEACHER ACCOUNT ──────────────────────────────────
  const teacherHash = await hashPassword('Teacher@2025!');
  const demoTeacher = await prisma.user.upsert({
    where: { email: 'teacher@demoschool.edu' },
    update: { passwordHash: teacherHash, status: 'ACTIVE', loginAttempts: 0, lockedUntil: null },
    create: {
      email: 'teacher@demoschool.edu',
      passwordHash: teacherHash,
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'TEACHER',
      accountType: 'B2B_INSTITUTION',
      status: 'ACTIVE',
      emailVerified: true,
      tenantId: tenant.id,
    },
  });
  console.log('Demo teacher created:', demoTeacher.email);

  // ─── DEMO QUIZZES, QUESTIONS & ATTEMPTS ─────────────────────
  const demoQuizzes = [
    { title: 'Calculus Mid-Term Quiz', desc: 'Limits, Derivatives & Integration Basics', subjectCode: 'MATH', totalMarks: 25, passingMarks: 10, duration: 30 },
    { title: 'Kinematics & Laws of Motion', desc: 'Mechanics fundamentals', subjectCode: 'PHY', totalMarks: 20, passingMarks: 8, duration: 25 },
    { title: 'Organic Chemistry - Hydrocarbons', desc: 'Alkanes, Alkenes, Alkynes', subjectCode: 'CHEM', totalMarks: 20, passingMarks: 8, duration: 20 },
    { title: 'Cell Biology & Genetics', desc: 'Cell structure, mitosis, meiosis, genetics', subjectCode: 'BIO', totalMarks: 30, passingMarks: 12, duration: 35 },
    { title: 'English Comprehension & Grammar', desc: 'Reading comprehension and grammar rules', subjectCode: 'ENG', totalMarks: 20, passingMarks: 8, duration: 20 },
    { title: 'Python Programming Basics', desc: 'Variables, loops, functions, data structures', subjectCode: 'CS', totalMarks: 25, passingMarks: 10, duration: 30 },
  ];

  for (const q of demoQuizzes) {
    if (!subjectMap[q.subjectCode]) continue;
    const quiz = await prisma.quiz.create({
      data: {
        title: q.title,
        description: q.desc,
        subjectId: subjectMap[q.subjectCode],
        totalMarks: q.totalMarks,
        passingMarks: q.passingMarks,
        duration: q.duration,
        isPublished: true,
        createdBy: demoTeacher.id,
      },
    });

    // Create 5 questions per quiz
    const questions = [];
    for (let i = 1; i <= 5; i++) {
      const question = await prisma.question.create({
        data: {
          quizId: quiz.id,
          text: `${q.title} - Question ${i}: Sample question text for ${q.subjectCode}`,
          type: 'MCQ',
          options: JSON.parse(JSON.stringify({ A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' })),
          correctAnswer: ['A', 'B', 'C', 'D'][i % 4],
          explanation: `Detailed explanation for question ${i}`,
          difficulty: ['EASY', 'MEDIUM', 'HARD'][i % 3],
          marks: Math.ceil(q.totalMarks / 5),
        },
      });
      questions.push(question);
    }

    // Create quiz attempts (spread over past 60 days)
    const daysAgo = Math.floor(Math.random() * 60);
    const attemptDate = new Date();
    attemptDate.setDate(attemptDate.getDate() - daysAgo);
    const score = Math.floor(q.totalMarks * (0.55 + Math.random() * 0.4));
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: demoStudent.id,
        quizId: quiz.id,
        score,
        totalMarks: q.totalMarks,
        startedAt: attemptDate,
        completedAt: new Date(attemptDate.getTime() + q.duration * 60 * 1000 * 0.7),
        timeTaken: Math.floor(q.duration * 0.7),
      },
    });

    // Create quiz answers
    for (let i = 0; i < questions.length; i++) {
      const correct = Math.random() > 0.3;
      await prisma.quizAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: questions[i].id,
          answer: correct ? questions[i].correctAnswer || 'A' : 'B',
          isCorrect: correct,
        },
      });
    }
  }
  console.log('Demo quizzes, questions & attempts created');

  // ─── DEMO NOTES ─────────────────────────────────────────────
  const demoNotes = [
    { title: 'Differential Calculus - Limits & Continuity', content: '# Limits\\n\\nA limit describes the value a function approaches as the input approaches a value.\\n\\n## Key Formulas\\n- lim(x→a) f(x) = L\\n- L\'Hôpital\'s Rule for 0/0 forms\\n\\n## Practice Problems\\n1. Find lim(x→2) (x²-4)/(x-2)\\n2. Evaluate lim(x→0) sin(x)/x', subjectName: 'Mathematics', tags: ['calculus', 'limits', 'board-exam'] },
    { title: 'Newton\'s Laws of Motion - Complete Notes', content: '# Newton\'s Laws\\n\\n## First Law (Inertia)\\nAn object at rest stays at rest unless acted upon by a force.\\n\\n## Second Law\\nF = ma\\n\\n## Third Law\\nEvery action has an equal and opposite reaction.\\n\\n## Applications\\n- Rocket propulsion\\n- Friction on inclined planes', subjectName: 'Physics', tags: ['mechanics', 'newton', 'forces'] },
    { title: 'Organic Chemistry - IUPAC Nomenclature', content: '# IUPAC Naming\\n\\n## Rules\\n1. Find the longest carbon chain\\n2. Number carbons from nearest substituent\\n3. Name substituents alphabetically\\n\\n## Functional Groups\\n- Alkanes (-ane)\\n- Alkenes (-ene)\\n- Alkynes (-yne)\\n- Alcohols (-ol)\\n- Aldehydes (-al)', subjectName: 'Chemistry', tags: ['organic', 'nomenclature', 'functional-groups'] },
    { title: 'Cell Biology - Mitosis & Meiosis', content: '# Cell Division\\n\\n## Mitosis\\n- Prophase → Metaphase → Anaphase → Telophase\\n- Results in 2 identical daughter cells\\n\\n## Meiosis\\n- Two divisions: Meiosis I & II\\n- Results in 4 haploid cells\\n- Crossing over in prophase I', subjectName: 'Biology', tags: ['cell-biology', 'division', 'genetics'] },
    { title: 'Python Data Structures', content: '# Python Data Structures\\n\\n## Lists\\n```python\\nmy_list = [1, 2, 3]\\nmy_list.append(4)\\n```\\n\\n## Dictionaries\\n```python\\nstudent = {"name": "Demo", "grade": 12}\\n```\\n\\n## Tuples\\nImmutable sequences.\\n\\n## Sets\\nUnique elements only.', subjectName: 'Computer Science', tags: ['python', 'data-structures', 'programming'] },
    { title: 'English Grammar - Tenses Summary', content: '# English Tenses\\n\\n## Present Tenses\\n- Simple Present: I write\\n- Present Continuous: I am writing\\n- Present Perfect: I have written\\n\\n## Past Tenses\\n- Simple Past: I wrote\\n- Past Continuous: I was writing\\n\\n## Future Tenses\\n- Will + base verb\\n- Going to + base verb', subjectName: 'English', tags: ['grammar', 'tenses', 'board-exam'] },
    { title: 'JEE Main - Important Formulas', content: '# JEE Main Formula Sheet\\n\\n## Physics\\n- v = u + at\\n- s = ut + ½at²\\n- Work = F·d·cosθ\\n\\n## Chemistry\\n- PV = nRT\\n- ΔG = ΔH - TΔS\\n\\n## Mathematics\\n- Quadratic: x = (-b ± √(b²-4ac))/2a\\n- Integration by parts: ∫udv = uv - ∫vdu', subjectName: 'Mathematics', tags: ['jee', 'formulas', 'competitive'] },
    { title: 'NEET Biology - Human Physiology', content: '# Human Physiology\\n\\n## Digestive System\\n- Mouth → Esophagus → Stomach → Small Intestine → Large Intestine\\n\\n## Respiratory System\\n- Tidal Volume: 500mL\\n- Vital Capacity: ~3.5-4.5L\\n\\n## Circulatory System\\n- Double circulation\\n- SA node → AV node → Bundle of His', subjectName: 'Biology', tags: ['neet', 'physiology', 'human-body'] },
  ];

  for (let i = 0; i < demoNotes.length; i++) {
    const n = demoNotes[i];
    const daysOffset = Math.floor((i / demoNotes.length) * 45);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - (45 - daysOffset));
    await prisma.note.create({
      data: {
        userId: demoStudent.id,
        title: n.title,
        content: n.content,
        subjectName: n.subjectName,
        tags: n.tags,
        isFavorite: i < 3,
        isDraft: false,
        createdAt: createdDate,
      },
    });
  }
  console.log('Demo notes created');

  // ─── DEMO STUDY PLANS ──────────────────────────────────────
  const studyPlanItems = [
    { title: 'Calculus Practice - Integration', subjectName: 'Mathematics', duration: 90, isCompleted: true },
    { title: 'Physics - Electrostatics Revision', subjectName: 'Physics', duration: 60, isCompleted: true },
    { title: 'Chemistry - Periodic Table & Trends', subjectName: 'Chemistry', duration: 45, isCompleted: true },
    { title: 'Biology - Ecology Chapter', subjectName: 'Biology', duration: 75, isCompleted: false },
    { title: 'English Literature - The Last Lesson', subjectName: 'English', duration: 40, isCompleted: false },
    { title: 'CS - Object Oriented Programming', subjectName: 'Computer Science', duration: 60, isCompleted: false },
    { title: 'Math - Probability & Statistics', subjectName: 'Mathematics', duration: 90, isCompleted: true },
    { title: 'Physics - Optics & Waves', subjectName: 'Physics', duration: 60, isCompleted: true },
    { title: 'Chemistry - Chemical Bonding', subjectName: 'Chemistry', duration: 45, isCompleted: false },
    { title: 'Biology - Molecular Biology of Gene', subjectName: 'Biology', duration: 60, isCompleted: false },
  ];

  for (let i = 0; i < studyPlanItems.length; i++) {
    const sp = studyPlanItems[i];
    const planDate = new Date();
    planDate.setDate(planDate.getDate() - (10 - i));
    await prisma.studyPlan.create({
      data: {
        userId: demoStudent.id,
        title: sp.title,
        date: planDate,
        subjectName: sp.subjectName,
        duration: sp.duration,
        isCompleted: sp.isCompleted,
        notes: sp.isCompleted ? 'Completed on schedule' : undefined,
      },
    });
  }
  console.log('Demo study plans created');

  // ─── DEMO CONTENT ITEMS (Study Materials) ───────────────────
  const contentItems = [
    { title: 'CBSE Class 12 Mathematics Textbook Solutions', type: 'NOTE' as const, desc: 'Chapter-wise solutions for NCERT Mathematics' },
    { title: 'Physics Revision Sheet - All Chapters', type: 'REVISION_SHEET' as const, desc: 'Quick revision formulae and key concepts' },
    { title: 'Chemistry Question Bank - Organic', type: 'QUESTION_BANK' as const, desc: '500+ MCQs from organic chemistry' },
    { title: 'Biology Flashcards - Human Physiology', type: 'FLASHCARD' as const, desc: 'Quick recall cards for physiology topics' },
    { title: 'Computer Science Assignment - File Handling', type: 'ASSIGNMENT' as const, desc: 'Python file handling exercises' },
    { title: 'English Literature Study Guide', type: 'TEACHER_RESOURCE' as const, desc: 'Comprehensive guide for Flamingo & Vistas' },
    { title: 'Mock Test - JEE Main Pattern', type: 'MOCK_TEST' as const, desc: 'Full-length JEE Main mock test with solutions' },
    { title: 'NEET Biology Practice Set', type: 'MOCK_TEST' as const, desc: 'NEET Biology section practice questions' },
  ];

  for (const ci of contentItems) {
    await prisma.contentItem.create({
      data: {
        tenantId: tenant.id,
        createdById: demoTeacher.id,
        title: ci.title,
        description: ci.desc,
        type: ci.type,
        status: 'APPROVED',
        isPublic: true,
        tags: ['demo', 'class-12'],
      },
    });
  }
  console.log('Demo content items created');

  // ─── DEMO RESOURCES ─────────────────────────────────────────
  const resources = [
    { title: 'NCERT Mathematics Solutions PDF', type: 'PDF', desc: 'Complete NCERT solutions', tags: ['ncert', 'mathematics'] },
    { title: 'Physics Formulae Handbook', type: 'PDF', desc: 'All formulae at a glance', tags: ['physics', 'formulae'] },
    { title: 'Chemistry Lab Manual', type: 'DOCUMENT', desc: 'Practical experiments guide', tags: ['chemistry', 'lab'] },
    { title: 'English Grammar Video Lectures', type: 'VIDEO', desc: 'Video series on advanced grammar', tags: ['english', 'video'] },
    { title: 'CS Python Tutorial Series', type: 'VIDEO', desc: 'Complete Python programming course', tags: ['python', 'cs'] },
    { title: 'Biology Diagrams Collection', type: 'IMAGE', desc: 'High-quality diagrams for biology', tags: ['biology', 'diagrams'] },
  ];

  for (const r of resources) {
    await prisma.resource.create({
      data: {
        title: r.title,
        description: r.desc,
        type: r.type,
        tags: r.tags,
        isPublished: true,
        createdBy: demoTeacher.id,
        subjectId: subjectMap[r.tags[0] === 'ncert' ? 'MATH' : r.tags[0] === 'physics' ? 'PHY' : r.tags[0] === 'chemistry' ? 'CHEM' : r.tags[0] === 'english' ? 'ENG' : r.tags[0] === 'python' ? 'CS' : 'BIO'] || null,
      },
    });
  }
  console.log('Demo resources created');

  // ─── DEMO AI CHAT ───────────────────────────────────────────
  const aiChat = await prisma.aiChat.create({
    data: {
      userId: demoStudent.id,
      title: 'Help with Calculus Integration',
    },
  });
  const chatMessages = [
    { role: 'user', content: 'Can you explain integration by parts with an example?' },
    { role: 'assistant', content: 'Integration by parts is based on the product rule of differentiation.\n\n**Formula:** ∫u dv = uv - ∫v du\n\n**Example:** Find ∫x·eˣ dx\n\n**Step 1:** Choose u = x, dv = eˣ dx\n**Step 2:** Then du = dx, v = eˣ\n**Step 3:** Apply formula: x·eˣ - ∫eˣ dx = x·eˣ - eˣ + C\n\n**Result:** ∫x·eˣ dx = eˣ(x - 1) + C\n\nThe key is choosing u and dv wisely. Use **LIATE** rule:\n- **L**ogarithmic\n- **I**nverse trig\n- **A**lgebraic\n- **T**rigonometric\n- **E**xponential' },
    { role: 'user', content: 'What about ∫x²·sin(x) dx?' },
    { role: 'assistant', content: 'For ∫x²·sin(x) dx, we need to apply integration by parts **twice**.\n\n**First application:**\n- u = x², dv = sin(x) dx\n- du = 2x dx, v = -cos(x)\n- = -x²cos(x) + ∫2x·cos(x) dx\n\n**Second application** (for ∫2x·cos(x) dx):\n- u = 2x, dv = cos(x) dx\n- du = 2 dx, v = sin(x)\n- = 2x·sin(x) - ∫2·sin(x) dx\n- = 2x·sin(x) + 2cos(x)\n\n**Final Answer:**\n∫x²·sin(x) dx = **-x²cos(x) + 2x·sin(x) + 2cos(x) + C**' },
  ];
  for (const msg of chatMessages) {
    await prisma.aiChatMessage.create({
      data: { chatId: aiChat.id, role: msg.role, content: msg.content },
    });
  }
  console.log('Demo AI chat created');

  // ─── DEMO NOTIFICATIONS ────────────────────────────────────
  const notifications = [
    { title: 'Welcome to SRP Education AI!', message: 'Your account has been set up successfully. Start exploring the platform.', type: 'SYSTEM' },
    { title: 'New Quiz Available', message: 'Calculus Mid-Term Quiz is now available. Complete it before the deadline.', type: 'QUIZ' },
    { title: 'Study Plan Reminder', message: 'You have 3 pending study tasks for today. Stay on track!', type: 'REMINDER' },
    { title: 'Achievement Unlocked', message: 'You completed 5 quizzes this week! Keep up the great work.', type: 'ACHIEVEMENT' },
    { title: 'New Resource Added', message: 'Physics Formulae Handbook has been uploaded to your resources.', type: 'RESOURCE' },
  ];
  for (const n of notifications) {
    await prisma.notification.create({
      data: { userId: demoStudent.id, title: n.title, message: n.message, type: n.type },
    });
  }
  // Institution notifications
  for (const n of [
    { title: 'Institution Setup Complete', message: 'Demo School of Excellence is fully configured and ready.', type: 'SYSTEM' },
    { title: 'New Student Registered', message: 'Demo Student has joined the platform.', type: 'USER' },
    { title: 'Subscription Active', message: 'Your Campus Growth plan is active until next year.', type: 'BILLING' },
  ]) {
    await prisma.notification.create({
      data: { userId: demoInstitution.id, tenantId: tenant.id, title: n.title, message: n.message, type: n.type },
    });
  }
  console.log('Demo notifications created');

  // ─── DEMO ANALYTICS DATA ───────────────────────────────────
  // Analytics events
  const eventTypes = ['PAGE_VIEW', 'QUIZ_COMPLETED', 'NOTE_CREATED', 'AI_CHAT', 'LOGIN', 'STUDY_SESSION'];
  for (let d = 0; d < 90; d++) {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() - d);
    const eventsPerDay = Math.floor(3 + Math.random() * 8);
    for (let e = 0; e < eventsPerDay; e++) {
      await prisma.analyticsEvent.create({
        data: {
          tenantId: tenant.id,
          userId: demoStudent.id,
          event: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          resource: 'dashboard',
          metadata: JSON.parse(JSON.stringify({ source: 'demo', duration: Math.floor(Math.random() * 120) })),
          createdAt: eventDate,
        },
      });
    }
  }

  // Analytics snapshots (monthly for past 12 months)
  for (let m = 0; m < 12; m++) {
    const snapDate = new Date();
    snapDate.setMonth(snapDate.getMonth() - m);
    snapDate.setDate(1);
    snapDate.setHours(0, 0, 0, 0);

    // Student metrics snapshot
    await prisma.analyticsSnapshot.upsert({
      where: { tenantId_type_date: { tenantId: tenant.id, type: 'STUDENT_METRICS', date: snapDate } },
      update: {},
      create: {
        tenantId: tenant.id,
        type: 'STUDENT_METRICS',
        date: snapDate,
        metrics: JSON.parse(JSON.stringify({
          totalStudents: 120 + m * 15,
          activeStudents: 95 + m * 10,
          avgQuizScore: 62 + Math.floor(Math.random() * 20),
          notesCreated: 200 + m * 30,
          studyHours: 450 + m * 50,
          quizzesTaken: 180 + m * 25,
          aiChats: 90 + m * 15,
        })),
      },
    });

    // Enrollment snapshot
    await prisma.analyticsSnapshot.upsert({
      where: { tenantId_type_date: { tenantId: tenant.id, type: 'ENROLLMENT', date: snapDate } },
      update: {},
      create: {
        tenantId: tenant.id,
        type: 'ENROLLMENT',
        date: snapDate,
        metrics: JSON.parse(JSON.stringify({
          science: 45 + Math.floor(m * 3),
          commerce: 35 + Math.floor(m * 2),
          arts: 25 + Math.floor(m * 1.5),
          newEnrollments: 8 + Math.floor(Math.random() * 12),
          dropouts: Math.floor(Math.random() * 3),
        })),
      },
    });

    // Performance snapshot
    await prisma.analyticsSnapshot.upsert({
      where: { tenantId_type_date: { tenantId: tenant.id, type: 'PERFORMANCE', date: snapDate } },
      update: {},
      create: {
        tenantId: tenant.id,
        type: 'PERFORMANCE',
        date: snapDate,
        metrics: JSON.parse(JSON.stringify({
          mathematics: 68 + Math.floor(Math.random() * 15),
          physics: 62 + Math.floor(Math.random() * 18),
          chemistry: 65 + Math.floor(Math.random() * 16),
          biology: 70 + Math.floor(Math.random() * 14),
          english: 75 + Math.floor(Math.random() * 12),
          computerScience: 72 + Math.floor(Math.random() * 15),
        })),
      },
    });
  }
  console.log('Demo analytics data created');

  // ─── DEMO ANALYTICS GOALS ──────────────────────────────────
  const goals = [
    { name: 'Complete 50 Quizzes', type: 'QUIZ_COUNT', targetValue: 50, currentValue: 32, unit: 'quizzes' },
    { name: 'Study 200 Hours', type: 'STUDY_HOURS', targetValue: 200, currentValue: 142, unit: 'hours' },
    { name: 'Score 80% Average', type: 'AVG_SCORE', targetValue: 80, currentValue: 73, unit: '%' },
    { name: 'Create 30 Notes', type: 'NOTE_COUNT', targetValue: 30, currentValue: 24, unit: 'notes' },
  ];
  for (const g of goals) {
    await prisma.analyticsGoal.create({
      data: {
        userId: demoStudent.id,
        name: g.name,
        type: g.type,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        unit: g.unit,
        status: g.currentValue >= g.targetValue ? 'ACHIEVED' : 'IN_PROGRESS',
      },
    });
  }
  console.log('Demo analytics goals created');

  // ─── DEMO AUDIT LOGS ───────────────────────────────────────
  const auditActions = [
    { action: 'LOGIN', resource: 'auth', userId: demoStudent.id },
    { action: 'LOGIN', resource: 'auth', userId: demoInstitution.id },
    { action: 'QUIZ_ATTEMPT', resource: 'quiz', userId: demoStudent.id },
    { action: 'NOTE_CREATED', resource: 'note', userId: demoStudent.id },
    { action: 'PROFILE_UPDATED', resource: 'user', userId: demoInstitution.id },
    { action: 'CONTENT_CREATED', resource: 'content', userId: demoTeacher.id },
  ];
  for (const a of auditActions) {
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: a.userId,
        action: a.action,
        resource: a.resource,
        ipAddress: '127.0.0.1',
        userAgent: 'SeedScript/1.0',
      },
    });
  }
  console.log('Demo audit logs created');

  // ─── DEMO ACCOUNTS SUMMARY ─────────────────────────────────
  console.log('\n═══════════════════════════════════════════════');
  console.log('  DEMO ACCOUNTS (for client presentations)');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('  SYSTEM OWNER (you):');
  console.log('    Email:    owner@srpailabs.com');
  console.log('    Password: SrpOwner@2025!');
  console.log('    Role:     SUPER_ADMIN');
  console.log('');
  console.log('  INSTITUTION DEMO:');
  console.log('    Email:    demo-institution@srpailabs.com');
  console.log('    Password: DemoInst@2025!');
  console.log('    Role:     INSTITUTION_OWNER');
  console.log('    Plan:     Campus Growth (Premium)');
  console.log('');
  console.log('  STUDENT DEMO:');
  console.log('    Email:    demo-student@srpailabs.com');
  console.log('    Password: DemoStudent@2025!');
  console.log('    Role:     STUDENT (B2C)');
  console.log('    Plan:     Student Pro');
  console.log('');
  console.log('  TEACHER DEMO:');
  console.log('    Email:    teacher@demoschool.edu');
  console.log('    Password: Teacher@2025!');
  console.log('    Role:     TEACHER');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('  DEMO DATA CREATED:');
  console.log('    - 3 Departments (Science, Commerce, Arts)');
  console.log('    - 3 Courses (Class 12 streams)');
  console.log('    - 6 Subjects & Enrollments');
  console.log('    - 6 Quizzes with 30 Questions & Attempts');
  console.log('    - 8 Notes (study materials)');
  console.log('    - 10 Study Plans');
  console.log('    - 8 Content Items');
  console.log('    - 6 Resources');
  console.log('    - AI Chat History');
  console.log('    - 90 days of Analytics Events');
  console.log('    - 12 months of Analytics Snapshots');
  console.log('    - 4 Analytics Goals');
  console.log('    - Notifications & Audit Logs');
  console.log('═══════════════════════════════════════════════\n');

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
