import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { TaskStatus } from '@prisma/client'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            console.error('❌ [Checklist API] No session or user ID')
            return NextResponse.json({
                success: false,
                error: 'Unauthorized - No valid session'
            }, { status: 401 })
        }

        const studentId = session.user.id

        // Check if student exists
        const student = await prisma.students.findUnique({
            where: { user_id: studentId },
            select: { user_id: true }
        })

        if (!student) {
            console.error('❌ [Checklist API] Student not found in DB for user:', studentId)
            return NextResponse.json({
                success: false,
                error: 'Student record not found'
            }, { status: 404 })
        }

        // Student found, fetching checklist data

        // Get stages
        const stages = await prisma.checklist_stages.findMany({
            orderBy: { order_index: 'asc' },
            select: {
                id: true,
                name: true,
                description: true,
                order_index: true
            }
        })

        // Get tasks with progress
        const tasks = await prisma.checklist_tasks.findMany({
            include: {
                stage: {
                    select: {
                        id: true,
                        name: true,
                        order_index: true
                    }
                },
                student_progress: {
                    where: {
                        student_id: studentId
                    }
                }
            },
            orderBy: [
                { stage: { order_index: 'asc' } },
                { order_index: 'asc' }
            ]
        })

        // Transform tasks to include status
        const transformedTasks = tasks.map(task => {
            const progress = task.student_progress[0] // First match due to unique constraint

            return {
                id: task.id,
                stage_id: task.stage_id,
                title: task.title,
                description: task.description,
                link_to: task.link_to,
                is_required: task.is_required,
                order_index: task.order_index,
                isCompleted: progress?.status === TaskStatus.COMPLETED,
                status: progress?.status,
                uploadedFile: progress?.submission_url,
                feedback: progress?.mentor_note
            }
        })

        // Add isUnlocked to stages (simple logic: stage 1 always unlocked, others based on previous completion)
        const stagesWithLockStatus = stages.map((stage, index) => ({
            ...stage,
            isUnlocked: index === 0 // For now, only first stage is unlocked
        }))

        // Get progress for each task
        const taskProgress = await prisma.student_task_progress.findMany({
            where: { student_id: studentId },
            select: {
                id: true,
                student_id: true,
                task_id: true,
                status: true,
                submission_url: true,
                mentor_note: true,
                completed_at: true,
                created_at: true,
                updated_at: true
            }
        })

        console.log('📊 [Checklist API] Fetched data summary:', {
            stages: stagesWithLockStatus.length,
            tasks: transformedTasks.length,
            progress: taskProgress.length
        })

        return NextResponse.json({
            success: true,
            data: {
                stages: stagesWithLockStatus,
                tasks: transformedTasks,
                progress: taskProgress
            }
        })

    } catch (error) {
        console.error('💥 [Checklist API] Error getting student checklist:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        })
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
        }, { status: 500 })
    }
}
