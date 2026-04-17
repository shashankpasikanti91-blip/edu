import { Router } from 'express';
import { Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireTenantAdmin, requireSuperAdmin } from '../../middleware/rbac';
import { tenantGuard } from '../../middleware/tenant';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { AuthenticatedRequest } from '../../shared/types';
import { AuditService } from './audit.service';

const router = Router();

router.get(
  '/platform',
  authenticate,
  requireSuperAdmin(),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuditService.getAuditLogs({
      action: req.query.action as string,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    });
    res.json({ success: true, message: 'Audit logs retrieved', data: result.logs, meta: result.meta });
  })
);

router.get(
  '/tenant/:tenantId',
  authenticate,
  tenantGuard(),
  requireTenantAdmin(),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuditService.getAuditLogs({
      tenantId: req.params.tenantId,
      action: req.query.action as string,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, message: 'Audit logs retrieved', data: result.logs, meta: result.meta });
  })
);

export { router as auditRoutes };
