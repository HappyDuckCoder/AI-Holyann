const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndUpdateChecklistLinks() {
  try {
    console.log('🔍 Checking checklist tasks with test links...\n');

    // Tìm các task liên quan đến test
    const mbtiTask = await prisma.checklist_tasks.findFirst({
      where: { title: { contains: 'MBTI', mode: 'insensitive' } }
    });

    const gritTask = await prisma.checklist_tasks.findFirst({
      where: { title: { contains: 'GRIT', mode: 'insensitive' } }
    });

    const riasecTask = await prisma.checklist_tasks.findFirst({
      where: { title: { contains: 'RIASEC', mode: 'insensitive' } }
    });

    // Update links nếu cần
    if (mbtiTask && (!mbtiTask.link_to || !mbtiTask.link_to.includes('mbti'))) {
      await prisma.checklist_tasks.update({
        where: { id: mbtiTask.id },
        data: { link_to: '/dashboard/tests?type=mbti' }
      });
      console.log(`✅ Updated MBTI task link: ${mbtiTask.title}`);
    } else if (mbtiTask) {
      console.log(`✓ MBTI task already has link: ${mbtiTask.link_to}`);
    } else {
      console.log('⚠️ MBTI task not found');
    }

    if (gritTask && (!gritTask.link_to || !gritTask.link_to.includes('grit'))) {
      await prisma.checklist_tasks.update({
        where: { id: gritTask.id },
        data: { link_to: '/dashboard/tests?type=grit' }
      });
      console.log(`✅ Updated GRIT task link: ${gritTask.title}`);
    } else if (gritTask) {
      console.log(`✓ GRIT task already has link: ${gritTask.link_to}`);
    } else {
      console.log('⚠️ GRIT task not found');
    }

    if (riasecTask && (!riasecTask.link_to || !riasecTask.link_to.includes('riasec'))) {
      await prisma.checklist_tasks.update({
        where: { id: riasecTask.id },
        data: { link_to: '/dashboard/tests?type=riasec' }
      });
      console.log(`✅ Updated RIASEC task link: ${riasecTask.title}`);
    } else if (riasecTask) {
      console.log(`✓ RIASEC task already has link: ${riasecTask.link_to}`);
    } else {
      console.log('⚠️ RIASEC task not found');
    }

    console.log('\n✅ Check complete!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkAndUpdateChecklistLinks();
