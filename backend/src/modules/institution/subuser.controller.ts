import { Request, Response } from 'express';
import { SubUserService } from './subuser.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class SubUserController {
  static createSubUser = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const createdBy = (req as any).user.sub;
    const result = await SubUserService.createSubUser(tenantId, createdBy, req.body);
    res.status(201).json({ success: true, data: result });
  });

  static listSubUsers = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await SubUserService.listSubUsers(tenantId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      role: req.query.role as string,
      departmentId: req.query.departmentId as string,
      status: req.query.status as string,
      search: req.query.search as string,
    });
    res.json({ success: true, data: result });
  });

  static updateSubUser = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await SubUserService.updateSubUser(tenantId, req.params.userId, req.body);
    res.json({ success: true, data: result });
  });

  static deactivateSubUser = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await SubUserService.deactivateSubUser(tenantId, req.params.userId);
    res.json({ success: true, data: result });
  });

  static activateSubUser = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await SubUserService.activateSubUser(tenantId, req.params.userId);
    res.json({ success: true, data: result });
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await SubUserService.resetSubUserPassword(tenantId, req.params.userId);
    res.json({ success: true, data: result });
  });

  static bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const createdBy = (req as any).user.sub;
    const result = await SubUserService.bulkCreateSubUsers(tenantId, createdBy, req.body.users);
    res.json({ success: true, data: result });
  });
}
