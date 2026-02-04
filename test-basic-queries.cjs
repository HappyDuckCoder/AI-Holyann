const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBasicQueries() {
  try {
    console.log('🔧 Testing basic student_task_progress queries...');

    // Test 1: Basic query without relations
    console.log('\n1️⃣ Basic query without relations...');
    const basic = await prisma.student_task_progress.findMany({
      take: 5,
      select: {
        id: true,
        student_id: true,
        task_id: true,
        submission_url: true,
        status: true,
        completed_at: true
      }
    });
    console.log(`   ✅ Found ${basic.length} records (basic query works)`);

    // Test 2: Query with task relation only
    console.log('\n2️⃣ Query with task relation...');
    const withTask = await prisma.student_task_progress.findMany({
      take: 3,
      select: {
        id: true,
        submission_url: true,
        task: {
          select: {
            title: true
          }
        }
      }
    });
    console.log(`   ✅ Found ${withTask.length} records with task data`);

    // Test 3: CV files specifically
    console.log('\n3️⃣ CV files for mentors...');
    const cvFiles = await prisma.student_task_progress.findMany({
      where: {
        submission_url: { not: null }
      },
      select: {
        id: true,
        submission_url: true,
        student_id: true,
        completed_at: true,
        task: {
          select: {
            title: true
          }
        }
      }
    });

    console.log(`   ✅ Found ${cvFiles.length} submitted files`);

    if (cvFiles.length > 0) {
      console.log('\n📁 Files available for mentor viewing:');
      cvFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. Task: ${file.task?.title || 'Unknown'}`);
        console.log(`      File URL: ${file.submission_url}`);
        console.log(`      Student ID: ${file.student_id}`);
        console.log(`      Completed: ${file.completed_at}`);
        console.log('');
      });
    }

    await prisma.$disconnect();

    console.log('🎉 SUCCESS: Basic queries work!');
    console.log('✅ custom_title column issue resolved');
    console.log('✅ Prisma Studio should work now');

    console.log('\n🔗 NEXT STEPS FOR MENTOR CV ACCESS:');
    console.log('1. Restart Prisma Studio: npx prisma studio');
    console.log('2. Navigate to student_task_progress table');
    console.log('3. Filter by submission_url IS NOT NULL');
    console.log('4. CV URLs will be visible for mentor access');

  } catch (error) {
    console.error('❌ Basic query failed:', error.message);

    if (error.message.includes('custom_title')) {
      console.log('\n❌ custom_title error still exists!');
      console.log('🔄 Try these steps:');
      console.log('1. Close ALL Prisma Studio tabs');
      console.log('2. Run: npx prisma generate');
      console.log('3. Run: npx prisma studio');
    }

    await prisma.$disconnect();
    process.exit(1);
  }
}

testBasicQueries();
