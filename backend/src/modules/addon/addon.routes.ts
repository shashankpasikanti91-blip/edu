import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { addOnController } from './addon.controller';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { Role } from '../../shared/constants';

const router = Router();

// Public - list available modules
router.get('/modules', asyncHandler(async (req, res) => addOnController.listModules(req, res)));

// Authenticated routes
router.use(authenticate);

// Get tenant's active add-ons
router.get(
  '/tenant',
  asyncHandler(async (req, res) => addOnController.getTenantAddOns(req as any, res))
);

// Check if tenant has specific add-on
router.get(
  '/tenant/check/:slug',
  asyncHandler(async (req, res) => addOnController.checkAddOn(req as any, res))
);

// Get billing summary
router.get(
  '/tenant/billing',
  asyncHandler(async (req, res) => addOnController.getBillingSummary(req as any, res))
);

// Admin-only: activate/deactivate add-ons
router.post(
  '/tenant/activate',
  requireRole(Role.INSTITUTION_OWNER, Role.INSTITUTION_ADMIN, Role.SUPER_ADMIN),
  asyncHandler(async (req, res) => addOnController.activateAddOn(req as any, res))
);

router.post(
  '/tenant/deactivate',
  requireRole(Role.INSTITUTION_OWNER, Role.INSTITUTION_ADMIN, Role.SUPER_ADMIN),
  asyncHandler(async (req, res) => addOnController.deactivateAddOn(req as any, res))
);

export const addOnRoutes = router;
