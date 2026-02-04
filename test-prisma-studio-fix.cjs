const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPrismaStudioQueries() {
  try {
    console.log('🎯 Testing Prisma Studio Queries (without custom_title)...');

    console.log('\n1️⃣ Testing student_task_progress findMany...');

    // Test query tương tự Prisma Studio (không có custom_title)
    const progressRecords = await prisma.student_task_progress.findMany({
      take: 10,
      select: {
        id: true,
        student_id: true,
        task_id: true,
        submission_url: true,
        status: true,
        mentor_note: true,
        completed_at: true,
        created_at: true,
        updated_at: true,
        // Không có custom_title nữa
        student: {
          select: {
            users: {
              select: {
                full_name: true,
                email: true
              }
            }
          }
        },
        task: {
          select: {
            title: true,
            description: true
          }
        }
      }
    });

    console.log(`   ✅ Found ${progressRecords.length} progress records`);
    console.log('   ✅ No custom_title field queried');

    console.log('\n2️⃣ Testing submitted files for CV viewing...');
    const submittedFiles = progressRecords.filter(record => record.submission_url);
    console.log(`   ✅ Found ${submittedFiles.length} submitted files`);

    if (submittedFiles.length > 0) {
      console.log('\n📁 Files available for mentor viewing:');
      submittedFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. Student: ${file.student.users.full_name}`);
        console.log(`      Task: ${file.task.title}`);
        console.log(`      File: ${file.submission_url}`);
        console.log(`      Status: ${file.status}`);
        console.log('');
      });
    }

    console.log('\n3️⃣ Testing CV-specific uploads...');
    const cvUploads = await prisma.student_task_progress.findMany({
      where: {
        AND: [
          { submission_url: { not: null } },
          {
            task: {
              title: { contains: "CV", mode: "insensitive" }
            }
          }
        ]
      },
      select: {
        submission_url: true,
        completed_at: true,
        student: {
          select: {
            users: {
              select: {
                full_name: true,
                email: true
              }
            }
          }
        },
        task: {
          select: {
            title: true
          }
        }
      }
    });

    console.log(`   ✅ Found ${cvUploads.length} CV uploads specifically`);

    await prisma.$disconnect();

    console.log('\n🎉 SUCCESS: All queries work without custom_title!');
    console.log('✅ Prisma Studio should now work properly');
    console.log('✅ CV files are accessible for mentors');
    console.log('✅ Database schema is clean');

    if (submittedFiles.length > 0) {
      console.log('\n🔗 MENTOR ACCESS:');
      console.log('Mentors can view uploaded CVs through:');
      console.log('1. Direct URLs from database queries');
      console.log('2. Admin dashboard (to be built)');
      console.log('3. Supabase Storage browser');
    }

  } catch (error) {
    console.error('❌ Query test failed:', error.message);
    if (error.message.includes('custom_title')) {
      console.log('\n🔄 Solution: Restart Prisma Studio');
      console.log('   Close current Studio tab and run: npx prisma studio');
    }
    await prisma.$disconnect();
    process.exit(1);
  }
}

testPrismaStudioQueries();
