'use server';

import { prisma } from '@/lib/prisma';

export async function getChatRooms(userId: string) {
  try {
    const rooms = await prisma.chat_rooms.findMany({
      where: {
        deleted_at: null,
        participants: {
          some: {
            user_id: userId,
            is_active: true,
          },
        },
      },
      include: {
        participants: {
          where: { is_active: true },
          include: {
            users: {
              select: {
                id: true,
                full_name: true,
                avatar_url: true,
                role: true,
              },
            },
          },
        },
        messages: {
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
          take: 1,
          include: {
            users: {
              select: {
                id: true,
                full_name: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                deleted_at: null,
              },
            },
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    // Tính số tin chưa đọc cho mỗi phòng
    const roomsWithUnreadCount = await Promise.all(
      rooms.map(async (room) => {
        const participant = room.participants.find((p) => p.user_id === userId);
        const lastReadAt = participant?.last_read_at || new Date(0);

        const unreadCount = await prisma.chat_messages.count({
          where: {
            room_id: room.id,
            created_at: {
              gt: lastReadAt,
            },
            sender_id: {
              not: userId,
            },
            deleted_at: null,
          },
        });

        return {
          ...room,
          unreadCount,
          lastMessage: room.messages[0] || null,
        };
      })
    );

    return {
      success: true,
      data: roomsWithUnreadCount,
    };
  } catch (error: any) {
    console.error('Error getting chat rooms:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getChatMessages(roomId: string, userId: string, limit = 50, cursor?: string) {
  try {
    // Kiểm tra quyền truy cập phòng
    const participant = await prisma.chat_participants.findFirst({
      where: {
        room_id: roomId,
        user_id: userId,
        is_active: true,
      },
    });

    if (!participant) {
      throw new Error('Bạn không có quyền xem tin nhắn trong phòng này');
    }

    const messages = await prisma.chat_messages.findMany({
      where: {
        room_id: roomId,
        deleted_at: null,
        ...(cursor && {
          id: {
            lt: cursor,
          },
        }),
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            role: true,
          },
        },
        attachments: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });

    return {
      success: true,
      data: messages.reverse(), // Đảo ngược để hiển thị từ cũ đến mới
      nextCursor: messages.length === limit ? messages[messages.length - 1].id : null,
    };
  } catch (error: any) {
    console.error('Error getting messages:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getRoomParticipants(roomId: string) {
  try {
    const participants = await prisma.chat_participants.findMany({
      where: {
        room_id: roomId,
        is_active: true,
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            role: true,
            email: true,
            phone_number: true,
          },
        },
      },
    });

    return {
      success: true,
      data: participants,
    };
  } catch (error: any) {
    console.error('Error getting participants:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getRoomMedia(roomId: string, userId: string) {
  try {
    // Kiểm tra quyền truy cập
    const participant = await prisma.chat_participants.findFirst({
      where: {
        room_id: roomId,
        user_id: userId,
        is_active: true,
      },
    });

    if (!participant) {
      throw new Error('Bạn không có quyền xem media trong phòng này');
    }

    const attachments = await prisma.chat_attachments.findMany({
      where: {
        chat_messages: {
          room_id: roomId,
          deleted_at: null,
        },
      },
      include: {
        chat_messages: {
          include: {
            users: {
              select: {
                id: true,
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Phân loại media
    const images = attachments.filter((att) => att.file_type.startsWith('image/'));
    const files = attachments.filter((att) => !att.file_type.startsWith('image/'));

    // Trích xuất links từ messages
    const messages = await prisma.chat_messages.findMany({
      where: {
        room_id: roomId,
        deleted_at: null,
        content: {
          contains: 'http',
        },
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        users: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Extract URLs từ content
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links = messages
      .map((msg) => {
        const urls = msg.content?.match(urlRegex) || [];
        return urls.map((url) => ({
          url,
          messageId: msg.id,
          sender: msg.users,
          sentAt: msg.created_at,
        }));
      })
      .flat();

    return {
      success: true,
      data: {
        images,
        files,
        links,
      },
    };
  } catch (error: any) {
    console.error('Error getting room media:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
