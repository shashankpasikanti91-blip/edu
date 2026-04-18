const { prisma } = require('../dist/config/database');

async function fix() {
  const demoStudent = await prisma.user.findUnique({ where: { email: 'demo-student@srpailabs.com' } });
  const demoInst = await prisma.user.findUnique({ where: { email: 'demo-institution@srpailabs.com' } });
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo-school' } });

  const goals = [
    { title: 'Complete 50 Quizzes', description: 'Finish 50 quizzes across all subjects', targetValue: 50, currentValue: 32, unit: 'quizzes' },
    { title: 'Study 200 Hours', description: 'Accumulate 200 study hours this semester', targetValue: 200, currentValue: 142, unit: 'hours' },
    { title: 'Score 80% Average', description: 'Achieve 80% average across all subjects', targetValue: 80, currentValue: 73, unit: '%' },
    { title: 'Create 30 Notes', description: 'Create 30 study notes', targetValue: 30, currentValue: 24, unit: 'notes' },
  ];

  for (const g of goals) {
    await prisma.analyticsGoal.create({
      data: {
        user: { connect: { id: demoStudent.id } },
        title: g.title,
        description: g.description,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        unit: g.unit,
        status: g.currentValue >= g.targetValue ? 'ACHIEVED' : 'IN_PROGRESS',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('Analytics goals created');

  for (const a of [
    { action: 'LOGIN', resource: 'auth', userId: demoStudent.id },
    { action: 'LOGIN', resource: 'auth', userId: demoInst.id },
    { action: 'QUIZ_ATTEMPT', resource: 'quiz', userId: demoStudent.id },
  ]) {
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
  console.log('Audit logs created');
  console.log('Fix completed!');
  await prisma.$disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });
