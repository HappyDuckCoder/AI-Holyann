import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarClock,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

// Helper function to get deadline status with colors
function getDeadlineStatus(deadline: Date, status: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = deadlineDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // If task is completed/submitted, show neutral
  if (status === 'COMPLETED' || status === 'SUBMITTED') {
    return {
      label: formattedDate,
      sublabel: status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang chờ review',
      colorClass: 'text-gray-500',
      bgClass: 'bg-gray-50 border-gray-200',
      badgeClass: 'bg-gray-100 text-gray-700',
      icon: CheckCircle2,
      iconColor: 'text-gray-400',
      priority: 4
    };
  }

  // Overdue
  if (diffDays < 0) {
    return {
      label: formattedDate,
      sublabel: `Quá hạn ${Math.abs(diffDays)} ngày`,
      colorClass: 'text-red-600 font-bold',
      bgClass: 'bg-red-50 border-red-300',
      badgeClass: 'bg-red-100 text-red-700',
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      priority: 1
    };
  }

  // Today
  if (diffDays === 0) {
    return {
      label: formattedDate,
      sublabel: 'Hôm nay là hạn chót!',
      colorClass: 'text-orange-600 font-semibold',
      bgClass: 'bg-orange-50 border-orange-300',
      badgeClass: 'bg-orange-100 text-orange-700',
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
      priority: 1
    };
  }

  // 1-3 days
  if (diffDays <= 3) {
    return {
      label: formattedDate,
      sublabel: `Còn ${diffDays} ngày`,
      colorClass: 'text-orange-500 font-medium',
      bgClass: 'bg-orange-50 border-orange-200',
      badgeClass: 'bg-orange-100 text-orange-600',
      icon: Clock,
      iconColor: 'text-orange-400',
      priority: 2
    };
  }

  // More than 3 days
  return {
    label: formattedDate,
    sublabel: `Còn ${diffDays} ngày`,
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50 border-green-200',
    badgeClass: 'bg-green-100 text-green-700',
    icon: Calendar,
    iconColor: 'text-green-400',
    priority: 3
  };
}

// Map status to Vietnamese
function getStatusLabel(status: string) {
  switch (status) {
    case 'COMPLETED': return 'Đã hoàn thành';
    case 'SUBMITTED': return 'Chờ review';
    case 'IN_PROGRESS': return 'Đang thực hiện';
    case 'NEEDS_REVISION': return 'Cần chỉnh sửa';
    default: return 'Chưa bắt đầu';
  }
}

export default async function StudentDeadlinesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const studentId = session.user.id;

  // Query all tasks with deadlines for this student
  const tasksWithDeadlines = await prisma.student_task_progress.findMany({
    where: {
      student_id: studentId,
      deadline: { not: null }
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          description: true,
          stage: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      deadline: 'asc'
    }
  });

  // Process and sort by priority
  const processedTasks = tasksWithDeadlines
    .filter(t => t.task && t.deadline)
    .map(t => {
      const deadlineStatus = getDeadlineStatus(t.deadline!, t.status);
      return {
        ...t,
        deadlineStatus
      };
    })
    .sort((a, b) => {
      // Sort by priority first, then by deadline
      if (a.deadlineStatus.priority !== b.deadlineStatus.priority) {
        return a.deadlineStatus.priority - b.deadlineStatus.priority;
      }
      return new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();
    });

  // Stats
  const overdueCount = processedTasks.filter(t => t.deadlineStatus.priority === 1).length;
  const urgentCount = processedTasks.filter(t => t.deadlineStatus.priority === 2).length;
  const upcomingCount = processedTasks.filter(t => t.deadlineStatus.priority === 3).length;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarClock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Quản lý Deadline</h1>
        </div>
        <p className="text-gray-600">
          Theo dõi các hạn chót và hoàn thành nhiệm vụ đúng tiến độ
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          <div className="text-sm text-red-600">Quá hạn</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{urgentCount}</div>
          <div className="text-sm text-orange-600">Sắp hết hạn</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{upcomingCount}</div>
          <div className="text-sm text-green-600">Sắp tới</div>
        </div>
      </div>

      {/* Task List */}
      {processedTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có deadline nào
          </h3>
          <p className="text-gray-500 mb-4">
            Mentor sẽ thiết lập deadline cho các nhiệm vụ của bạn
          </p>
          <Link
            href="/student/checklist"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ClipboardList className="h-4 w-4" />
            Xem Checklist
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {processedTasks.map((item) => {
            const StatusIcon = item.deadlineStatus.icon;

            return (
              <div
                key={item.id}
                className={`border rounded-xl p-5 transition-all hover:shadow-md ${item.deadlineStatus.bgClass}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 bg-white/80 px-2 py-0.5 rounded">
                        {item.task?.stage?.name || 'Task'}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${item.deadlineStatus.badgeClass}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.task?.title}
                    </h3>

                    {item.task?.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.task.description}
                      </p>
                    )}

                    {/* Deadline Info */}
                    <div className={`flex items-center gap-2 ${item.deadlineStatus.colorClass}`}>
                      <StatusIcon className={`h-4 w-4 ${item.deadlineStatus.iconColor}`} />
                      <span className="text-sm">{item.deadlineStatus.label}</span>
                      <span className="text-xs">• {item.deadlineStatus.sublabel}</span>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <Link
                    href="/student/checklist"
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Đi tới Checklist
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
