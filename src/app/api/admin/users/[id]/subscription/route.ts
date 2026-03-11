import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

const ALLOWED_PLANS = ['FREE', 'PLUS', 'PREMIUM'] as const
type Plan = (typeof ALLOWED_PLANS)[number]

// PATCH - Admin đổi gói học viên
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await request.json().catch(() => ({}))
        const plan = (body?.plan ?? body?.subscriptionPlan) as Plan | undefined

        if (!plan || !ALLOWED_PLANS.includes(plan)) {
            return NextResponse.json(
                { message: 'Gói không hợp lệ. Chọn FREE, PLUS hoặc PREMIUM.' },
                { status: 400 }
            )
        }

        const targetUser = await prisma.users.findUnique({
            where: { id },
            select: { role: true }
        })
        if (!targetUser) {
            return NextResponse.json({ message: 'Không tìm thấy người dùng' }, { status: 404 })
        }
        if (targetUser.role !== 'STUDENT') {
            return NextResponse.json(
                { message: 'Chỉ học viên mới có gói đăng ký. Mentor/Admin không áp dụng.' },
                { status: 400 }
            )
        }

        const now = new Date()
        let subscriptionStart: Date = now
        let subscriptionEnd: Date = new Date(now)

        if (plan === 'FREE') {
            subscriptionStart = now
            subscriptionEnd = now
        } else {
            // PLUS / PREMIUM: mặc định 6 tháng
            subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 6)
        }

        const user = await prisma.users.update({
            where: { id },
            data: {
                // subscriptionPlan: plan,
                // subscriptionStart: plan === 'FREE' ? null : subscriptionStart,
                // subscriptionEnd: plan === 'FREE' ? null : subscriptionEnd
            },
            select: {
                id: true,
            }
        })

        return NextResponse.json({
            message: `Đã đổi gói thành ${plan}`,
            user: {
                ...user,
                subscriptionPlan: plan,
                subscriptionStart: plan === 'FREE' ? null : subscriptionStart,
                subscriptionEnd: plan === 'FREE' ? null : subscriptionEnd
            }
        })

        return NextResponse.json({
            message: `Đã đổi gói thành ${plan}`,
            user
        })
    } catch (error: unknown) {
        console.error('Error updating user subscription:', error)
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Lỗi khi cập nhật gói' },
            { status: 500 }
        )
    }
}
