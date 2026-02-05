'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    ChevronDown,
    Clock,
    CheckSquare,
    AlertCircle,
    Calendar,
    AlertTriangle
} from 'lucide-react'
import FileUpload from '@/components/ui/file-upload'
import { submitTaskWithFile } from '@/actions/checklist'
import { cn } from '@/lib/utils'

interface Task {
    id: string
    title: string
    description?: string
    deadline?: string
    requiresFile?: boolean
    linkTo?: string
}

interface ChecklistItemProps {
    task: Task
    initialData?: {
        status?: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'NEEDS_REVISION'
        submission_url?: string
        mentor_note?: string
        completed_at?: Date
    }
    userId?: string
    isExpanded?: boolean
    onToggleExpanded?: () => void
    className?: string
}

export default function ChecklistItem({
    task,
    initialData,
    userId,
    isExpanded = false,
    onToggleExpanded,
    className
}: ChecklistItemProps) {
    const router = useRouter()

    // Local state for optimistic UI updates
    const [status, setStatus] = useState(initialData?.status || 'PENDING')
    const [submissionUrl, setSubmissionUrl] = useState(initialData?.submission_url || '')
    const [mentorNote, setMentorNote] = useState(initialData?.mentor_note || '')
    const [isUploading, setIsUploading] = useState(false)

    // Sync with server data when initialData changes (after refresh/hydration)
    useEffect(() => {
        if (initialData?.status) {
            setStatus(initialData.status)
        }
        if (initialData?.submission_url) {
            setSubmissionUrl(initialData.submission_url)
        }
        if (initialData?.mentor_note) {
            setMentorNote(initialData.mentor_note)
        }
    }, [initialData])

    // Handle file upload completion with optimistic UI
    const handleUploadComplete = async (fileUrl: string | null) => {
        if (!fileUrl) {
            // File removed - reset to pending
            setStatus('PENDING')
            setSubmissionUrl('')
            setMentorNote('')
            return
        }

        try {
            setIsUploading(true)

            // Optimistic UI update - immediately show "Chờ review" state
            setStatus('SUBMITTED')
            setSubmissionUrl(fileUrl)

            // Submit to server in background
            if (userId) {
                await submitTaskWithFile(userId, task.id, fileUrl)
            }

            // Refresh server data (silent background sync)
            router.refresh()

        } catch (error) {
            console.error('Failed to submit task:', error)
            // Revert optimistic update on error
            setStatus('PENDING')
            setSubmissionUrl('')
        } finally {
            setIsUploading(false)
        }
    }

    // Determine checkbox state based on current status
    const getCheckboxState = () => {
        switch (status) {
            case 'COMPLETED':
                return {
                    icon: <CheckSquare size={20} className="text-teal-600" />,
                    className: 'bg-teal-50 border-teal-200 text-teal-600'
                }
            case 'SUBMITTED':
                return {
                    icon: <Clock size={20} className="text-amber-600" />,
                    className: 'bg-amber-50 border-amber-200 text-amber-600'
                }
            case 'NEEDS_REVISION':
                return {
                    icon: (
                        <div className="relative">
                            <div className="w-5 h-5 rounded-full border-2 border-red-500 bg-red-50 flex items-center justify-center">
                                <AlertTriangle size={12} className="text-red-500 fill-red-500" />
                            </div>
                        </div>
                    ),
                    className: 'bg-red-50 border-red-200 text-red-600'
                }
            default:
                return {
                    icon: <div className="w-5 h-5 rounded border-2 border-gray-300" />,
                    className: 'bg-white border-gray-200 text-gray-400'
                }
        }
    }

    // Get status badge
    const getStatusBadge = () => {
        switch (status) {
            case 'COMPLETED':
                return (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Đã hoàn thành
                    </span>
                )
            case 'SUBMITTED':
                return (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                        Chờ review
                    </span>
                )
            case 'NEEDS_REVISION':
                return (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Cần chỉnh sửa
                    </span>
                )
            default:
                return (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        Chưa hoàn thành
                    </span>
                )
        }
    }

    const checkboxState = getCheckboxState()
    const needsFile = task.requiresFile || task.title.toLowerCase().includes('upload') || task.title.toLowerCase().includes('tải lên')

    return (
        <div className={cn(
            "border rounded-xl transition-all duration-200 hover:shadow-md",
            status === 'COMPLETED' ? 'border-teal-200 bg-teal-50/30' :
            status === 'SUBMITTED' ? 'border-amber-200 bg-amber-50/30' :
            status === 'NEEDS_REVISION' ? 'border-red-200 bg-red-50/30' :
            'border-gray-200 bg-white',
            className
        )}>
            {/* Main Task Row */}
            <div className="flex items-center gap-4 p-4">
                {/* Checkbox */}
                <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-colors cursor-pointer",
                    checkboxState.className
                )}>
                    {checkboxState.icon}
                </div>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                            {task.title}
                        </h3>
                        {getStatusBadge()}
                    </div>

                    {task.description && (
                        <p className="text-sm text-gray-600 mt-1">
                            {task.description}
                        </p>
                    )}

                    {/* Deadline */}
                    {task.deadline && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Calendar size={12} />
                            Hạn: {task.deadline}
                        </div>
                    )}

                    {/* Mentor Note */}
                    {mentorNote && status === 'NEEDS_REVISION' && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                            <p className="text-sm text-red-800 font-medium">
                                Ghi chú từ mentor:
                            </p>
                            <p className="text-sm text-red-700 mt-1">{mentorNote}</p>
                        </div>
                    )}
                </div>

                {/* Expand Button */}
                {needsFile && (
                    <button
                        onClick={onToggleExpanded}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronDown
                            size={16}
                            className={cn(
                                "transition-transform duration-200",
                                isExpanded && "rotate-180"
                            )}
                        />
                    </button>
                )}
            </div>

            {/* Expanded Content - File Upload */}
            {needsFile && isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-4">
                        {/* File Upload Component */}
                        {userId ? (
                            <FileUpload
                                userId={userId}
                                onUploadComplete={handleUploadComplete}
                                currentFileUrl={submissionUrl}
                                category="applications"
                                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                                disabled={isUploading}
                                label={task.id === '1-2' ? 'Upload CV - AI sẽ tự động scan thông tin' : 'Upload file'}
                            />
                        ) : (
                            <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-600">
                                    <AlertCircle size={16} />
                                    Vui lòng đăng nhập để upload file
                                </div>
                            </div>
                        )}

                        {/* Additional Info for CV Upload */}
                        {task.id === '1-2' && status === 'PENDING' && (
                            <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                <p className="text-sm text-blue-800 font-medium">
                                    💡 Upload CV của bạn để mentor có thể xem xét và phê duyệt
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
