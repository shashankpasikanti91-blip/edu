import { Request, Response } from 'express';
import { userService } from './user.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { AuthenticatedRequest } from '../../shared/types';

export const userController = {
  getProfile: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const profile = await userService.getProfile(authReq.user!.id);

    res.status(200).json({
      success: true,
      message: 'Profile retrieved',
      data: profile,
    });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const user = await userService.updateProfile(authReq.user!.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  }),

  getDashboardStats: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const stats = await userService.getDashboardStats(authReq.user!.id);

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: stats,
    });
  }),
};
