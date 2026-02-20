import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarClock,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
} from "lucide-react";
import MentorDeadlineViewCell from "@/components/mentor/deadlines/MentorDeadlineViewCell";
import MentorDeadlineNoteCell from "@/components/mentor/deadlines/MentorDeadlineNoteCell";

// Helper function to get deadline status with colors
function getDeadlineStatus(deadline: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = deadlineDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (diffDays < 0) {
    return {
      label: formattedDate,
      sublabel: `Quá hạn ${Math.abs(diffDays)} ngày`,
      colorClass: "text-destructive font-bold",
      bgClass: "bg-destructive/10 dark:bg-destructive/20",
      badgeClass:
        "bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive",
      rowClass:
        "bg-destructive/5 hover:bg-destructive/10 dark:bg-destructive/10 dark:hover:bg-destructive/20",
      icon: AlertTriangle,
      iconColor: "text-destructive",
      priority: 1,
    };
  }
  if (diffDays === 0) {
    return {
      label: formattedDate,
      sublabel: "Hôm nay!",
      colorClass: "text-accent-foreground font-semibold",
      bgClass: "bg-accent/10 dark:bg-accent/20",
      badgeClass: "bg-accent/20 text-accent-foreground dark:bg-accent/30",
      rowClass:
        "bg-accent/5 hover:bg-accent/10 dark:bg-accent/10 dark:hover:bg-accent/20",
      icon: AlertTriangle,
      iconColor: "text-accent-foreground",
      priority: 1,
    };
  }
  if (diffDays <= 3) {
    return {
      label: formattedDate,
      sublabel: `Còn ${diffDays} ngày`,
      colorClass: "text-amber-600 dark:text-amber-400 font-medium",
      bgClass: "bg-amber-500/10 dark:bg-amber-500/20",
      badgeClass:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      rowClass:
        "bg-muted/30 hover:bg-muted/50 dark:bg-muted/20 dark:hover:bg-muted/40",
      icon: Clock,
      iconColor: "text-amber-500 dark:text-amber-400",
      priority: 2,
    };
  }
  return {
    label: formattedDate,
    sublabel: `Còn ${diffDays} ngày`,
    colorClass: "text-muted-foreground",
    bgClass: "",
    badgeClass: "bg-muted text-muted-foreground dark:bg-muted/80",
    rowClass: "hover:bg-muted/30 dark:hover:bg-muted/20",
    icon: Calendar,
    iconColor: "text-muted-foreground",
    priority: 3,
  };
}

function getStatusLabel(status: string) {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Hoàn thành",
        class:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      };
    case "SUBMITTED":
      return {
        label: "Chờ review",
        class:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      };
    case "IN_PROGRESS":
      return {
        label: "Đang làm",
        class:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      };
    case "NEEDS_REVISION":
      return {
        label: "Cần sửa",
        class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      };
    default:
      return {
        label: "Chưa bắt đầu",
        class: "bg-muted text-muted-foreground dark:bg-muted/80",
      };
  }
}

export default async function MentorDeadlinesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const mentorId = session.user.id;

  // Step 1: Get all students assigned to this mentor
  const assignments = await prisma.mentor_assignments.findMany({
    where: {
      mentor_id: mentorId,
      status: "ACTIVE",
    },
    select: {
      student_id: true,
    },
  });

  const studentIds = assignments.map((a) => a.student_id);

  if (studentIds.length === 0) {
    return (
      <div className="min-h-[calc(100vh-theme(spacing.14))] bg-background">
        <div className="container max-w-screen-2xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <header className="mb-8 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <CalendarClock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground sm:text-3xl">
                  Quản lý Deadline
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Theo dõi tiến độ và deadline của các học viên
                </p>
              </div>
            </div>
          </header>
          <div className="rounded-xl border border-border bg-card py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Chưa có học viên
            </h3>
            <p className="text-muted-foreground">
              Bạn chưa được phân công quản lý học viên nào
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Checklist tasks with deadlines + custom deadlines
  type CustomDeadlineDb = {
    id: string;
    title: string;
    student_id: string;
    deadline: Date | null;
    status: string;
    mentor_note: string | null;
    student_note: string | null;
    student: { user_id: string; users: { full_name: string | null; email: string | null } | null };
  };
  const [tasksWithDeadlines, customDeadlines] = await Promise.all([
    prisma.student_task_progress.findMany({
      where: {
        student_id: { in: studentIds },
        deadline: { not: null },
        status: { in: ["PENDING", "IN_PROGRESS", "NEEDS_REVISION"] },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            stage: { select: { name: true } },
          },
        },
        student: {
          select: {
            user_id: true,
            users: { select: { full_name: true, email: true } },
          },
        },
      },
      orderBy: { deadline: "asc" },
    }),
    (
      prisma as unknown as {
        mentor_custom_deadlines: { findMany: (args: unknown) => Promise<CustomDeadlineDb[]> };
      }
    ).mentor_custom_deadlines.findMany({
        where: {
          mentor_id: mentorId,
          student_id: { in: studentIds },
        },
        include: {
          student: {
            select: {
              user_id: true,
              users: { select: { full_name: true, email: true } },
            },
          },
        },
        orderBy: [{ deadline: "asc" }, { created_at: "desc" }],
      }),
  ]);

  type TaskItem = (typeof tasksWithDeadlines)[0] & { mentor_note?: string | null; student_note?: string | null };
  type ChecklistRow = TaskItem & { deadlineStatus: ReturnType<typeof getDeadlineStatus>; type: "checklist" };
  const processedChecklist: ChecklistRow[] = tasksWithDeadlines
    .filter((t: (typeof tasksWithDeadlines)[0]): t is TaskItem => !!t.task && !!t.deadline)
    .map((t: TaskItem) => {
      const deadlineStatus = getDeadlineStatus(t.deadline!);
      return { ...t, deadlineStatus, type: "checklist" as const };
    })
    .sort((a: ChecklistRow, b: ChecklistRow) => {
      if (a.deadlineStatus.priority !== b.deadlineStatus.priority) {
        return a.deadlineStatus.priority - b.deadlineStatus.priority;
      }
      return new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();
    });

  type CustomRow = {
    type: "custom";
    id: string;
    student_id: string;
    task: null;
    student: { user_id: string; users: { full_name: string | null; email: string | null } | null };
    taskTitle: string;
    stageName: null;
    deadline: Date | null;
    status: string;
    mentor_note: string | null;
    student_note: string | null;
    deadlineStatus: ReturnType<typeof getDeadlineStatus>;
  };
  const processedCustom: CustomRow[] = customDeadlines.map((c: CustomDeadlineDb) => {
    const deadline = c.deadline;
    const deadlineStatus = deadline
      ? getDeadlineStatus(deadline)
      : {
          label: "—",
          sublabel: "Chưa đặt",
          colorClass: "text-muted-foreground",
          bgClass: "",
          badgeClass: "bg-muted text-muted-foreground dark:bg-muted/80",
          rowClass: "hover:bg-muted/30 dark:hover:bg-muted/20",
          icon: Calendar,
          iconColor: "text-muted-foreground",
          priority: 5,
        };
    return {
      type: "custom",
      id: c.id,
      student_id: c.student_id,
      task: null,
      student: c.student,
      taskTitle: c.title,
      stageName: null,
      deadline,
      status: c.status,
      mentor_note: c.mentor_note ?? null,
      student_note: c.student_note ?? null,
      deadlineStatus,
    };
  });

  type UnifiedRow = ChecklistRow | CustomRow;
  const combinedRows: UnifiedRow[] = [...processedChecklist, ...processedCustom].sort(
    (a: UnifiedRow, b: UnifiedRow) => {
      if (a.deadlineStatus.priority !== b.deadlineStatus.priority) {
        return a.deadlineStatus.priority - b.deadlineStatus.priority;
      }
      const aTime = a.deadline ? new Date(a.deadline).getTime() : 0;
      const bTime = b.deadline ? new Date(b.deadline).getTime() : 0;
      return aTime - bTime;
    }
  );

  // Stats
  const overdueCount = combinedRows.filter((r) => r.deadlineStatus.priority === 1).length;
  const urgentCount = combinedRows.filter((r) => r.deadlineStatus.priority === 2).length;
  const totalStudents = new Set(combinedRows.map((r) => r.student_id)).size;

  return (
    <div className="min-h-[calc(100vh-theme(spacing.14))] bg-background">
      <div className="container max-w-screen-2xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <header className="mb-8 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <CalendarClock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground sm:text-3xl">
                Quản lý Deadline
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Theo dõi tiến độ và deadline của các học viên
              </p>
            </div>
          </div>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-destructive">
              {overdueCount}
            </p>
            <p className="text-sm text-muted-foreground">Quá hạn / Hôm nay</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {urgentCount}
            </p>
            <p className="text-sm text-muted-foreground">
              Sắp hết hạn (≤3 ngày)
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {combinedRows.length}
            </p>
            <p className="text-sm text-muted-foreground">Tổng nhiệm vụ</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalStudents}
            </p>
            <p className="text-sm text-muted-foreground">Học viên liên quan</p>
          </div>
        </div>

        {combinedRows.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Không có deadline nào cần theo dõi
            </h3>
            <p className="text-muted-foreground">
              Tất cả học viên đã hoàn thành nhiệm vụ hoặc chưa có deadline được đặt
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">Học viên</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">Nhiệm vụ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">Hạn chót</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">Ghi chú (feedback)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground sm:px-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedRows.map((item) => {
                    const StatusIcon = item.deadlineStatus.icon;
                    const statusInfo = getStatusLabel(item.status);
                    const taskTitle = item.type === "custom" ? item.taskTitle : item.task?.title ?? "";
                    const stageName = item.type === "custom" ? item.stageName : item.task?.stage?.name ?? null;
                    const viewItem = {
                      id: item.id,
                      student_id: item.student_id,
                      studentName: item.student?.users?.full_name || "Không rõ",
                      studentEmail: item.student?.users?.email ?? null,
                      taskTitle,
                      stageName,
                      deadlineLabel: item.deadlineStatus.label,
                      deadlineSublabel: item.deadlineStatus.sublabel,
                      statusLabel: statusInfo.label,
                      statusClass: statusInfo.class,
                      mentor_note: item.mentor_note ?? null,
                      student_note: item.student_note ?? null,
                    };
                    return (
                      <tr
                        key={`${item.type}-${item.id}`}
                        className={`border-b border-border transition-colors hover:bg-muted/20 last:border-0 ${item.deadlineStatus.rowClass}`}
                      >
                        <td className="px-4 py-3 sm:px-6">
                          <Link
                            href={`/mentor/student/${item.student_id}`}
                            className="font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {item.student?.users?.full_name || "Không rõ"}
                          </Link>
                          <div className="mt-0.5 text-sm text-muted-foreground">
                            {item.student?.users?.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <div>
                            <div className="font-medium text-foreground">{taskTitle}</div>
                            {item.type === "checklist" && (
                              <span className="text-xs text-muted-foreground">Checklist</span>
                            )}
                            {item.type === "custom" && (
                              <span className="text-xs text-muted-foreground">Tùy chỉnh</span>
                            )}
                            {stageName && (
                              <div className="mt-1 text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                                {stageName}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <div className={`flex items-center gap-2 ${item.deadlineStatus.colorClass}`}>
                            <StatusIcon className={`h-4 w-4 shrink-0 ${item.deadlineStatus.iconColor}`} />
                            <div>
                              <div className="text-sm">{item.deadlineStatus.label}</div>
                              <div className="text-xs opacity-80">{item.deadlineStatus.sublabel}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <span className={`inline-flex rounded-full border-0 px-2.5 py-1 text-xs font-medium ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="max-w-[240px] px-4 py-3 sm:px-6">
                          <MentorDeadlineNoteCell
                            type={item.type}
                            id={item.id}
                            studentId={item.student_id}
                            mentorNote={item.mentor_note ?? null}
                            studentNote={item.student_note ?? null}
                            title={taskTitle}
                          />
                        </td>
                        <td className="px-4 py-3 text-right sm:px-6">
                          <MentorDeadlineViewCell item={viewItem} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-destructive/60" />
            <span>Quá hạn / Hôm nay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-amber-400/60" />
            <span>Sắp hết hạn (≤3 ngày)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-muted-foreground/40" />
            <span>Còn thời gian (&gt;3 ngày)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
