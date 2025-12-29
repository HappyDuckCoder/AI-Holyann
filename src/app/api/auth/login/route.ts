import {NextRequest, NextResponse} from 'next/server'
import {AuthService} from '@/lib/services/auth.service'
import {LoginData} from '@/lib/types/auth.types'

export async function POST(request: NextRequest) {
    try {
        const body: LoginData = await request.json()

        // Validation
        if (!body.email || !body.password) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Vui lòng điền đầy đủ thông tin'
                },
                {status: 400}
            )
        }

        const result = await AuthService.login(body)

        if (!result.success) {
            return NextResponse.json(result, {status: 401})
        }

        return NextResponse.json(result, {status: 200})
    } catch (error) {
        console.error('Error in login API:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Đã xảy ra lỗi server'
            },
            {status: 500}
        )
    }
}

