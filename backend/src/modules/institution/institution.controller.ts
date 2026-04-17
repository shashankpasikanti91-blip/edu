import { Request, Response } from 'express';
import { InstitutionService } from './institution.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class InstitutionController {
  /**
   * GET /api/v1/institution/profile
   * Get institution profile for the current tenant.
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await InstitutionService.getProfile(tenantId);
    res.json({ success: true, data: result });
  });

  /**
   * POST /api/v1/institution/profile
   * Create institution profile (onboarding step 1).
   */
  static createProfile = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const profile = await InstitutionService.createProfile(tenantId, req.body);
    res.status(201).json({ success: true, data: profile });
  });

  /**
   * PATCH /api/v1/institution/profile
   * Update institution profile.
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const profile = await InstitutionService.updateProfile(tenantId, req.body);
    res.json({ success: true, data: profile });
  });

  /**
   * POST /api/v1/institution/onboarding/complete
   * Mark onboarding as complete.
   */
  static completeOnboarding = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const profile = await InstitutionService.completeOnboarding(tenantId);
    res.json({ success: true, data: profile });
  });

  /**
   * GET /api/v1/institution/academic-context
   * Get academic context for the tenant (used by exam prep, sub-user creation).
   */
  static getAcademicContext = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const context = await InstitutionService.getAcademicContext(tenantId);
    res.json({ success: true, data: context });
  });
}
