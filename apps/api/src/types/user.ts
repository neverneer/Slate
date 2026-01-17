export type AccountStatus = 'active' | 'suspended' | 'deleted';

export type ProfileVisibility = 'public' | 'private' | 'connections';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  timezone: string;
  preferred_language: string;
  account_status: AccountStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface UserSettings {
  id: string;
  user_id: string;
  profile_visibility: ProfileVisibility;
  data_sharing_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  security_alerts: boolean;
  two_factor_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  token_jti: string;
  device_info: string | null;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: Date;
  created_at: Date;
  last_active_at: Date;
}

export interface UserAuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  timezone: string;
  preferred_language: string;
  account_status: AccountStatus;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
}
