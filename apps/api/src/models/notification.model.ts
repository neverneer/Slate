import { query } from '../config/database';
import { Notification } from '../types/notification';

export class NotificationModel {
  static async getForUser(userId: string): Promise<Notification[]> {
    const result = await query<Notification>(
      `SELECT id, user_id as "userId", type, title, message, is_read as "isRead", link, created_at as "createdAt"
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  static async markAsRead(id: string, userId: string): Promise<boolean> {
    const result = await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async create(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> {
    const result = await query<Notification>(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id as "userId", type, title, message, is_read as "isRead", link, created_at as "createdAt"`,
      [notification.userId, notification.type, notification.title, notification.message, notification.link]
    );
    return result.rows[0];
  }
}
