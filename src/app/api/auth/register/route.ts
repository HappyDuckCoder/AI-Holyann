import {NextRequest, NextResponse} from 'next/server'
import {AuthService} from '@/lib/services/auth.service'
import {RegisterData} from '@/lib/types/auth.types'

export async function POST(request: NextRequest) {
    try {
        const body: RegisterData = await request.json()

        // Validation
        if (!body.email || !body.password || !body.full_name) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Vui lòng điền đầy đủ thông tin'
                },
                {status: 400}
            )
        }

        if (body.password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự'
                },
                {status: 400}
            )
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email không hợp lệ'
                },
                {status: 400}
            )
        }

        const result = await AuthService.register(body)

        if (!result.success) {
            return NextResponse.json(result, {status: 400})
        }

        return NextResponse.json(result, {status: 201})
    } catch (error) {
        console.error('Error in register API:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Đã xảy ra lỗi server'
            },
            {status: 500}
        )
    }
}

