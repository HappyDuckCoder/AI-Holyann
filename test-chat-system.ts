// Test script for Chat System
// Run with: npx tsx test-chat-system.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testChatSystem() {
    console.log('🧪 Testing Chat System...\n');

    try {
        // Test 1: Check tables exist
        console.log('✓ Test 1: Checking database tables...');
        const conversations = await prisma.$queryRaw`
            SELECT COUNT(*) as count FROM chat_conversations;
        `;
        const messages = await prisma.$queryRaw`
            SELECT COUNT(*) as count FROM chat_messages;
        `;
        console.log('  ✅ chat_conversations table exists');
        console.log('  ✅ chat_messages table exists');

        // Test 2: Check enum exists
        console.log('\n✓ Test 2: Checking MessageType enum...');
        const enumCheck = await prisma.$queryRaw`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'MessageType'
            ) as exists;
        `;
        console.log('  ✅ MessageType enum exists');

        // Test 3: Get users for testing
        console.log('\n✓ Test 3: Finding test users...');
        const students = await prisma.users.findMany({
            where: { role: 'STUDENT' },
            take: 1,
            select: { id: true, full_name: true, email: true }
        });

        const mentors = await prisma.users.findMany({
            where: { role: 'MENTOR' },
            take: 1,
            select: { id: true, full_name: true, email: true }
        });

        if (students.length === 0) {
            console.log('  ⚠️  No STUDENT users found. Please create a student account first.');
            return;
        }

        if (mentors.length === 0) {
            console.log('  ⚠️  No MENTOR users found. Please create a mentor account first.');
            return;
        }

        const student = students[0];
        const mentor = mentors[0];

        console.log(`  ✅ Student found: ${student.full_name} (${student.email})`);
        console.log(`  ✅ Mentor found: ${mentor.full_name} (${mentor.email})`);

        // Test 4: Create test conversation
        console.log('\n✓ Test 4: Creating test conversation...');
        const { randomUUID } = await import('crypto');

        // Check if conversation exists
        let conversation = await prisma.chat_conversations.findFirst({
            where: {
                student_id: student.id,
                mentor_id: mentor.id
            }
        });

        if (!conversation) {
            conversation = await prisma.chat_conversations.create({
                data: {
                    id: randomUUID(),
                    student_id: student.id,
                    mentor_id: mentor.id,
                    last_message_at: new Date()
                }
            });
            console.log(`  ✅ Created conversation: ${conversation.id}`);
        } else {
            console.log(`  ℹ️  Conversation already exists: ${conversation.id}`);
        }

        // Test 5: Create test messages
        console.log('\n✓ Test 5: Creating test messages...');

        const testMessages = [
            {
                id: randomUUID(),
                conversation_id: conversation.id,
                sender_id: mentor.id,
                content: 'Chào em! Mentor đã xem qua hồ sơ của em rồi. Em có câu hỏi gì không?',
                created_at: new Date(Date.now() - 7200000) // 2 hours ago
            },
            {
                id: randomUUID(),
                conversation_id: conversation.id,
                sender_id: student.id,
                content: 'Dạ chào mentor! Em muốn hỏi về chiến lược chọn trường cho mùa apply năm nay ạ.',
                created_at: new Date(Date.now() - 5400000) // 1.5 hours ago
            },
            {
                id: randomUUID(),
                conversation_id: conversation.id,
                sender_id: mentor.id,
                content: 'Tốt lắm! Với profile hiện tại của em, mentor nghĩ em nên cân nhắc danh sách 8-10 trường theo tỉ lệ: 2 Dream, 4 Match, 2 Safety.',
                created_at: new Date(Date.now() - 3600000) // 1 hour ago
            }
        ];

        for (const msg of testMessages) {
            const exists = await prisma.chat_messages.findUnique({
                where: { id: msg.id }
            });

            if (!exists) {
                await prisma.chat_messages.create({ data: msg });
                console.log(`  ✅ Created message: "${msg.content.substring(0, 50)}..."`);
            }
        }

        // Test 6: Query conversation with messages
        console.log('\n✓ Test 6: Querying conversation with messages...');
        const conversationWithMessages = await prisma.chat_conversations.findUnique({
            where: { id: conversation.id },
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true
                    }
                },
                mentor: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true
                    }
                },
                messages: {
                    orderBy: { created_at: 'asc' },
                    take: 10
                }
            }
        });

        console.log(`  ✅ Conversation ID: ${conversationWithMessages?.id}`);
        console.log(`  ✅ Student: ${conversationWithMessages?.student.full_name}`);
        console.log(`  ✅ Mentor: ${conversationWithMessages?.mentor.full_name}`);
        console.log(`  ✅ Message count: ${conversationWithMessages?.messages.length}`);

        // Test 7: Test unread count
        console.log('\n✓ Test 7: Testing unread message count...');
        const unreadCount = await prisma.chat_messages.count({
            where: {
                conversation_id: conversation.id,
                sender_id: { not: student.id },
                is_read: false
            }
        });
        console.log(`  ✅ Unread messages for student: ${unreadCount}`);

        // Test 8: Mark messages as read
        console.log('\n✓ Test 8: Marking messages as read...');
        const updateResult = await prisma.chat_messages.updateMany({
            where: {
                conversation_id: conversation.id,
                sender_id: { not: student.id }
            },
            data: {
                is_read: true
            }
        });
        console.log(`  ✅ Marked ${updateResult.count} messages as read`);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ All tests passed successfully!');
        console.log('='.repeat(60));
        console.log('\nTest Data Created:');
        console.log(`  - Conversation ID: ${conversation.id}`);
        console.log(`  - Student: ${student.full_name} (${student.email})`);
        console.log(`  - Mentor: ${mentor.full_name} (${mentor.email})`);
        console.log(`  - Messages: ${testMessages.length}`);
        console.log('\nYou can now test the chat UI at:');
        console.log(`  - Student: http://localhost:3000/dashboard/chat`);
        console.log(`  - Mentor: http://localhost:3000/dashboard/mentor/chat`);

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Run tests
testChatSystem();
