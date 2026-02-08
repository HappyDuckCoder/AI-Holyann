"use client"
import { useState, useEffect } from 'react'
import UserAvatar from '@/components/ui/UserAvatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Mail, Phone, GraduationCap, Target, Building2 } from 'lucide-react'

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

interface StudentDetailData {
  id: string
  full_name: string | null
  email: string | null
  phone_number: string | null
  avatar_url: string | null
  is_active: boolean | null
  created_at: string | Date | null
  students: {
    current_school: string | null
    current_grade: string | null
    current_address: string | null
    date_of_birth: string | Date | null
    talents: string | null
    hobbies: string | null
    target_country: string | null
    intended_major: string | null
    yearly_budget: number | null
    personal_desire: string | null
    assessments_completed: boolean | null
  } | null
  student_applications: Array<{
    id: string
    category: string
    status: string
    personal_notes: string | null
    universities: { id: number; name: string; country: string | null; current_ranking: number | null } | null
  }>
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [viewStudentId, setViewStudentId] = useState<string | null>(null)
  const [viewDetail, setViewDetail] = useState<StudentDetailData | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState<string | null>(null)

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
        setError(`Server error: ${response.status}`)
        return
      }

      const result: StudentsResponse = await response.json()
      setStudents(result.students || [])
    } catch (err) {
      setError('Could not load students')
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

  const openView = (studentId: string) => {
    setViewStudentId(studentId)
    setViewDetail(null)
    setViewError(null)
    setViewOpen(true)
  }
  const closeView = () => {
    setViewOpen(false)
    setViewStudentId(null)
    setViewDetail(null)
    setViewError(null)
  }

  useEffect(() => {
    if (!viewOpen || !viewStudentId) return
    setViewLoading(true)
    setViewError(null)
    fetch(`/api/admin/students/${viewStudentId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setViewDetail(json.data)
        else setViewError(json.error || 'Failed to load')
      })
      .catch(() => setViewError('Failed to load'))
      .finally(() => setViewLoading(false))
  }, [viewOpen, viewStudentId])

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto min-h-[300px] flex flex-col">
        <div className="flex-1 p-6 md:p-8 space-y-6">
          <h1 className="text-xl font-semibold text-foreground">Students</h1>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-3 text-muted-foreground">Loading…</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto min-h-[300px] flex flex-col">
        <div className="flex-1 p-6 md:p-8 space-y-6">
          <h1 className="text-xl font-semibold text-foreground">Students</h1>
          <div className="text-center py-8">
            <div className="text-destructive mb-4">
              <i className="fas fa-exclamation-triangle text-3xl" />
            </div>
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchStudents}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <i className="fas fa-refresh mr-2" />
              Retry
            </button>
          </div>
        </div>
        <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border mt-4">
          Admin © 2025 <span className="text-primary font-heading font-bold">HOLYANN EXPLORE</span>
        </footer>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[300px] flex flex-col">
      <div className="flex-1 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl font-semibold text-foreground">Students</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {students.length} student{students.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={fetchStudents}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <i className="fas fa-refresh text-xs" />
              Refresh
            </button>
          </div>
        </div>

        <div className="relative max-w-md">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-xl bg-muted/20">
            <div className="text-muted-foreground mb-4">
              <i className="fas fa-user-graduate text-4xl" />
            </div>
            <p className="text-muted-foreground">
              {searchTerm ? 'No students match your search' : 'No students yet'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-primary hover:underline text-sm"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground hidden lg:table-cell">Joined</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => openView(student.id)}
                    >
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                        {student.email || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          student.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                        {formatDate(student.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openView(student.id)
                          }}
                          className="text-primary hover:text-primary/80 px-2 py-1 rounded transition-colors inline-flex items-center gap-1.5 text-sm"
                          title="View details"
                        >
                          <i className="fas fa-eye" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student view modal */}
        <Dialog open={viewOpen} onOpenChange={(open) => !open && closeView()}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <DialogTitle>Student details</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {viewLoading && (
                <div className="py-12 flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Loading…
                </div>
              )}
              {viewError && !viewLoading && (
                <div className="py-8 text-center">
                  <p className="text-destructive mb-4">{viewError}</p>
                  <button
                    onClick={() => {
                      if (!viewStudentId) return
                      setViewLoading(true)
                      setViewError(null)
                      fetch(`/api/admin/students/${viewStudentId}`, { credentials: 'include' })
                        .then((r) => r.json())
                        .then((j) => {
                          if (j.success && j.data) {
                            setViewDetail(j.data)
                            setViewError(null)
                          } else setViewError(j.error || 'Failed to load')
                        })
                        .catch(() => setViewError('Failed to load'))
                        .finally(() => setViewLoading(false))
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Retry
                  </button>
                </div>
              )}
              {viewDetail && !viewLoading && (
                <div className="space-y-6 pt-2">
                  {/* Header card */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                    <UserAvatar
                      src={viewDetail.avatar_url}
                      name={viewDetail.full_name}
                      role="STUDENT"
                      size="xl"
                      showInitials={true}
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold text-foreground">{viewDetail.full_name ?? 'N/A'}</h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {viewDetail.email ?? '–'}
                        </span>
                        {viewDetail.phone_number && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {viewDetail.phone_number}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          viewDetail.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {viewDetail.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">Joined {formatDate(viewDetail.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Education & goals grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border p-4">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <GraduationCap size={16} className="text-primary" />
                        Education
                      </h3>
                      <dl className="space-y-2 text-sm">
                        <div>
                          <dt className="text-muted-foreground">School</dt>
                          <dd className="text-foreground">{viewDetail.students?.current_school ?? '–'}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Grade</dt>
                          <dd className="text-foreground">{viewDetail.students?.current_grade ?? '–'}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Address</dt>
                          <dd className="text-foreground">{viewDetail.students?.current_address ?? '–'}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="rounded-xl border border-border p-4">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <Target size={16} className="text-primary" />
                        Goals
                      </h3>
                      <dl className="space-y-2 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Major</dt>
                          <dd className="text-foreground">{viewDetail.students?.intended_major ?? '–'}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Target country</dt>
                          <dd className="text-foreground">{viewDetail.students?.target_country ?? '–'}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Budget (yearly)</dt>
                          <dd className="text-foreground">
                            {viewDetail.students?.yearly_budget != null ? `$${viewDetail.students.yearly_budget.toLocaleString()}` : '–'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Optional: talents, hobbies, desire */}
                  {(viewDetail.students?.talents || viewDetail.students?.hobbies || viewDetail.students?.personal_desire) && (
                    <div className="rounded-xl border border-border p-4 space-y-3">
                      {viewDetail.students?.talents && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-1">Talents</h3>
                          <p className="text-sm text-muted-foreground">{viewDetail.students.talents}</p>
                        </div>
                      )}
                      {viewDetail.students?.hobbies && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-1">Hobbies</h3>
                          <p className="text-sm text-muted-foreground">{viewDetail.students.hobbies}</p>
                        </div>
                      )}
                      {viewDetail.students?.personal_desire && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-1">Personal statement</h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewDetail.students.personal_desire}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assessments */}
                  <div className="rounded-xl border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Assessments</h3>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      viewDetail.students?.assessments_completed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {viewDetail.students?.assessments_completed ? 'Completed' : 'Not completed'}
                    </span>
                  </div>

                  {/* Applications */}
                  {viewDetail.student_applications && viewDetail.student_applications.length > 0 && (
                    <div className="rounded-xl border border-border overflow-hidden">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 p-4 border-b border-border">
                        <Building2 size={16} className="text-primary" />
                        Applications ({viewDetail.student_applications.length})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">University</th>
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Country</th>
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Rank</th>
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Category</th>
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewDetail.student_applications.map((app) => (
                              <tr key={app.id} className="border-b border-border last:border-0">
                                <td className="py-2 px-3 text-foreground">{app.universities?.name ?? '–'}</td>
                                <td className="py-2 px-3 text-muted-foreground">{app.universities?.country ?? '–'}</td>
                                <td className="py-2 px-3 text-muted-foreground">{app.universities?.current_ranking ? `#${app.universities.current_ranking}` : '–'}</td>
                                <td className="py-2 px-3">{app.category}</td>
                                <td className="py-2 px-3">{app.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border mt-4">
        Admin © 2025 <span className="text-primary font-heading font-bold">HOLYANN EXPLORE</span>
      </footer>
    </div>
  )
}
