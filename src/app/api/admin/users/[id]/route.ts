import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Cập nhật người dùng
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { full_name, phone_number, role, is_active } = body

        const user = await prisma.users.update({
            where: { id: params.id },
            data: {
                full_name,
                phone_number: phone_number || null,
                role,
                is_active
            }
        })

        return NextResponse.json({ message: 'Cập nhật thành công', user })
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json(
            { message: 'Lỗi khi cập nhật người dùng' },
            { status: 500 }
        )
    }
}

// DELETE - Xóa người dùng
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.users.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Xóa người dùng thành công' })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
            { message: 'Lỗi khi xóa người dùng' },
            { status: 500 }
        )
    }
}
