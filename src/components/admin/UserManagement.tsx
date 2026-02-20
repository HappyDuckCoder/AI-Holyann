"use client"
import { useState, useEffect } from 'react'
import { User, UserFormData } from '@/types/admin'
import UserTable from './UserTable'
import UserModal from './UserModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import AssignMentorForm from './AssignMentorForm'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deletingUser, setDeletingUser] = useState<User | null>(null)
    const [showAssignMentorForm, setShowAssignMentorForm] = useState(false)

    // Students and mentors data
    const [students, setStudents] = useState([])
    const [mentors, setMentors] = useState([])

    // Fetch users
    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/users')
            if (response.ok) {
                const data = await response.json()
                setUsers(data.users || [])
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch students and mentors
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsResponse, mentorsResponse] = await Promise.all([
                    fetch('/api/admin/students'),
                    fetch('/api/admin/mentors')
                ])

                if (studentsResponse.ok && mentorsResponse.ok) {
                    const studentsData = await studentsResponse.json()
                    const mentorsData = await mentorsResponse.json()

                    setStudents(studentsData.students || [])
                    setMentors(mentorsData.mentors || [])
                } else {
                    const studentsError = !studentsResponse.ok ? `Students API: ${studentsResponse.status} ${studentsResponse.statusText}` : ''
                    const mentorsError = !mentorsResponse.ok ? `Mentors API: ${mentorsResponse.status} ${mentorsResponse.statusText}` : ''
                    console.error('Failed to fetch students or mentors:', studentsError, mentorsError)
                    
                    // Try to get error details
                    if (!studentsResponse.ok) {
                        try {
                            const errorData = await studentsResponse.json()
                            console.error('Students API error details:', errorData)
                        } catch (e) {
                            console.error('Could not parse students error response')
                        }
                    }
                    if (!mentorsResponse.ok) {
                        try {
                            const errorData = await mentorsResponse.json()
                            console.error('Mentors API error details:', errorData)
                        } catch (e) {
                            console.error('Could not parse mentors error response')
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching students/mentors data:', error)
                // Set empty arrays as fallback
                setStudents([])
                setMentors([])
            }
        }

        fetchData()
    }, [])

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter.toUpperCase()
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' ? user.is_active : !user.is_active)

        return matchesSearch && matchesRole && matchesStatus
    })

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

    // Handlers
    const handleAddUser = () => {
        setEditingUser(null)
        setIsModalOpen(true)
    }

    const handleEditUser = (user: User) => {
        setEditingUser(user)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (user: User) => {
        setDeletingUser(user)
        setIsDeleteModalOpen(true)
    }

    const handleSaveUser = async (userData: UserFormData) => {
        try {
            const url = editingUser
                ? `/api/admin/users/${editingUser.id}`
                : '/api/admin/users'

            const method = editingUser ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            })

            if (response.ok) {
                await fetchUsers()
                setIsModalOpen(false)
                setEditingUser(null)
            } else {
                // Check if response has content before parsing JSON
                const contentType = response.headers.get('content-type')
                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json()
                    alert(error.message || 'Có lỗi xảy ra')
                } else {
                    alert('Có lỗi xảy ra khi lưu người dùng')
                }
            }
        } catch (error) {
            console.error('Error saving user:', error)
            alert('Có lỗi xảy ra khi lưu người dùng')
        }
    }

    const handleConfirmDelete = async () => {
        if (!deletingUser) return

        try {
            const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await fetchUsers()
                setIsDeleteModalOpen(false)
                setDeletingUser(null)
            } else {
                const contentType = response.headers.get('content-type')
                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json()
                    alert(error.message || 'Có lỗi xảy ra')
                } else {
                    alert('Có lỗi xảy ra khi xóa người dùng')
                }
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Có lỗi xảy ra khi xóa người dùng')
        }
    }

    const handleToggleStatus = async (user: User) => {
        try {
            const response = await fetch(`/api/admin/users/${user.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !user.is_active })
            })

            if (response.ok) {
                await fetchUsers()
            }
        } catch (error) {
            console.error('Error toggling status:', error)
        }
    }

    // Stats
    const stats = {
        total: users.length,
        active: users.filter(u => u.is_active).length,
        students: users.filter(u => u.role === 'STUDENT').length,
        mentors: users.filter(u => u.role === 'MENTOR').length,
        admins: users.filter(u => u.role === 'ADMIN').length,
    }

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Quản lý người dùng</h1>
                    <p className="text-muted-foreground mt-1">Quản lý tất cả người dùng trong hệ thống</p>
                </div>
                <button
                    onClick={handleAddUser}
                    className="btn-primary flex items-center gap-2"
                >
                    <i className="fas fa-user-plus"></i>
                    Thêm người dùng
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="card-holyann text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                    <div className="text-sm text-muted-foreground mt-1">Tổng số</div>
                </div>
                <div className="card-holyann text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
                    <div className="text-sm text-muted-foreground mt-1">Hoạt động</div>
                </div>
                <div className="card-holyann text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.students}</div>
                    <div className="text-sm text-muted-foreground mt-1">Học viên</div>
                </div>
                <div className="card-holyann text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.mentors}</div>
                    <div className="text-sm text-muted-foreground mt-1">Mentors</div>
                </div>
                <div className="card-holyann text-center">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.admins}</div>
                    <div className="text-sm text-muted-foreground mt-1">Admins</div>
                </div>
            </div>

            {/* Filters */}
            <div className="card-holyann">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên hoặc email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-holyann pl-10 w-full"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            className="btn-primary"
                            onClick={() => setShowAssignMentorForm(true)}
                        >
                            Gán mentor
                        </button>
                    </div>
                    <div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="input-holyann w-full"
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="student">Học viên</option>
                            <option value="mentor">Mentor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-holyann w-full"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card-holyann">
                <UserTable
                    users={currentUsers}
                    loading={loading}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleToggleStatus}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} trong {filteredUsers.length} người dùng
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded-lg transition-colors ${
                                        currentPage === page
                                            ? 'bg-primary text-white'
                                            : 'bg-muted hover:bg-muted/80'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setEditingUser(null)
                }}
                onSave={handleSaveUser}
                user={editingUser}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setDeletingUser(null)
                }}
                onConfirm={handleConfirmDelete}
                userName={deletingUser?.full_name || ''}
            />

            {showAssignMentorForm && (
                <Dialog open={showAssignMentorForm} onOpenChange={setShowAssignMentorForm}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Gán Mentor cho Học viên</DialogTitle>
                        </DialogHeader>
                        <AssignMentorForm students={students} mentors={mentors} />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
