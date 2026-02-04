const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyTermsTask() {
  try {
    console.log('🔍 Verifying Terms of Service task...\n');

    // Tìm task có link chứa 'terms'
    const termsTask = await prisma.checklist_tasks.findFirst({
      where: {
        link_to: { contains: 'terms', mode: 'insensitive' }
      },
      include: { stage: true }
    });

    if (termsTask) {
      console.log('✅ Found Terms Task:');
      console.log(`   Title: ${termsTask.title}`);
      console.log(`   Link: ${termsTask.link_to}`);
      console.log(`   Stage: ${termsTask.stage.name}`);
      console.log(`   Order: ${termsTask.order_index}`);
      console.log(`   Required: ${termsTask.is_required}`);
    } else {
      console.log('❌ Terms task not found');
    }

    // Kiểm tra helper function có tìm được không
    console.log('\n🧪 Testing helper function logic...');
    const tasksWithTerms = await prisma.checklist_tasks.findMany({
      where: {
        link_to: { contains: 'terms', mode: 'insensitive' }
      }
    });
    console.log(`   Found ${tasksWithTerms.length} task(s) with 'terms' in link`);

    await prisma.$disconnect();
    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

verifyTermsTask();
