import { prisma } from './src/lib/prisma';

async function checkData() {
  try {
    console.log('🔍 Checking checklist data...\n');

    const stages = await prisma.checklist_stages.findMany({
      orderBy: { order_index: 'asc' },
    });

    console.log(`📊 Found ${stages.length} stages:`);
    stages.forEach(stage => {
      console.log(`  - Stage ${stage.id} (order: ${stage.order_index}): ${stage.name}`);
      console.log(`    Description: ${stage.description || 'N/A'}`);
    });

    console.log('\n📋 Checking tasks by stage:');
    for (const stage of stages) {
      const tasks = await prisma.checklist_tasks.findMany({
        where: { stage_id: stage.id },
        orderBy: { order_index: 'asc' },
      });

      console.log(`\n  🎯 Stage ${stage.id} - "${stage.name}": ${tasks.length} tasks`);
      if (tasks.length === 0) {
        console.log(`    ⚠️  No tasks found for this stage!`);
      } else {
        tasks.forEach(task => {
          console.log(`    ✓ [${task.order_index}] ${task.title}`);
          if (task.description) {
            console.log(`       → ${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}`);
          }
          if (task.link_to) {
            console.log(`       🔗 Links to: ${task.link_to}`);
          }
        });
      }
    }

    console.log('\n✅ Data check complete!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkData();
