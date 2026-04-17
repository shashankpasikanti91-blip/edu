import { Request, Response } from 'express';
import { addOnService } from './addon.service';
import { AuthenticatedRequest } from '../../shared/types';

class AddOnController {
  async listModules(_req: Request, res: Response) {
    const modules = await addOnService.listModules();
    res.status(200).json({
      success: true,
      message: 'Add-on modules retrieved',
      data: modules,
    });
  }

  async getTenantAddOns(req: AuthenticatedRequest, res: Response) {
    const tenantId = req.tenantId || req.params.tenantId;
    if (!tenantId) {
      res.status(400).json({ success: false, message: 'Tenant ID required' });
      return;
    }

    const addOns = await addOnService.getTenantAddOns(tenantId);
    res.status(200).json({
      success: true,
      message: 'Tenant add-ons retrieved',
      data: addOns,
    });
  }

  async activateAddOn(req: AuthenticatedRequest, res: Response) {
    const tenantId = req.tenantId || req.params.tenantId;
    if (!tenantId) {
      res.status(400).json({ success: false, message: 'Tenant ID required' });
      return;
    }

    const { slug, billingInterval } = req.body;
    const result = await addOnService.activateAddOn(tenantId, slug, billingInterval);

    res.status(200).json({
      success: true,
      message: 'Add-on activated successfully',
      data: result,
    });
  }

  async deactivateAddOn(req: AuthenticatedRequest, res: Response) {
    const tenantId = req.tenantId || req.params.tenantId;
    if (!tenantId) {
      res.status(400).json({ success: false, message: 'Tenant ID required' });
      return;
    }

    const { slug } = req.body;
    await addOnService.deactivateAddOn(tenantId, slug);

    res.status(200).json({
      success: true,
      message: 'Add-on deactivated successfully',
    });
  }

  async checkAddOn(req: AuthenticatedRequest, res: Response) {
    const tenantId = req.tenantId || req.params.tenantId;
    if (!tenantId) {
      res.status(400).json({ success: false, message: 'Tenant ID required' });
      return;
    }

    const { slug } = req.params;
    const hasAccess = await addOnService.hasAddOn(tenantId, slug);

    res.status(200).json({
      success: true,
      data: { hasAccess },
    });
  }

  async getBillingSummary(req: AuthenticatedRequest, res: Response) {
    const tenantId = req.tenantId || req.params.tenantId;
    if (!tenantId) {
      res.status(400).json({ success: false, message: 'Tenant ID required' });
      return;
    }

    const summary = await addOnService.getTenantBillingSummary(tenantId);
    res.status(200).json({
      success: true,
      message: 'Billing summary retrieved',
      data: summary,
    });
  }
}

export const addOnController = new AddOnController();
