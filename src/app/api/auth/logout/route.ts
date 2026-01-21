import {NextResponse} from 'next/server'

/**
 * POST /api/auth/logout
 * Đăng xuất người dùng và xóa session
 */
export async function POST() {
    try {
        console.log('🔵 [Logout] Processing logout request');

        // Tạo response
        const response = NextResponse.json({
            success: true,
            message: 'Đăng xuất thành công'
        }, {status: 200})

        // Xóa cookie auth-token
        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Xóa cookie ngay lập tức
            path: '/'
        })

        console.log('✅ [Logout] Session cleared successfully');

        return response
    } catch (error) {
        console.error('❌ [Logout] Error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Đã xảy ra lỗi khi đăng xuất'
            },
            {status: 500}
        )
    }
}
