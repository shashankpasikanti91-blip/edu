import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';

// BigInt JSON serialization support
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/user/user.routes';
import { tenantRoutes } from './modules/tenant/tenant.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';
import { contentRoutes } from './modules/content/content.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import notificationRoutes from './modules/notification/notification.routes';
import subscriptionRoutes from './modules/subscription/subscription.routes';
import uploadRoutes from './modules/upload/upload.routes';
import brandingRoutes from './modules/branding/branding.routes';
import paymentRoutes from './modules/payment/payment.routes';
import { aiRoutes } from './modules/ai/ai.routes';
import { addOnRoutes } from './modules/addon/addon.routes';
import { studentRoutes } from './modules/student/student.routes';
import { institutionRoutes } from './modules/institution/institution.routes';
import { subUserRoutes } from './modules/institution/subuser.routes';
import { taxonomyRoutes } from './modules/taxonomy/taxonomy.routes';
import { logger } from './shared/utils/logger';

const app = express();

// ─── Trust proxy for rate limiter behind reverse proxy ───────
app.set('trust proxy', 1);

// ─── Security middleware ─────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);
app.use(hpp());

// ─── CORS — support wildcard tenant subdomains ──────────────
const allowedOriginPattern = env.FRONTEND_URL; // e.g. https://edu.srpailabs.com
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, health checks)
      if (!origin) return callback(null, true);
      // Exact match
      if (origin === allowedOriginPattern) return callback(null, true);
      // Wildcard subdomain match: *.edu.srpailabs.com
      try {
        const frontendHost = new URL(allowedOriginPattern).hostname; // edu.srpailabs.com
        const reqHost = new URL(origin).hostname;
        if (reqHost === frontendHost || reqHost.endsWith('.' + frontendHost)) {
          return callback(null, true);
        }
      } catch { /* ignore parse errors */ }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // Cache preflight for 24h
  })
);

// ─── Additional security headers ────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0'); // Modern browsers — use CSP instead
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// ─── Rate limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});
app.use(limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

// Strict limiter for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded for this operation. Please try again later.',
  },
});

// Upload rate limiter (prevent abuse)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 uploads per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many uploads. Please try again later.',
  },
});

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ─── Health check ────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'SRP Education AI API is running',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/uploads', uploadLimiter, uploadRoutes);
app.use('/api/v1/branding', brandingRoutes);
app.use('/api/v1/payments', strictLimiter, paymentRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/addons', addOnRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/institution', institutionRoutes);
app.use('/api/v1/institution/users', subUserRoutes);
app.use('/api/v1/taxonomy', taxonomyRoutes);

// ─── 404 handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'The requested resource was not found',
  });
});

// ─── Error handler ───────────────────────────────────────────
app.use(errorHandler);

export { app };
