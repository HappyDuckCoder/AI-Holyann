import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/users/by-email?email=xxx
 * Fetch user by email address
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email parameter is required' },
                { status: 400 }
            );
        }

        console.log('🔍 [API] Fetching user by email:', email);

        const user = await prisma.users.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                full_name: true,
                role: true,
                avatar_url: true,
            }
        });

        if (!user) {
            console.warn('⚠️ [API] User not found for email:', email);
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        console.log('✅ [API] User found:', user.id);

        return NextResponse.json(user);
    } catch (error) {
        console.error('❌ [API] Error fetching user by email:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
