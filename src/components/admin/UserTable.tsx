import { User } from '@/types/admin'

interface UserTableProps {
    users: User[]
    loading: boolean
    onEdit: (user: User) => void
    onDelete: (user: User) => void
    onToggleStatus: (user: User) => void
}

export default function UserTable({ users, loading, onEdit, onDelete, onToggleStatus }: UserTableProps) {
    const getRoleBadge = (role: string) => {
        const badges = {
            STUDENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            MENTOR: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        }
        return badges[role as keyof typeof badges] || badges.STUDENT
    }

    const getRoleLabel = (role: string) => {
        const labels = {
            STUDENT: 'Học viên',
            MENTOR: 'Mentor',
            ADMIN: 'Admin',
        }
        return labels[role as keyof typeof labels] || role
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }

    if (users.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <i className="fas fa-users text-6xl text-muted-foreground/30 mb-4"></i>
                    <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
                </div>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Người dùng</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Vai trò</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Trạng thái</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <i className="fas fa-user text-primary"></i>
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold text-foreground">{user.full_name}</div>
                                        <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{user.email}</td>
                            <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <button onClick={() => onToggleStatus(user)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${user.is_active ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                                    {user.is_active ? 'Hoạt động' : 'Khóa'}
                                </button>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => onEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button onClick={() => onDelete(user)} className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
