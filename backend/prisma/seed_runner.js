// Seed runner that uses compiled JS output from dist/
const { prisma } = require('../dist/config/database');
const argon2 = require('argon2');

async function main() {
  console.log('Seeding database...');

  const hashPassword = async (password) =>
    argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

  // SYSTEM OWNER
  const ownerHash = await hashPassword('SrpOwner@2025!');
  const systemOwner = await prisma.user.upsert({
    where: { email: 'owner@srpailabs.com' },
    update: { passwordHash: ownerHash, firstName: 'SRP', lastName: 'Owner', role: 'SUPER_ADMIN', status: 'ACTIVE', emailVerified: true, loginAttempts: 0, lockedUntil: null },
    create: { email: 'owner@srpailabs.com', passwordHash: ownerHash, firstName: 'SRP', lastName: 'Owner', role: 'SUPER_ADMIN', status: 'ACTIVE', emailVerified: true },
  });
  console.log('System owner created:', systemOwner.email);

  const adminHash = await hashPassword('Admin@12345');
  await prisma.user.upsert({
    where: { email: 'admin@srpeducation.ai' },
    update: { passwordHash: adminHash, firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN', status: 'ACTIVE', emailVerified: true, loginAttempts: 0, lockedUntil: null },
    create: { email: 'admin@srpeducation.ai', passwordHash: adminHash, firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN', status: 'ACTIVE', emailVerified: true },
  });

  // DEMO TENANT
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-school' },
    update: {},
    create: { name: 'Demo School', slug: 'demo-school', type: 'SCHOOL', status: 'ACTIVE', email: 'info@demoschool.edu' },
  });
  await prisma.tenantSettings.upsert({ where: { tenantId: tenant.id }, update: {}, create: { tenantId: tenant.id } });

  // DEMO INSTITUTION LOGIN
  const demoInstHash = await hashPassword('DemoInst@2025!');
  const demoInstitution = await prisma.user.upsert({
    where: { email: 'demo-institution@srpailabs.com' },
    update: { passwordHash: demoInstHash, firstName: 'Demo', lastName: 'Institution', role: 'INSTITUTION_OWNER', accountType: 'B2B_INSTITUTION', status: 'ACTIVE', emailVerified: true, loginAttempts: 0, lockedUntil: null, tenantId: tenant.id },
    create: { email: 'demo-institution@srpailabs.com', passwordHash: demoInstHash, firstName: 'Demo', lastName: 'Institution', role: 'INSTITUTION_OWNER', accountType: 'B2B_INSTITUTION', status: 'ACTIVE', emailVerified: true, tenantId: tenant.id },
  });
  console.log('Demo institution login created:', demoInstitution.email);

  const demoOwnerHash = await hashPassword('Owner@12345');
  await prisma.user.upsert({
    where: { email: 'owner@demoschool.edu' },
    update: {},
    create: { email: 'owner@demoschool.edu', passwordHash: demoOwnerHash, firstName: 'Demo', lastName: 'Owner', role: 'INSTITUTION_OWNER', status: 'ACTIVE', emailVerified: true, tenantId: tenant.id },
  });

  // DEMO STUDENT
  const demoStudentHash = await hashPassword('DemoStudent@2025!');
  const studentCounter = await prisma.idCounter.upsert({
    where: { name: 'direct_student' },
    update: { lastValue: { increment: 1 } },
    create: { name: 'direct_student', lastValue: 1 },
  });
  const demoStudentId = `IND-STU-${String(studentCounter.lastValue).padStart(6, '0')}`;
  const demoStudent = await prisma.user.upsert({
    where: { email: 'demo-student@srpailabs.com' },
    update: { passwordHash: demoStudentHash, firstName: 'Demo', lastName: 'Student', role: 'STUDENT', accountType: 'B2C_STUDENT', status: 'ACTIVE', emailVerified: true, loginAttempts: 0, lockedUntil: null },
    create: { email: 'demo-student@srpailabs.com', passwordHash: demoStudentHash, firstName: 'Demo', lastName: 'Student', role: 'STUDENT', accountType: 'B2C_STUDENT', directStudentId: demoStudentId, referralCode: 'DEM-DEMO01', status: 'ACTIVE', emailVerified: true },
  });
  console.log('Demo student login created:', demoStudent.email);

  await prisma.studentProfile.upsert({
    where: { userId: demoStudent.id },
    update: {},
    create: { userId: demoStudent.id, grade: 'Class 12', goalDescription: 'Prepare for board exams and competitive entrances', courseName: 'Science Stream' },
  });

  // SUBJECTS
  const subjects = [
    { name: 'Mathematics', code: 'MATH', icon: '📐', color: '#6366f1' },
    { name: 'Physics', code: 'PHY', icon: '⚡', color: '#f59e0b' },
    { name: 'Chemistry', code: 'CHEM', icon: '🧪', color: '#10b981' },
    { name: 'Biology', code: 'BIO', icon: '🧬', color: '#ec4899' },
    { name: 'English', code: 'ENG', icon: '📖', color: '#3b82f6' },
    { name: 'Computer Science', code: 'CS', icon: '💻', color: '#8b5cf6' },
  ];
  for (const subject of subjects) {
    await prisma.subject.upsert({ where: { code: subject.code }, update: {}, create: { ...subject, tenantId: tenant.id } });
  }

  // PLANS
  await prisma.plan.upsert({ where: { slug: 'student-free' }, update: {}, create: { name: 'Student Free', slug: 'student-free', category: 'STUDENT', description: 'Get started with basic learning tools', price: 0, yearlyPrice: 0, interval: 'MONTHLY', maxUsers: 1, maxStorage: 104857600, maxAiCredits: 10, features: { dashboard: true, limitedAi: true, quizzesPerMonth: 3 }, brandingTier: 'BASIC', trialDays: 0, sortOrder: 1, isActive: true, isPopular: false } });
  await prisma.plan.upsert({ where: { slug: 'student-pro' }, update: {}, create: { name: 'Student Pro', slug: 'student-pro', category: 'STUDENT', description: 'Full-powered AI learning experience', price: 149, yearlyPrice: 1490, interval: 'MONTHLY', maxUsers: 1, maxStorage: 1073741824, maxAiCredits: 500, features: { dashboard: true, fullAi: true, unlimitedQuizzes: true, studyPlanner: true }, brandingTier: 'BASIC', trialDays: 7, sortOrder: 2, isActive: true, isPopular: true } });
  await prisma.plan.upsert({ where: { slug: 'career-premium' }, update: {}, create: { name: 'Career Premium', slug: 'career-premium', category: 'STUDENT', description: 'IELTS, GRE, placement & career prep', price: 399, yearlyPrice: 3990, interval: 'MONTHLY', maxUsers: 1, maxStorage: 5368709120, maxAiCredits: 2000, features: { dashboard: true, fullAi: true }, brandingTier: 'BASIC', trialDays: 7, sortOrder: 3, isActive: true, isPopular: false } });
  await prisma.plan.upsert({ where: { slug: 'school-starter' }, update: {}, create: { name: 'School Starter', slug: 'school-starter', category: 'INSTITUTION', description: 'Essential tools for growing schools', price: 9999, yearlyPrice: 99990, interval: 'MONTHLY', maxUsers: 300, maxStorage: 5368709120, maxAiCredits: 500, features: { institutionDashboard: true }, brandingTier: 'BASIC', trialDays: 14, sortOrder: 10, isActive: true, isPopular: false } });
  await prisma.plan.upsert({ where: { slug: 'campus-growth' }, update: {}, create: { name: 'Campus Growth', slug: 'campus-growth', category: 'INSTITUTION', description: 'Scale with AI-powered learning tools', price: 24999, yearlyPrice: 249990, interval: 'MONTHLY', maxUsers: 1000, maxStorage: 21474836480, maxAiCredits: 5000, features: { institutionDashboard: true, advancedAnalytics: true }, brandingTier: 'STANDARD', trialDays: 14, sortOrder: 11, isActive: true, isPopular: true } });
  await prisma.plan.upsert({ where: { slug: 'university-pro' }, update: {}, create: { name: 'University Pro', slug: 'university-pro', category: 'INSTITUTION', description: 'Enterprise-grade for universities', price: 79999, yearlyPrice: 799990, interval: 'MONTHLY', maxUsers: 5000, maxStorage: 107374182400, maxAiCredits: 50000, features: { institutionDashboard: true, whiteLabel: true }, brandingTier: 'WHITE_LABEL', trialDays: 14, sortOrder: 12, isActive: true, isPopular: false } });
  await prisma.plan.upsert({ where: { slug: 'enterprise' }, update: {}, create: { name: 'Enterprise', slug: 'enterprise', category: 'INSTITUTION', description: 'Custom solution for large organizations', price: 0, yearlyPrice: 0, interval: 'MONTHLY', maxUsers: 99999, maxStorage: 1099511627776, maxAiCredits: 999999, features: { everything: true }, brandingTier: 'WHITE_LABEL', trialDays: 14, sortOrder: 13, isActive: true, isPopular: false } });
  console.log('Plans created');

  // ADD-ONS
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
    await prisma.addOnModule.upsert({ where: { slug: mod.slug }, update: {}, create: mod });
  }

  // COUPONS
  const now = new Date();
  const sixMonthsLater = new Date(now);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  await prisma.coupon.upsert({ where: { code: 'WELCOME20' }, update: {}, create: { code: 'WELCOME20', description: '20% off for new institutions', discountType: 'PERCENTAGE', discountValue: 20, maxUses: 100, validFrom: now, validUntil: sixMonthsLater, isActive: true } });
  await prisma.coupon.upsert({ where: { code: 'STUDENT50' }, update: {}, create: { code: 'STUDENT50', description: '₹50 off for students', discountType: 'FIXED', discountValue: 50, maxUses: 500, validFrom: now, validUntil: sixMonthsLater, isActive: true } });

  // SUBSCRIPTIONS
  const studentProPlan = await prisma.plan.findUnique({ where: { slug: 'student-pro' } });
  const campusGrowthPlan = await prisma.plan.findUnique({ where: { slug: 'campus-growth' } });
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  if (studentProPlan) {
    const existingStudentSub = await prisma.subscription.findFirst({ where: { userId: demoStudent.id, status: 'ACTIVE' } });
    if (!existingStudentSub) {
      await prisma.subscription.create({ data: { userId: demoStudent.id, planId: studentProPlan.id, status: 'ACTIVE', currentPeriodStart: new Date(), currentPeriodEnd: oneYearFromNow } });
      console.log('Demo student Pro subscription created');
    }
  }
  if (campusGrowthPlan) {
    const existingInstSub = await prisma.subscription.findFirst({ where: { tenantId: tenant.id, status: 'ACTIVE' } });
    if (!existingInstSub) {
      await prisma.subscription.create({ data: { userId: demoInstitution.id, tenantId: tenant.id, planId: campusGrowthPlan.id, status: 'ACTIVE', currentPeriodStart: new Date(), currentPeriodEnd: oneYearFromNow } });
      console.log('Demo institution Campus Growth subscription created');
    }
  }

  // INSTITUTION PROFILE
  await prisma.institutionProfile.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id, institutionName: 'Demo School of Excellence', shortName: 'DSE', institutionCode: 'DSE-2025', institutionType: 'SCHOOL',
      country: 'India', state: 'Telangana', city: 'Hyderabad', fullAddress: '123 Education Lane, Madhapur, Hyderabad', pincode: '500081',
      officialEmail: 'info@demoschool.edu', officialPhone: '+91 40 12345678', website: 'https://demoschool.edu',
      primaryColor: '#4f46e5', secondaryColor: '#06b6d4', maxTeachers: 50, maxStudents: 500,
      onboardingStatus: 'COMPLETED', onboardingCompletedAt: new Date(),
    },
  });
  console.log('Demo institution profile created');

  // DEPARTMENTS
  const scienceDept = await prisma.department.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: 'SCI' } }, update: {}, create: { tenantId: tenant.id, name: 'Science Department', code: 'SCI', description: 'Physics, Chemistry, Biology, Mathematics' } });
  const commerceDept = await prisma.department.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: 'COM' } }, update: {}, create: { tenantId: tenant.id, name: 'Commerce Department', code: 'COM', description: 'Accountancy, Business Studies, Economics' } });
  const artsDept = await prisma.department.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: 'ARTS' } }, update: {}, create: { tenantId: tenant.id, name: 'Arts & Humanities', code: 'ARTS', description: 'History, Political Science, Sociology, English' } });
  console.log('Demo departments created');

  // COURSES
  const scienceCourse = await prisma.course.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: 'SCI-12' } }, update: {}, create: { tenantId: tenant.id, departmentId: scienceDept.id, name: 'Class 12 Science', code: 'SCI-12', description: 'CBSE Class 12 Science Stream', duration: '1 Year' } });
  await prisma.course.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: 'COM-12' } }, update: {}, create: { tenantId: tenant.id, departmentId: commerceDept.id, name: 'Class 12 Commerce', code: 'COM-12', description: 'CBSE Class 12 Commerce Stream', duration: '1 Year' } });
  await prisma.course.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: 'ARTS-12' } }, update: {}, create: { tenantId: tenant.id, departmentId: artsDept.id, name: 'Class 12 Arts', code: 'ARTS-12', description: 'CBSE Class 12 Humanities Stream', duration: '1 Year' } });
  console.log('Demo courses created');

  // ENROLLMENTS
  const allSubjects = await prisma.subject.findMany({ where: { tenantId: tenant.id } });
  const subjectMap = {};
  for (const s of allSubjects) { subjectMap[s.code] = s.id; }
  for (const code of ['MATH', 'PHY', 'CHEM', 'BIO', 'ENG', 'CS']) {
    if (subjectMap[code]) {
      await prisma.enrollment.upsert({ where: { userId_courseId_subjectId: { userId: demoStudent.id, courseId: scienceCourse.id, subjectId: subjectMap[code] } }, update: {}, create: { userId: demoStudent.id, courseId: scienceCourse.id, subjectId: subjectMap[code], status: 'ACTIVE' } });
    }
  }
  console.log('Demo enrollments created');

  // TEACHER
  const teacherHash = await hashPassword('Teacher@2025!');
  const demoTeacher = await prisma.user.upsert({
    where: { email: 'teacher@demoschool.edu' },
    update: { passwordHash: teacherHash, status: 'ACTIVE', loginAttempts: 0, lockedUntil: null },
    create: { email: 'teacher@demoschool.edu', passwordHash: teacherHash, firstName: 'Priya', lastName: 'Sharma', role: 'TEACHER', accountType: 'B2B_INSTITUTION', status: 'ACTIVE', emailVerified: true, tenantId: tenant.id },
  });
  console.log('Demo teacher created:', demoTeacher.email);

  // QUIZZES
  const demoQuizzes = [
    { title: 'Calculus Mid-Term Quiz', desc: 'Limits, Derivatives & Integration Basics', subjectCode: 'MATH', totalMarks: 25, passingMarks: 10, duration: 30 },
    { title: 'Kinematics & Laws of Motion', desc: 'Mechanics fundamentals', subjectCode: 'PHY', totalMarks: 20, passingMarks: 8, duration: 25 },
    { title: 'Organic Chemistry - Hydrocarbons', desc: 'Alkanes, Alkenes, Alkynes', subjectCode: 'CHEM', totalMarks: 20, passingMarks: 8, duration: 20 },
    { title: 'Cell Biology & Genetics', desc: 'Cell structure, mitosis, meiosis, genetics', subjectCode: 'BIO', totalMarks: 30, passingMarks: 12, duration: 35 },
    { title: 'English Comprehension & Grammar', desc: 'Reading comprehension and grammar rules', subjectCode: 'ENG', totalMarks: 20, passingMarks: 8, duration: 20 },
    { title: 'Python Programming Basics', desc: 'Variables, loops, functions', subjectCode: 'CS', totalMarks: 25, passingMarks: 10, duration: 30 },
  ];
  for (const q of demoQuizzes) {
    if (!subjectMap[q.subjectCode]) continue;
    const quiz = await prisma.quiz.create({ data: { title: q.title, description: q.desc, subjectId: subjectMap[q.subjectCode], totalMarks: q.totalMarks, passingMarks: q.passingMarks, duration: q.duration, isPublished: true, createdBy: demoTeacher.id } });
    const questions = [];
    for (let i = 1; i <= 5; i++) {
      const question = await prisma.question.create({ data: { quizId: quiz.id, text: `${q.title} - Question ${i}`, type: 'MCQ', options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' }, correctAnswer: ['A', 'B', 'C', 'D'][i % 4], explanation: `Explanation for question ${i}`, difficulty: ['EASY', 'MEDIUM', 'HARD'][i % 3], marks: Math.ceil(q.totalMarks / 5) } });
      questions.push(question);
    }
    const daysAgo = Math.floor(Math.random() * 60);
    const attemptDate = new Date(); attemptDate.setDate(attemptDate.getDate() - daysAgo);
    const score = Math.floor(q.totalMarks * (0.55 + Math.random() * 0.4));
    const attempt = await prisma.quizAttempt.create({ data: { userId: demoStudent.id, quizId: quiz.id, score, totalMarks: q.totalMarks, startedAt: attemptDate, completedAt: new Date(attemptDate.getTime() + q.duration * 60 * 1000 * 0.7), timeTaken: Math.floor(q.duration * 0.7) } });
    for (let i = 0; i < questions.length; i++) {
      const correct = Math.random() > 0.3;
      await prisma.quizAnswer.create({ data: { attemptId: attempt.id, questionId: questions[i].id, answer: correct ? questions[i].correctAnswer || 'A' : 'B', isCorrect: correct } });
    }
  }
  console.log('Demo quizzes, questions & attempts created');

  // NOTES
  const demoNotes = [
    { title: 'Differential Calculus - Limits & Continuity', content: '# Limits\nA limit describes the value a function approaches.', subjectName: 'Mathematics', tags: ['calculus', 'limits'] },
    { title: 'Newton\'s Laws of Motion', content: '# Newton\'s Laws\n## First Law (Inertia)\n## Second Law F=ma\n## Third Law', subjectName: 'Physics', tags: ['mechanics', 'newton'] },
    { title: 'Organic Chemistry - IUPAC Nomenclature', content: '# IUPAC Naming Rules', subjectName: 'Chemistry', tags: ['organic', 'nomenclature'] },
    { title: 'Cell Biology - Mitosis & Meiosis', content: '# Cell Division', subjectName: 'Biology', tags: ['cell-biology', 'genetics'] },
    { title: 'Python Data Structures', content: '# Python Data Structures', subjectName: 'Computer Science', tags: ['python', 'data-structures'] },
    { title: 'English Grammar - Tenses Summary', content: '# English Tenses', subjectName: 'English', tags: ['grammar', 'tenses'] },
    { title: 'JEE Main - Important Formulas', content: '# JEE Main Formula Sheet', subjectName: 'Mathematics', tags: ['jee', 'formulas'] },
    { title: 'NEET Biology - Human Physiology', content: '# Human Physiology', subjectName: 'Biology', tags: ['neet', 'physiology'] },
  ];
  for (let i = 0; i < demoNotes.length; i++) {
    const n = demoNotes[i];
    const createdDate = new Date(); createdDate.setDate(createdDate.getDate() - (45 - Math.floor((i / demoNotes.length) * 45)));
    await prisma.note.create({ data: { userId: demoStudent.id, title: n.title, content: n.content, subjectName: n.subjectName, tags: n.tags, isFavorite: i < 3, isDraft: false, createdAt: createdDate } });
  }
  console.log('Demo notes created');

  // STUDY PLANS
  const studyPlanItems = [
    { title: 'Calculus Practice - Integration', subjectName: 'Mathematics', duration: 90, isCompleted: true },
    { title: 'Physics - Electrostatics Revision', subjectName: 'Physics', duration: 60, isCompleted: true },
    { title: 'Chemistry - Periodic Table', subjectName: 'Chemistry', duration: 45, isCompleted: true },
    { title: 'Biology - Ecology Chapter', subjectName: 'Biology', duration: 75, isCompleted: false },
    { title: 'English Literature', subjectName: 'English', duration: 40, isCompleted: false },
    { title: 'CS - OOP Concepts', subjectName: 'Computer Science', duration: 60, isCompleted: false },
  ];
  for (let i = 0; i < studyPlanItems.length; i++) {
    const sp = studyPlanItems[i]; const planDate = new Date(); planDate.setDate(planDate.getDate() - (6 - i));
    await prisma.studyPlan.create({ data: { userId: demoStudent.id, title: sp.title, date: planDate, subjectName: sp.subjectName, duration: sp.duration, isCompleted: sp.isCompleted } });
  }
  console.log('Demo study plans created');

  // CONTENT ITEMS
  const contentItems = [
    { title: 'CBSE Class 12 Math Textbook Solutions', type: 'NOTE', desc: 'Chapter-wise solutions' },
    { title: 'Physics Revision Sheet', type: 'REVISION_SHEET', desc: 'Quick revision formulae' },
    { title: 'Chemistry Question Bank', type: 'QUESTION_BANK', desc: '500+ MCQs' },
    { title: 'Biology Flashcards', type: 'FLASHCARD', desc: 'Quick recall cards' },
  ];
  for (const ci of contentItems) {
    await prisma.contentItem.create({ data: { tenantId: tenant.id, createdById: demoTeacher.id, title: ci.title, description: ci.desc, type: ci.type, status: 'APPROVED', isPublic: true, tags: ['demo'] } });
  }
  console.log('Demo content items created');

  // RESOURCES
  const resources = [
    { title: 'NCERT Mathematics Solutions PDF', type: 'PDF', desc: 'Complete NCERT solutions', subCode: 'MATH' },
    { title: 'Physics Formulae Handbook', type: 'PDF', desc: 'All formulae at a glance', subCode: 'PHY' },
    { title: 'Chemistry Lab Manual', type: 'DOCUMENT', desc: 'Practical experiments guide', subCode: 'CHEM' },
  ];
  for (const r of resources) {
    await prisma.resource.create({ data: { title: r.title, description: r.desc, type: r.type, tags: ['demo'], isPublished: true, createdBy: demoTeacher.id, subjectId: subjectMap[r.subCode] || null } });
  }
  console.log('Demo resources created');

  // AI CHAT
  const aiChat = await prisma.aiChat.create({ data: { userId: demoStudent.id, title: 'Help with Calculus Integration' } });
  await prisma.aiChatMessage.create({ data: { chatId: aiChat.id, role: 'user', content: 'Can you explain integration by parts?' } });
  await prisma.aiChatMessage.create({ data: { chatId: aiChat.id, role: 'assistant', content: 'Integration by parts formula: ∫u dv = uv - ∫v du\n\nExample: ∫x·eˣ dx = eˣ(x - 1) + C' } });
  console.log('Demo AI chat created');

  // NOTIFICATIONS
  for (const n of [
    { title: 'Welcome to SRP Education AI!', message: 'Your account has been set up successfully.', type: 'SYSTEM' },
    { title: 'New Quiz Available', message: 'Calculus Mid-Term Quiz is now available.', type: 'QUIZ' },
    { title: 'Study Plan Reminder', message: 'You have 3 pending study tasks for today.', type: 'REMINDER' },
  ]) {
    await prisma.notification.create({ data: { userId: demoStudent.id, title: n.title, message: n.message, type: n.type } });
  }
  for (const n of [
    { title: 'Institution Setup Complete', message: 'Demo School of Excellence is fully configured.', type: 'SYSTEM' },
    { title: 'Subscription Active', message: 'Your Campus Growth plan is active.', type: 'BILLING' },
  ]) {
    await prisma.notification.create({ data: { userId: demoInstitution.id, tenantId: tenant.id, title: n.title, message: n.message, type: n.type } });
  }
  console.log('Demo notifications created');

  // ANALYTICS EVENTS (90 days)
  const eventTypes = ['PAGE_VIEW', 'QUIZ_COMPLETED', 'NOTE_CREATED', 'AI_CHAT', 'LOGIN', 'STUDY_SESSION'];
  for (let d = 0; d < 90; d++) {
    const eventDate = new Date(); eventDate.setDate(eventDate.getDate() - d);
    const eventsPerDay = Math.floor(3 + Math.random() * 8);
    for (let e = 0; e < eventsPerDay; e++) {
      await prisma.analyticsEvent.create({ data: { tenantId: tenant.id, userId: demoStudent.id, event: eventTypes[Math.floor(Math.random() * eventTypes.length)], resource: 'dashboard', metadata: { source: 'demo', duration: Math.floor(Math.random() * 120) }, createdAt: eventDate } });
    }
  }

  // ANALYTICS SNAPSHOTS (12 months)
  for (let m = 0; m < 12; m++) {
    const snapDate = new Date(); snapDate.setMonth(snapDate.getMonth() - m); snapDate.setDate(1); snapDate.setHours(0, 0, 0, 0);
    await prisma.analyticsSnapshot.upsert({ where: { tenantId_type_date: { tenantId: tenant.id, type: 'STUDENT_METRICS', date: snapDate } }, update: {}, create: { tenantId: tenant.id, type: 'STUDENT_METRICS', date: snapDate, metrics: { totalStudents: 120 + m * 15, activeStudents: 95 + m * 10, avgQuizScore: 62 + Math.floor(Math.random() * 20), notesCreated: 200 + m * 30, studyHours: 450 + m * 50 } } });
    await prisma.analyticsSnapshot.upsert({ where: { tenantId_type_date: { tenantId: tenant.id, type: 'ENROLLMENT', date: snapDate } }, update: {}, create: { tenantId: tenant.id, type: 'ENROLLMENT', date: snapDate, metrics: { science: 45 + Math.floor(m * 3), commerce: 35 + Math.floor(m * 2), arts: 25 + Math.floor(m * 1.5) } } });
    await prisma.analyticsSnapshot.upsert({ where: { tenantId_type_date: { tenantId: tenant.id, type: 'PERFORMANCE', date: snapDate } }, update: {}, create: { tenantId: tenant.id, type: 'PERFORMANCE', date: snapDate, metrics: { mathematics: 68 + Math.floor(Math.random() * 15), physics: 62 + Math.floor(Math.random() * 18), chemistry: 65 + Math.floor(Math.random() * 16) } } });
  }
  console.log('Demo analytics data created');

  // ANALYTICS GOALS
  const goals = [
    { type: 'QUIZ_COUNT', targetValue: 50, currentValue: 32, unit: 'quizzes' },
    { type: 'STUDY_HOURS', targetValue: 200, currentValue: 142, unit: 'hours' },
    { type: 'AVG_SCORE', targetValue: 80, currentValue: 73, unit: '%' },
    { type: 'NOTE_COUNT', targetValue: 30, currentValue: 24, unit: 'notes' },
  ];
  for (const g of goals) {
    await prisma.analyticsGoal.create({ data: { userId: demoStudent.id, type: g.type, targetValue: g.targetValue, currentValue: g.currentValue, unit: g.unit, status: g.currentValue >= g.targetValue ? 'ACHIEVED' : 'IN_PROGRESS' } });
  }
  console.log('Demo analytics goals created');

  // AUDIT LOGS
  for (const a of [
    { action: 'LOGIN', resource: 'auth', userId: demoStudent.id },
    { action: 'LOGIN', resource: 'auth', userId: demoInstitution.id },
    { action: 'QUIZ_ATTEMPT', resource: 'quiz', userId: demoStudent.id },
  ]) {
    await prisma.auditLog.create({ data: { tenantId: tenant.id, userId: a.userId, action: a.action, resource: a.resource, ipAddress: '127.0.0.1', userAgent: 'SeedScript/1.0' } });
  }
  console.log('Demo audit logs created');

  console.log('\nSeed completed successfully!');
  console.log('Demo Accounts:');
  console.log('  owner@srpailabs.com / SrpOwner@2025! (SUPER_ADMIN)');
  console.log('  demo-institution@srpailabs.com / DemoInst@2025! (INSTITUTION_OWNER)');
  console.log('  demo-student@srpailabs.com / DemoStudent@2025! (STUDENT)');
  console.log('  teacher@demoschool.edu / Teacher@2025! (TEACHER)');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
