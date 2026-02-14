'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { TaskStatus } from '@prisma/client'

// ==================== TYPES ====================

interface TaskWithProgress {
  id: string
  stage_id: number
  title: string
  description: string | null
  link_to: string | null
  is_required: boolean
  order_index: number
  stage: {
    id: number
    name: string
    description: string | null
    order_index: number
  }
  progress?: {
    id: string
    status: TaskStatus
    submission_url: string | null
    mentor_note: string | null
    completed_at: Date | null
    created_at: Date
    updated_at: Date
  }
}

interface StudentChecklistResult {
  success: boolean
  data?: {
    studentInfo: {
      id: string
      full_name: string
      email: string
    }
    stages: Array<{
      id: number
      name: string
      description: string | null
      order_index: number
      tasks: TaskWithProgress[]
    }>
    flatTasks: TaskWithProgress[]
  }
  error?: string
}

interface UpdateTaskStatusResult {
  success: boolean
  data?: {
    id: string
    status: TaskStatus
    mentor_note: string | null
    updated_at: Date
  }
  error?: string
}

// ==================== SERVER ACTIONS ====================

/**
 * Lấy toàn bộ checklist tasks với progress của học viên
 * @param studentId - UUID của học viên
 * @returns StudentChecklistResult
 */
export async function getStudentChecklist(studentId: string): Promise<StudentChecklistResult> {
  try {
    // Validate input
    if (!studentId) {
      return {
        success: false,
        error: 'Student ID không hợp lệ'
      }
    }

    // 1. Lấy thông tin học viên
    const student = await prisma.students.findUnique({
      where: { user_id: studentId },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    })

    if (!student) {
      return {
        success: false,
        error: 'Không tìm thấy học viên'
      }
    }

    // 2. Lấy tất cả tasks với stage info và progress của học viên
    const tasksWithProgress = await prisma.checklist_tasks.findMany({
      include: {
        stage: {
          select: {
            id: true,
            name: true,
            description: true,
            order_index: true
          }
        },
        student_progress: {
          where: {
            student_id: studentId
          },
          select: {
            id: true,
            status: true,
            submission_url: true,
            mentor_note: true,
            completed_at: true,
            created_at: true,
            updated_at: true
          }
        }
      },
      orderBy: [
        { stage: { order_index: 'asc' } },
        { order_index: 'asc' }
      ]
    })

    // 3. Transform data structure
    const flatTasks: TaskWithProgress[] = tasksWithProgress.map(task => ({
      id: task.id,
      stage_id: task.stage_id,
      title: task.title,
      description: task.description,
      link_to: task.link_to,
      is_required: task.is_required,
      order_index: task.order_index,
      stage: task.stage,
      progress: task.student_progress[0] || undefined // First match (should be only one due to unique constraint)
    }))

    // 4. Group by stages
    const stagesMap = new Map<number, {
      id: number
      name: string
      description: string | null
      order_index: number
      tasks: TaskWithProgress[]
    }>()

    flatTasks.forEach(task => {
      if (!stagesMap.has(task.stage_id)) {
        stagesMap.set(task.stage_id, {
          id: task.stage.id,
          name: task.stage.name,
          description: task.stage.description,
          order_index: task.stage.order_index,
          tasks: []
        })
      }
      stagesMap.get(task.stage_id)!.tasks.push(task)
    })

    const stages = Array.from(stagesMap.values()).sort((a, b) => a.order_index - b.order_index)

    return {
      success: true,
      data: {
        studentInfo: {
          id: student.users.id,
          full_name: student.users.full_name,
          email: student.users.email
        },
        stages,
        flatTasks
      }
    }

  } catch (error) {
    console.error('❌ Error getting student checklist:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi hệ thống khi tải checklist'
    }
  }
}

/**
 * Cập nhật trạng thái task của học viên (dành cho mentor)
 * @param studentId - UUID của học viên
 * @param taskId - UUID của task
 * @param newStatus - Trạng thái mới
 * @param mentorNote - Ghi chú từ mentor (optional)
 * @returns UpdateTaskStatusResult
 */
export async function updateStudentTaskStatus(
  studentId: string,
  taskId: string,
  newStatus: TaskStatus,
  mentorNote?: string
): Promise<UpdateTaskStatusResult> {
  try {
    // Validate inputs
    if (!studentId) {
      return {
        success: false,
        error: 'Student ID không hợp lệ'
      }
    }

    if (!taskId) {
      return {
        success: false,
        error: 'Task ID không hợp lệ'
      }
    }

    if (!Object.values(TaskStatus).includes(newStatus)) {
      return {
        success: false,
        error: 'Trạng thái task không hợp lệ'
      }
    }

    // 1. Verify student exists
    const student = await prisma.students.findUnique({
      where: { user_id: studentId },
      select: { user_id: true }
    })

    if (!student) {
      return {
        success: false,
        error: 'Không tìm thấy học viên'
      }
    }

    // 2. Verify task exists
    const task = await prisma.checklist_tasks.findUnique({
      where: { id: taskId },
      select: { id: true, title: true }
    })

    if (!task) {
      return {
        success: false,
        error: 'Không tìm thấy task'
      }
    }

    // 3. Upsert student task progress
    const updatedProgress = await prisma.student_task_progress.upsert({
      where: {
        student_id_task_id: {
          student_id: studentId,
          task_id: taskId
        }
      },
      create: {
        student_id: studentId,
        task_id: taskId,
        status: newStatus,
        mentor_note: mentorNote || null,
        completed_at: newStatus === TaskStatus.COMPLETED ? new Date() : null,
        created_at: new Date(),
        updated_at: new Date()
      },
      update: {
        status: newStatus,
        mentor_note: mentorNote || null,
        completed_at: newStatus === TaskStatus.COMPLETED ? new Date() : null,
        updated_at: new Date()
      },
      select: {
        id: true,
        status: true,
        mentor_note: true,
        completed_at: true,
        updated_at: true
      }
    })

    // 4. Revalidate relevant paths
    revalidatePath('/mentor/dashboard')
    revalidatePath('/mentor/students')
    revalidatePath(`/mentor/students/${studentId}`)
    revalidatePath('/student/checklist') // For student view if they're logged in

    return {
      success: true,
      data: {
        id: updatedProgress.id,
        status: updatedProgress.status,
        mentor_note: updatedProgress.mentor_note,
        updated_at: updatedProgress.updated_at
      }
    }

  } catch (error) {
    console.error('❌ Error updating task status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi hệ thống khi cập nhật trạng thái task'
    }
  }
}

/**
 * Lấy thống kê tiến độ của học viên (optional helper function)
 * @param studentId - UUID của học viên
 * @returns Progress statistics
 */
export async function getStudentProgressStats(studentId: string) {
  try {
    if (!studentId) {
      return {
        success: false,
        error: 'Student ID không hợp lệ'
      }
    }

    // Get total tasks and progress breakdown
    const [totalTasks, progressStats] = await Promise.all([
      prisma.checklist_tasks.count(),
      prisma.student_task_progress.groupBy({
        by: ['status'],
        where: { student_id: studentId },
        _count: { status: true }
      })
    ])

    // Calculate stats
    const statsByStatus = progressStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<TaskStatus, number>)

    const completedTasks = statsByStatus[TaskStatus.COMPLETED] || 0
    const submittedTasks = statsByStatus[TaskStatus.SUBMITTED] || 0
    const inProgressTasks = statsByStatus[TaskStatus.IN_PROGRESS] || 0
    const needsRevisionTasks = statsByStatus[TaskStatus.NEEDS_REVISION] || 0
    const pendingTasks = totalTasks - (completedTasks + submittedTasks + inProgressTasks + needsRevisionTasks)

    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      success: true,
      data: {
        totalTasks,
        completedTasks,
        submittedTasks,
        inProgressTasks,
        needsRevisionTasks,
        pendingTasks,
        completionPercentage
      }
    }

  } catch (error) {
    console.error('❌ Error getting progress stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi hệ thống khi tải thống kê tiến độ'
    }
  }
}
