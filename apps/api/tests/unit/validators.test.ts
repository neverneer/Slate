import { describe, it, expect } from 'vitest';
import {
  updateProfileSchema,
  updateSettingsSchema,
  userIdParamSchema,
} from '../../src/validators/user.validators';

describe('User Validators', () => {
  describe('updateProfileSchema', () => {
    it('should validate valid profile updates', () => {
      const validData = {
        first_name: 'John',
        last_name: 'Doe',
        bio: 'A short bio',
        timezone: 'America/New_York',
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept null for optional nullable fields', () => {
      const validData = {
        avatar_url: null,
        bio: null,
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty first name', () => {
      const invalidData = {
        first_name: '',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid avatar URL', () => {
      const invalidData = {
        avatar_url: 'not-a-url',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject bio exceeding max length', () => {
      const invalidData = {
        bio: 'a'.repeat(501),
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept valid avatar URL', () => {
      const validData = {
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateSettingsSchema', () => {
    it('should validate valid settings updates', () => {
      const validData = {
        profile_visibility: 'private',
        email_notifications: false,
        push_notifications: true,
      };

      const result = updateSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid profile visibility', () => {
      const invalidData = {
        profile_visibility: 'invalid',
      };

      const result = updateSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid visibility options', () => {
      const visibilityOptions = ['public', 'private', 'connections'];

      visibilityOptions.forEach((option) => {
        const result = updateSettingsSchema.safeParse({
          profile_visibility: option,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject non-boolean notification settings', () => {
      const invalidData = {
        email_notifications: 'yes',
      };

      const result = updateSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('userIdParamSchema', () => {
    it('should validate valid UUID', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = userIdParamSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalidData = {
        userId: 'not-a-uuid',
      };

      const result = userIdParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing userId', () => {
      const invalidData = {};

      const result = userIdParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
