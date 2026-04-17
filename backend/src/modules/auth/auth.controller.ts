import { Request, Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { AuthenticatedRequest } from '../../shared/types';

function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress;
}

export const authController = {
  signup: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.signup(
      req.body,
      getClientIp(req),
      req.headers['user-agent']
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      data: result,
    });
  }),

  login: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(
      req.body,
      getClientIp(req),
      req.headers['user-agent']
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tokens = await authService.refreshToken(req.body.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });
  }),

  logout: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    await authService.logout(
      authReq.user!.sessionId,
      authReq.user!.id,
      getClientIp(req),
      req.headers['user-agent']
    );

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  logoutAllDevices: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    await authService.logoutAllDevices(
      authReq.user!.id,
      getClientIp(req),
      req.headers['user-agent']
    );

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices',
    });
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await authService.verifyEmail(req.body.token);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await authService.forgotPassword(req.body);

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await authService.resetPassword(req.body);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  }),

  getActiveSessions: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const sessions = await authService.getActiveSessions(authReq.user!.id);

    res.status(200).json({
      success: true,
      message: 'Active sessions retrieved',
      data: sessions,
    });
  }),

  me: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const { prisma } = await import('../../config/database');
    const user = await prisma.user.findUnique({
      where: { id: authReq.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        accountType: true,
        emailVerified: true,
        tenantId: true,
        directStudentId: true,
      },
    });
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: user,
    });
  }),
};
