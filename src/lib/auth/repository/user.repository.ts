import { DatabaseService } from '@/lib/services/database.service';
import { User, RegisterData, UserRole, AuthProvider } from '@/lib/types/auth.types';
import type { RegisterInput } from '@/lib/auth/validator/schemas';

const BCRYPT_SALT_ROUNDS = 10;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const UserRepository = {
  normalizeEmail,

  async findByEmail(email: string): Promise<User | null> {
    return DatabaseService.findUserByEmail(normalizeEmail(email));
  },

  async findById(id: string): Promise<User | null> {
    return DatabaseService.findUserById(id);
  },

  async existsByEmail(email: string): Promise<boolean> {
    const user = await DatabaseService.findUserByEmail(normalizeEmail(email));
    return user != null;
  },

  async createUser(data: RegisterInput): Promise<User | null> {
    const normalized: RegisterData = {
      full_name: data.full_name.trim(),
      email: normalizeEmail(data.email),
      password: data.password,
      role: (data.role as UserRole) || 'STUDENT',
    };
    return DatabaseService.createUser(normalized);
  },

  async createOAuthUser(
    email: string,
    full_name: string,
    provider: AuthProvider,
    providerId: string,
    avatarUrl?: string
  ): Promise<User | null> {
    return DatabaseService.createOAuthUser(
      normalizeEmail(email),
      full_name,
      provider,
      providerId,
      avatarUrl
    );
  },

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return DatabaseService.verifyPassword(plain, hash);
  },

  async updatePassword(userId: string, newPasswordHash: string): Promise<boolean> {
    return DatabaseService.updatePassword(userId, newPasswordHash);
  },

  async findStudentByUserId(userId: string) {
    return DatabaseService.findStudentByUserId(userId);
  },

  async deleteUser(userId: string): Promise<boolean> {
    return DatabaseService.deleteUser(userId);
  },
};

export { BCRYPT_SALT_ROUNDS };
