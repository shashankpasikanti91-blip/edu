import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireSuperAdmin, requireAdmin } from '../../middleware/rbac';
import { SubscriptionController } from './subscription.controller';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { createPlanSchema, updatePlanSchema, createSubscriptionSchema } from './subscription.validation';

const router = Router();

// ─── PUBLIC: List plans (no auth needed) ────────────────────
router.get('/plans', asyncHandler(SubscriptionController.listPlans));
router.get('/plans/:id', asyncHandler(SubscriptionController.getPlan));

// ─── AUTHENTICATED ROUTES ───────────────────────────────────
router.use(authenticate);

// Validate coupon (any authenticated user)
router.post('/coupons/validate', asyncHandler(SubscriptionController.validateCoupon));

// Billing dashboard
router.get('/billing/dashboard', asyncHandler(SubscriptionController.getBillingDashboard));

// Invoices
router.get('/invoices', asyncHandler(SubscriptionController.getInvoices));

// Subscription details
router.get('/:id', asyncHandler(SubscriptionController.getSubscriptionDetails));

// Get subscription by tenant/user
router.get('/', asyncHandler(SubscriptionController.getSubscription));

// Create subscription
router.post('/', asyncHandler(SubscriptionController.createSubscription));

// Renew subscription
router.post('/:id/renew', asyncHandler(SubscriptionController.renewSubscription));

// Upgrade subscription
router.post('/:id/upgrade', asyncHandler(SubscriptionController.upgradeSubscription));

// Cancel subscription
router.post('/:id/cancel', asyncHandler(SubscriptionController.cancelSubscription));

// Referrals
router.post('/referrals', asyncHandler(SubscriptionController.createReferral));
router.post('/referrals/apply', asyncHandler(SubscriptionController.applyReferral));

// ─── ADMIN ROUTES ───────────────────────────────────────────
router.post('/plans', requireSuperAdmin(), validate(createPlanSchema), asyncHandler(SubscriptionController.createPlan));
router.patch('/plans/:id', requireSuperAdmin(), validate(updatePlanSchema), asyncHandler(SubscriptionController.updatePlan));
router.delete('/plans/:id', requireSuperAdmin(), asyncHandler(SubscriptionController.deletePlan));

// Coupons management
router.get('/coupons', requireSuperAdmin(), asyncHandler(SubscriptionController.listCoupons));
router.post('/coupons', requireSuperAdmin(), asyncHandler(SubscriptionController.createCoupon));
router.delete('/coupons/:id', requireSuperAdmin(), asyncHandler(SubscriptionController.deactivateCoupon));

// Invoice status
router.patch('/invoices/:id/status', requireSuperAdmin(), asyncHandler(SubscriptionController.updateInvoiceStatus));

// Alert engine (cron or manual trigger)
router.post('/alerts/check', requireSuperAdmin(), asyncHandler(SubscriptionController.checkAlerts));

export default router;
