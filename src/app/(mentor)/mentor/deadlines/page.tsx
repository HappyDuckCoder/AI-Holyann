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
  Users,
  ExternalLink
} from 'lucide-react';

// Helper function to get deadline status with colors
function getDeadlineStatus(deadline: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = deadlineDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Overdue
  if (diffDays < 0) {
    return {
      label: formattedDate,
      sublabel: `Quá hạn ${Math.abs(diffDays)} ngày`,
      colorClass: 'text-red-600 font-bold',
      bgClass: 'bg-red-50',
      badgeClass: 'bg-red-100 text-red-700 border-red-200',
      rowClass: 'bg-red-50 hover:bg-red-100',
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      priority: 1
    };
  }

  // Today
  if (diffDays === 0) {
    return {
      label: formattedDate,
      sublabel: 'Hôm nay!',
      colorClass: 'text-orange-600 font-semibold',
      bgClass: 'bg-orange-50',
      badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
      rowClass: 'bg-orange-50 hover:bg-orange-100',
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
      bgClass: 'bg-orange-50',
      badgeClass: 'bg-orange-100 text-orange-600 border-orange-200',
      rowClass: 'bg-orange-50/50 hover:bg-orange-100',
      icon: Clock,
      iconColor: 'text-orange-400',
      priority: 2
    };
  }

  // More than 3 days
  return {
    label: formattedDate,
    sublabel: `Còn ${diffDays} ngày`,
    colorClass: 'text-gray-600',
    bgClass: 'bg-white',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    rowClass: 'bg-white hover:bg-gray-50',
    icon: Calendar,
    iconColor: 'text-gray-400',
    priority: 3
  };
}

// Map status to Vietnamese
function getStatusLabel(status: string) {
  switch (status) {
    case 'COMPLETED': return { label: 'Hoàn thành', class: 'bg-green-100 text-green-700' };
    case 'SUBMITTED': return { label: 'Chờ review', class: 'bg-blue-100 text-blue-700' };
    case 'IN_PROGRESS': return { label: 'Đang làm', class: 'bg-yellow-100 text-yellow-700' };
    case 'NEEDS_REVISION': return { label: 'Cần sửa', class: 'bg-red-100 text-red-700' };
    default: return { label: 'Chưa bắt đầu', class: 'bg-gray-100 text-gray-600' };
  }
}

export default async function MentorDeadlinesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const mentorId = session.user.id;

  // Step 1: Get all students assigned to this mentor
  const assignments = await prisma.mentor_assignments.findMany({
    where: {
      mentor_id: mentorId,
      status: 'ACTIVE'
    },
    select: {
      student_id: true
    }
  });

  const studentIds = assignments.map(a => a.student_id);

  if (studentIds.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarClock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Quản lý Deadline</h1>
          </div>
        </div>

        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có học viên
          </h3>
          <p className="text-gray-500">
            Bạn chưa được phân công quản lý học viên nào
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Get all tasks with deadlines for those students
  // Only get PENDING and NEEDS_REVISION tasks (incomplete)
  const tasksWithDeadlines = await prisma.student_task_progress.findMany({
    where: {
      student_id: { in: studentIds },
      deadline: { not: null },
      status: { in: ['PENDING', 'IN_PROGRESS', 'NEEDS_REVISION'] }
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          stage: {
            select: {
              name: true
            }
          }
        }
      },
      student: {
        select: {
          user_id: true,
          users: {
            select: {
              full_name: true,
              email: true
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
      const deadlineStatus = getDeadlineStatus(t.deadline!);
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
  const totalStudents = new Set(processedTasks.map(t => t.student_id)).size;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarClock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Quản lý Deadline</h1>
        </div>
        <p className="text-gray-600">
          Theo dõi tiến độ và deadline của các học viên
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          <div className="text-sm text-red-600">Quá hạn / Hôm nay</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{urgentCount}</div>
          <div className="text-sm text-orange-600">Sắp hết hạn (≤3 ngày)</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{processedTasks.length}</div>
          <div className="text-sm text-blue-600">Tổng nhiệm vụ</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{totalStudents}</div>
          <div className="text-sm text-green-600">Học viên liên quan</div>
        </div>
      </div>

      {/* Table */}
      {processedTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có deadline nào cần theo dõi
          </h3>
          <p className="text-gray-500">
            Tất cả học viên đã hoàn thành nhiệm vụ hoặc chưa có deadline được đặt
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Học viên
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Nhiệm vụ
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Hạn chót
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Trạng thái
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processedTasks.map((item) => {
                  const StatusIcon = item.deadlineStatus.icon;
                  const statusInfo = getStatusLabel(item.status);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${item.deadlineStatus.rowClass}`}
                    >
                      {/* Student Name */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/mentor/student/${item.student_id}`}
                          className="font-medium text-gray-900 hover:text-primary hover:underline"
                        >
                          {item.student?.users?.full_name || 'Không rõ'}
                        </Link>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.student?.users?.email}
                        </div>
                      </td>

                      {/* Task */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {item.task?.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.task?.stage?.name}
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${item.deadlineStatus.colorClass}`}>
                          <StatusIcon className={`h-4 w-4 ${item.deadlineStatus.iconColor}`} />
                          <div>
                            <div className="text-sm">{item.deadlineStatus.label}</div>
                            <div className="text-xs opacity-80">{item.deadlineStatus.sublabel}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/mentor/student/${item.student_id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Chi tiết
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-200"></div>
          <span>Quá hạn / Hôm nay</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-200"></div>
          <span>Sắp hết hạn (≤3 ngày)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-200"></div>
          <span>Còn thời gian (&gt;3 ngày)</span>
        </div>
      </div>
    </div>
  );
}
