const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCurrentUser() {
  try {
    console.log('🔍 Testing current user session...');

    // Check users and their roles
    const users = await prisma.users.findMany({
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true
      }
    });

    console.log('\n👥 Available users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active ? '✅' : '❌'}`);
      console.log('');
    });

    // Check active sessions (if any)
    const sessions = await prisma.sessions.findMany({
      where: {
        expires: { gt: new Date() } // Not expired
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });

    console.log(`🔑 Active sessions: ${sessions.length}`);
    sessions.forEach((session, index) => {
      console.log(`${index + 1}. User: ${session.user.full_name} (${session.user.email})`);
      console.log(`   Session ID: ${session.sessionToken.substring(0, 20)}...`);
      console.log(`   Expires: ${session.expires}`);
      console.log('');
    });

    // Give instructions for manual testing
    console.log('🧪 MANUAL TESTING INSTRUCTIONS:');
    console.log('========================================');
    console.log('1. Open browser and go to http://localhost:3000');
    console.log('2. Login with one of these accounts:');
    console.log('   - Student: st.st@test.com');
    console.log('   - Admin: duc.admin@test.com');
    console.log('   - Mentor: ngoc.mentor@test.com');
    console.log('3. Navigate to /student/checklist');
    console.log('4. Try to upload a file');
    console.log('5. Check browser console (F12) for debug logs');

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Test failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testCurrentUser();
