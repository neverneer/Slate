import { query } from '../config/database';
import { UserSession } from '../types/user';

export class UserSessionModel {
  static async create(sessionData: {
    user_id: string;
    token_jti: string;
    device_info?: string;
    ip_address?: string;
    user_agent?: string;
    expires_at: Date;
  }): Promise<UserSession> {
    const result = await query<UserSession>(
      `INSERT INTO user_sessions (user_id, token_jti, device_info, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        sessionData.user_id,
        sessionData.token_jti,
        sessionData.device_info || null,
        sessionData.ip_address || null,
        sessionData.user_agent || null,
        sessionData.expires_at,
      ]
    );
    return result.rows[0];
  }

  static async findByJti(jti: string): Promise<UserSession | null> {
    const result = await query<UserSession>(
      'SELECT * FROM user_sessions WHERE token_jti = $1',
      [jti]
    );
    return result.rows[0] || null;
  }

  static async findActiveByUserId(userId: string): Promise<UserSession[]> {
    const result = await query<UserSession>(
      `SELECT * FROM user_sessions 
       WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
       ORDER BY last_active_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async deleteById(sessionId: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM user_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async deleteByJti(jti: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM user_sessions WHERE token_jti = $1',
      [jti]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async deleteAllByUserId(userId: string): Promise<number> {
    const result = await query(
      'DELETE FROM user_sessions WHERE user_id = $1',
      [userId]
    );
    return result.rowCount ?? 0;
  }

  static async updateLastActive(jti: string): Promise<void> {
    await query(
      'UPDATE user_sessions SET last_active_at = CURRENT_TIMESTAMP WHERE token_jti = $1',
      [jti]
    );
  }

  static async cleanupExpired(): Promise<number> {
    const result = await query(
      'DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP'
    );
    return result.rowCount ?? 0;
  }
}
