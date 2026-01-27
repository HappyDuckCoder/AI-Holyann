import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH - Thay đổi trạng thái người dùng
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { is_active } = body

        const user = await prisma.users.update({
            where: { id: params.id },
            data: { is_active }
        })

        return NextResponse.json({
            message: `${is_active ? 'Kích hoạt' : 'Khóa'} người dùng thành công`,
            user
        })
    } catch (error) {
        console.error('Error updating user status:', error)
        return NextResponse.json(
            { message: 'Lỗi khi cập nhật trạng thái' },
            { status: 500 }
        )
    }
}
