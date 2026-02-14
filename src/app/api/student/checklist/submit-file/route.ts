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

        const { taskId, fileUrl, studentId } = await request.json()

        if (!taskId || !fileUrl || !studentId) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 })
        }

        // Verify student ID matches session
        if (studentId !== session.user.id) {
            return NextResponse.json({
                success: false,
                error: 'Student ID mismatch'
            }, { status: 403 })
        }

        // Upsert task progress with file
        const taskProgress = await prisma.student_task_progress.upsert({
            where: {
                student_id_task_id: {
                    student_id: studentId,
                    task_id: taskId
                }
            },
            update: {
                status: TaskStatus.SUBMITTED, // Changed to SUBMITTED for mentor review
                submission_url: fileUrl,
                completed_at: new Date(),
                updated_at: new Date()
            },
            create: {
                student_id: studentId,
                task_id: taskId,
                status: TaskStatus.SUBMITTED,
                submission_url: fileUrl,
                completed_at: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            }
        })


        return NextResponse.json({
            success: true,
            data: taskProgress
        })

    } catch (error) {
        console.error('❌ Error submitting file task:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 })
    }
}
