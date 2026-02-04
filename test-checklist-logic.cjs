const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testChecklistLogic() {
  try {
    console.log('🧪 Testing Checklist Auto-Complete Logic\n');

    // Tìm một student để test
    const student = await prisma.students.findFirst({
      include: { users: true }
    });

    if (!student) {
      console.log('⚠️ No student found in database');
      return;
    }

    console.log(`Found student: ${student.users.full_name} (${student.user_id})\n`);

    // Kiểm tra các task đã có link
    const tasks = await prisma.checklist_tasks.findMany({
      where: {
        OR: [
          { link_to: { contains: 'mbti', mode: 'insensitive' } },
          { link_to: { contains: 'grit', mode: 'insensitive' } },
          { link_to: { contains: 'riasec', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`Found ${tasks.length} test-related tasks:`);
    tasks.forEach(task => {
      console.log(`  - ${task.title}`);
      console.log(`    Link: ${task.link_to}\n`);
    });

    // Kiểm tra progress hiện tại
    const progress = await prisma.student_task_progress.findMany({
      where: {
        student_id: student.user_id,
        task_id: { in: tasks.map(t => t.id) }
      },
      include: { task: true }
    });

    console.log(`\nCurrent progress for student:`);
    if (progress.length === 0) {
      console.log('  No progress yet');
    } else {
      progress.forEach(p => {
        console.log(`  - ${p.task?.title}: ${p.status}`);
      });
    }

    // Kiểm tra trạng thái bài test
    const mbtiTest = await prisma.mbti_tests.findUnique({
      where: { student_id: student.user_id }
    });
    const gritTest = await prisma.grit_tests.findUnique({
      where: { student_id: student.user_id }
    });
    const riasecTest = await prisma.riasec_tests.findUnique({
      where: { student_id: student.user_id }
    });

    console.log(`\nTest completion status:`);
    console.log(`  - MBTI: ${mbtiTest?.status || 'NOT_STARTED'}`);
    console.log(`  - GRIT: ${gritTest?.status || 'NOT_STARTED'}`);
    console.log(`  - RIASEC: ${riasecTest?.status || 'NOT_STARTED'}`);

    console.log('\n✅ Test complete!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testChecklistLogic();
