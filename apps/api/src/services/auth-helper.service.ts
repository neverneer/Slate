import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserModel } from '../models/user.model';
import { UserSettingsModel } from '../models/user-settings.model';
import { UserSessionModel } from '../models/user-session.model';
import { generateToken } from '../middleware/auth.middleware';
import { transaction } from '../config/database';

export class AuthHelperService {
  static async createUser(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<{ userId: string; token: string }> {
    const emailExists = await UserModel.emailExists(userData.email);
    if (emailExists) {
      throw new Error('Email already in use');
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);

    const result = await transaction(async (client) => {
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userData.email, passwordHash, userData.first_name, userData.last_name]
      );

      const userId = userResult.rows[0].id;

      await client.query(
        `INSERT INTO user_settings (user_id) VALUES ($1)`,
        [userId]
      );

      return userId;
    });

    const jti = randomUUID();
    const token = generateToken({
      userId: result,
      email: userData.email,
      jti,
    });

    await UserSessionModel.create({
      user_id: result,
      token_jti: jti,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { userId: result, token };
  }

  static async login(
    email: string,
    password: string,
    metadata?: {
      device_info?: string;
      ip_address?: string;
      user_agent?: string;
    }
  ): Promise<{ userId: string; token: string } | null> {
    const user = await UserModel.findByEmail(email);
    if (!user || user.account_status !== 'active') {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    const jti = randomUUID();
    const token = generateToken({
      userId: user.id,
      email: user.email,
      jti,
    });

    await UserSessionModel.create({
      user_id: user.id,
      token_jti: jti,
      device_info: metadata?.device_info,
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { userId: user.id, token };
  }
}
