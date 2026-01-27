import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Lấy danh sách người dùng
export async function GET(request: NextRequest) {
    try {
        const users = await prisma.users.findMany({
            select: {
                id: true,
                full_name: true,
                email: true,
                phone_number: true,
                role: true,
                is_active: true,
                avatar_url: true,
                created_at: true,
                auth_provider: true
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { message: 'Lỗi khi lấy danh sách người dùng' },
            { status: 500 }
        )
    }
}

// POST - Tạo người dùng mới
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { full_name, email, phone_number, role, is_active, password } = body

        // Validate required fields
        if (!full_name || !email || !password) {
            return NextResponse.json(
                { message: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            )
        }

        // Check if email exists
        const existingUser = await prisma.users.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { message: 'Email đã tồn tại' },
                { status: 409 }
            )
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.users.create({
            data: {
                id: crypto.randomUUID(),
                full_name,
                email,
                phone_number: phone_number || null,
                role: role || 'STUDENT',
                is_active: is_active !== undefined ? is_active : true,
                password_hash,
                auth_provider: 'LOCAL'
            }
        })

        return NextResponse.json(
            { message: 'Tạo người dùng thành công', user },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { message: 'Lỗi khi tạo người dùng' },
            { status: 500 }
        )
    }
}
