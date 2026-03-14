import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { TaskStatus } from '@prisma/client'
import { requirePremium } from '@/lib/api/require-premium'

export async function GET(request: NextRequest) {
    try {
        const forbidden = await requirePremium(request)
        if (forbidden) return forbidden

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
                checklist_stages: {
                    select: {
                        id: true,
                        name: true,
                        order_index: true
                    }
                },
                student_task_progress: {
                    where: {
                        student_id: studentId
                    }
                }
            },
            orderBy: [
                { checklist_stages: { order_index: 'asc' } },
                { order_index: 'asc' }
            ]
        })

        // CV task: complete when student has >= 1 CV on manage-upload page
        const cvTask = tasks.find(t => /CV/i.test(t.title))
        let cvCount = 0
        if (cvTask) {
            cvCount = await prisma.student_cv_documents.count({ where: { student_id: studentId } })
        }

        // Transform tasks to include status
        const transformedTasks = tasks.map(task => {
            const progress = task.student_task_progress[0] // First match due to unique constraint
            const isCvTask = cvTask && task.id === cvTask.id
            const completedByCvUpload = isCvTask && cvCount >= 1

            return {
                id: task.id,
                stage_id: task.stage_id,
                stage: task.checklist_stages ? { id: task.checklist_stages.id, name: task.checklist_stages.name } : undefined,
                title: task.title,
                description: task.description,
                link_to: isCvTask ? '/student/manage-upload' : task.link_to,
                is_required: task.is_required,
                order_index: task.order_index,
                isCompleted: completedByCvUpload || progress?.status === TaskStatus.COMPLETED,
                status: completedByCvUpload ? TaskStatus.COMPLETED : progress?.status,
                uploadedFile: isCvTask && completedByCvUpload ? 'Đã có CV' : progress?.submission_url,
                feedback: progress?.mentor_note,
                linkToManageUpload: !!isCvTask
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
                deadline: true,
                completed_at: true,
                created_at: true,
                updated_at: true
            }
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
