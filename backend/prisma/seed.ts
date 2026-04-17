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
    update: { firstName: 'SRP', lastName: 'Owner', role: 'SUPER_ADMIN', status: 'ACTIVE', emailVerified: true },
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
    update: { firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN', status: 'ACTIVE', emailVerified: true },
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
    update: { firstName: 'Demo', lastName: 'Institution', role: 'INSTITUTION_OWNER', status: 'ACTIVE', emailVerified: true },
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
    update: { firstName: 'Demo', lastName: 'Student', role: 'STUDENT', accountType: 'B2C_STUDENT', status: 'ACTIVE', emailVerified: true },
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
