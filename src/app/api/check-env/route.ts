import {NextRequest, NextResponse} from 'next/server'
import {supabaseAdmin} from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        // Check environment variables
        const envCheck = {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set (hidden)' : '❌ Not set',
            JWT_SECRET: process.env.JWT_SECRET ? '✅ Set (hidden)' : '❌ Not set',
        }

        console.log('Environment variables:', envCheck)

        // Check table schema
        const {data: columns, error: schemaError} = await supabaseAdmin
            .rpc('pg_get_table_cols', {table_name: 'users'})
            .select()

        if (schemaError) {
            console.error('Schema check error:', schemaError)
        }

        // Try to get table info
        const {data, error} = await supabaseAdmin
            .from('users')
            .select('*')
            .limit(1)

        return NextResponse.json({
            success: !error,
            environment: envCheck,
            tableExists: !error,
            error: error ? {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            } : null,
            sampleData: data
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, {status: 500})
    }
}

