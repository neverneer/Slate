import { query } from '../config/database';
import { FeedItem } from '../types/feed';

export class FeedModel {
  static async getFeedForUser(userId: string, limit: number = 20, offset: number = 0): Promise<{ items: FeedItem[], total: number }> {
    const itemsResult = await query<FeedItem>(
      `SELECT id, user_id as "userId", type, title, content, media_url as "mediaUrl", created_at as "createdAt", updated_at as "updatedAt"
       FROM feed_items
       WHERE user_id = $1 OR user_id IS NULL
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query<{ count: string }>(
      'SELECT COUNT(*) FROM feed_items WHERE user_id = $1 OR user_id IS NULL',
      [userId]
    );

    return {
      items: itemsResult.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }

  static async create(item: Omit<FeedItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeedItem> {
    const result = await query<FeedItem>(
      `INSERT INTO feed_items (user_id, type, title, content, media_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id as "userId", type, title, content, media_url as "mediaUrl", created_at as "createdAt", updated_at as "updatedAt"`,
      [item.userId, item.type, item.title, item.content, item.mediaUrl]
    );
    return result.rows[0];
  }
}
