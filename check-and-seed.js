import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  const stages = await prisma.checklist_stages.count();
  const tasks = await prisma.checklist_tasks.count();

  console.log('Stages:', stages);
  console.log('Tasks:', tasks);

  if (stages === 0) {
    console.log('\n🔄 Running seed...');
    await import('./seed-checklist.js');
  } else {
    console.log('\n✅ Data exists');
  }

  await prisma.$disconnect();
}

checkData();
