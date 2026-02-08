"use client"
import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import CreateMentorForm from "@/components/admin/CreateMentorForm"
import RecentUsersTable from "@/components/admin/RecentUsersTable"

export default function AdminDashboard() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const stats = [
        {label: 'Tổng người dùng', value: '2,847', icon: 'fa-users', color: 'blue', trend: '+12%'},
        {label: 'Mentors hoạt động', value: '42', icon: 'fa-chalkboard-teacher', color: 'purple', trend: '+5%'},
        {label: 'Khóa học', value: '156', icon: 'fa-book', color: 'green', trend: '+8%'},
        {label: 'Doanh thu tháng', value: '₫125M', icon: 'fa-dollar-sign', color: 'yellow', trend: '+15%'},
    ]

    const systemLogs = [
        {id: 1, action: 'Đăng nhập hệ thống', user: 'admin@holyann.vn', time: '10 phút trước', type: 'info'},
        {id: 2, action: 'Thêm mentor mới', user: 'admin@holyann.vn', time: '1 giờ trước', type: 'success'},
        {id: 3, action: 'Cập nhật cài đặt', user: 'admin@holyann.vn', time: '2 giờ trước', type: 'warning'},
        {id: 4, action: 'Backup dữ liệu', user: 'System', time: '3 giờ trước', type: 'success'},
    ]

    const getLogIcon = (type: string) => {
        const icons = {
            info: 'fa-info-circle text-blue-500',
            success: 'fa-check-circle text-green-500',
            warning: 'fa-exclamation-triangle text-yellow-500',
            error: 'fa-times-circle text-red-500',
        }
        return icons[type as keyof typeof icons] || icons.info
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="w-full max-w-7xl mx-auto bg-muted/50 dark:bg-card/20 shadow-2xl rounded-3xl overflow-hidden min-h-[800px] flex flex-col font-sans transition-colors duration-300 backdrop-blur-sm border border-border">
                <main className="flex-1 p-8 flex items-center justify-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded w-64 mb-4"></div>
                        <div className="h-4 bg-muted rounded w-48"></div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div
            className="w-full max-w-7xl mx-auto bg-muted/50 dark:bg-card/20 shadow-2xl rounded-3xl overflow-hidden min-h-[800px] flex flex-col font-sans transition-colors duration-300 backdrop-blur-sm border border-border">


            <main className="flex-1 p-8">
                {/* Overview Content */}
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

                    {/* Recent Users - Using Real Data */}
                    <div className="lg:col-span-2">
                        <RecentUsersTable />
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
                            ].map((action, index) => {
                                const activeClass = `p-4 bg-${action.color}-50 dark:bg-${action.color}-900/20 rounded-xl hover:shadow-md transition-all group flex flex-col items-center justify-center w-full h-full`;

                                if (action.label === 'Thêm mentor') {
                                    return (
                                        <Dialog key={index}>
                                            <DialogTrigger asChild>
                                                <button className={activeClass}>
                                                    <i className={`fas ${action.icon} text-3xl text-${action.color}-600 dark:text-${action.color}-400 mb-2 group-hover:scale-110 transition-transform`}></i>
                                                    <p className="text-xs font-semibold text-foreground">{action.label}</p>
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
                                                 <DialogTitle className="sr-only">Thêm Mentor</DialogTitle>
                                                <CreateMentorForm />
                                            </DialogContent>
                                        </Dialog>
                                    )
                                }

                                return (
                                    <button key={index}
                                            className={activeClass}>
                                        <i className={`fas ${action.icon} text-3xl text-${action.color}-600 dark:text-${action.color}-400 mb-2 group-hover:scale-110 transition-transform`}></i>
                                        <p className="text-xs font-semibold text-foreground">{action.label}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
                </>
            </main>

            <footer
                className="py-6 text-center text-xs text-muted-foreground border-t border-border bg-background font-sans transition-colors duration-300">
                Admin Dashboard © 2025 <span className="text-primary dark:text-sky-400 font-heading font-bold">HOLYANN EXPLORE</span>
            </footer>
        </div>
    )
}
