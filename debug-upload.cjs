const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugUploadIssue() {
  try {
    console.log('🔍 Debugging file upload issue...');

    // 1. Check current session/user state
    console.log('\n1️⃣ Checking users in database...');
    const users = await prisma.users.findMany({
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true
      },
      take: 3
    });

    console.log(`   Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - ID: ${user.id}`);
    });

    // 2. Check environment variables
    console.log('\n2️⃣ Checking environment configuration...');
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'
    };

    Object.entries(envCheck).forEach(([key, status]) => {
      console.log(`   ${key}: ${status}`);
    });

    // 3. Test Supabase connection
    console.log('\n3️⃣ Testing Supabase connection...');
    const { createClient } = require('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Test bucket access
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();

      if (bucketsError) {
        console.log('   ❌ Failed to list buckets:', bucketsError.message);
      } else {
        console.log(`   ✅ Connected to Supabase Storage`);
        console.log(`   📁 Available buckets: ${buckets.map(b => b.name).join(', ')}`);

        // Check specific bucket
        const hoexBucket = buckets.find(b => b.name === 'hoex-documents');
        if (hoexBucket) {
          console.log('   ✅ hoex-documents bucket exists');

          // Test listing files
          const { data: files, error: filesError } = await supabaseAdmin.storage
            .from('hoex-documents')
            .list('', { limit: 5 });

          if (filesError) {
            console.log('   ⚠️ Cannot list files:', filesError.message);
          } else {
            console.log(`   📄 Found ${files?.length || 0} items in bucket`);
          }
        } else {
          console.log('   ❌ hoex-documents bucket not found');
        }
      }
    }

    // 4. Check current task progress with submission URLs
    console.log('\n4️⃣ Checking current upload tasks...');
    const uploadTasks = await prisma.student_task_progress.findMany({
      where: {
        OR: [
          { submission_url: { not: null } },
          {
            task: {
              title: { contains: 'Upload' }
            }
          }
        ]
      },
      include: {
        task: {
          select: { title: true }
        },
        student: {
          include: {
            users: {
              select: { full_name: true, email: true }
            }
          }
        }
      }
    });

    console.log(`   Found ${uploadTasks.length} upload-related tasks:`);
    uploadTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.student.users.full_name} - ${task.task.title}`);
      console.log(`      Status: ${task.status}`);
      console.log(`      Has URL: ${task.submission_url ? '✅ Yes' : '❌ No'}`);
      if (task.submission_url) {
        console.log(`      URL: ${task.submission_url.substring(0, 80)}...`);
      }
      console.log('');
    });

    await prisma.$disconnect();

    console.log('\n🎯 DEBUGGING SUMMARY:');
    console.log('='.repeat(50));
    console.log('✅ Database connection: Working');
    console.log('✅ Users exist: ' + (users.length > 0 ? 'Yes' : 'No'));
    console.log('✅ Environment vars: ' + (envCheck.SUPABASE_SERVICE_ROLE_KEY === '✅ Set' ? 'OK' : 'Missing'));
    console.log('✅ Upload tasks: ' + uploadTasks.length + ' found');

    console.log('\n🔧 POTENTIAL ISSUES TO CHECK:');
    console.log('1. Session state in browser (F12 > Application > Cookies)');
    console.log('2. CORS settings in Supabase dashboard');
    console.log('3. Network requests in browser (F12 > Network tab)');
    console.log('4. User authentication status');

  } catch (error) {
    console.error('❌ Debug script failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

debugUploadIssue();
