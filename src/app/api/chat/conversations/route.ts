// API: GET /api/chat/conversations - Get all conversations for current user
// API: POST /api/chat/conversations - Create new conversation

import {NextRequest, NextResponse} from 'next/server';
import {verifyToken} from '@/lib/auth';
import {prisma} from '@/lib/prisma';

// GET - Get all conversations for current user
export async function GET(request: NextRequest) {
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

        // Get user info to check role
        const user = await prisma.users.findUnique({
            where: {id: userId},
            select: {role: true}
        });

        if (!user) {
            return NextResponse.json({error: 'User not found'}, {status: 404});
        }

        // Get conversations based on role
        const conversations = user.role === 'STUDENT' || user.role === 'ADMIN'
            ? await prisma.chat_conversations.findMany({
                where: {student_id: userId},
                include: {
                    mentor: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                            avatar_url: true,
                            role: true
                        }
                    },
                    messages: {
                        orderBy: {created_at: 'desc'},
                        take: 1,
                        select: {
                            id: true,
                            content: true,
                            created_at: true,
                            sender_id: true
                        }
                    },
                    _count: {
                        select: {
                            messages: {
                                where: {
                                    sender_id: {not: userId},
                                    is_read: false
                                }
                            }
                        }
                    }
                },
                orderBy: {last_message_at: 'desc'}
            })
            : await prisma.chat_conversations.findMany({
                where: {mentor_id: userId},
                include: {
                    student: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                            avatar_url: true,
                            students: {
                                select: {
                                    current_grade: true,
                                    target_country: true
                                }
                            }
                        }
                    },
                    messages: {
                        orderBy: {created_at: 'desc'},
                        take: 1,
                        select: {
                            id: true,
                            content: true,
                            created_at: true,
                            sender_id: true
                        }
                    },
                    _count: {
                        select: {
                            messages: {
                                where: {
                                    sender_id: {not: userId},
                                    is_read: false
                                }
                            }
                        }
                    }
                },
                orderBy: {last_message_at: 'desc'}
            });

        // Format response
        const formattedConversations = conversations.map(conv => ({
            id: conv.id,
            participant: user.role === 'STUDENT' || user.role === 'ADMIN' ? {
                id: conv.mentor.id,
                name: conv.mentor.full_name,
                email: conv.mentor.email,
                avatar: conv.mentor.avatar_url,
                role: conv.mentor.role
            } : {
                id: conv.student.id,
                name: conv.student.full_name,
                email: conv.student.email,
                avatar: conv.student.avatar_url,
                grade: conv.student.students?.current_grade,
                targetCountry: conv.student.students?.target_country
            },
            lastMessage: conv.messages[0]?.content || '',
            lastMessageTime: conv.messages[0]?.created_at || conv.created_at,
            unreadCount: conv._count.messages,
            createdAt: conv.created_at,
            updatedAt: conv.updated_at
        }));

        return NextResponse.json({
            conversations: formattedConversations,
            userRole: user.role
        });

    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            {error: 'Failed to fetch conversations'},
            {status: 500}
        );
    }
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
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
        const {mentorId, studentId} = await request.json();

        // Validate that user is creating conversation correctly based on their role
        const user = await prisma.users.findUnique({
            where: {id: userId},
            select: {role: true}
        });

        if (!user) {
            return NextResponse.json({error: 'User not found'}, {status: 404});
        }

        let finalStudentId = studentId;
        let finalMentorId = mentorId;

        // If student is creating conversation, they should be the student_id
        if (user.role === 'STUDENT') {
            finalStudentId = userId;
            if (!mentorId) {
                return NextResponse.json({error: 'Mentor ID is required'}, {status: 400});
            }
        } else if (user.role === 'MENTOR') {
            // If mentor is creating conversation, they should be the mentor_id
            finalMentorId = userId;
            if (!studentId) {
                return NextResponse.json({error: 'Student ID is required'}, {status: 400});
            }
        } else {
            return NextResponse.json({error: 'Invalid user role'}, {status: 403});
        }

        // Check if conversation already exists
        const existingConversation = await prisma.chat_conversations.findFirst({
            where: {
                student_id: finalStudentId,
                mentor_id: finalMentorId
            }
        });

        if (existingConversation) {
            return NextResponse.json({
                conversation: existingConversation,
                message: 'Conversation already exists'
            });
        }

        // Create new conversation
        const {randomUUID} = await import('crypto');
        const newConversation = await prisma.chat_conversations.create({
            data: {
                id: randomUUID(),
                student_id: finalStudentId,
                mentor_id: finalMentorId
            },
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar_url: true
                    }
                },
                mentor: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar_url: true
                    }
                }
            }
        });

        return NextResponse.json({
            conversation: newConversation,
            message: 'Conversation created successfully'
        }, {status: 201});

    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json(
            {error: 'Failed to create conversation'},
            {status: 500}
        );
    }
}
