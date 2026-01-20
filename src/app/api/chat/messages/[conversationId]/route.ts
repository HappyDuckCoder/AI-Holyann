// API: GET /api/chat/messages/[conversationId] - Get messages for a conversation
// API: POST /api/chat/messages/[conversationId] - Send a new message
// API: PATCH /api/chat/messages/[conversationId] - Mark messages as read

import {NextRequest, NextResponse} from 'next/server';
import {verifyToken} from '@/lib/auth';
import {prisma} from '@/lib/prisma';

// GET - Get all messages for a conversation
export async function GET(
    request: NextRequest,
    {params}: { params: { conversationId: string } }
) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({error: 'Invalid token'}, {status: 401});
        }

        const userId = decoded.userId;
        const conversationId = params.conversationId;

        // Verify user has access to this conversation
        const conversation = await prisma.chat_conversations.findFirst({
            where: {
                id: conversationId,
                OR: [
                    {student_id: userId},
                    {mentor_id: userId}
                ]
            }
        });

        if (!conversation) {
            return NextResponse.json({error: 'Conversation not found'}, {status: 404});
        }

        // Get messages with pagination
        const {searchParams} = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const messages = await prisma.chat_messages.findMany({
            where: {conversation_id: conversationId},
            include: {
                sender: {
                    select: {
                        id: true,
                        full_name: true,
                        avatar_url: true,
                        role: true
                    }
                }
            },
            orderBy: {created_at: 'asc'},
            skip,
            take: limit
        });

        const totalMessages = await prisma.chat_messages.count({
            where: {conversation_id: conversationId}
        });

        // Format messages
        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            senderId: msg.sender_id,
            senderName: msg.sender.full_name,
            senderAvatar: msg.sender.avatar_url,
            senderRole: msg.sender.role,
            content: msg.content,
            messageType: msg.message_type,
            attachmentUrl: msg.attachment_url,
            timestamp: msg.created_at,
            isRead: msg.is_read,
            isMine: msg.sender_id === userId
        }));

        return NextResponse.json({
            messages: formattedMessages,
            pagination: {
                page,
                limit,
                total: totalMessages,
                totalPages: Math.ceil(totalMessages / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            {error: 'Failed to fetch messages'},
            {status: 500}
        );
    }
}

// POST - Send a new message
export async function POST(
    request: NextRequest,
    {params}: { params: { conversationId: string } }
) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({error: 'Invalid token'}, {status: 401});
        }

        const userId = decoded.userId;
        const conversationId = params.conversationId;
        const {content, messageType = 'TEXT', attachmentUrl} = await request.json();

        if (!content || content.trim() === '') {
            return NextResponse.json({error: 'Message content is required'}, {status: 400});
        }

        // Verify user has access to this conversation
        const conversation = await prisma.chat_conversations.findFirst({
            where: {
                id: conversationId,
                OR: [
                    {student_id: userId},
                    {mentor_id: userId}
                ]
            }
        });

        if (!conversation) {
            return NextResponse.json({error: 'Conversation not found'}, {status: 404});
        }

        // Create new message
        const {randomUUID} = await import('crypto');
        const newMessage = await prisma.chat_messages.create({
            data: {
                id: randomUUID(),
                conversation_id: conversationId,
                sender_id: userId,
                content: content.trim(),
                message_type: messageType,
                attachment_url: attachmentUrl || null,
                is_read: false
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        full_name: true,
                        avatar_url: true,
                        role: true
                    }
                }
            }
        });

        // Update conversation's last_message_at (handled by trigger, but we can also do it here)
        await prisma.chat_conversations.update({
            where: {id: conversationId},
            data: {
                last_message_at: new Date(),
                updated_at: new Date()
            }
        });

        // Format response
        const formattedMessage = {
            id: newMessage.id,
            senderId: newMessage.sender_id,
            senderName: newMessage.sender.full_name,
            senderAvatar: newMessage.sender.avatar_url,
            senderRole: newMessage.sender.role,
            content: newMessage.content,
            messageType: newMessage.message_type,
            attachmentUrl: newMessage.attachment_url,
            timestamp: newMessage.created_at,
            isRead: newMessage.is_read,
            isMine: true
        };

        return NextResponse.json({
            message: formattedMessage,
            success: true
        }, {status: 201});

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            {error: 'Failed to send message'},
            {status: 500}
        );
    }
}

// PATCH - Mark messages as read
export async function PATCH(
    request: NextRequest,
    {params}: { params: { conversationId: string } }
) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({error: 'Invalid token'}, {status: 401});
        }

        const userId = decoded.userId;
        const conversationId = params.conversationId;

        // Verify user has access to this conversation
        const conversation = await prisma.chat_conversations.findFirst({
            where: {
                id: conversationId,
                OR: [
                    {student_id: userId},
                    {mentor_id: userId}
                ]
            }
        });

        if (!conversation) {
            return NextResponse.json({error: 'Conversation not found'}, {status: 404});
        }

        // Mark all messages from other user as read
        const result = await prisma.chat_messages.updateMany({
            where: {
                conversation_id: conversationId,
                sender_id: {not: userId},
                is_read: false
            },
            data: {
                is_read: true,
                updated_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            updatedCount: result.count
        });

    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            {error: 'Failed to mark messages as read'},
            {status: 500}
        );
    }
}
