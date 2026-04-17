import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';
import type { CreatePlanInput, UpdatePlanInput } from './subscription.validation';

export class SubscriptionService {
  // ─── PLANS ──────────────────────────────────────────────────

  static async listPlans(category?: string) {
    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;

    return prisma.plan.findMany({
      where: where as any,
      orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
    });
  }

  static async getPlanById(id: string) {
    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundError('Plan not found');
    return plan;
  }

  static async getPlanBySlug(slug: string) {
    const plan = await prisma.plan.findUnique({ where: { slug } });
    if (!plan) throw new NotFoundError('Plan not found');
    return plan;
  }

  static async createPlan(data: CreatePlanInput) {
    const existing = await prisma.plan.findUnique({ where: { slug: data.slug } });
    if (existing) throw new BadRequestError('Plan slug already exists');

    return prisma.plan.create({ data: data as any });
  }

  static async updatePlan(id: string, data: UpdatePlanInput) {
    await this.getPlanById(id);
    return prisma.plan.update({ where: { id }, data: data as any });
  }

  static async deletePlan(id: string) {
    const plan = await this.getPlanById(id);
    const activeSubs = await prisma.subscription.count({
      where: { planId: id, status: 'ACTIVE' },
    });
    if (activeSubs > 0) {
      throw new BadRequestError('Cannot delete plan with active subscriptions. Deactivate it instead.');
    }
    return prisma.plan.update({ where: { id }, data: { isActive: false } });
  }

  // ─── SUBSCRIPTIONS ─────────────────────────────────────────

  static async getSubscription(tenantId?: string, userId?: string) {
    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (userId) where.userId = userId;

    return prisma.subscription.findFirst({
      where: where as any,
      include: { plan: true, alerts: { orderBy: { createdAt: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getSubscriptionDetails(subscriptionId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
        alerts: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!sub) throw new NotFoundError('Subscription not found');
    return sub;
  }

  static async createSubscription(data: {
    tenantId?: string;
    userId?: string;
    planId: string;
    paymentProvider?: string;
    couponCode?: string;
  }) {
    const plan = await this.getPlanById(data.planId);

    // Check for existing active subscription
    if (data.tenantId) {
      const existing = await prisma.subscription.findFirst({
        where: { tenantId: data.tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
      });
      if (existing) throw new BadRequestError('Tenant already has an active subscription');
    }

    if (data.userId && !data.tenantId) {
      const existing = await prisma.subscription.findFirst({
        where: { userId: data.userId, tenantId: null, status: { in: ['ACTIVE', 'TRIALING'] } },
      });
      if (existing) throw new BadRequestError('User already has an active subscription');
    }

    const now = new Date();
    const isTrialing = (plan as any).trialDays > 0;
    const periodEnd = new Date(now);

    if (isTrialing) {
      periodEnd.setDate(periodEnd.getDate() + (plan as any).trialDays);
    } else if ((plan as any).interval === 'MONTHLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if ((plan as any).interval === 'QUARTERLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 3);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let couponId: string | undefined;
    if (data.couponCode) {
      const coupon = await this.validateCoupon(data.couponCode, (plan as any).price, data.planId);
      discountAmount = this.calculateDiscount(coupon, (plan as any).price);
      couponId = coupon.id;
    }

    const subscription = await prisma.subscription.create({
      data: {
        tenantId: data.tenantId || null,
        userId: data.userId || null,
        planId: data.planId,
        status: isTrialing ? 'TRIALING' : 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialEndsAt: isTrialing ? periodEnd : null,
        paymentProvider: (data.paymentProvider as any) || null,
        autoRenew: true,
      } as any,
      include: { plan: true },
    });

    // Generate initial invoice (skip for trial)
    if (!isTrialing && (plan as any).price > 0) {
      await this.generateInvoice(subscription.id, {
        tenantId: data.tenantId,
        userId: data.userId,
        amount: (plan as any).price,
        couponId,
        discountAmount,
      });
    }

    // Increment coupon usage
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    logger.info(`Subscription created: ${subscription.id} for plan ${(plan as any).name}`);
    return subscription;
  }

  static async renewSubscription(subscriptionId: string, couponCode?: string) {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });
    if (!sub) throw new NotFoundError('Subscription not found');

    const plan = sub.plan as any;
    const now = new Date();
    const periodEnd = new Date(now);

    if (plan.interval === 'MONTHLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (plan.interval === 'QUARTERLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 3);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    let discountAmount = 0;
    let couponId: string | undefined;
    if (couponCode) {
      const coupon = await this.validateCoupon(couponCode, plan.price, plan.id);
      discountAmount = this.calculateDiscount(coupon, plan.price);
      couponId = coupon.id;
    }

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
        cancelReason: null,
      } as any,
      include: { plan: true },
    });

    if (plan.price > 0) {
      await this.generateInvoice(subscriptionId, {
        tenantId: (sub as any).tenantId,
        userId: (sub as any).userId,
        amount: plan.price,
        couponId,
        discountAmount,
      });
    }

    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    logger.info(`Subscription renewed: ${subscriptionId}`);
    return updated;
  }

  static async upgradeSubscription(subscriptionId: string, newPlanId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });
    if (!sub) throw new NotFoundError('Subscription not found');

    const newPlan = await this.getPlanById(newPlanId);

    if ((newPlan as any).price <= (sub.plan as any).price) {
      throw new BadRequestError('New plan must be higher-priced for an upgrade. Use downgrade instead.');
    }

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { planId: newPlanId } as any,
      include: { plan: true },
    });

    // Prorated invoice for upgrade
    const remainingDays = Math.ceil(
      (sub.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const totalDays = Math.ceil(
      (sub.currentPeriodEnd.getTime() - sub.currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const priceDiff = (newPlan as any).price - (sub.plan as any).price;
    const proratedAmount = Math.round((priceDiff * remainingDays / totalDays) * 100) / 100;

    if (proratedAmount > 0) {
      await this.generateInvoice(subscriptionId, {
        tenantId: (sub as any).tenantId,
        userId: (sub as any).userId,
        amount: proratedAmount,
        description: `Upgrade from ${(sub.plan as any).name} to ${(newPlan as any).name} (prorated)`,
      });
    }

    logger.info(`Subscription upgraded: ${subscriptionId} to plan ${(newPlan as any).name}`);
    return updated;
  }

  static async cancelSubscription(subscriptionId: string, reason?: string) {
    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new NotFoundError('Subscription not found');
    if ((sub as any).status === 'CANCELLED') throw new BadRequestError('Subscription already cancelled');

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason || null,
        autoRenew: false,
      } as any,
      include: { plan: true },
    });

    logger.info(`Subscription cancelled: ${subscriptionId}`);
    return updated;
  }

  // ─── BILLING DASHBOARD ─────────────────────────────────────

  static async getBillingDashboard(tenantId?: string, userId?: string) {
    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (userId) where.userId = userId;

    const subscription = await prisma.subscription.findFirst({
      where: where as any,
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return {
        subscription: null,
        usage: null,
        recentInvoices: [],
        alerts: [],
        upgradeSuggestions: [],
      };
    }

    const [recentInvoices, alerts] = await Promise.all([
      prisma.invoice.findMany({
        where: { subscriptionId: subscription.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.subscriptionAlert.findMany({
        where: { subscriptionId: subscription.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const plan = subscription.plan as any;
    const usage = {
      seatsUsed: (subscription as any).seatsUsed || 0,
      seatsLimit: plan.maxUsers,
      seatsPercentage: plan.maxUsers > 0 ? Math.round(((subscription as any).seatsUsed || 0) / plan.maxUsers * 100) : 0,
      storageUsedMb: (subscription as any).storageUsedMb || 0,
      storageLimitMb: Number(plan.maxStorage) / (1024 * 1024),
      storagePercentage: plan.maxStorage > 0
        ? Math.round(((subscription as any).storageUsedMb || 0) / (Number(plan.maxStorage) / (1024 * 1024)) * 100)
        : 0,
      aiCreditsUsed: (subscription as any).aiCreditsUsed || 0,
      aiCreditsLimit: plan.maxAiCredits,
      aiCreditsPercentage: plan.maxAiCredits > 0
        ? Math.round(((subscription as any).aiCreditsUsed || 0) / plan.maxAiCredits * 100)
        : 0,
    };

    const upgradeSuggestions = await this.getUpgradeSuggestions(subscription, usage);

    return {
      subscription,
      usage,
      recentInvoices,
      alerts,
      upgradeSuggestions,
    };
  }

  // ─── USAGE TRACKING ─────────────────────────────────────────

  static async updateUsage(subscriptionId: string, field: 'seatsUsed' | 'storageUsedMb' | 'aiCreditsUsed', value: number) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { [field]: value } as any,
    });
  }

  static async incrementUsage(subscriptionId: string, field: 'seatsUsed' | 'storageUsedMb' | 'aiCreditsUsed', amount: number = 1) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { [field]: { increment: amount } } as any,
    });
  }

  // ─── INVOICES ───────────────────────────────────────────────

  static async generateInvoice(subscriptionId: string, data: {
    tenantId?: string;
    userId?: string;
    amount: number;
    couponId?: string;
    discountAmount?: number;
    description?: string;
  }) {
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `SRP-INV-${String(invoiceCount + 1).padStart(6, '0')}`;
    const taxRate = 18; // GST
    const amountAfterDiscount = data.amount - (data.discountAmount || 0);
    const tax = Math.round(amountAfterDiscount * taxRate / 100 * 100) / 100;
    const totalAmount = Math.round((amountAfterDiscount + tax) * 100) / 100;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    return prisma.invoice.create({
      data: {
        subscriptionId,
        tenantId: data.tenantId || null,
        userId: data.userId || null,
        invoiceNumber,
        amount: data.amount,
        tax,
        taxRate,
        totalAmount,
        status: 'PENDING',
        couponId: data.couponId || null,
        discountAmount: data.discountAmount || 0,
        description: data.description || 'Subscription payment',
        dueDate,
      } as any,
    });
  }

  static async getInvoices(tenantId?: string, userId?: string, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (userId) where.userId = userId;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: where as any,
        include: { subscription: { include: { plan: true } }, coupon: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where: where as any }),
    ]);

    return {
      invoices,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async updateInvoiceStatus(invoiceId: string, status: string) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: status as any,
        paidAt: status === 'PAID' ? new Date() : undefined,
      },
    });
  }

  // ─── COUPONS ────────────────────────────────────────────────

  static async validateCoupon(code: string, amount: number, planId?: string) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) throw new NotFoundError('Invalid coupon code');

    const now = new Date();
    if (!(coupon as any).isActive) throw new BadRequestError('Coupon is no longer active');
    if (now < (coupon as any).validFrom) throw new BadRequestError('Coupon is not yet valid');
    if (now > (coupon as any).validUntil) throw new BadRequestError('Coupon has expired');
    if ((coupon as any).maxUses && (coupon as any).usedCount >= (coupon as any).maxUses) {
      throw new BadRequestError('Coupon usage limit reached');
    }
    if ((coupon as any).minAmount && amount < (coupon as any).minAmount) {
      throw new BadRequestError(`Minimum order amount is ₹${(coupon as any).minAmount}`);
    }
    if (planId && (coupon as any).applicablePlans?.length > 0 && !(coupon as any).applicablePlans.includes(planId)) {
      throw new BadRequestError('Coupon is not applicable to this plan');
    }

    return coupon;
  }

  static calculateDiscount(coupon: any, amount: number): number {
    if (coupon.discountType === 'PERCENTAGE') {
      return Math.round(amount * coupon.discountValue / 100 * 100) / 100;
    }
    return Math.min(coupon.discountValue, amount);
  }

  static async createCoupon(data: {
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
    maxUses?: number;
    minAmount?: number;
    applicablePlans?: string[];
    validFrom: Date;
    validUntil: Date;
  }) {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
    if (existing) throw new BadRequestError('Coupon code already exists');

    return prisma.coupon.create({
      data: { ...data, code: data.code.toUpperCase() } as any,
    });
  }

  static async listCoupons(activeOnly = true) {
    const where: Record<string, unknown> = {};
    if (activeOnly) where.isActive = true;

    return prisma.coupon.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async deactivateCoupon(id: string) {
    return prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ─── REFERRALS ──────────────────────────────────────────────

  static async createReferral(referrerId: string) {
    const code = `REF-${referrerId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    return prisma.referral.create({
      data: { referrerId, referralCode: code } as any,
    });
  }

  static async applyReferral(referralCode: string, referredEmail: string, referredId: string) {
    const referral = await prisma.referral.findUnique({ where: { referralCode } });
    if (!referral) throw new NotFoundError('Invalid referral code');
    if ((referral as any).status !== 'PENDING') throw new BadRequestError('Referral already used');

    return prisma.referral.update({
      where: { id: referral.id },
      data: {
        referredEmail,
        referredId,
        status: 'CONVERTED',
        convertedAt: new Date(),
      } as any,
    });
  }

  // ─── ALERTS ENGINE ──────────────────────────────────────────

  static async checkAndSendAlerts() {
    const now = new Date();

    // Find subscriptions needing renewal alerts
    const alertWindows = [
      { days: 30, type: 'RENEWAL_REMINDER', title: 'Annual renewal approaching', message: 'Your annual plan renews next month. Please confirm.' },
      { days: 15, type: 'RENEWAL_REMINDER', title: 'Renewal in 15 days', message: 'Please confirm renewal or contact support.' },
      { days: 7, type: 'EXPIRY_WARNING', title: 'Plan expires in 7 days', message: 'Your plan expires in 7 days. Renew now to avoid interruption.' },
      { days: 3, type: 'EXPIRY_WARNING', title: 'Plan expiring soon', message: 'Your subscription is ending soon. Renew immediately.' },
      { days: 0, type: 'EXPIRY_WARNING', title: 'Plan expired', message: 'Your premium features are paused. Renew now to restore access.' },
    ];

    const results: Array<{ subscriptionId: string; alertType: string }> = [];

    for (const window of alertWindows) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + window.days);

      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const subs = await prisma.subscription.findMany({
        where: {
          status: { in: ['ACTIVE', 'TRIALING'] },
          currentPeriodEnd: { gte: startOfDay, lte: endOfDay },
        } as any,
      });

      for (const sub of subs) {
        // Check if alert already sent
        const existingAlert = await prisma.subscriptionAlert.findFirst({
          where: {
            subscriptionId: sub.id,
            type: window.type as any,
            createdAt: { gte: startOfDay },
          },
        });

        if (!existingAlert) {
          await prisma.subscriptionAlert.create({
            data: {
              subscriptionId: sub.id,
              type: window.type as any,
              title: window.title,
              message: window.message,
              actionUrl: '/dashboard/settings',
            } as any,
          });

          // Create user notification
          const userId = (sub as any).userId;
          if (userId) {
            await prisma.notification.create({
              data: {
                userId,
                tenantId: (sub as any).tenantId,
                title: window.title,
                message: window.message,
                type: 'SUBSCRIPTION_ALERT',
              } as any,
            });
          }

          results.push({ subscriptionId: sub.id, alertType: window.type });
        }
      }
    }

    // Expire overdue subscriptions
    const expiredSubs = await prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] },
        currentPeriodEnd: { lt: now },
      } as any,
    });

    for (const sub of expiredSubs) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'EXPIRED' } as any,
      });

      await prisma.subscriptionAlert.create({
        data: {
          subscriptionId: sub.id,
          type: 'EXPIRY_WARNING' as any,
          title: 'Plan expired',
          message: 'Your subscription has expired. Upgrade or renew to continue using premium features.',
          actionUrl: '/dashboard/settings',
        } as any,
      });

      logger.info(`Subscription expired: ${sub.id}`);
    }

    // Usage alerts
    const activeSubs = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' } as any,
      include: { plan: true },
    });

    for (const sub of activeSubs) {
      const plan = sub.plan as any;
      const subAny = sub as any;

      // Seat usage
      if (plan.maxUsers > 0 && subAny.seatsUsed >= plan.maxUsers * 0.9 && subAny.seatsUsed < plan.maxUsers) {
        const existing = await prisma.subscriptionAlert.findFirst({
          where: {
            subscriptionId: sub.id,
            type: 'USAGE_LIMIT' as any,
            createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
            message: { contains: 'active users' },
          },
        });

        if (!existing) {
          await prisma.subscriptionAlert.create({
            data: {
              subscriptionId: sub.id,
              type: 'USAGE_LIMIT' as any,
              title: 'User limit approaching',
              message: `You have used ${subAny.seatsUsed} of ${plan.maxUsers} active users (${Math.round(subAny.seatsUsed / plan.maxUsers * 100)}%). Upgrade now for uninterrupted onboarding.`,
              actionUrl: '/dashboard/settings',
            } as any,
          });
        }
      }

      // At seat limit
      if (plan.maxUsers > 0 && subAny.seatsUsed >= plan.maxUsers) {
        const suggestPlan = await prisma.plan.findFirst({
          where: {
            category: plan.category,
            maxUsers: { gt: plan.maxUsers },
            isActive: true,
          } as any,
          orderBy: { maxUsers: 'asc' },
        });

        if (suggestPlan) {
          const existing = await prisma.subscriptionAlert.findFirst({
            where: {
              subscriptionId: sub.id,
              type: 'UPGRADE_SUGGESTION' as any,
              createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
            },
          });

          if (!existing) {
            await prisma.subscriptionAlert.create({
              data: {
                subscriptionId: sub.id,
                type: 'UPGRADE_SUGGESTION' as any,
                title: 'Upgrade recommended',
                message: `Your institution has reached ${plan.maxUsers} active users. Upgrade to ${(suggestPlan as any).name} to continue adding students.`,
                actionUrl: '/dashboard/settings',
              } as any,
            });
          }
        }
      }
    }

    logger.info(`Alert check completed: ${results.length} alerts sent, ${expiredSubs.length} subscriptions expired`);
    return results;
  }

  // ─── UPGRADE SUGGESTIONS ───────────────────────────────────

  private static async getUpgradeSuggestions(subscription: any, usage: any) {
    const suggestions: string[] = [];
    const plan = subscription.plan;

    if (usage.seatsPercentage >= 80) {
      suggestions.push(`You're using ${usage.seatsPercentage}% of your user seats. Consider upgrading for more capacity.`);
    }
    if (usage.storagePercentage >= 80) {
      suggestions.push(`Storage is at ${usage.storagePercentage}%. Upgrade for more storage space.`);
    }
    if (usage.aiCreditsPercentage >= 80) {
      suggestions.push(`AI credits are at ${usage.aiCreditsPercentage}%. Upgrade for unlimited AI features.`);
    }

    // Suggest next tier
    if (suggestions.length > 0) {
      const nextPlan = await prisma.plan.findFirst({
        where: {
          category: plan.category,
          price: { gt: plan.price },
          isActive: true,
        } as any,
        orderBy: { price: 'asc' },
      });

      if (nextPlan) {
        suggestions.push(`Recommended upgrade: ${(nextPlan as any).name} at ₹${(nextPlan as any).price}/month`);
      }
    }

    return suggestions;
  }
}
