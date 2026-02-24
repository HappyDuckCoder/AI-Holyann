import { NextRequest } from 'next/server';
import { AuthController } from '@/lib/auth/controller/auth.controller';

export async function DELETE(request: NextRequest) {
  return AuthController.deleteAccount(request);
}
