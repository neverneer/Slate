import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const notifications = await this.notificationService.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const success = await this.notificationService.markAsRead(userId, id);
      if (!success) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
