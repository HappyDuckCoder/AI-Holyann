import { NextRequest, NextResponse } from 'next/server';
import { uploadFileServerAction } from '@/actions/upload';

export async function POST(request: NextRequest) {
    try {
        console.log('🛠️ Upload API Route called...');

        const formData = await request.formData();

        // Log formData contents for debugging
        console.log('📋 FormData contents:');
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`   ${key}: File (${value.name}, ${value.size} bytes, ${value.type})`);
            } else {
                console.log(`   ${key}: ${value}`);
            }
        }

        // Call the server action
        const result = await uploadFileServerAction(formData);

        console.log('📥 Server Action Result:', result);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json(result, { status: 400 });
        }

    } catch (error) {
        console.error('❌ Upload API Route error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown upload error'
            },
            { status: 500 }
        );
    }
}
