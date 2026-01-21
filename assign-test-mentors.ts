import { assignMentorsToStudent } from './src/actions/chat/assign-mentors';
import { prisma } from './src/lib/prisma';

async function assign() {
  console.log('🔍 Finding test users...\n');

  // 1. Lấy user IDs
  const student = await prisma.users.findFirst({
    where: { email: 'student@test.com' }
  });

  const mentorAS = await prisma.users.findFirst({
    where: { email: 'mentor-as@test.com' }
  });

  const mentorACS = await prisma.users.findFirst({
    where: { email: 'mentor-acs@test.com' }
  });

  const mentorARD = await prisma.users.findFirst({
    where: { email: 'mentor-ard@test.com' }
  });

  const admin = await prisma.users.findFirst({
    where: { email: 'admin@test.com' }
  });

  if (!student || !mentorAS || !mentorACS || !mentorARD || !admin) {
    console.error('❌ Missing users! Create test users first.');
    console.log('\nExpected users:');
    console.log('  - student@test.com (role: STUDENT)');
    console.log('  - mentor-as@test.com (role: MENTOR)');
    console.log('  - mentor-acs@test.com (role: MENTOR)');
    console.log('  - mentor-ard@test.com (role: MENTOR)');
    console.log('  - admin@test.com (role: ADMIN)');
    console.log('\nGo to Supabase Dashboard → Authentication → Users to create them.');
    process.exit(1);
  }

  console.log('✅ Found users:');
  console.log(`  Student: ${student.full_name} (${student.id})`);
  console.log(`  Mentor AS: ${mentorAS.full_name} (${mentorAS.id})`);
  console.log(`  Mentor ACS: ${mentorACS.full_name} (${mentorACS.id})`);
  console.log(`  Mentor ARD: ${mentorARD.full_name} (${mentorARD.id})`);
  console.log(`  Admin: ${admin.full_name} (${admin.id})`);

  // 2. Gán mentors
  console.log('\n🔄 Assigning mentors to student...');

  const result = await assignMentorsToStudent({
    studentId: student.id,
    mentorASId: mentorAS.id,
    mentorACSId: mentorACS.id,
    mentorARDId: mentorARD.id,
    createdBy: admin.id,
  });

  if (result.success) {
    console.log('\n✅ SUCCESS! Chat rooms created:');
    console.log('='.repeat(60));

    result.data?.rooms.forEach((room: any, i: number) => {
      console.log(`\n${i + 1}. ${room.name}`);
      console.log(`   Type: ${room.type}`);
      console.log(`   Status: ${room.status}`);
      console.log(`   ID: ${room.id}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 All done! Now you can:');
    console.log('  1. Start server: npm run dev');
    console.log('  2. Login student: http://localhost:3000/login');
    console.log('  3. Go to chat: http://localhost:3000/chat');
    console.log('  4. Select a room and send messages!\n');
  } else {
    console.error('\n❌ FAILED:', result.error);
    console.log('\nPossible issues:');
    console.log('  - User roles not correct (check users table)');
    console.log('  - Database connection error');
    console.log('  - Tables not created (run: npx prisma db push)');
  }

  await prisma.$disconnect();
}

assign().catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
