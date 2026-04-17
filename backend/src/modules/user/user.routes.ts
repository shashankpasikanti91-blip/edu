import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateProfileSchema } from './user.validation';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.get('/dashboard', userController.getDashboardStats);

export { router as userRoutes };
