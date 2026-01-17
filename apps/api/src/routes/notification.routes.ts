import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

router.get('/', authenticateToken, notificationController.getNotifications);
router.put('/:id/read', authenticateToken, notificationController.markAsRead);

export default router;
