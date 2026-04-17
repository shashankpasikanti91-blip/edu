import { Router } from 'express';
import { ContentController } from './content.controller';
import { authenticate } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/tenant';
import { requireTeacherOrAbove, requireTenantAdmin } from '../../middleware/rbac';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.use(authenticate, tenantGuard());

router.post('/', requireTeacherOrAbove(), asyncHandler(ContentController.create));
router.get('/', asyncHandler(ContentController.list));
router.get('/:id', asyncHandler(ContentController.getById));
router.patch('/:id', requireTeacherOrAbove(), asyncHandler(ContentController.update));
router.post('/:id/approve', requireTenantAdmin(), asyncHandler(ContentController.approve));
router.post('/:id/reject', requireTenantAdmin(), asyncHandler(ContentController.reject));
router.post('/:id/flag', asyncHandler(ContentController.flag));
router.delete('/:id', requireTenantAdmin(), asyncHandler(ContentController.remove));

export { router as contentRoutes };
