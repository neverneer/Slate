import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../../src/services/user.service';
import { UserModel } from '../../src/models/user.model';
import { UserSettingsModel } from '../../src/models/user-settings.model';
import { UserAuditModel } from '../../src/models/user-audit.model';
import { UserSessionModel } from '../../src/models/user-session.model';

vi.mock('../../src/models/user.model');
vi.mock('../../src/models/user-settings.model');
vi.mock('../../src/models/user-audit.model');
vi.mock('../../src/models/user-session.model');
vi.mock('../../src/utils/logger');

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: null,
        bio: null,
        timezone: 'UTC',
        preferred_language: 'en',
        account_status: 'active' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(UserModel.getProfile).mockResolvedValue(mockProfile);

      const result = await userService.getMyProfile('user-123');

      expect(result).toEqual(mockProfile);
      expect(UserModel.getProfile).toHaveBeenCalledWith('user-123');
    });

    it('should return null if user not found', async () => {
      vi.mocked(UserModel.getProfile).mockResolvedValue(null);

      const result = await userService.getMyProfile('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getPublicProfile', () => {
    it('should return public profile when visibility is public', async () => {
      const mockUser = {
        id: 'user-123',
        account_status: 'active' as const,
      };
      const mockSettings = {
        profile_visibility: 'public' as const,
      };
      const mockPublicProfile = {
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: null,
        bio: null,
      };

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);
      vi.mocked(UserSettingsModel.findByUserId).mockResolvedValue(mockSettings as any);
      vi.mocked(UserModel.getPublicProfile).mockResolvedValue(mockPublicProfile);

      const result = await userService.getPublicProfile('requester-123', 'user-123');

      expect(result).toEqual(mockPublicProfile);
    });

    it('should return null when profile is private', async () => {
      const mockUser = {
        id: 'user-123',
        account_status: 'active' as const,
      };
      const mockSettings = {
        profile_visibility: 'private' as const,
      };

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);
      vi.mocked(UserSettingsModel.findByUserId).mockResolvedValue(mockSettings as any);

      const result = await userService.getPublicProfile('requester-123', 'user-123');

      expect(result).toBeNull();
    });

    it('should return null if user is not active', async () => {
      const mockUser = {
        id: 'user-123',
        account_status: 'deleted' as const,
      };

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      const result = await userService.getPublicProfile('requester-123', 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile and create audit log', async () => {
      const currentProfile = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: null,
        bio: null,
        timezone: 'UTC',
        preferred_language: 'en',
        account_status: 'active' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedProfile = {
        ...currentProfile,
        bio: 'New bio',
      };

      vi.mocked(UserModel.getProfile).mockResolvedValue(currentProfile);
      vi.mocked(UserModel.updateProfile).mockResolvedValue(updatedProfile);
      vi.mocked(UserAuditModel.create).mockResolvedValue({} as any);

      const result = await userService.updateProfile(
        'user-123',
        { bio: 'New bio' },
        { ip_address: '127.0.0.1' }
      );

      expect(result).toEqual(updatedProfile);
      expect(UserAuditModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          action: 'UPDATE_PROFILE',
          entity_type: 'user',
        })
      );
    });

    it('should return null if user not found', async () => {
      vi.mocked(UserModel.getProfile).mockResolvedValue(null);

      const result = await userService.updateProfile('user-123', { bio: 'New bio' }, {});

      expect(result).toBeNull();
      expect(UserModel.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('getSettings', () => {
    it('should return user settings', async () => {
      const mockSettings = {
        id: 'settings-123',
        user_id: 'user-123',
        profile_visibility: 'public' as const,
        data_sharing_enabled: false,
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        marketing_emails: false,
        security_alerts: true,
        two_factor_enabled: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(UserSettingsModel.getOrCreate).mockResolvedValue(mockSettings);

      const result = await userService.getSettings('user-123');

      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateSettings', () => {
    it('should update settings and create audit log', async () => {
      const currentSettings = {
        id: 'settings-123',
        user_id: 'user-123',
        profile_visibility: 'public' as const,
        email_notifications: true,
      };

      const updatedSettings = {
        ...currentSettings,
        email_notifications: false,
      };

      vi.mocked(UserSettingsModel.getOrCreate).mockResolvedValue(currentSettings as any);
      vi.mocked(UserSettingsModel.update).mockResolvedValue(updatedSettings as any);
      vi.mocked(UserAuditModel.create).mockResolvedValue({} as any);

      const result = await userService.updateSettings(
        'user-123',
        { email_notifications: false },
        {}
      );

      expect(result).toEqual(updatedSettings);
      expect(UserAuditModel.create).toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete account and clear sessions', async () => {
      vi.mocked(UserModel.softDelete).mockResolvedValue(true);
      vi.mocked(UserSessionModel.deleteAllByUserId).mockResolvedValue(2);
      vi.mocked(UserAuditModel.create).mockResolvedValue({} as any);

      const result = await userService.deleteAccount('user-123', {});

      expect(result).toBe(true);
      expect(UserSessionModel.deleteAllByUserId).toHaveBeenCalledWith('user-123');
      expect(UserAuditModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE_ACCOUNT',
        })
      );
    });
  });

  describe('getActiveSessions', () => {
    it('should return active sessions', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          user_id: 'user-123',
          token_jti: 'jti-1',
          device_info: 'Chrome',
          ip_address: '127.0.0.1',
          user_agent: 'Mozilla/5.0',
          expires_at: new Date(),
          created_at: new Date(),
          last_active_at: new Date(),
        },
      ];

      vi.mocked(UserSessionModel.findActiveByUserId).mockResolvedValue(mockSessions);

      const result = await userService.getActiveSessions('user-123');

      expect(result).toEqual(mockSessions);
    });
  });

  describe('logoutSession', () => {
    it('should logout specific session', async () => {
      vi.mocked(UserSessionModel.deleteById).mockResolvedValue(true);

      const result = await userService.logoutSession('user-123', 'session-123');

      expect(result).toBe(true);
      expect(UserSessionModel.deleteById).toHaveBeenCalledWith('session-123', 'user-123');
    });
  });

  describe('logoutAllSessions', () => {
    it('should logout all sessions', async () => {
      vi.mocked(UserSessionModel.deleteAllByUserId).mockResolvedValue(3);

      const result = await userService.logoutAllSessions('user-123');

      expect(result).toBe(3);
      expect(UserSessionModel.deleteAllByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should logout all sessions except current', async () => {
      const mockSessions = [
        { id: 'session-1', token_jti: 'jti-1' },
        { id: 'session-2', token_jti: 'jti-2' },
        { id: 'session-3', token_jti: 'jti-current' },
      ];

      vi.mocked(UserSessionModel.findActiveByUserId).mockResolvedValue(mockSessions as any);
      vi.mocked(UserSessionModel.deleteById).mockResolvedValue(true);

      const result = await userService.logoutAllSessions('user-123', 'jti-current');

      expect(result).toBe(2);
      expect(UserSessionModel.deleteById).toHaveBeenCalledTimes(2);
    });
  });
});
