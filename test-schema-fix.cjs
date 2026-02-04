const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSchemaFix() {
  try {
    console.log('🧪 Testing Schema Fix - student_task_progress');

    // Test query that was failing - use valid UUID format or no where clause
    const progressRecords = await prisma.student_task_progress.findMany({
      include: {
        task: true,
      },
      take: 1 // Limit to avoid large result
    });

    console.log('✅ SUCCESS: student_task_progress.findMany() works!');
    console.log(`   Found ${progressRecords.length} records (expected 0 for test)`);

    // Check schema columns
    console.log('\n📋 Checking available columns...');
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_task_progress' 
      ORDER BY ordinal_position;
    `;

    console.log('   Available columns:');
    result.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // Verify custom_title is NOT there
    const hasCustomTitle = result.some(col => col.column_name === 'custom_title');
    console.log(`\n🔍 custom_title column exists: ${hasCustomTitle ? '❌ YES (problem!)' : '✅ NO (fixed!)'}`);

    await prisma.$disconnect();

    if (!hasCustomTitle) {
      console.log('\n🎉 SCHEMA FIXED SUCCESSFULLY!');
      console.log('The checklist page should now load without errors.');
    } else {
      console.log('\n⚠️ Schema still has issues. Run: npx prisma db push');
    }

  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
    await prisma.$disconnect();
  }
}

testSchemaFix();
