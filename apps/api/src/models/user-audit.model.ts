import { query } from '../config/database';
import { UserAuditLog } from '../types/user';

export class UserAuditModel {
  static async create(auditData: {
    user_id: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    changes?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
  }): Promise<UserAuditLog> {
    const result = await query<UserAuditLog>(
      `INSERT INTO user_audit_logs 
       (user_id, action, entity_type, entity_id, changes, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        auditData.user_id,
        auditData.action,
        auditData.entity_type,
        auditData.entity_id || null,
        auditData.changes ? JSON.stringify(auditData.changes) : null,
        auditData.ip_address || null,
        auditData.user_agent || null,
      ]
    );
    return result.rows[0];
  }

  static async findByUserId(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<UserAuditLog[]> {
    const result = await query<UserAuditLog>(
      `SELECT * FROM user_audit_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async findByUserIdAndAction(
    userId: string,
    action: string,
    limit: number = 50
  ): Promise<UserAuditLog[]> {
    const result = await query<UserAuditLog>(
      `SELECT * FROM user_audit_logs 
       WHERE user_id = $1 AND action = $2 
       ORDER BY created_at DESC 
       LIMIT $3`,
      [userId, action, limit]
    );
    return result.rows;
  }
}
