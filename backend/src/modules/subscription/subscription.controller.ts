import { Request, Response } from 'express';
import { SubscriptionService } from './subscription.service';

export class SubscriptionController {
  // ─── PLANS ──────────────────────────────────────────────────

  static async listPlans(req: Request, res: Response) {
    const { category } = req.query;
    const plans = await SubscriptionService.listPlans(category as string);
    res.json({ success: true, data: { plans } });
  }

  static async getPlan(req: Request, res: Response) {
    const plan = await SubscriptionService.getPlanById(req.params.id);
    res.json({ success: true, data: { plan } });
  }

  static async createPlan(req: Request, res: Response) {
    const plan = await SubscriptionService.createPlan(req.body);
    res.status(201).json({ success: true, data: { plan } });
  }

  static async updatePlan(req: Request, res: Response) {
    const plan = await SubscriptionService.updatePlan(req.params.id, req.body);
    res.json({ success: true, data: { plan } });
  }

  static async deletePlan(req: Request, res: Response) {
    await SubscriptionService.deletePlan(req.params.id);
    res.json({ success: true, message: 'Plan deactivated' });
  }

  // ─── SUBSCRIPTIONS ─────────────────────────────────────────

  static async getSubscription(req: Request, res: Response) {
    const { tenantId, userId } = req.query;
    if (!tenantId && !userId) {
      return res.status(400).json({ success: false, message: 'Either tenantId or userId is required' });
    }
    const subscription = await SubscriptionService.getSubscription(
      tenantId ? String(tenantId) : undefined,
      userId ? String(userId) : undefined
    );
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription found' });
    }
    res.json({ success: true, data: { subscription } });
  }

  static async getSubscriptionDetails(req: Request, res: Response) {
    const details = await SubscriptionService.getSubscriptionDetails(req.params.id);
    res.json({ success: true, data: details });
  }

  static async createSubscription(req: Request, res: Response) {
    const subscription = await SubscriptionService.createSubscription(req.body);
    res.status(201).json({ success: true, data: { subscription } });
  }

  static async renewSubscription(req: Request, res: Response) {
    const { couponCode } = req.body;
    const subscription = await SubscriptionService.renewSubscription(req.params.id, couponCode);
    res.json({ success: true, data: { subscription } });
  }

  static async upgradeSubscription(req: Request, res: Response) {
    const { planId } = req.body;
    const subscription = await SubscriptionService.upgradeSubscription(req.params.id, planId);
    res.json({ success: true, data: { subscription } });
  }

  static async cancelSubscription(req: Request, res: Response) {
    const { reason } = req.body;
    const subscription = await SubscriptionService.cancelSubscription(req.params.id, reason);
    res.json({ success: true, data: { subscription } });
  }

  // ─── BILLING DASHBOARD ─────────────────────────────────────

  static async getBillingDashboard(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || (req.query.tenantId as string);
    const userId = (req as any).user?.id;
    const dashboard = await SubscriptionService.getBillingDashboard(tenantId, userId);
    res.json({ success: true, data: dashboard });
  }

  // ─── INVOICES ───────────────────────────────────────────────

  static async getInvoices(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || (req.query.tenantId as string);
    const userId = (req as any).user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await SubscriptionService.getInvoices(tenantId, userId, page, limit);
    res.json({ success: true, data: result });
  }

  static async updateInvoiceStatus(req: Request, res: Response) {
    const { status } = req.body;
    const invoice = await SubscriptionService.updateInvoiceStatus(req.params.id, status);
    res.json({ success: true, data: { invoice } });
  }

  // ─── COUPONS ────────────────────────────────────────────────

  static async validateCoupon(req: Request, res: Response) {
    const { code, amount, planId } = req.body;
    const coupon = await SubscriptionService.validateCoupon(code, amount, planId);
    const discount = SubscriptionService.calculateDiscount(coupon, amount);
    res.json({ success: true, data: { coupon, discount } });
  }

  static async createCoupon(req: Request, res: Response) {
    const coupon = await SubscriptionService.createCoupon(req.body);
    res.status(201).json({ success: true, data: { coupon } });
  }

  static async listCoupons(req: Request, res: Response) {
    const activeOnly = req.query.activeOnly !== 'false';
    const coupons = await SubscriptionService.listCoupons(activeOnly);
    res.json({ success: true, data: { coupons } });
  }

  static async deactivateCoupon(req: Request, res: Response) {
    await SubscriptionService.deactivateCoupon(req.params.id);
    res.json({ success: true, message: 'Coupon deactivated' });
  }

  // ─── REFERRALS ──────────────────────────────────────────────

  static async createReferral(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const referral = await SubscriptionService.createReferral(userId);
    res.status(201).json({ success: true, data: { referral } });
  }

  static async applyReferral(req: Request, res: Response) {
    const { referralCode, referredEmail, referredId } = req.body;
    const referral = await SubscriptionService.applyReferral(referralCode, referredEmail, referredId);
    res.json({ success: true, data: { referral } });
  }

  // ─── ALERTS ─────────────────────────────────────────────────

  static async checkAlerts(_req: Request, res: Response) {
    const results = await SubscriptionService.checkAndSendAlerts();
    res.json({ success: true, data: { alertsSent: results.length, alerts: results } });
  }
}
