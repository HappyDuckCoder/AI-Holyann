import {NextRequest, NextResponse} from 'next/server'
import {AuthService} from '@/lib/services/auth.service'

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Token không tồn tại'
                },
                {status: 401}
            )
        }

        const result = await AuthService.verifyToken(token)

        if (!result.success) {
            return NextResponse.json(result, {status: 401})
        }

        return NextResponse.json(result, {status: 200})
    } catch (error) {
        console.error('Error in verify API:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Đã xảy ra lỗi server'
            },
            {status: 500}
        )
    }
}

