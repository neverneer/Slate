import { UserModel } from '../models/user.model';
import { UserSettingsModel } from '../models/user-settings.model';
import { UserAuditModel } from '../models/user-audit.model';
import { UserSessionModel } from '../models/user-session.model';
import { UserProfile, PublicUserProfile, UserSettings, UserSession } from '../types/user';
import { UpdateProfileInput, UpdateSettingsInput } from '../validators/user.validators';
import { logger } from '../utils/logger';

export class UserService {
  async getMyProfile(userId: string): Promise<UserProfile | null> {
    return UserModel.getProfile(userId);
  }

  async getPublicProfile(
    requestingUserId: string,
    targetUserId: string
  ): Promise<PublicUserProfile | null> {
    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser || targetUser.account_status !== 'active') {
      return null;
    }

    const settings = await UserSettingsModel.findByUserId(targetUserId);

    if (settings?.profile_visibility === 'private' && requestingUserId !== targetUserId) {
      return null;
    }

    return UserModel.getPublicProfile(targetUserId);
  }

  async updateProfile(
    userId: string,
    updates: UpdateProfileInput,
    metadata: { ip_address?: string; user_agent?: string }
  ): Promise<UserProfile | null> {
    const currentProfile = await UserModel.getProfile(userId);
    if (!currentProfile) {
      return null;
    }

    const updatedProfile = await UserModel.updateProfile(userId, updates);
    if (!updatedProfile) {
      return null;
    }

    const changes: Record<string, any> = {};
    Object.keys(updates).forEach((key) => {
      const currentValue = (currentProfile as any)[key];
      const newValue = (updates as any)[key];
      if (currentValue !== newValue) {
        changes[key] = { from: currentValue, to: newValue };
      }
    });

    if (Object.keys(changes).length > 0) {
      await UserAuditModel.create({
        user_id: userId,
        action: 'UPDATE_PROFILE',
        entity_type: 'user',
        entity_id: userId,
        changes,
        ip_address: metadata.ip_address,
        user_agent: metadata.user_agent,
      });

      logger.info('User profile updated', { userId, changes });
    }

    return updatedProfile;
  }

  async getSettings(userId: string): Promise<UserSettings> {
    return UserSettingsModel.getOrCreate(userId);
  }

  async updateSettings(
    userId: string,
    updates: UpdateSettingsInput,
    metadata: { ip_address?: string; user_agent?: string }
  ): Promise<UserSettings | null> {
    const currentSettings = await UserSettingsModel.getOrCreate(userId);
    const updatedSettings = await UserSettingsModel.update(userId, updates);

    if (!updatedSettings) {
      return null;
    }

    const changes: Record<string, any> = {};
    Object.keys(updates).forEach((key) => {
      const currentValue = (currentSettings as any)[key];
      const newValue = (updates as any)[key];
      if (currentValue !== newValue) {
        changes[key] = { from: currentValue, to: newValue };
      }
    });

    if (Object.keys(changes).length > 0) {
      await UserAuditModel.create({
        user_id: userId,
        action: 'UPDATE_SETTINGS',
        entity_type: 'user_settings',
        entity_id: currentSettings.id,
        changes,
        ip_address: metadata.ip_address,
        user_agent: metadata.user_agent,
      });

      logger.info('User settings updated', { userId, changes });
    }

    return updatedSettings;
  }

  async deleteAccount(
    userId: string,
    metadata: { ip_address?: string; user_agent?: string }
  ): Promise<boolean> {
    const deleted = await UserModel.softDelete(userId);

    if (deleted) {
      await UserSessionModel.deleteAllByUserId(userId);

      await UserAuditModel.create({
        user_id: userId,
        action: 'DELETE_ACCOUNT',
        entity_type: 'user',
        entity_id: userId,
        ip_address: metadata.ip_address,
        user_agent: metadata.user_agent,
      });

      logger.info('User account deleted', { userId });
    }

    return deleted;
  }

  async getActiveSessions(userId: string): Promise<UserSession[]> {
    return UserSessionModel.findActiveByUserId(userId);
  }

  async logoutSession(
    userId: string,
    sessionId: string
  ): Promise<boolean> {
    const deleted = await UserSessionModel.deleteById(sessionId, userId);

    if (deleted) {
      logger.info('User session logged out', { userId, sessionId });
    }

    return deleted;
  }

  async logoutAllSessions(userId: string, exceptJti?: string): Promise<number> {
    if (exceptJti) {
      const sessions = await UserSessionModel.findActiveByUserId(userId);
      let deletedCount = 0;

      for (const session of sessions) {
        if (session.token_jti !== exceptJti) {
          const deleted = await UserSessionModel.deleteById(session.id, userId);
          if (deleted) deletedCount++;
        }
      }

      logger.info('User sessions logged out (except current)', { userId, deletedCount });
      return deletedCount;
    } else {
      const deletedCount = await UserSessionModel.deleteAllByUserId(userId);
      logger.info('All user sessions logged out', { userId, deletedCount });
      return deletedCount;
    }
  }
}
