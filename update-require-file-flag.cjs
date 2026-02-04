const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUploadTasksRequireFile() {
  try {
    console.log('📁 Setting requiresFile = true for upload tasks...\n');

    // Find all upload tasks that should require file upload
    const uploadTasks = await prisma.checklist_tasks.findMany({
      where: {
        OR: [
          { title: { contains: 'upload', mode: 'insensitive' } },
          { title: { contains: 'tải lên', mode: 'insensitive' } },
          { title: { contains: 'cv', mode: 'insensitive' } },
          { title: { contains: 'transcript', mode: 'insensitive' } },
          { title: { contains: 'bảng điểm', mode: 'insensitive' } },
          { title: { contains: 'chứng chỉ', mode: 'insensitive' } },
          { link_to: { contains: 'upload', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`Found ${uploadTasks.length} upload tasks to update:`);

    for (const task of uploadTasks) {
      console.log(`\n📋 Task: ${task.title}`);
      console.log(`   Current requiresFile: ${task.requires_file || false}`);

      if (!task.requires_file) {
        await prisma.checklist_tasks.update({
          where: { id: task.id },
          data: { requires_file: true }
        });
        console.log(`   ✅ Updated requiresFile to TRUE`);
      } else {
        console.log(`   ✓ Already requires file`);
      }
    }

    // Also check for any other tasks that might need file upload based on description
    const descriptionTasks = await prisma.checklist_tasks.findMany({
      where: {
        OR: [
          { description: { contains: 'upload', mode: 'insensitive' } },
          { description: { contains: 'tải', mode: 'insensitive' } },
          { description: { contains: 'nộp', mode: 'insensitive' } }
        ],
        requires_file: { not: true }
      }
    });

    if (descriptionTasks.length > 0) {
      console.log(`\n📄 Found ${descriptionTasks.length} additional tasks based on description:`);
      for (const task of descriptionTasks) {
        console.log(`\n📋 Task: ${task.title}`);
        console.log(`   Description: ${task.description}`);

        await prisma.checklist_tasks.update({
          where: { id: task.id },
          data: { requires_file: true }
        });
        console.log(`   ✅ Updated requiresFile to TRUE`);
      }
    }

    console.log('\n✅ Update complete!');
    console.log('\n💡 Now when users click on these tasks, they will expand to show file upload interface instead of navigating.');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateUploadTasksRequireFile();
