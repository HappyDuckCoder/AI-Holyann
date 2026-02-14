import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { TaskStatus } from '@prisma/client'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 })
        }

        const { taskId, isCompleted } = await request.json()

        if (!taskId) {
            return NextResponse.json({
                success: false,
                error: 'Missing taskId'
            }, { status: 400 })
        }

        const studentId = session.user.id

        // Upsert task progress
        const taskProgress = await prisma.student_task_progress.upsert({
            where: {
                student_id_task_id: {
                    student_id: studentId,
                    task_id: taskId
                }
            },
            update: {
                status: isCompleted ? TaskStatus.COMPLETED : TaskStatus.PENDING,
                completed_at: isCompleted ? new Date() : null,
                updated_at: new Date()
            },
            create: {
                student_id: studentId,
                task_id: taskId,
                status: isCompleted ? TaskStatus.COMPLETED : TaskStatus.PENDING,
                completed_at: isCompleted ? new Date() : null,
                created_at: new Date(),
                updated_at: new Date()
            }
        })


        return NextResponse.json({
            success: true,
            data: taskProgress
        })

    } catch (error) {
        console.error('❌ Error toggling task:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 })
    }
}
