'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'

export async function getMentorsAction() {
    try {
        const session = await getServerSession(authOptions)
        const userRole = (session?.user as any)?.role

        if (!session || userRole !== 'ADMIN') {
            return {
                success: false,
                message: 'Unauthorized',
                data: []
            }
        }

        const mentors = await prisma.mentors.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar_url: true,
                        phone_number: true,
                        is_active: true,
                        created_at: true
                    }
                },
                assignments: {
                    include: {
                        student: {
                            include: {
                                users: {
                                    select: {
                                        full_name: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        return {
            success: true,
            data: mentors
        }
    } catch (error) {
        console.error('Failed to get mentors:', error)
        return {
            success: false,
            message: 'Failed to fetch mentors',
            data: []
        }
    }
}
