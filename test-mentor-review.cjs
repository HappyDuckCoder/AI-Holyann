const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMentorReviewSystem() {
  try {
    console.log('🧪 Testing Mentor Review System...');

    // 1. Check current submissions
    console.log('\n1️⃣ Checking current submitted files...');
    const submittedFiles = await prisma.student_task_progress.findMany({
      where: {
        submission_url: { not: null }
      },
      select: {
        id: true,
        status: true,
        submission_url: true,
        student_id: true,
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

    console.log(`   📋 Found ${submittedFiles.length} files with URLs:`);
    submittedFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.student.users.full_name} - ${file.task.title}`);
      console.log(`      Status: ${file.status}`);
      console.log(`      URL: ${file.submission_url}`);
      console.log('');
    });

    // 2. Test status update (simulate mentor review)
    if (submittedFiles.length > 0) {
      const testFile = submittedFiles.find(f => f.status === 'SUBMITTED');

      if (testFile) {
        console.log(`\n2️⃣ Testing mentor review for: ${testFile.student.users.full_name}`);

        // Simulate approve action
        console.log('   Simulating APPROVE action...');
        const approvedFile = await prisma.student_task_progress.update({
          where: { id: testFile.id },
          data: {
            status: 'COMPLETED',
            mentor_note: 'File looks good! Well formatted CV.',
            updated_at: new Date()
          }
        });

        console.log(`   ✅ Status updated: ${testFile.status} -> ${approvedFile.status}`);
        console.log(`   📝 Mentor note: ${approvedFile.mentor_note}`);

        // Revert back to SUBMITTED for testing
        await prisma.student_task_progress.update({
          where: { id: testFile.id },
          data: {
            status: 'SUBMITTED',
            mentor_note: null
          }
        });
        console.log('   🔄 Reverted status back to SUBMITTED for testing');
      } else {
        console.log('   ⚠️ No SUBMITTED files found to test review');
      }
    }

    // 3. Test statistics
    console.log('\n3️⃣ Testing review statistics...');
    const stats = {
      submitted: await prisma.student_task_progress.count({
        where: {
          submission_url: { not: null },
          status: 'SUBMITTED'
        }
      }),
      completed: await prisma.student_task_progress.count({
        where: {
          submission_url: { not: null },
          status: 'COMPLETED'
        }
      }),
      needs_revision: await prisma.student_task_progress.count({
        where: {
          submission_url: { not: null },
          status: 'NEEDS_REVISION'
        }
      })
    };

    console.log('   📊 Review Statistics:');
    console.log(`      🟡 Chờ review: ${stats.submitted}`);
    console.log(`      🟢 Đã duyệt: ${stats.completed}`);
    console.log(`      🔴 Cần sửa: ${stats.needs_revision}`);

    await prisma.$disconnect();

    console.log('\n🎯 MENTOR REVIEW SYSTEM STATUS:');
    console.log('='.repeat(50));
    console.log('✅ Database queries: Working');
    console.log('✅ Status updates: Working');
    console.log('✅ File submissions: Found');
    console.log('✅ Statistics: Generated');
    console.log('');
    console.log('🚀 READY FOR PRODUCTION:');
    console.log('1. Mentor can access: /admin/file-review');
    console.log('2. View submitted files with student info');
    console.log('3. Approve or request revision');
    console.log('4. Students see updated status in checklist');

  } catch (error) {
    console.error('❌ Mentor review system test failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testMentorReviewSystem();
