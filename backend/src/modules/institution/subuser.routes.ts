import { Router } from 'express';
import { SubUserController } from './subuser.controller';
import { authenticate } from '../../middleware/auth';
import { requireTenantAdmin } from '../../middleware/rbac';
import { tenantGuard } from '../../middleware/tenant';

const router = Router();

router.use(authenticate);
router.use(tenantGuard());
router.use(requireTenantAdmin());

// Sub-user CRUD
router.post('/', SubUserController.createSubUser);
router.get('/', SubUserController.listSubUsers);
router.patch('/:userId', SubUserController.updateSubUser);
router.post('/:userId/deactivate', SubUserController.deactivateSubUser);
router.post('/:userId/activate', SubUserController.activateSubUser);
router.post('/:userId/reset-password', SubUserController.resetPassword);
router.post('/bulk', SubUserController.bulkCreate);

export const subUserRoutes = router;
