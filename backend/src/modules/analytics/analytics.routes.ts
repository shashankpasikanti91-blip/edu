import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/auth';
import { requireSuperAdmin, requireTenantAdmin, requireTeacherOrAbove } from '../../middleware/rbac';
import { tenantGuard } from '../../middleware/tenant';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// Platform-level analytics (Super Admin only)
router.get('/platform', authenticate, requireSuperAdmin(), asyncHandler(AnalyticsController.getPlatformStats));
router.get('/platform/growth', authenticate, requireSuperAdmin(), asyncHandler(AnalyticsController.getMonthlyGrowth));

// Tenant-level analytics
router.get('/tenant/:tenantId', authenticate, tenantGuard(), requireTenantAdmin(), asyncHandler(AnalyticsController.getTenantStats));
router.get('/tenant/:tenantId/growth', authenticate, tenantGuard(), requireTenantAdmin(), asyncHandler(AnalyticsController.getMonthlyGrowth));

// Student progress
router.get('/student/:userId?', authenticate, asyncHandler(AnalyticsController.getStudentProgress));

// Teacher stats
router.get('/teacher/:userId?', authenticate, requireTeacherOrAbove(), asyncHandler(AnalyticsController.getTeacherStats));

// Goals
router.get('/goals', authenticate, asyncHandler(AnalyticsController.getGoals));
router.post('/goals', authenticate, asyncHandler(AnalyticsController.createGoal));
router.post('/goals/:goalId/progress', authenticate, asyncHandler(AnalyticsController.updateGoalProgress));

export { router as analyticsRoutes };
