import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'

export async function GET() {
    try {
        console.log('🧪 [Auth Test] Starting session test...')
        
        const session = await getServerSession(authOptions)
        
        console.log('🔐 [Auth Test] Session details:', {
            hasSession: !!session,
            sessionType: typeof session,
            keys: session ? Object.keys(session) : [],
            hasUser: !!session?.user,
            userId: session?.user?.id,
            userEmail: session?.user?.email,
            userRole: session?.user?.role
        })

        return NextResponse.json({
            success: true,
            hasSession: !!session,
            session: session ? {
                user: session.user ? {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name,
                    role: session.user.role
                } : null,
                expires: session.expires
            } : null,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('💥 [Auth Test] Error:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        })

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
