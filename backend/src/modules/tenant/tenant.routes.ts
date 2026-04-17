import { Router } from 'express';
import { TenantController } from './tenant.controller';
import { authenticate } from '../../middleware/auth';
import { requireSuperAdmin, requireTenantAdmin } from '../../middleware/rbac';
import { tenantGuard, requireTenantMatch } from '../../middleware/tenant';
import { validate } from '../../middleware/validate';
import { createTenantSchema, updateTenantSchema, updateTenantSettingsSchema } from './tenant.validation';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// Super Admin routes
router.post(
  '/',
  authenticate,
  requireSuperAdmin(),
  validate(createTenantSchema),
  asyncHandler(TenantController.create)
);

router.get(
  '/',
  authenticate,
  requireSuperAdmin(),
  asyncHandler(TenantController.list)
);

router.get(
  '/slug/:slug',
  authenticate,
  asyncHandler(TenantController.getBySlug)
);

router.get(
  '/:tenantId',
  authenticate,
  requireTenantMatch(),
  asyncHandler(TenantController.getById)
);

router.patch(
  '/:tenantId',
  authenticate,
  requireTenantAdmin(),
  requireTenantMatch(),
  validate(updateTenantSchema),
  asyncHandler(TenantController.update)
);

router.patch(
  '/:tenantId/settings',
  authenticate,
  requireTenantAdmin(),
  requireTenantMatch(),
  validate(updateTenantSettingsSchema),
  asyncHandler(TenantController.updateSettings)
);

router.post(
  '/:tenantId/suspend',
  authenticate,
  requireSuperAdmin(),
  asyncHandler(TenantController.suspend)
);

router.post(
  '/:tenantId/activate',
  authenticate,
  requireSuperAdmin(),
  asyncHandler(TenantController.activate)
);

router.delete(
  '/:tenantId',
  authenticate,
  requireSuperAdmin(),
  asyncHandler(TenantController.remove)
);

router.get(
  '/:tenantId/stats',
  authenticate,
  tenantGuard(),
  requireTenantMatch(),
  asyncHandler(TenantController.getStats)
);

export { router as tenantRoutes };
