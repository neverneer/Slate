import { NotificationModel } from '../models/notification.model';
import { Notification, NotificationResponse } from '../types/notification';

export class NotificationService {
  async getNotifications(userId: string): Promise<NotificationResponse> {
    const items = await NotificationModel.getForUser(userId);
    const unreadCount = await NotificationModel.getUnreadCount(userId);

    return {
      items,
      unreadCount
    };
  }

  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    return NotificationModel.markAsRead(notificationId, userId);
  }

  async sendWelcomeNotification(userId: string): Promise<Notification> {
    return NotificationModel.create({
      userId,
      type: 'success',
      title: 'Account Created',
      message: 'Welcome to Slate! Your universal identity is now ready.',
      link: '/onboarding'
    });
  }
}
