import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

/** Plans that can be upgraded to (6‑month cycle; Premium is contact-sales). */
const ALLOWED_PLANS = ['PLUS', 'PREMIUM'] as const;
type AllowedPlan = (typeof ALLOWED_PLANS)[number];

/** Plus: 399k/6 months or 599k/year (VND). */
const PLUS_AMOUNT = { '6months': 399000, '1year': 599000 } as const;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const plan = (body?.plan || body?.subscriptionPlan) as AllowedPlan | undefined;
    const billingCycle = body?.billingCycle === '1year' ? '1year' : '6months';

    if (!plan || !ALLOWED_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const now = new Date();
    const subscriptionEnd = new Date(now);
    if (plan === 'PLUS') {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + (billingCycle === '1year' ? 12 : 6));
    } else {
      // Premium: default 6‑month cycle (contact-sales may set custom end)
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 6);
    }

    // TODO: Tích hợp payment gateway (Stripe/PayOS) trước khi xác nhận thanh toán

    const updatedUser = await prisma.users.update({
      where: { id: session.user.id as string },
      data: {
        subscriptionPlan: plan as any,
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

    const amount = plan === 'PLUS' ? PLUS_AMOUNT[billingCycle] : 0;
    await prisma.payments.create({
      data: {
        user_id: updatedUser.id,
        plan: plan as any,
        amount,
        currency: 'VND',
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

