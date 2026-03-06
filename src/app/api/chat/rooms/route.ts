import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth/get-user'

/**
 * GET /api/chat/rooms
 * Lấy danh sách chat rooms của user hiện tại
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request)
        
        if (!user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const userId = user.id

        // Lấy tất cả rooms mà user là participant
        const rooms = await prisma.chat_rooms.findMany({
            where: {
                chat_participants: {
                    some: {
                        user_id: userId,
                        is_active: true
                    }
                },
                deleted_at: null,
                status: 'ACTIVE'
            },
            include: {
                chat_participants: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                full_name: true,
                                email: true,
                                avatar_url: true,
                                role: true
                            }
                        }
                    }
                },
                chat_messages: {
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: 1,
                    select: {
                        id: true,
                        content: true,
                        type: true,
                        created_at: true,
                        sender_id: true,
                        users: {
                            select: {
                                full_name: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        chat_messages: true
                    }
                }
            },
            orderBy: {
                updated_at: 'desc'
            }
        })

        // Format dữ liệu để dễ sử dụng ở frontend
        const formattedRooms = rooms.map(room => {
            const lastMessage = room.chat_messages[0]

            // Find the current user's participant record
            const myParticipant = room.chat_participants.find(p => p.user_id === userId)

            // Find other participant (for PRIVATE rooms) or first other participant (for GROUP rooms)
            const otherParticipant = room.chat_participants.find(p => p.user_id !== userId)

            // Count unread messages (messages chưa được user hiện tại đọc)
            const unreadCount = myParticipant?.last_read_at
                ? room._count.chat_messages // Simplified - should count messages after last_read_at
                : room._count.chat_messages

            return {
                id: room.id,
                name: room.name,
                type: room.type,
                status: room.status,
                mentorType: room.mentor_type,
                lastMessage: lastMessage ? {
                    id: lastMessage.id,
                    content: lastMessage.content,
                    type: lastMessage.type,
                    createdAt: lastMessage.created_at,
                    senderId: lastMessage.sender_id,
                    senderName: lastMessage.users.full_name,
                    isFromMe: lastMessage.sender_id === userId
                } : null,
                otherUser: otherParticipant ? {
                    id: otherParticipant.users.id,
                    name: otherParticipant.users.full_name,
                    email: otherParticipant.users.email,
                    avatar: otherParticipant.users.avatar_url,
                    role: otherParticipant.users.role
                } : null,
                unreadCount,
                createdAt: room.created_at,
                updatedAt: room.updated_at
            }
        })

        return NextResponse.json({
            success: true,
            rooms: formattedRooms,
            count: formattedRooms.length
        })

    } catch (error) {
        console.error('Error fetching chat rooms:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch chat rooms',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

/**
 * POST /api/chat/rooms
 * Tạo room chat mới
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request)
        
        if (!user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const userId = user.id
        const body = await request.json()
        const { name, type, participantIds, mentorType } = body

        // Validate
        if (!name || !type || !participantIds || !Array.isArray(participantIds)) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create room
        const room = await prisma.chat_rooms.create({
            data: {
                id: crypto.randomUUID(),
                name,
                type,
                student_id: userId, // Current user is the owner
                mentor_type: mentorType || null,
                status: 'ACTIVE'
            }
        })

        // Add participants (including creator)
        const allParticipantIds = [...new Set([userId, ...participantIds])]
        await prisma.chat_participants.createMany({
            data: allParticipantIds.map(pId => ({
                id: crypto.randomUUID(),
                room_id: room.id,
                user_id: pId,
                is_active: true
            }))
        })

        return NextResponse.json({
            success: true,
            room: {
                id: room.id,
                name: room.name,
                type: room.type,
                status: room.status
            }
        })

    } catch (error) {
        console.error('Error creating chat room:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create chat room',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
