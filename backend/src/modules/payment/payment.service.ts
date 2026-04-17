import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';
import { env } from '../../config/env';

export class PaymentService {
  // ─── RAZORPAY ───────────────────────────────────────────────

  static async createRazorpayOrder(subscriptionId: string, invoiceId: string, amount: number) {
    // In production, call Razorpay API:
    // const Razorpay = require('razorpay');
    // const instance = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
    // const order = await instance.orders.create({ amount: amount * 100, currency: 'INR', receipt: invoiceId });

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await prisma.payment.create({
      data: {
        subscriptionId,
        invoiceId,
        amount,
        currency: 'INR',
        provider: 'RAZORPAY',
        providerOrderId: orderId,
        status: 'PENDING',
      } as any,
    });

    return {
      orderId,
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
    };
  }

  static async confirmPayment(providerOrderId: string, providerPaymentId: string, provider: string) {
    const payment = await prisma.payment.findFirst({
      where: { providerOrderId, provider: provider as any },
    });

    if (!payment) throw new NotFoundError('Payment not found');

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId,
        status: 'COMPLETED',
        paidAt: new Date(),
      } as any,
    });

    // Update invoice status
    if ((payment as any).invoiceId) {
      await prisma.invoice.update({
        where: { id: (payment as any).invoiceId },
        data: { status: 'PAID', paidAt: new Date() },
      });
    }

    // Activate/renew subscription
    await prisma.subscription.update({
      where: { id: (payment as any).subscriptionId },
      data: { status: 'ACTIVE' } as any,
    });

    logger.info(`Payment confirmed: ${payment.id} via ${provider}`);
    return updated;
  }

  static async handleRazorpayWebhook(body: any) {
    const event = body.event;

    switch (event) {
      case 'payment.captured': {
        const paymentEntity = body.payload.payment.entity;
        await this.confirmPayment(
          paymentEntity.order_id,
          paymentEntity.id,
          'RAZORPAY'
        );
        break;
      }
      case 'payment.failed': {
        const failedPayment = body.payload.payment.entity;
        const payment = await prisma.payment.findFirst({
          where: { providerOrderId: failedPayment.order_id, provider: 'RAZORPAY' as any },
        });
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              failureReason: failedPayment.error_description || 'Payment failed',
            } as any,
          });

          // Create alert
          await prisma.subscriptionAlert.create({
            data: {
              subscriptionId: (payment as any).subscriptionId,
              type: 'PAYMENT_FAILED',
              title: 'Payment failed',
              message: 'Your recent payment could not be processed. Please try again or update payment method.',
              actionUrl: '/dashboard/settings',
            } as any,
          });
        }
        break;
      }
      default:
        logger.info(`Unhandled Razorpay webhook event: ${event}`);
    }
  }

  // ─── STRIPE ─────────────────────────────────────────────────

  static async createStripeCheckout(
    subscriptionId: string,
    invoiceId: string,
    amount: number,
    successUrl: string,
    cancelUrl: string
  ) {
    // In production, call Stripe API:
    // const stripe = require('stripe')(env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({...});

    const sessionId = `cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await prisma.payment.create({
      data: {
        subscriptionId,
        invoiceId,
        amount,
        currency: 'USD',
        provider: 'STRIPE',
        providerOrderId: sessionId,
        status: 'PENDING',
      } as any,
    });

    return {
      sessionId,
      url: `${env.FRONTEND_URL}/payment/stripe?session=${sessionId}`,
    };
  }

  static async handleStripeWebhook(body: any, signature: string) {
    // In production, verify with Stripe:
    // const stripe = require('stripe')(env.STRIPE_SECRET_KEY);
    // const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);

    const event = body;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await this.confirmPayment(
          session.id,
          session.payment_intent,
          'STRIPE'
        );
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        logger.error(`Stripe payment failed: ${intent.id}`);
        break;
      }
      default:
        logger.info(`Unhandled Stripe webhook event: ${event.type}`);
    }
  }

  // ─── PAYMENT HISTORY ────────────────────────────────────────

  static async getPaymentHistory(tenantId?: string, userId?: string, page = 1, limit = 20) {
    const subscriptionWhere: Record<string, unknown> = {};
    if (tenantId) subscriptionWhere.tenantId = tenantId;
    if (userId) subscriptionWhere.userId = userId;

    const subscriptions = await prisma.subscription.findMany({
      where: subscriptionWhere as any,
      select: { id: true },
    });
    const subscriptionIds = subscriptions.map((s) => s.id);

    if (subscriptionIds.length === 0) {
      return { payments: [], meta: { page, limit, total: 0, totalPages: 0 } };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { subscriptionId: { in: subscriptionIds } },
        include: { invoice: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({
        where: { subscriptionId: { in: subscriptionIds } },
      }),
    ]);

    return {
      payments,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
