import { Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';
import { AuthenticatedRequest } from '../../middleware/auth';

export class NotificationsController {
  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await NotificationsService.getUserNotifications(req.user!.userId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await NotificationsService.markAsRead(req.params.id, req.user!.userId);
      return res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  }

  static async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await NotificationsService.markAllAsRead(req.user!.userId);
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  }
}
