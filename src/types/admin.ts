// Admin types

export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: UserRole;
  is_active: boolean;
  avatar_url: string | null;
  created_at: Date | string;
  auth_provider?: string;
}

export interface UserFormData {
  full_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  is_active: boolean;
  password?: string; // Optional, only required when creating new user
}
