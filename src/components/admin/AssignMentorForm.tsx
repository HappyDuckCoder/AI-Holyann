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

export default function AssignMentorForm({ students, mentors }: AssignMentorFormProps) {
    const [selectedStudent, setSelectedStudent] = useState<string>('')
    const [selectedMentor, setSelectedMentor] = useState<string>('')
    const [mentorType, setMentorType] = useState<'AS' | 'ACS' | 'ARD'>('AS')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [currentAssignments, setCurrentAssignments] = useState<any[]>([])

    // Filter mentors by selected type and ensure they have valid IDs
    const availableMentors = mentors.filter(m => m.specialization === mentorType && m.id)

    // Load current assignments when student changes
    useEffect(() => {
        if (selectedStudent) {
            loadAssignments()
        }
    }, [selectedStudent])

    const loadAssignments = async () => {
        if (!selectedStudent) return

        const result = await getStudentAssignments(selectedStudent)
        if (result.success) {
            setCurrentAssignments(result.data || [])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedStudent || !selectedMentor || !mentorType) {
            setMessage({
                type: 'error',
                text: 'Vui lòng chọn đầy đủ thông tin'
            })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            const result = await assignMentorToStudent(
                selectedStudent,
                selectedMentor,
                mentorType
            )

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.message
                })

                // Show additional info
                if (result.data?.hasFullTeam) {
                    setTimeout(() => {
                        setMessage({
                            type: 'success',
                            text: `🎉 Học viên đã có đủ 3 mentors! Nhóm hỗ trợ đầy đủ đã được tạo.`
                        })
                    }, 2000)
                }

                // Reset form
                setSelectedMentor('')

                // Reload assignments
                await loadAssignments()
            } else {
                setMessage({
                    type: 'error',
                    text: result.message
                })
            }
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
            <div className="card-holyann">
                <h2 className="text-2xl font-bold mb-6">Gán Mentor cho Học viên</h2>

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

                    {/* Current Assignments */}
                    {selectedStudent && currentAssignments.length > 0 && (
                        <div className="bg-muted p-4 rounded-lg">
                            <h3 className="font-semibold mb-3">Mentors hiện tại:</h3>
                            <div className="space-y-2">
                                {['AS', 'ACS', 'ARD'].map(type => {
                                    const assignment = getAssignmentByType(type)
                                    const info = MENTOR_TYPE_INFO[type as keyof typeof MENTOR_TYPE_INFO]

                                    return (
                                        <div key={type} className="flex items-center justify-between p-2 bg-background rounded">
                                            <div className="flex items-center gap-2">
                                                <span>{info.icon}</span>
                                                <span className="font-medium">{type}:</span>
                                                {assignment ? (
                                                    <span>{assignment.mentor.user.full_name}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">Chưa gán</span>
                                                )}
                                            </div>
                                            {assignment && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleUnassign(type as any)}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                    disabled={loading}
                                                >
                                                    Hủy gán
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Select Mentor Type */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Loại Mentor <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.entries(MENTOR_TYPE_INFO).map(([key, info]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setMentorType(key as any)}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        mentorType === key
                                            ? `border-${info.color}-600 bg-${info.color}-50 dark:bg-${info.color}-900/20`
                                            : 'border-border hover:border-primary'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">{info.icon}</div>
                                    <div className="font-bold text-sm">{key}</div>
                                    <div className="text-xs text-muted-foreground">{info.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Select Mentor */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Chọn Mentor ({mentorType}) <span className="text-red-500">*</span>
                        </label>
                        {availableMentors.length === 0 ? (
                            <div className="text-muted-foreground p-4 bg-muted rounded-lg">
                                Không có mentor nào với chuyên môn {mentorType}
                            </div>
                        ) : (
                            <select
                                value={selectedMentor}
                                onChange={(e) => setSelectedMentor(e.target.value)}
                                className="input-holyann w-full"
                                required
                            >
                                <option value="">-- Chọn mentor --</option>
                                {availableMentors.map(mentor => (
                                    <option key={mentor.id} value={mentor.id}>
                                        {mentor.name} - {mentor.university} (⭐ {mentor.rating})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !selectedStudent || !selectedMentor}
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
                                Gán Mentor
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Info Box */}
            <div className="card-holyann bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
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
