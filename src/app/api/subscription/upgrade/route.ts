import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';
import { SubscriptionPlan } from '@prisma/client';

const ALLOWED_PLANS: SubscriptionPlan[] = ['PLUS', 'ADVANCED', 'PREMIUM'];

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const plan = (body?.plan || body?.subscriptionPlan) as SubscriptionPlan | undefined;

    if (!plan || !ALLOWED_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const now = new Date();
    const subscriptionEnd = new Date(now);
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    // TODO: Tích hợp payment gateway (Stripe/PayOS) trước khi xác nhận thanh toán

    const updatedUser = await prisma.users.update({
      where: { id: session.user.id as string },
      data: {
        subscriptionPlan: plan,
        subscriptionStart: now,
        subscriptionEnd,
      },
      select: {
        id: true,
        subscriptionPlan: true,
        subscriptionStart: true,
        subscriptionEnd: true,
      },
    });

    await prisma.payments.create({
      data: {
        user_id: updatedUser.id,
        plan,
        amount: plan === 'PLUS' ? 10 : plan === 'ADVANCED' ? 20 : 30,
        currency: 'USD',
        status: 'success',
      },
    });

    return NextResponse.json({
      success: true,
      plan: updatedUser.subscriptionPlan,
      subscriptionStart: updatedUser.subscriptionStart,
      subscriptionEnd: updatedUser.subscriptionEnd,
    });
  } catch (error) {
    console.error('[subscription/upgrade] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

