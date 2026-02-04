const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTermsTask() {
  try {
    console.log('📜 Creating Terms of Service task...\n');

    // Tìm stage "Chuẩn bị hồ sơ" (stage đầu tiên)
    const stage = await prisma.checklist_stages.findFirst({
      where: { order_index: 1 }
    });

    if (!stage) {
      console.error('❌ Stage not found');
      return;
    }

    console.log(`Found stage: ${stage.name} (ID: ${stage.id})`);

    // Kiểm tra xem task đã tồn tại chưa
    const existingTask = await prisma.checklist_tasks.findFirst({
      where: {
        title: { contains: 'Đọc nội quy', mode: 'insensitive' }
      }
    });

    if (existingTask) {
      console.log('⚠️ Task already exists:', existingTask.title);

      // Update link nếu chưa có
      if (!existingTask.link_to || !existingTask.link_to.includes('terms')) {
        await prisma.checklist_tasks.update({
          where: { id: existingTask.id },
          data: { link_to: '/student/terms-of-service' }
        });
        console.log('✅ Updated link for existing task');
      }

      await prisma.$disconnect();
      return;
    }

    // Tạo task mới
    const newTask = await prisma.checklist_tasks.create({
      data: {
        stage_id: stage.id,
        title: 'Đọc nội quy của HOEX',
        description: 'Đọc và đồng ý với điều khoản & nội quy sử dụng nền tảng Holyann Explore',
        link_to: '/student/terms-of-service',
        is_required: true,
        order_index: 0, // Đặt ở đầu tiên trong stage
      }
    });

    console.log(`✅ Created task: "${newTask.title}"`);
    console.log(`   Link: ${newTask.link_to}`);
    console.log(`   Stage: ${stage.name}`);

    await prisma.$disconnect();
    console.log('\n✅ Setup complete!');
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTermsTask();
