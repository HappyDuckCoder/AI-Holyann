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
                participants: {
                    some: {
                        user_id: userId,
                        is_active: true
                    }
                },
                deleted_at: null,
                status: 'ACTIVE'
            },
            include: {
                participants: {
                    where: {
                        user_id: { not: userId } // Lấy participants khác (để hiển thị thông tin đối tác chat)
                    },
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
                    },
                    take: 1 // Chỉ lấy 1 participant khác (vì room private chỉ có 2 người)
                },
                messages: {
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
                        messages: true
                    }
                }
            },
            orderBy: {
                updated_at: 'desc'
            }
        })

        // Format dữ liệu để dễ sử dụng ở frontend
        const formattedRooms = rooms.map(room => {
            const lastMessage = room.messages[0]
            const otherParticipant = room.participants[0]

            // Count unread messages (messages chưa được user hiện tại đọc)
            const myParticipant = room.participants.find(p => p.user_id === userId)
            const unreadCount = myParticipant?.last_read_at
                ? room._count.messages // Simplified - should count messages after last_read_at
                : room._count.messages

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
