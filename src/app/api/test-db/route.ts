import {NextRequest, NextResponse} from 'next/server'
import {supabaseAdmin} from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Testing database connection...')
        console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

        // Test 1: Check table exists
        console.log('📋 Test 1: Checking if users table exists...')
        const {data: tables, error: tableError} = await supabaseAdmin
            .from('users')
            .select('count')
            .limit(0)

        if (tableError) {
            console.error('❌ Table check failed:', tableError)
            return NextResponse.json({
                success: false,
                test: 'table_check',
                error: tableError.message,
                details: tableError,
                hint: 'Table users might not exist. Run database/setup.sql'
            }, {status: 500})
        }

        console.log('✅ Table exists!')

        // Test 2: Try to insert a test user
        console.log('📋 Test 2: Trying to insert test user...')
        const testEmail = `test_${Date.now()}@example.com`

        const {data: insertData, error: insertError} = await supabaseAdmin
            .from('users')
            .insert({
                full_name: 'Test User',
                email: testEmail,
                password_hash: 'test_hash',
                role: 'STUDENT',
                auth_provider: 'LOCAL',
                is_active: true
            })
            .select()
            .single()

        if (insertError) {
            console.error('❌ Insert failed:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
            })
            return NextResponse.json({
                success: false,
                test: 'insert_test',
                error: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
            }, {status: 500})
        }

        console.log('✅ Insert successful!', insertData)

        // Clean up test user
        await supabaseAdmin
            .from('users')
            .delete()
            .eq('email', testEmail)

        return NextResponse.json({
            success: true,
            message: 'Database connected and working!',
            tests: {
                table_exists: true,
                insert_works: true,
                test_user_created: insertData?.id
            }
        })
    } catch (error: any) {
        console.error('❌ Exception:', error)
        return NextResponse.json({
            success: false,
            message: 'Test failed',
            error: error.message,
            stack: error.stack
        }, {status: 500})
    }
}

