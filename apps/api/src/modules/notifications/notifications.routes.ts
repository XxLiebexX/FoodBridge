import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth);
router.get('/', NotificationsController.getNotifications);
router.patch('/read-all', NotificationsController.markAllRead);
router.patch('/:id/read', NotificationsController.markRead);

export const notificationRoutes = router;
