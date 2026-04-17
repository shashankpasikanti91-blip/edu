import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { ContentService } from './content.service';

export class ContentController {
  static async create(req: AuthenticatedRequest, res: Response) {
    const content = await ContentService.createContent({
      ...req.body,
      tenantId: req.tenantId!,
      createdById: req.user!.id,
    });
    res.status(201).json({ success: true, message: 'Content created', data: content });
  }

  static async list(req: AuthenticatedRequest, res: Response) {
    const result = await ContentService.listContent({
      tenantId: req.tenantId!,
      type: req.query.type as string,
      status: req.query.status as string,
      subjectId: req.query.subjectId as string,
      search: req.query.search as string,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, message: 'Content retrieved', data: result.items, meta: result.meta });
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    const content = await ContentService.getContentById(req.params.id, req.tenantId!);
    res.json({ success: true, message: 'Content retrieved', data: content });
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    const content = await ContentService.updateContent(req.params.id, req.tenantId!, req.body);
    res.json({ success: true, message: 'Content updated', data: content });
  }

  static async approve(req: AuthenticatedRequest, res: Response) {
    const content = await ContentService.approveContent(
      req.params.id, req.tenantId!, req.user!.id, req.body.note
    );
    res.json({ success: true, message: 'Content approved', data: content });
  }

  static async reject(req: AuthenticatedRequest, res: Response) {
    const content = await ContentService.rejectContent(
      req.params.id, req.tenantId!, req.user!.id, req.body.note
    );
    res.json({ success: true, message: 'Content rejected', data: content });
  }

  static async flag(req: AuthenticatedRequest, res: Response) {
    await ContentService.flagContent(req.params.id, req.tenantId!, req.body.reason);
    res.json({ success: true, message: 'Content flagged for review' });
  }

  static async remove(req: AuthenticatedRequest, res: Response) {
    await ContentService.deleteContent(req.params.id, req.tenantId!);
    res.json({ success: true, message: 'Content deleted' });
  }
}
