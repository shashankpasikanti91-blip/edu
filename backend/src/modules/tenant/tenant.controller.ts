import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { TenantService } from './tenant.service';

export class TenantController {
  static async create(req: AuthenticatedRequest, res: Response) {
    const tenant = await TenantService.createTenant(req.body);
    res.status(201).json({
      success: true,
      message: 'Institution created successfully',
      data: tenant,
    });
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    const tenant = await TenantService.getTenantById(req.params.tenantId);
    res.json({
      success: true,
      message: 'Institution retrieved successfully',
      data: tenant,
    });
  }

  static async getBySlug(req: AuthenticatedRequest, res: Response) {
    const tenant = await TenantService.getTenantBySlug(req.params.slug);
    res.json({
      success: true,
      message: 'Institution retrieved successfully',
      data: tenant,
    });
  }

  static async list(req: AuthenticatedRequest, res: Response) {
    const { page, limit, status, type, search } = req.query;
    const result = await TenantService.listTenants({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string,
      type: type as string,
      search: search as string,
    });

    res.json({
      success: true,
      message: 'Institutions retrieved successfully',
      data: result.tenants,
      meta: result.meta,
    });
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    const tenant = await TenantService.updateTenant(req.params.tenantId, req.body);
    res.json({
      success: true,
      message: 'Institution updated successfully',
      data: tenant,
    });
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response) {
    const settings = await TenantService.updateTenantSettings(req.params.tenantId, req.body);
    res.json({
      success: true,
      message: 'Institution settings updated successfully',
      data: settings,
    });
  }

  static async suspend(req: AuthenticatedRequest, res: Response) {
    const tenant = await TenantService.suspendTenant(req.params.tenantId);
    res.json({
      success: true,
      message: 'Institution suspended successfully',
      data: tenant,
    });
  }

  static async activate(req: AuthenticatedRequest, res: Response) {
    const tenant = await TenantService.activateTenant(req.params.tenantId);
    res.json({
      success: true,
      message: 'Institution activated successfully',
      data: tenant,
    });
  }

  static async remove(req: AuthenticatedRequest, res: Response) {
    await TenantService.deleteTenant(req.params.tenantId);
    res.json({
      success: true,
      message: 'Institution deleted successfully',
    });
  }

  static async getStats(req: AuthenticatedRequest, res: Response) {
    const tenantId = req.params.tenantId || req.tenantId;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Tenant ID required' });
    }
    const stats = await TenantService.getTenantStats(tenantId);
    res.json({
      success: true,
      message: 'Institution stats retrieved successfully',
      data: stats,
    });
  }
}
