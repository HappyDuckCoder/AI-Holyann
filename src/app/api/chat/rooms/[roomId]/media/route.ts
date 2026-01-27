import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'images';

    // Verify user is participant in this room
    const participant = await prisma.chat_participants.findFirst({
      where: {
        room_id: roomId,
        user_id: session.user.id,
        is_active: true,
      },
    });

    if (!participant) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Fetch attachments based on type
    let whereClause: any = {
      chat_messages: {
        room_id: roomId,
        deleted_at: null,
      },
    };

    if (type === 'images') {
      whereClause.file_type = {
        startsWith: 'image/',
      };
    } else if (type === 'files') {
      whereClause.file_type = {
        not: {
          startsWith: 'image/',
        },
      };
    }

    const attachments = await prisma.chat_attachments.findMany({
      where: whereClause,
      include: {
        chat_messages: {
          include: {
            users: {
              select: {
                full_name: true,
                avatar_url: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 100,
    });

    const items = attachments.map((attachment) => ({
      id: attachment.id,
      url: attachment.file_url,
      name: attachment.file_name,
      type: attachment.file_type,
      size: attachment.file_size ? Number(attachment.file_size) : null,
      thumbnail: attachment.thumbnail_url,
      createdAt: attachment.created_at,
      sender: {
        name: attachment.chat_messages.users.full_name,
        avatar: attachment.chat_messages.users.avatar_url,
      },
    }));

    // TODO: Handle links separately
    // Links should be extracted from message content

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error: any) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
