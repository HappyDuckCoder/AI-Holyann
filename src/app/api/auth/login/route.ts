import { NextRequest } from 'next/server';
import { AuthController } from '@/lib/auth/controller/auth.controller';

export async function POST(request: NextRequest) {
  return AuthController.login(request);
}
