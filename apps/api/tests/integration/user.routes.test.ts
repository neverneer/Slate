import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { UserSettingsModel } from '../../src/models/user-settings.model';
import { UserSessionModel } from '../../src/models/user-session.model';
import { generateToken } from '../../src/middleware/auth.middleware';

vi.mock('../../src/models/user.model');
vi.mock('../../src/models/user-settings.model');
vi.mock('../../src/models/user-session.model');
vi.mock('../../src/models/user-audit.model');
vi.mock('../../src/utils/logger');

describe('User Routes Integration Tests', () => {
  const mockUser = {
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
    deleted_at: null,
  };

  const mockSession = {
    id: 'session-123',
    user_id: 'user-123',
    token_jti: 'test-jti',
    expires_at: new Date(Date.now() + 86400000),
    created_at: new Date(),
    last_active_at: new Date(),
  };

  let authToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    authToken = generateToken({
      userId: 'user-123',
      email: 'test@example.com',
      jti: 'test-jti',
    });
  });

  describe('GET /users/me', () => {
    it('should return authenticated user profile', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserModel.getProfile).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('user-123');
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/users/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 404 if user not found', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserModel.getProfile).mockResolvedValue(null);

      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('GET /users/:userId', () => {
    it('should return full profile when requesting own profile', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserModel.getProfile).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/users/user-123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBeDefined();
    });

    it('should return public profile for other users', async () => {
      const mockPublicProfile = {
        id: 'user-456',
        first_name: 'Jane',
        last_name: 'Smith',
        avatar_url: null,
        bio: 'Test bio',
      };

      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserModel.findById).mockResolvedValue({ ...mockUser, id: 'user-456' });
      vi.mocked(UserSettingsModel.findByUserId).mockResolvedValue({
        profile_visibility: 'public',
      } as any);
      vi.mocked(UserModel.getPublicProfile).mockResolvedValue(mockPublicProfile);

      const response = await request(app)
        .get('/users/user-456')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.first_name).toBe('Jane');
      expect(response.body.email).toBeUndefined();
    });

    it('should return 400 for invalid user ID', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();

      const response = await request(app)
        .get('/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /users/me', () => {
    it('should update user profile', async () => {
      const updatedUser = { ...mockUser, bio: 'Updated bio' };

      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserModel.getProfile).mockResolvedValue(mockUser);
      vi.mocked(UserModel.updateProfile).mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bio: 'Updated bio' });

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe('Updated bio');
    });

    it('should validate profile updates', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ first_name: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate avatar URL format', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ avatar_url: 'not-a-url' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /users/me/settings', () => {
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

      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserSettingsModel.getOrCreate).mockResolvedValue(mockSettings);

      const response = await request(app)
        .get('/users/me/settings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.profile_visibility).toBe('public');
    });
  });

  describe('PUT /users/me/settings', () => {
    it('should update user settings', async () => {
      const updatedSettings = {
        id: 'settings-123',
        user_id: 'user-123',
        profile_visibility: 'private' as const,
        email_notifications: false,
      };

      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserSettingsModel.getOrCreate).mockResolvedValue({} as any);
      vi.mocked(UserSettingsModel.update).mockResolvedValue(updatedSettings as any);

      const response = await request(app)
        .put('/users/me/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          profile_visibility: 'private',
          email_notifications: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.profile_visibility).toBe('private');
    });

    it('should validate settings input', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();

      const response = await request(app)
        .put('/users/me/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ profile_visibility: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('DELETE /users/me', () => {
    it('should soft delete user account', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserModel.softDelete).mockResolvedValue(true);
      vi.mocked(UserSessionModel.deleteAllByUserId).mockResolvedValue(1);

      const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Account deleted successfully');
    });

    it('should return 404 if user not found', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserModel.softDelete).mockResolvedValue(false);

      const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /users/me/sessions', () => {
    it('should return active sessions', async () => {
      const activeSessions = [
        {
          id: 'session-1',
          user_id: 'user-123',
          token_jti: 'test-jti',
          device_info: 'Chrome',
          ip_address: '127.0.0.1',
          user_agent: 'Mozilla/5.0',
          created_at: new Date(),
          last_active_at: new Date(),
          expires_at: new Date(Date.now() + 86400000),
        },
      ];

      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserSessionModel.findActiveByUserId).mockResolvedValue(activeSessions);

      const response = await request(app)
        .get('/users/me/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].is_current).toBe(true);
    });
  });

  describe('DELETE /users/me/sessions/:sessionId', () => {
    it('should logout specific session', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserSessionModel.deleteById).mockResolvedValue(true);

      const response = await request(app)
        .delete('/users/me/sessions/session-123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Session logged out successfully');
    });
  });

  describe('DELETE /users/me/sessions', () => {
    it('should logout all sessions', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserSessionModel.deleteAllByUserId).mockResolvedValue(3);

      const response = await request(app)
        .delete('/users/me/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(3);
    });

    it('should keep current session when requested', async () => {
      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();
      vi.mocked(UserSessionModel.findActiveByUserId).mockResolvedValue([
        mockSession,
        { ...mockSession, id: 'session-2', token_jti: 'jti-2' },
      ] as any);
      vi.mocked(UserSessionModel.deleteById).mockResolvedValue(true);

      const response = await request(app)
        .delete('/users/me/sessions?keepCurrent=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
    });
  });
});
