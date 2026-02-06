'use server';

import { prisma } from '@/lib/prisma';

export async function testChatData() {
    try {
        // Get chat rooms
        const rooms = await prisma.chat_rooms.findMany({
            include: {
                participants: {
                    include: {
                        users: {
                            select: {
                                email: true,
                                full_name: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: 1
                }
            }
        });

        return {
            success: true,
            data: rooms
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
