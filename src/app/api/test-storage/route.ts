import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔍 Testing Supabase Storage...');

    // Test 1: List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    console.log('📦 Available buckets:', buckets?.map(b => b.name));

    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
    }

    // Test 2: Check if hoex-documents bucket exists
    const targetBucket = 'hoex-documents';
    const bucketExists = buckets?.find(b => b.name === targetBucket);

    console.log(`📁 Bucket '${targetBucket}' exists:`, !!bucketExists);

    // Test 3: Try to get bucket info
    if (bucketExists) {
      const { data: bucketFiles, error: filesError } = await supabase.storage
        .from(targetBucket)
        .list('', { limit: 5 });

      console.log(`📄 Files in ${targetBucket}:`, bucketFiles?.length || 0);

      if (filesError) {
        console.error('❌ Error listing files:', filesError);
      }
    }

    return NextResponse.json({
      success: true,
      buckets: buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })),
      targetBucketExists: !!bucketExists,
      message: bucketExists
        ? `Bucket '${targetBucket}' exists and accessible`
        : `Bucket '${targetBucket}' NOT FOUND. Available: ${buckets?.map(b => b.name).join(', ')}`
    });

  } catch (error) {
    console.error('💥 Supabase test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to Supabase Storage'
    }, { status: 500 });
  }
}
