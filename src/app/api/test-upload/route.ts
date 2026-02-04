import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    return NextResponse.json({
        success: true,
        message: 'API route working',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const result = {
            success: true,
            message: 'POST request received successfully',
            formDataKeys: Array.from(formData.keys()),
            formDataValues: {}
        };

        // Log formData contents (safely)
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                result.formDataValues[key] = {
                    type: 'File',
                    name: value.name,
                    size: value.size,
                    contentType: value.type
                };
            } else {
                result.formDataValues[key] = value;
            }
        }

        console.log('🧪 Test upload API received:', result);

        return NextResponse.json(result);

    } catch (error) {
        console.error('❌ Test upload API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 400 }
        );
    }
}
