import { NextRequest } from 'next/server';
import { AuthController } from '@/lib/auth/controller/auth.controller';

export async function GET(request: NextRequest) {
  return AuthController.getMe(request);
}
