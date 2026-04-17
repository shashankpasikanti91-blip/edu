import { Router } from 'express';
import crypto from 'crypto';
import { authenticate } from '../../middleware/auth';
import { requireSuperAdmin } from '../../middleware/rbac';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { BadRequestError } from '../../shared/errors/AppError';
import { PaymentService } from './payment.service';
import { env } from '../../config/env';

const router = Router();

// ─── RAZORPAY ROUTES ────────────────────────────────────────

// Create Razorpay order
router.post(
  '/razorpay/order',
  authenticate,
  asyncHandler(async (req, res) => {
    const { subscriptionId, invoiceId, amount } = req.body;
    const order = await PaymentService.createRazorpayOrder(subscriptionId, invoiceId, amount);
    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        keyId: env.RAZORPAY_KEY_ID,
      },
    });
  }),
);

// Verify Razorpay payment
router.post(
  '/razorpay/verify',
  authenticate,
  asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new BadRequestError('Invalid payment signature');
    }

    const payment = await PaymentService.confirmPayment(
      razorpay_order_id,
      razorpay_payment_id,
      'RAZORPAY'
    );
    res.json({ success: true, data: { payment } });
  }),
);

// Razorpay webhook
router.post(
  '/razorpay/webhook',
  asyncHandler(async (req, res) => {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookBody = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      throw new BadRequestError('Invalid webhook signature');
    }

    await PaymentService.handleRazorpayWebhook(req.body);
    res.json({ success: true });
  }),
);

// ─── STRIPE ROUTES ──────────────────────────────────────────

// Create Stripe checkout session
router.post(
  '/stripe/checkout',
  authenticate,
  asyncHandler(async (req, res) => {
    const { subscriptionId, invoiceId, amount, successUrl, cancelUrl } = req.body;
    const session = await PaymentService.createStripeCheckout(
      subscriptionId, invoiceId, amount, successUrl, cancelUrl
    );
    res.json({ success: true, data: { sessionId: session.sessionId, url: session.url } });
  }),
);

// Stripe webhook
router.post(
  '/stripe/webhook',
  asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    await PaymentService.handleStripeWebhook(req.body, sig);
    res.json({ success: true });
  }),
);

// ─── COMMON ROUTES ──────────────────────────────────────────

// Get payment history
router.get(
  '/history',
  authenticate,
  asyncHandler(async (req, res) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await PaymentService.getPaymentHistory(tenantId, userId, page, limit);
    res.json({ success: true, data: result });
  }),
);

export default router;
