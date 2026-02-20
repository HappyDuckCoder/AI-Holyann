"use client"

import { useState, useEffect } from 'react'
import { assignMentorToStudent, getStudentAssignments, unassignMentor } from '@/actions/admin/assign-mentor'

interface Mentor {
    id: string
    name: string
    email: string
    specialization: 'AS' | 'ACS' | 'ARD'
    university: string
    rating: number
}

interface Student {
    id: string
    name: string
    email: string
}

interface AssignMentorFormProps {
    students: Student[]
    mentors: Mentor[]
}

const MENTOR_TYPE_INFO = {
    AS: {
        label: 'Admissions Strategist',
        description: 'Tư vấn chiến lược du học',
        icon: '🔵',
        color: 'blue'
    },
    ACS: {
        label: 'Academic Content Specialist',
        description: 'Chuyên gia nội dung học thuật',
        icon: '🟢',
        color: 'green'
    },
    ARD: {
        label: 'Activity & Research Development',
        description: 'Phát triển hoạt động & nghiên cứu',
        icon: '🟣',
        color: 'purple'
    }
}

type MentorType = 'AS' | 'ACS' | 'ARD'

interface SelectedMentors {
    AS: string
    ACS: string
    ARD: string
}

export default function AssignMentorForm({ students, mentors }: AssignMentorFormProps) {
    const [selectedStudent, setSelectedStudent] = useState<string>('')
    // Store selected mentor for each type
    const [selectedMentors, setSelectedMentors] = useState<SelectedMentors>({
        AS: '',
        ACS: '',
        ARD: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [currentAssignments, setCurrentAssignments] = useState<any[]>([])

    // Get available mentors for each type
    const getMentorsByType = (type: MentorType) => mentors.filter(m => m.specialization === type && m.id)

    // Load current assignments when student changes
    useEffect(() => {
        if (selectedStudent) {
            loadAssignments()
            // Reset selected mentors when student changes
            setSelectedMentors({ AS: '', ACS: '', ARD: '' })
        }
    }, [selectedStudent])

    const loadAssignments = async () => {
        if (!selectedStudent) return

        const result = await getStudentAssignments(selectedStudent)
        if (result.success) {
            setCurrentAssignments(result.data || [])
        }
    }

    // Update selected mentor for a specific type
    const handleMentorSelect = (type: MentorType, mentorId: string) => {
        setSelectedMentors(prev => ({
            ...prev,
            [type]: mentorId
        }))
    }

    // Check if any mentor is selected
    const hasSelectedMentors = Object.values(selectedMentors).some(id => id !== '')

    // Get count of selected mentors
    const selectedCount = Object.values(selectedMentors).filter(id => id !== '').length

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedStudent) {
            setMessage({
                type: 'error',
                text: 'Vui lòng chọn học viên'
            })
            return
        }

        if (!hasSelectedMentors) {
            setMessage({
                type: 'error',
                text: 'Vui lòng chọn ít nhất một mentor'
            })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            const results: { type: string; success: boolean; message: string }[] = []

            // Assign all selected mentors
            for (const [type, mentorId] of Object.entries(selectedMentors)) {
                if (mentorId) {
                    const result = await assignMentorToStudent(
                        selectedStudent,
                        mentorId,
                        type as MentorType
                    )
                    results.push({
                        type,
                        success: result.success,
                        message: result.message
                    })
                }
            }

            // Check results
            const successCount = results.filter(r => r.success).length
            const failedResults = results.filter(r => !r.success)

            if (successCount === results.length) {
                setMessage({
                    type: 'success',
                    text: `✅ Đã gán thành công ${successCount} mentor cho học viên!`
                })
            } else if (successCount > 0) {
                setMessage({
                    type: 'success',
                    text: `✅ Đã gán ${successCount}/${results.length} mentor. Lỗi: ${failedResults.map(r => `${r.type}: ${r.message}`).join(', ')}`
                })
            } else {
                setMessage({
                    type: 'error',
                    text: `Không thể gán mentor: ${failedResults.map(r => r.message).join(', ')}`
                })
            }

            // Reset selected mentors
            setSelectedMentors({ AS: '', ACS: '', ARD: '' })

            // Reload assignments
            await loadAssignments()
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Có lỗi xảy ra khi gán mentor'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUnassign = async (type: 'AS' | 'ACS' | 'ARD') => {
        if (!selectedStudent) return

        if (!confirm(`Bạn có chắc muốn hủy gán mentor ${type}?`)) return

        setLoading(true)
        const result = await unassignMentor(selectedStudent, type)

        if (result.success) {
            setMessage({
                type: 'success',
                text: result.message
            })
            await loadAssignments()
        } else {
            setMessage({
                type: 'error',
                text: result.message
            })
        }
        setLoading(false)
    }

    const getAssignmentByType = (type: string) => {
        return currentAssignments.find(a => a.type === type)
    }

    return (
        <div className="space-y-6">
            <div>
                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Select Student */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Chọn Học viên <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="input-holyann w-full"
                            required
                        >
                            <option value="">-- Chọn học viên --</option>
                            {students.filter(s => s.id).map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Select Mentors for each type */}
                    {selectedStudent && (
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold">
                                Chọn Mentor cho từng vai trò
                            </label>

                            {(['AS', 'ACS', 'ARD'] as MentorType[]).map(type => {
                                const info = MENTOR_TYPE_INFO[type]
                                const mentorsOfType = getMentorsByType(type)
                                const currentAssignment = getAssignmentByType(type)
                                const isAlreadyAssigned = !!currentAssignment

                                return (
                                    <div key={type} className="p-4 border border-border rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">{info.icon}</span>
                                            <span className="font-semibold">{type}</span>
                                            <span className="text-sm text-muted-foreground">- {info.description}</span>
                                        </div>

                                        {isAlreadyAssigned ? (
                                            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                                <span className="text-green-700 dark:text-green-400">
                                                    ✓ Đã gán: {currentAssignment.mentor.user.full_name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUnassign(type)}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                    disabled={loading}
                                                >
                                                    Hủy gán
                                                </button>
                                            </div>
                                        ) : mentorsOfType.length === 0 ? (
                                            <div className="text-muted-foreground p-2 bg-muted rounded">
                                                Không có mentor nào với chuyên môn {type}
                                            </div>
                                        ) : (
                                            <select
                                                value={selectedMentors[type]}
                                                onChange={(e) => handleMentorSelect(type, e.target.value)}
                                                className="input-holyann w-full"
                                            >
                                                <option value="">-- Chọn mentor {type} --</option>
                                                {mentorsOfType.map(mentor => (
                                                    <option key={mentor.id} value={mentor.id}>
                                                        {mentor.name} - {mentor.university} (⭐ {mentor.rating})
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !selectedStudent || !hasSelectedMentors}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-user-plus mr-2"></i>
                                Gán {selectedCount > 0 ? `${selectedCount} ` : ''}Mentor
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    <i className="fas fa-info-circle text-blue-600"></i>
                    Lưu ý
                </h3>
                <ul className="space-y-2 text-sm">
                    <li>✅ Mỗi học viên có thể có tối đa 3 mentors (1 AS + 1 ACS + 1 ARD)</li>
                    <li>✅ Khi gán mentor, hệ thống tự động tạo chat riêng giữa học viên và mentor</li>
                    <li>✅ Khi đủ 3 mentors, hệ thống tự động tạo group chat cho cả team</li>
                    <li>✅ Mentor phải có đúng chuyên môn tương ứng với vị trí được gán</li>
                </ul>
            </div>
        </div>
    )
}
