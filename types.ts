// Re-export types from components
export * from '@/components/types';

// User Role Types
export type UserRole = 'user' | 'mentor' | 'admin';

export interface User {
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    createdAt?: string;
}

