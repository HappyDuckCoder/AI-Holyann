const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUploadTasks() {
  try {
    console.log('📁 Updating upload tasks in database...\n');

    // Find tasks that might need file upload (CV, documents, etc.)
    const uploadTasks = await prisma.checklist_tasks.findMany({
      where: {
        OR: [
          { title: { contains: 'cv', mode: 'insensitive' } },
          { title: { contains: 'upload', mode: 'insensitive' } },
          { title: { contains: 'tải lên', mode: 'insensitive' } },
          { title: { contains: 'bảng điểm', mode: 'insensitive' } },
          { title: { contains: 'transcript', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`Found ${uploadTasks.length} potential upload tasks:`);

    for (const task of uploadTasks) {
      console.log(`\n📋 Task: ${task.title}`);
      console.log(`   Current link: ${task.link_to || 'null'}`);

      // Update link to contain 'upload' keyword if it doesn't already
      if (!task.link_to || !task.link_to.includes('upload')) {
        const newLink = '/student/checklist?task=upload&id=' + task.id;

        await prisma.checklist_tasks.update({
          where: { id: task.id },
          data: { link_to: newLink }
        });

        console.log(`   ✅ Updated link: ${newLink}`);
      } else {
        console.log(`   ✓ Link already contains 'upload'`);
      }
    }

    // Special handling for CV upload task (usually has specific handling)
    const cvTask = await prisma.checklist_tasks.findFirst({
      where: { title: { contains: 'cv', mode: 'insensitive' } }
    });

    if (cvTask && (!cvTask.link_to || !cvTask.link_to.includes('upload'))) {
      await prisma.checklist_tasks.update({
        where: { id: cvTask.id },
        data: {
          link_to: '/student/checklist?task=upload-cv&id=' + cvTask.id,
          description: cvTask.description || 'Upload CV để hệ thống AI phân tích và đánh giá hồ sơ của bạn'
        }
      });
      console.log(`\n🎯 Special update for CV task: ${cvTask.title}`);
      console.log(`   New link: /student/checklist?task=upload-cv&id=${cvTask.id}`);
    }

    console.log('\n✅ Upload tasks update complete!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateUploadTasks();
