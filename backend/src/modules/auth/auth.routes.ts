import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  signupSchema,
  institutionSignupSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validation';

const router = Router();

// Public routes
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/signup/institution', validate(institutionSignupSchema), authController.signupInstitution);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAllDevices);
router.get('/sessions', authenticate, authController.getActiveSessions);
router.get('/me', authenticate, authController.me);

export { router as authRoutes };
