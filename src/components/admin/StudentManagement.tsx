"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import UserAvatar from '@/components/ui/UserAvatar'

interface Student {
  id: string
  name: string | null
  email: string | null
  isActive: boolean | null
  avatarUrl: string | null
  createdAt: string | Date | null
}

interface StudentsResponse {
  students: Student[]
  count: number
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/students', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        setError(`Lỗi server: ${response.status}`)
        return
      }

      const result: StudentsResponse = await response.json()
      setStudents(result.students || [])
    } catch (err) {
      setError('Không thể tải danh sách học viên')
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A'
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return 'Invalid Date'
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const handleViewStudent = (studentId: string) => {
    router.push(`/admin/students/${studentId}`)
  }

  if (loading) {
    return (
      <div className="card-holyann">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title text-2xl !mb-0 !text-left after:!mx-0 after:!w-16">
            QUẢN LÝ HỌC VIÊN
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Đang tải danh sách học viên...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-holyann">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title text-2xl !mb-0 !text-left after:!mx-0 after:!w-16">
            QUẢN LÝ HỌC VIÊN
          </h1>
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-triangle text-3xl"></i>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchStudents}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <i className="fas fa-refresh mr-2"></i>
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-holyann">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title text-2xl !mb-0 !text-left after:!mx-0 after:!w-16">
          QUẢN LÝ HỌC VIÊN
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Tổng cộng: <span className="font-semibold text-primary">{students.length}</span> học viên
          </div>
          <button
            onClick={fetchStudents}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <i className="fas fa-refresh text-xs"></i>
            Làm mới
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-muted-foreground"></i>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <i className="fas fa-user-graduate text-4xl"></i>
          </div>
          <p className="text-muted-foreground text-lg">
            {searchTerm ? 'Không tìm thấy học viên nào phù hợp' : 'Chưa có học viên nào trong hệ thống'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-primary hover:underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Học viên</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Email</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Trạng thái</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground hidden lg:table-cell">Ngày tham gia</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleViewStudent(student.id)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={student.avatarUrl}
                        name={student.name}
                        role="STUDENT"
                        size="md"
                        showInitials={true}
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {student.name || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground md:hidden">
                          {student.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground hidden md:table-cell">
                    {student.email || 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      student.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {student.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {formatDate(student.createdAt)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewStudent(student.id)
                      }}
                      className="text-primary hover:text-primary/80 px-2 py-1 rounded transition-colors"
                      title="Xem chi tiết"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
