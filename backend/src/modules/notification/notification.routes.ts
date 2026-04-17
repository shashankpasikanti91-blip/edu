import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { NotificationService } from './notification.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { AuthenticatedRequest } from '../../shared/types';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const { page, limit, unreadOnly } = req.query;
    const result = await NotificationService.getUserNotifications(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      unreadOnly: unreadOnly === 'true',
    });
    res.json({ success: true, data: result });
  }),
);

router.patch(
  '/read-all',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await NotificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  }),
);

router.patch(
  '/:id/read',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const notification = await NotificationService.markAsRead(req.params.id, req.user!.id);
    res.json({ success: true, data: { notification } });
  }),
);

export default router;
