import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import ChecklistItem from '@/components/checklist/ChecklistItem'
import { TaskStatus } from '@prisma/client'

// Types for better type safety
interface TaskWithProgress {
    id: string
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
    student_progress: Array<{
        id: string
        status: TaskStatus
        submission_url: string | null
        mentor_note: string | null
        completed_at: Date | null
        created_at: Date
        updated_at: Date
    }>
}

interface StageWithTasks {
    id: number
    name: string
    description: string | null
    order_index: number
    tasks: TaskWithProgress[]
}

export default async function ChecklistDashboardPage() {
    // 1. Authentication - Get current session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        redirect('/login')
    }

    // 2. Get user ID and verify student exists
    const currentUserId = session.user.id

    // Verify student record exists
    const student = await prisma.students.findUnique({
        where: { user_id: currentUserId },
        select: { user_id: true }
    })

    if (!student) {
        // If student record doesn't exist, redirect to profile setup
        redirect('/dashboard/profile')
    }

    // 3. Data Fetching - Get stages with tasks and progress
    const stagesWithTasks: StageWithTasks[] = await prisma.checklist_stages.findMany({
        include: {
            tasks: {
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
                            student_id: currentUserId
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
                orderBy: {
                    order_index: 'asc'
                }
            }
        },
        orderBy: {
            order_index: 'asc'
        }
    })

    // 4. Data Transformation - Calculate progress stats
    const allTasks = stagesWithTasks.flatMap(stage => stage.tasks)
    const completedTasks = allTasks.filter(task =>
        task.student_progress.some(progress => progress.status === TaskStatus.COMPLETED)
    )
    const submittedTasks = allTasks.filter(task =>
        task.student_progress.some(progress => progress.status === TaskStatus.SUBMITTED)
    )
    const inProgressTasks = allTasks.filter(task =>
        task.student_progress.some(progress => progress.status === TaskStatus.IN_PROGRESS)
    )

    const overallProgress = allTasks.length > 0
        ? Math.round((completedTasks.length / allTasks.length) * 100)
        : 0

    // Helper function to get task progress data
    const getTaskInitialData = (task: TaskWithProgress) => {
        const progress = task.student_progress[0] // Get first (and only) progress record

        return progress ? {
            status: progress.status,
            submission_url: progress.submission_url || undefined,
            mentor_note: progress.mentor_note || undefined,
            completed_at: progress.completed_at || undefined,
        } : {
            status: 'PENDING' as const,
            submission_url: undefined,
            mentor_note: undefined,
            completed_at: undefined,
        }
    }

    // Determine if task requires file upload
    const isUploadTask = (task: TaskWithProgress) => {
        const title = task.title.toLowerCase()
        return title.includes('upload') ||
               title.includes('tải lên') ||
               title.includes('nộp') ||
               title.includes('cv') ||
               title.includes('tài liệu') ||
               title.includes('chứng chỉ') ||
               task.link_to?.includes('upload')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🎯 Lộ trình Apply
                    </h1>
                    <p className="text-gray-600">
                        Theo dõi tiến độ và hoàn thành các bước chuẩn bị du học
                    </p>
                </div>

                {/* Overall Progress Bar */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Tiến độ tổng quan
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Hoàn thành {completedTasks.length}/{allTasks.length} nhiệm vụ
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">
                                {overallProgress}%
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-700"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>

                    {/* Progress Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-green-600">
                                {completedTasks.length}
                            </div>
                            <div className="text-xs text-green-600">Hoàn thành</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-yellow-600">
                                {submittedTasks.length}
                            </div>
                            <div className="text-xs text-yellow-600">Chờ duyệt</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-blue-600">
                                {inProgressTasks.length}
                            </div>
                            <div className="text-xs text-blue-600">Đang làm</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-gray-600">
                                {allTasks.length - completedTasks.length - submittedTasks.length - inProgressTasks.length}
                            </div>
                            <div className="text-xs text-gray-600">Chưa bắt đầu</div>
                        </div>
                    </div>
                </div>

                {/* Stages List */}
                <div className="space-y-8">
                    {stagesWithTasks.map((stage, stageIndex) => {
                        const stageCompletedTasks = stage.tasks.filter(task =>
                            task.student_progress.some(progress => progress.status === TaskStatus.COMPLETED)
                        )
                        const stageProgress = stage.tasks.length > 0
                            ? Math.round((stageCompletedTasks.length / stage.tasks.length) * 100)
                            : 0

                        // Simple unlock logic: first stage always unlocked, others need previous stage to be 80% complete
                        const isUnlocked = stageIndex === 0 || stageProgress >= 80

                        return (
                            <div key={stage.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                {/* Stage Header */}
                                <div className={`p-6 ${isUnlocked ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gray-50'}`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                                                ${isUnlocked 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-gray-300 text-gray-600'
                                                }
                                            `}>
                                                {stage.order_index}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {stage.name}
                                                </h3>
                                                {stage.description && (
                                                    <p className="text-gray-600 text-sm">
                                                        {stage.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {stageProgress}%
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {stageCompletedTasks.length}/{stage.tasks.length} hoàn thành
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-500 ${
                                                isUnlocked 
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                                    : 'bg-gray-400'
                                            }`}
                                            style={{ width: `${stageProgress}%` }}
                                        />
                                    </div>

                                    {!isUnlocked && (
                                        <div className="mt-4 text-center">
                                            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-600">
                                                🔒 Hoàn thành giai đoạn trước để mở khóa
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tasks List */}
                                {isUnlocked && (
                                    <div className="p-6 space-y-4">
                                        {stage.tasks.map((task) => {
                                            const initialData = getTaskInitialData(task)

                                            if (isUploadTask(task)) {
                                                return (
                                                    <ChecklistItem
                                                        key={task.id}
                                                        task={{
                                                            id: task.id,
                                                            title: task.title,
                                                            description: task.description || undefined,
                                                            requiresFile: true,
                                                            linkTo: task.link_to || undefined
                                                        }}
                                                        initialData={initialData}
                                                        userId={currentUserId}
                                                    />
                                                )
                                            }

                                            // Regular task (non-upload)
                                            const isCompleted = initialData.status === TaskStatus.COMPLETED

                                            return (
                                                <div
                                                    key={task.id}
                                                    className={`
                                                        bg-gray-50 rounded-xl border p-4 transition-all duration-200
                                                        ${task.link_to ? 'hover:bg-gray-100 cursor-pointer hover:border-blue-300' : ''}
                                                        ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}
                                                    `}
                                                    onClick={() => {
                                                        if (task.link_to) {
                                                            window.open(task.link_to, '_blank')
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {/* Checkbox */}
                                                        <div className={`
                                                            w-6 h-6 rounded-md border-2 flex items-center justify-center
                                                            ${isCompleted 
                                                                ? 'bg-green-500 border-green-500' 
                                                                : 'border-gray-300'
                                                            }
                                                        `}>
                                                            {isCompleted && (
                                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>

                                                        {/* Task Content */}
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                                {task.title}
                                                            </h4>
                                                            {task.description && (
                                                                <p className="text-sm text-gray-600">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                            {task.link_to && (
                                                                <p className="text-xs text-blue-600 mt-1">
                                                                    Click để thực hiện →
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Status */}
                                                        <div className="text-right">
                                                            {isCompleted ? (
                                                                <span className="text-green-600 text-sm font-medium">
                                                                    ✅ Hoàn thành
                                                                </span>
                                                            ) : initialData.status === TaskStatus.SUBMITTED ? (
                                                                <span className="text-yellow-600 text-sm font-medium">
                                                                    ⏳ Chờ duyệt
                                                                </span>
                                                            ) : initialData.status === TaskStatus.IN_PROGRESS ? (
                                                                <span className="text-blue-600 text-sm font-medium">
                                                                    🏃 Đang làm
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-500 text-sm">
                                                                    ⭕ Chờ thực hiện
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Footer Message */}
                <div className="mt-12 text-center bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        🚀 Chúc mừng bạn đã bắt đầu hành trình du học!
                    </h3>
                    <p className="text-blue-700 text-sm">
                        Hoàn thành từng bước một cách có hệ thống để tăng cơ hội thành công.
                        Nếu cần hỗ trợ, hãy liên hệ với mentor của bạn.
                    </p>
                </div>
            </div>
        </div>
    )
}
