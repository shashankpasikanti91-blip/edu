import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { AnalyticsService } from './analytics.service';
import { Role } from '../../shared/constants';

export class AnalyticsController {
  static async getPlatformStats(req: AuthenticatedRequest, res: Response) {
    const stats = await AnalyticsService.getPlatformStats();
    res.json({ success: true, message: 'Platform stats retrieved', data: stats });
  }

  static async getTenantStats(req: AuthenticatedRequest, res: Response) {
    const tenantId = req.params.tenantId || req.tenantId;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Tenant ID required' });
    }
    const stats = await AnalyticsService.getTenantStats(tenantId);
    res.json({ success: true, message: 'Tenant stats retrieved', data: stats });
  }

  static async getStudentProgress(req: AuthenticatedRequest, res: Response) {
    const userId = req.params.userId || req.user!.id;
    const stats = await AnalyticsService.getStudentProgress(userId);
    res.json({ success: true, message: 'Student progress retrieved', data: stats });
  }

  static async getTeacherStats(req: AuthenticatedRequest, res: Response) {
    const userId = req.params.userId || req.user!.id;
    const tenantId = req.tenantId || req.user!.tenantId;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Tenant context required' });
    }
    const stats = await AnalyticsService.getTeacherStats(userId, tenantId);
    res.json({ success: true, message: 'Teacher stats retrieved', data: stats });
  }

  static async getGoals(req: AuthenticatedRequest, res: Response) {
    const params: { tenantId?: string; userId?: string } = {};
    if (req.user!.role === Role.SUPER_ADMIN) {
      params.tenantId = req.query.tenantId as string;
    } else {
      params.tenantId = req.tenantId || undefined;
    }
    if (req.query.userId) params.userId = req.query.userId as string;
    else if (req.user!.role === Role.STUDENT) params.userId = req.user!.id;

    const goals = await AnalyticsService.getGoals(params);
    res.json({ success: true, message: 'Goals retrieved', data: goals });
  }

  static async createGoal(req: AuthenticatedRequest, res: Response) {
    const data = {
      ...req.body,
      tenantId: req.tenantId || undefined,
      userId: req.body.userId || req.user!.id,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    };
    const goal = await AnalyticsService.createGoal(data);
    res.status(201).json({ success: true, message: 'Goal created', data: goal });
  }

  static async updateGoalProgress(req: AuthenticatedRequest, res: Response) {
    const progress = await AnalyticsService.updateGoalProgress(
      req.params.goalId,
      req.body.value,
      req.body.note
    );
    res.json({ success: true, message: 'Goal progress updated', data: progress });
  }

  static async getMonthlyGrowth(req: AuthenticatedRequest, res: Response) {
    const tenantId = req.params.tenantId || req.tenantId;
    const data = await AnalyticsService.getMonthlyGrowth(tenantId || undefined);
    res.json({ success: true, message: 'Monthly growth data retrieved', data });
  }
}
