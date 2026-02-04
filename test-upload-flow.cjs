const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUploadTasksFlow() {
  try {
    console.log('🧪 Testing Upload Tasks Flow...\n');

    // Find upload tasks
    const uploadTasks = await prisma.checklist_tasks.findMany({
      where: {
        OR: [
          { title: { contains: 'upload', mode: 'insensitive' } },
          { title: { contains: 'tải', mode: 'insensitive' } },
          { title: { contains: 'cv', mode: 'insensitive' } }
        ]
      },
      include: { stage: true }
    });

    console.log(`Found ${uploadTasks.length} upload tasks:\n`);

    uploadTasks.forEach((task, index) => {
      console.log(`${index + 1}. "${task.title}"`);
      console.log(`   Stage: ${task.stage.name}`);
      console.log(`   Link: ${task.link_to || 'null'}`);
      console.log(`   Description: ${task.description || 'null'}`);

      // Test the logic that will be used in frontend
      const needsFile = task.title.toLowerCase().includes('upload') ||
                       task.title.toLowerCase().includes('tải') ||
                       task.title.toLowerCase().includes('cv') ||
                       task.title.toLowerCase().includes('transcript') ||
                       task.title.toLowerCase().includes('bảng điểm') ||
                       task.title.toLowerCase().includes('chứng chỉ') ||
                       (task.description && (
                         task.description.toLowerCase().includes('upload') ||
                         task.description.toLowerCase().includes('tải') ||
                         task.description.toLowerCase().includes('nộp')
                       )) ||
                       (task.link_to && task.link_to.includes('upload'));

      console.log(`   Will show FileUpload: ${needsFile ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });

    // Test helper function keyword matching
    console.log('🔍 Testing auto-complete keyword matching:\n');

    const keywordTests = [
      'upload',
      'cv',
      'transcript',
      'tải'
    ];

    for (const keyword of keywordTests) {
      const matchingTasks = await prisma.checklist_tasks.findMany({
        where: {
          link_to: { contains: keyword, mode: 'insensitive' }
        }
      });
      console.log(`Keyword "${keyword}": ${matchingTasks.length} tasks found`);
      matchingTasks.forEach(task => {
        console.log(`  - ${task.title}`);
      });
      console.log('');
    }

    console.log('📋 Summary:');
    console.log('1. When user clicks upload task → Will expand (not navigate)');
    console.log('2. Expanded section will show FileUpload component');
    console.log('3. Upload success → Task auto-completed via API');
    console.log('4. FileUpload component uses Supabase storage');
    console.log('\n✅ Test flow analysis complete!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testUploadTasksFlow();
