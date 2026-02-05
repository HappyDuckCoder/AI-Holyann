import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({
        error: 'Missing file URL parameter'
      }, { status: 400 });
    }

    console.log('🔍 Testing file access for URL:', fileUrl);

    // Extract bucket and path from URL
    const urlPattern = /\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/;
    const match = fileUrl.match(urlPattern);

    if (!match) {
      return NextResponse.json({
        error: 'Invalid Supabase URL format',
        receivedUrl: fileUrl
      }, { status: 400 });
    }

    const [, bucketName, filePath] = match;
    console.log('📁 Parsed - Bucket:', bucketName, 'Path:', filePath);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test 1: Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.find(b => b.name === bucketName);

    // Test 2: Check if file exists
    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    // Test 3: Try to get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      analysis: {
        originalUrl: fileUrl,
        parsedBucket: bucketName,
        parsedPath: filePath,
        bucketExists: !!bucketExists,
        bucketInfo: bucketExists,
        fileExists: !fileError,
        fileError: fileError?.message,
        publicUrl: publicUrlData.publicUrl,
        fileSize: fileData ? fileData.size : null
      },
      recommendation: !bucketExists
        ? `Bucket '${bucketName}' doesn't exist. Create it first.`
        : fileError
        ? `File doesn't exist or access denied: ${fileError.message}`
        : 'File should be accessible'
    });

  } catch (error) {
    console.error('💥 File test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
