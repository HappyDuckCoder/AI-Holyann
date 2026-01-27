"use client"
import {useAuthSession} from '@/hooks/useAuthSession'
import {useState} from 'react'
import UserManagement from '@/components/admin/UserManagement'

type TabKey = 'overview' | 'users' | 'mentors' | 'system'

export default function AdminDashboard() {
    const {user} = useAuthSession()
    const [activeTab, setActiveTab] = useState<TabKey>('overview')

    const tabs: { key: TabKey; label: string; icon: string }[] = [
        {key: 'overview', label: 'Tổng quan', icon: 'fa-chart-line'},
        {key: 'users', label: 'Người dùng', icon: 'fa-users'},
        {key: 'mentors', label: 'Mentors', icon: 'fa-chalkboard-teacher'},
        {key: 'system', label: 'Hệ thống', icon: 'fa-cog'},
    ]

    const stats = [
        {label: 'Tổng người dùng', value: '2,847', icon: 'fa-users', color: 'blue', trend: '+12%'},
        {label: 'Mentors hoạt động', value: '42', icon: 'fa-chalkboard-teacher', color: 'purple', trend: '+5%'},
        {label: 'Khóa học', value: '156', icon: 'fa-book', color: 'green', trend: '+8%'},
        {label: 'Doanh thu tháng', value: '₫125M', icon: 'fa-dollar-sign', color: 'yellow', trend: '+15%'},
    ]

    const recentUsers = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            role: 'user',
            date: '07/12/2025',
            status: 'active'
        },
        {id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', role: 'mentor', date: '06/12/2025', status: 'active'},
        {id: 3, name: 'Lê Văn C', email: 'levanc@email.com', role: 'user', date: '06/12/2025', status: 'pending'},
        {id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', role: 'user', date: '05/12/2025', status: 'active'},
    ]

    const systemLogs = [
        {id: 1, action: 'Đăng nhập hệ thống', user: 'admin@holyann.vn', time: '10 phút trước', type: 'info'},
        {id: 2, action: 'Thêm mentor mới', user: 'admin@holyann.vn', time: '1 giờ trước', type: 'success'},
        {id: 3, action: 'Cập nhật cài đặt', user: 'admin@holyann.vn', time: '2 giờ trước', type: 'warning'},
        {id: 4, action: 'Backup dữ liệu', user: 'System', time: '3 giờ trước', type: 'success'},
    ]

    const getRoleBadge = (role: string) => {
        const badges = {
            user: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            mentor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        }
        return badges[role as keyof typeof badges] || badges.user
    }

    const getLogIcon = (type: string) => {
        const icons = {
            info: 'fa-info-circle text-blue-500',
            success: 'fa-check-circle text-green-500',
            warning: 'fa-exclamation-triangle text-yellow-500',
            error: 'fa-times-circle text-red-500',
        }
        return icons[type as keyof typeof icons] || icons.info
    }

    return (
        <div
            className="w-full max-w-7xl mx-auto bg-muted/50 dark:bg-card/20 shadow-2xl rounded-3xl overflow-hidden min-h-[800px] flex flex-col font-sans transition-colors duration-300 backdrop-blur-sm border border-border">

            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-heading font-bold mb-2">
                            Admin Control Panel
                        </h1>
                        <p className="text-red-100">
                            Chào {user?.name}! Quản lý toàn bộ hệ thống Holyann Explore
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                            <i className="fas fa-bell mr-2"></i>
                            <span className="bg-yellow-500 text-xs px-2 py-0.5 rounded-full">3</span>
                        </button>
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <i className="fas fa-user-shield text-3xl"></i>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                activeTab === tab.key
                                    ? 'bg-white text-red-600 shadow-lg'
                                    : 'bg-white/10 hover:bg-white/20'
                            }`}
                        >
                            <i className={`fas ${tab.icon} mr-2`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 p-8">
                {/* Show UserManagement when users tab is active */}
                {activeTab === 'users' ? (
                    <UserManagement />
                ) : (
                    <>
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="card-holyann">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                                            <div className="text-3xl font-bold text-primary">{stat.value}</div>
                                            <div
                                                className={`text-xs mt-2 ${stat.trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                <i className={`fas fa-arrow-${stat.trend.startsWith('+') ? 'up' : 'down'} mr-1`}></i>
                                                {stat.trend} so với tháng trước
                                            </div>
                                        </div>
                                        <div
                                            className={`w-16 h-16 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                                            <i className={`fas ${stat.icon} text-2xl text-${stat.color}-600 dark:text-${stat.color}-400`}></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Recent Users */}
                    <div className="lg:col-span-2 card-holyann">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="section-title text-lg !mb-0 !text-left after:!mx-0 after:!w-10">
                                NGƯỜI DÙNG MỚI
                            </h2>
                            <button className="text-sm text-primary hover:underline">
                                Xem tất cả
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Tên</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Vai
                                        trò
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground hidden lg:table-cell">Ngày
                                        tạo
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Trạng
                                        thái
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Thao
                                        tác
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {recentUsers.map((user) => (
                                    <tr key={user.id}
                                        className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <i className="fas fa-user text-primary text-sm"></i>
                                                </div>
                                                <span className="font-semibold text-foreground">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{user.email}</td>
                                        <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                                                    {user.role === 'user' ? 'Học viên' : user.role === 'mentor' ? 'Mentor' : 'Admin'}
                                                </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">{user.date}</td>
                                        <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    user.status === 'active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                    {user.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
                                                </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button className="text-primary hover:text-primary/80 mx-1">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="text-red-500 hover:text-red-600 mx-1">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Logs */}
                    <div className="card-holyann">
                        <h2 className="section-title text-lg !mb-6 !text-left after:!mx-0 after:!w-10">
                            NHẬT KÝ HỆ THỐNG
                        </h2>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {systemLogs.map((log) => (
                                <div key={log.id}
                                     className="flex items-start gap-3 p-3 bg-muted/30 dark:bg-card/10 rounded-lg">
                                    <i className={`fas ${getLogIcon(log.type)} mt-1`}></i>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-foreground">{log.action}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{log.user}</p>
                                        <p className="text-xs text-muted-foreground">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="w-full mt-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold transition-colors">
                            Xem tất cả logs
                        </button>
                    </div>

                    {/* Quick Admin Actions */}
                    <div className="lg:col-span-3 card-holyann">
                        <h2 className="section-title text-lg !mb-6 !text-left after:!mx-0 after:!w-10">
                            QUẢN LÝ NHANH
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[
                                {icon: 'fa-user-plus', label: 'Thêm user', color: 'blue'},
                                {icon: 'fa-user-tie', label: 'Thêm mentor', color: 'purple'},
                                {icon: 'fa-book', label: 'Quản lý khóa học', color: 'green'},
                                {icon: 'fa-file-invoice-dollar', label: 'Doanh thu', color: 'yellow'},
                                {icon: 'fa-cog', label: 'Cài đặt', color: 'gray'},
                                {icon: 'fa-database', label: 'Backup', color: 'red'},
                            ].map((action, index) => (
                                <button key={index}
                                        className={`p-4 bg-${action.color}-50 dark:bg-${action.color}-900/20 rounded-xl hover:shadow-md transition-all group`}>
                                    <i className={`fas ${action.icon} text-3xl text-${action.color}-600 dark:text-${action.color}-400 mb-2 group-hover:scale-110 transition-transform`}></i>
                                    <p className="text-xs font-semibold text-foreground">{action.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                    </>
                )}
            </main>

            <footer
                className="py-6 text-center text-xs text-muted-foreground border-t border-border bg-background font-sans transition-colors duration-300">
                Admin Control Panel © 2025 <span className="text-primary dark:text-sky-400 font-heading font-bold">HOLYANN EXPLORE</span>
            </footer>
        </div>
    )
}
