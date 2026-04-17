import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors';
import { logger } from '../../shared/utils/logger';

class AddOnService {
  // List all available add-on modules
  async listModules() {
    return prisma.addOnModule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // Get tenant's active add-ons
  async getTenantAddOns(tenantId: string) {
    return prisma.tenantAddOn.findMany({
      where: { tenantId, isActive: true },
      include: { addOn: true },
    });
  }

  // Check if a tenant has a specific add-on active
  async hasAddOn(tenantId: string, slug: string): Promise<boolean> {
    const addOn = await prisma.tenantAddOn.findFirst({
      where: {
        tenantId,
        isActive: true,
        addOn: { slug: slug as any },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    return !!addOn;
  }

  // Activate an add-on for a tenant
  async activateAddOn(tenantId: string, addOnSlug: string, billingInterval: string = 'MONTHLY') {
    const addOn = await prisma.addOnModule.findFirst({
      where: { slug: addOnSlug as any, isActive: true },
    });

    if (!addOn) {
      throw new NotFoundError('Add-on module not found');
    }

    // Check if already active
    const existing = await prisma.tenantAddOn.findFirst({
      where: { tenantId, addOnId: addOn.id },
    });

    if (existing?.isActive) {
      throw new BadRequestError('This add-on is already active');
    }

    const price = billingInterval === 'YEARLY' ? addOn.yearlyPrice : addOn.monthlyPrice;
    const trialEndsAt = addOn.trialDays > 0
      ? new Date(Date.now() + addOn.trialDays * 24 * 60 * 60 * 1000)
      : null;

    const tenantAddOn = existing
      ? await prisma.tenantAddOn.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            activatedAt: new Date(),
            monthlyPrice: price,
            billingInterval,
            trialEndsAt,
          },
          include: { addOn: true },
        })
      : await prisma.tenantAddOn.create({
          data: {
            tenantId,
            addOnId: addOn.id,
            monthlyPrice: price,
            billingInterval,
            trialEndsAt,
          },
          include: { addOn: true },
        });

    logger.info('Add-on activated', { tenantId, addOnSlug });
    return tenantAddOn;
  }

  // Deactivate an add-on for a tenant
  async deactivateAddOn(tenantId: string, addOnSlug: string) {
    const addOn = await prisma.addOnModule.findFirst({
      where: { slug: addOnSlug as any },
    });

    if (!addOn) {
      throw new NotFoundError('Add-on module not found');
    }

    const tenantAddOn = await prisma.tenantAddOn.findFirst({
      where: { tenantId, addOnId: addOn.id, isActive: true },
    });

    if (!tenantAddOn) {
      throw new BadRequestError('This add-on is not currently active');
    }

    await prisma.tenantAddOn.update({
      where: { id: tenantAddOn.id },
      data: { isActive: false },
    });

    logger.info('Add-on deactivated', { tenantId, addOnSlug });
  }

  // Get tenant billing summary including add-ons
  async getTenantBillingSummary(tenantId: string) {
    const [subscription, activeAddOns, allModules] = await Promise.all([
      prisma.subscription.findUnique({
        where: { tenantId },
        include: { plan: true },
      }),
      prisma.tenantAddOn.findMany({
        where: { tenantId, isActive: true },
        include: { addOn: true },
      }),
      prisma.addOnModule.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    const addOnCost = activeAddOns.reduce((sum, a) => sum + (a.monthlyPrice || 0), 0);
    const baseCost = subscription?.plan?.price || 0;

    return {
      currentPlan: subscription?.plan || null,
      subscriptionStatus: subscription?.status || null,
      renewalDate: subscription?.currentPeriodEnd || null,
      enabledAddOns: activeAddOns.map((a) => ({
        slug: a.addOn.slug,
        name: a.addOn.name,
        price: a.monthlyPrice,
        billingInterval: a.billingInterval,
        activatedAt: a.activatedAt,
        expiresAt: a.expiresAt,
        trialEndsAt: a.trialEndsAt,
      })),
      availableAddOns: allModules
        .filter((m) => !activeAddOns.some((a) => a.addOnId === m.id))
        .map((m) => ({
          slug: m.slug,
          name: m.name,
          description: m.description,
          monthlyPrice: m.monthlyPrice,
          yearlyPrice: m.yearlyPrice,
          trialDays: m.trialDays,
        })),
      costBreakdown: {
        basePlan: baseCost,
        addOns: addOnCost,
        total: baseCost + addOnCost,
        currency: subscription?.plan?.currency || 'INR',
      },
    };
  }
}

export const addOnService = new AddOnService();
