import { query } from '../config/database';
import { UserSettings } from '../types/user';
import { UpdateSettingsInput } from '../validators/user.validators';

export class UserSettingsModel {
  static async findByUserId(userId: string): Promise<UserSettings | null> {
    const result = await query<UserSettings>(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  static async create(userId: string): Promise<UserSettings> {
    const result = await query<UserSettings>(
      `INSERT INTO user_settings (user_id)
       VALUES ($1)
       RETURNING *`,
      [userId]
    );
    return result.rows[0];
  }

  static async update(
    userId: string,
    updates: UpdateSettingsInput
  ): Promise<UserSettings | null> {
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
      return this.findByUserId(userId);
    }

    values.push(userId);

    const result = await query<UserSettings>(
      `UPDATE user_settings 
       SET ${fields.join(', ')} 
       WHERE user_id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async getOrCreate(userId: string): Promise<UserSettings> {
    let settings = await this.findByUserId(userId);
    if (!settings) {
      settings = await this.create(userId);
    }
    return settings;
  }
}
