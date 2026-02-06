import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Cập nhật người dùng
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { full_name, phone_number, role, is_active } = body

        const user = await prisma.users.update({
            where: { id },
            data: {
                full_name,
                phone_number: phone_number || null,
                role,
                is_active
            }
        })

        return NextResponse.json({ message: 'Cập nhật thành công', user })
    } catch (error: unknown) {
        console.error('Error updating user:', error)
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Lỗi khi cập nhật người dùng' },
            { status: 500 }
        )
    }
}

// DELETE - Xóa người dùng
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.users.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Xóa người dùng thành công' })
    } catch (error: unknown) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Lỗi khi xóa người dùng' },
            { status: 500 }
        )
    }
}
