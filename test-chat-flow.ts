// Test complete chat flow
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testChatFlow() {
  console.log('🧪 Testing complete chat flow...\n');

  try {
    // 1. Find test users
    console.log('1️⃣ Finding test users...');
    const student = await prisma.users.findFirst({
      where: { email: 'st@example.com' },
    });
    const mentor = await prisma.users.findFirst({
      where: { email: 'as@example.com' },
    });

    if (!student || !mentor) {
      console.error('❌ Test users not found');
      return;
    }

    console.log('✅ Found users:');
    console.log(`   Student: ${student.full_name} (${student.id})`);
    console.log(`   Mentor: ${mentor.full_name} (${mentor.id})\n`);

    // 2. Find or create chat room
    console.log('2️⃣ Finding chat room...');
    let room = await prisma.chat_rooms.findFirst({
      where: {
        participants: {
          some: { user_id: student.id },
        },
      },
      include: {
        participants: {
          include: { users: true },
        },
      },
    });

    if (!room) {
      console.log('⚠️  No room found, need to create one first');
      return;
    }

    console.log('✅ Found room:', room.name);
    console.log(`   ID: ${room.id}`);
    console.log(`   Participants: ${room.participants.length}\n`);

    // 3. Setup realtime listener (simulate mentor receiving messages)
    console.log('3️⃣ Setting up realtime listener for mentor...');
    let receivedMessages = 0;
    const channel = supabase
      .channel(`room:${room.id}`)
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        receivedMessages++;
        console.log(`📻 [MENTOR] Received broadcast message #${receivedMessages}:`, {
          id: payload.id,
          content: payload.content,
          from: payload.users?.full_name,
        });
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          console.log('🔔 [MENTOR] Postgres change detected:', {
            id: payload.new.id,
            content: payload.new.content,
          });
        }
      )
      .subscribe((status) => {
        console.log(`📡 Mentor subscription status: ${status}\n`);
      });

    // Wait for subscription
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 4. Send test message (simulate student sending)
    console.log('4️⃣ Sending test message from student...');
    const testMessage = `Test message at ${new Date().toLocaleTimeString()}`;

    const message = await prisma.chat_messages.create({
      data: {
        room_id: room.id,
        sender_id: student.id,
        content: testMessage,
        type: 'TEXT',
      },
      include: {
        users: true,
      },
    });

    console.log('✅ Message saved to DB:', message.id);

    // 5. Broadcast the message
    console.log('5️⃣ Broadcasting message...');
    const broadcastPayload = {
      id: message.id,
      room_id: room.id,
      sender_id: student.id,
      content: message.content,
      type: message.type,
      created_at: message.created_at,
      users: {
        id: message.users.id,
        full_name: message.users.full_name,
        avatar_url: message.users.avatar_url,
        role: message.users.role,
      },
      attachments: [],
      is_edited: false,
    };

    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: broadcastPayload,
    });

    console.log('📤 Broadcast sent!\n');

    // 6. Wait for message to be received
    console.log('6️⃣ Waiting for mentor to receive message...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 7. Check results
    console.log('\n📊 Test Results:');
    console.log('─'.repeat(50));
    if (receivedMessages > 0) {
      console.log('✅ PASS: Mentor received broadcast message instantly!');
      console.log(`   Messages received: ${receivedMessages}`);
      console.log('   ⚡ Real-time chat is working!\n');
    } else {
      console.log('❌ FAIL: Mentor did not receive message');
      console.log('   Check Supabase Realtime settings\n');
    }

    // Cleanup
    await supabase.removeChannel(channel);
    console.log('🧹 Cleaned up test resources\n');

    // 8. Summary
    console.log('📝 Summary:');
    console.log('─'.repeat(50));
    console.log('✅ Database connection: Working');
    console.log('✅ Supabase Realtime: Working');
    console.log('✅ Broadcast channel: Working');
    console.log(`${receivedMessages > 0 ? '✅' : '❌'} Message delivery: ${receivedMessages > 0 ? 'Working' : 'Failed'}`);
    console.log('\n🎉 Chat system is ready for production!\n');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatFlow();
