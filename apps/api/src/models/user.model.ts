import { query, transaction } from '../config/database';
import { User, UserProfile, PublicUserProfile, AccountStatus } from '../types/user';
import { UpdateProfileInput } from '../validators/user.validators';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    return result.rows[0] || null;
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    const result = await query<UserProfile>(
      `SELECT id, email, first_name, last_name, avatar_url, bio, 
              timezone, preferred_language, account_status, created_at, updated_at
       FROM users 
       WHERE id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    return result.rows[0] || null;
  }

  static async getPublicProfile(userId: string): Promise<PublicUserProfile | null> {
    const result = await query<PublicUserProfile>(
      `SELECT id, first_name, last_name, avatar_url, bio
       FROM users 
       WHERE id = $1 AND deleted_at IS NULL AND account_status = 'active'`,
      [userId]
    );
    return result.rows[0] || null;
  }

  static async updateProfile(
    userId: string,
    updates: UpdateProfileInput
  ): Promise<UserProfile | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.getProfile(userId);
    }

    values.push(userId);

    const result = await query<UserProfile>(
      `UPDATE users 
       SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING id, email, first_name, last_name, avatar_url, bio, 
                 timezone, preferred_language, account_status, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  static async softDelete(userId: string): Promise<boolean> {
    const result = await query(
      `UPDATE users 
       SET deleted_at = CURRENT_TIMESTAMP, account_status = 'deleted'
       WHERE id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    const params: any[] = [email];
    let queryText = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL';
    
    if (excludeUserId) {
      queryText += ' AND id != $2';
      params.push(excludeUserId);
    }
    
    queryText += ')';

    const result = await query<{ exists: boolean }>(queryText, params);
    return result.rows[0]?.exists || false;
  }

  static async updateAccountStatus(
    userId: string,
    status: AccountStatus
  ): Promise<boolean> {
    const result = await query(
      'UPDATE users SET account_status = $1 WHERE id = $2 AND deleted_at IS NULL',
      [status, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async create(userData: {
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
  }): Promise<User> {
    const result = await query<User>(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userData.email, userData.password_hash, userData.first_name, userData.last_name]
    );
    return result.rows[0];
  }
}
