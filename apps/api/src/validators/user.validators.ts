import { z } from 'zod';

export const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  timezone: z.string().max(100).optional(),
  preferred_language: z.string().max(10).optional(),
});

export const updateSettingsSchema = z.object({
  profile_visibility: z.enum(['public', 'private', 'connections']).optional(),
  data_sharing_enabled: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
  security_alerts: z.boolean().optional(),
});

export const userIdParamSchema = z.object({
  userId: z.string().min(1),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
