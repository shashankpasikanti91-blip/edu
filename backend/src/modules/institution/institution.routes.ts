import { Router } from 'express';
import { InstitutionController } from './institution.controller';
import { authenticate } from '../../middleware/auth';
import { requireTenantAdmin } from '../../middleware/rbac';
import { tenantGuard } from '../../middleware/tenant';

const router = Router();

// All institution routes require authentication + tenant context + admin role
router.use(authenticate);
router.use(tenantGuard());

// Get institution profile
router.get('/profile', InstitutionController.getProfile);

// Create institution profile (onboarding step 1)
router.post('/profile', requireTenantAdmin(), InstitutionController.createProfile);

// Update institution profile
router.patch('/profile', requireTenantAdmin(), InstitutionController.updateProfile);

// Complete onboarding
router.post('/onboarding/complete', requireTenantAdmin(), InstitutionController.completeOnboarding);

// Get academic context (available to all tenant users)
router.get('/academic-context', InstitutionController.getAcademicContext);

export const institutionRoutes = router;
