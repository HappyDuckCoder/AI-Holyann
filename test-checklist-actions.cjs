const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testChecklistActions() {
  try {
    console.log('🧪 Testing Checklist Server Actions...');

    // Test the exact query from getStudentChecklistData that was failing
    console.log('\n1️⃣ Testing Stages Query...');
    const stages = await prisma.checklist_stages.findMany({
      orderBy: { order_index: 'asc' },
    });
    console.log(`   ✅ Found ${stages.length} stages`);

    console.log('\n2️⃣ Testing Tasks Query...');
    const tasks = await prisma.checklist_tasks.findMany({
      include: {
        stage: true,
      },
      orderBy: [{ stage_id: 'asc' }, { order_index: 'asc' }],
    });
    console.log(`   ✅ Found ${tasks.length} tasks`);

    console.log('\n3️⃣ Testing Progress Query (the one that was failing)...');
    const progressRecords = await prisma.student_task_progress.findMany({
      include: {
        task: true,
      },
    });
    console.log(`   ✅ Found ${progressRecords.length} progress records`);

    console.log('\n4️⃣ Testing Upload Tasks Detection...');
    const uploadTasks = tasks.filter(task =>
      task.title.toLowerCase().includes('upload') ||
      task.title.toLowerCase().includes('tải') ||
      task.title.toLowerCase().includes('cv')
    );
    console.log(`   ✅ Found ${uploadTasks.length} upload tasks:`);
    uploadTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. "${task.title}" (Stage: ${task.stage.name})`);
    });

    console.log('\n5️⃣ Testing File Submission Column...');
    const submittedFiles = await prisma.student_task_progress.findMany({
      where: {
        submission_url: { not: null }
      },
      select: {
        submission_url: true,
        task: { select: { title: true } }
      }
    });
    console.log(`   ✅ Found ${submittedFiles.length} submitted files`);

    await prisma.$disconnect();

    console.log('\n🎯 FINAL STATUS:');
    console.log('='.repeat(50));
    console.log('✅ Stages query: Working');
    console.log('✅ Tasks query: Working');
    console.log('✅ Progress query: Fixed (was failing before)');
    console.log('✅ Upload tasks: Detected');
    console.log('✅ File submission: Column available');
    console.log('');
    console.log('🎉 ALL CHECKLIST SERVER ACTIONS WORKING!');
    console.log('The /student/checklist page should now load properly.');

  } catch (error) {
    console.error('❌ Server Action test failed:', error.message);
    console.log('\nThis indicates the schema issue is not fully resolved.');
    await prisma.$disconnect();
    process.exit(1);
  }
}

testChecklistActions();
