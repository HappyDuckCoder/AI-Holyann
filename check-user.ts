import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function checkUser() {
  const email = process.argv[2];

  if (!email) {
    console.log('Usage: npx tsx check-user.ts <email>');
    console.log('Example: npx tsx check-user.ts haivo@student.com');
    process.exit(1);
  }

  console.log(`\n🔍 Checking user: ${email}\n`);

  try {
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        students: true,
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      console.log('\n💡 Solutions:');
      console.log('   1. Register at: http://localhost:3000/register');
      console.log('   2. Check if email is correct');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ User found!');
    console.log('\n📊 User details:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Full Name:', user.full_name);
    console.log('   Role:', user.role);
    console.log('   Auth Provider:', user.auth_provider);
    console.log('   Has Password:', !!user.password_hash);
    console.log('   Is Active:', user.is_active);
    console.log('   Created At:', user.created_at);

    if (user.students) {
      console.log('\n👨‍🎓 Student profile:');
      console.log('   User ID:', user.students.user_id);
      console.log('   Current School:', user.students.current_school || 'N/A');
      console.log('   Current Grade:', user.students.current_grade || 'N/A');
      console.log('   Intended Major:', user.students.intended_major || 'N/A');
    } else if (user.role === 'STUDENT') {
      console.log('\n⚠️  Student profile missing! (Data sync issue)');
    }

    // Check common issues
    console.log('\n🔍 Diagnosis:');

    if (user.auth_provider !== 'LOCAL') {
      console.log(`   ⚠️  This account uses ${user.auth_provider} authentication`);
      console.log('   💡 Use "Sign in with Google" button instead');
    } else if (!user.password_hash) {
      console.log('   ❌ Password hash is missing!');
      console.log('   💡 Use "Forgot Password" to reset');
    } else if (!user.is_active) {
      console.log('   ⚠️  Account is deactivated');
      console.log('   💡 Contact admin to reactivate');
    } else {
      console.log('   ✅ Account is valid for login with credentials');
      console.log('   💡 If login fails, password might be incorrect');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkUser();
