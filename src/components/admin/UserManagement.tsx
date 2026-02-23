"use client"
import { useState, useEffect } from 'react'
import { User, UserFormData } from '@/types/admin'
import UserTable from './UserTable'
import UserModal from './UserModal'
import DeleteConfirmModal from './DeleteConfirmModal'
// import AssignMentorForm from './AssignMentorForm'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { UserPlus } from 'lucide-react'
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
    // const [showAssignMentorForm, setShowAssignMentorForm] = useState(false)

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
            {/* Header - same as admin dashboard */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-xl font-semibold text-foreground">Users</h1>
                <Button size="sm" className="shrink-0" onClick={handleAddUser}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add user
                </Button>
            </div>

            {/* Stats cards - same style as admin dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="rounded-xl border border-border p-4 bg-card">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-card">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-card">
                    <p className="text-sm text-muted-foreground">Students</p>
                    <p className="text-2xl font-bold text-foreground">{stats.students}</p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-card">
                    <p className="text-sm text-muted-foreground">Mentors</p>
                    <p className="text-2xl font-bold text-foreground">{stats.mentors}</p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-card">
                    <p className="text-sm text-muted-foreground">Admins</p>
                    <p className="text-2xl font-bold text-foreground">{stats.admins}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-border p-4 bg-card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                    {/* <div>
                        <Button variant="outline" size="sm" onClick={() => setShowAssignMentorForm(true)}>
                            Assign mentor
                        </Button>
                    </div> */}
                    <div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All roles</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="mentor">Mentor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Table - same card style as dashboard */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <UserTable
                    users={currentUsers}
                    loading={loading}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleToggleStatus}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                        <div className="text-sm text-muted-foreground">
                            Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className="min-w-[2rem]"
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
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

            {/* Assign mentor - commented out
            {showAssignMentorForm && (
                <Dialog open={showAssignMentorForm} onOpenChange={setShowAssignMentorForm}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Gán Mentor cho Học viên</DialogTitle>
                        </DialogHeader>
                        <AssignMentorForm students={students} mentors={mentors} />
                    </DialogContent>
                </Dialog>
            )} */}
        </div>
    )
}
