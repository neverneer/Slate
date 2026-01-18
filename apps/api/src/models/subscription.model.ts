import { query } from '../config/database';
import { Subscription, SubscriptionTier } from '../types/subscription';

export class SubscriptionModel {
  static async getByUserId(userId: string): Promise<Subscription | null> {
    const result = await query<Subscription>(
      `SELECT id, user_id as "userId", tier, status, 
              current_period_start as "currentPeriodStart", 
              current_period_end as "currentPeriodEnd", 
              cancel_at_period_end as "cancelAtPeriodEnd", 
              created_at as "createdAt", updated_at as "updatedAt"
       FROM subscriptions
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  static async create(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const result = await query<Subscription>(
      `INSERT INTO subscriptions (user_id, tier, status, current_period_start, current_period_end, cancel_at_period_end)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id as "userId", tier, status, 
                 current_period_start as "currentPeriodStart", 
                 current_period_end as "currentPeriodEnd", 
                 cancel_at_period_end as "cancelAtPeriodEnd", 
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [
        subscription.userId,
        subscription.tier,
        subscription.status,
        subscription.currentPeriodStart,
        subscription.currentPeriodEnd,
        subscription.cancelAtPeriodEnd
      ]
    );
    return result.rows[0];
  }

  static async updateTier(userId: string, tier: SubscriptionTier): Promise<Subscription | null> {
    const result = await query<Subscription>(
      `UPDATE subscriptions 
       SET tier = $1, status = 'active', updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING id, user_id as "userId", tier, status, 
                 current_period_start as "currentPeriodStart", 
                 current_period_end as "currentPeriodEnd", 
                 cancel_at_period_end as "cancelAtPeriodEnd", 
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [tier, userId]
    );
    return result.rows[0] || null;
  }
}
