import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, ClipboardList } from "lucide-react";
import StudentDeadlinesTable from "@/components/student/deadlines/StudentDeadlinesTable";

type RowType = "checklist" | "custom";

function getDeadlineStatus(deadline: Date, status: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const formattedDate = deadlineDate.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (status === "COMPLETED" || status === "SUBMITTED") {
    return {
      label: formattedDate,
      sublabel: status === "COMPLETED" ? "Đã hoàn thành" : "Chờ review",
      badgeClass: "bg-muted text-muted-foreground dark:bg-muted/80",
      priority: 4,
    };
  }
  if (diffDays < 0) {
    return {
      label: formattedDate,
      sublabel: `Quá hạn ${Math.abs(diffDays)} ngày`,
      badgeClass: "bg-destructive/20 text-destructive dark:bg-destructive/30",
      priority: 1,
    };
  }
  if (diffDays === 0) {
    return {
      label: formattedDate,
      sublabel: "Hôm nay",
      badgeClass: "bg-accent/20 text-accent-foreground dark:bg-accent/30",
      priority: 1,
    };
  }
  if (diffDays <= 3) {
    return {
      label: formattedDate,
      sublabel: `Còn ${diffDays} ngày`,
      badgeClass:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      priority: 2,
    };
  }
  return {
    label: formattedDate,
    sublabel: `Còn ${diffDays} ngày`,
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    priority: 3,
  };
}

export default async function StudentDeadlinesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const studentId = session.user.id;

  const [tasksWithDeadlines, customDeadlines] = await Promise.all([
    prisma.student_task_progress.findMany({
      where: { student_id: studentId, deadline: { not: null } },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            stage: { select: { name: true } },
          },
        },
      },
      orderBy: { deadline: "asc" },
    }),
    prisma.mentor_custom_deadlines.findMany({
      where: { student_id: studentId },
      orderBy: { deadline: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        mentor_note: true,
        deadline: true,
        status: true,
        student_note: true,
      },
    }),
  ]);

  type UnifiedRow = {
    id: string;
    type: RowType;
    title: string;
    description: string | null;
    stageName?: string | null;
    deadline: string | null;
    status: string;
    mentor_note: string | null;
    student_note: string | null;
    deadlineStatus: ReturnType<typeof getDeadlineStatus>;
  };

  const checklistRows: UnifiedRow[] = tasksWithDeadlines
    .filter((t) => t.task && t.deadline)
    .map((t) => {
      const deadlineStatus = getDeadlineStatus(t.deadline!, t.status);
      return {
        id: t.id,
        type: "checklist" as RowType,
        title: t.task!.title,
        description: t.task!.description,
        stageName: t.task!.stage?.name ?? null,
        deadline: t.deadline!.toISOString(),
        status: t.status,
        mentor_note: t.mentor_note ?? null,
        student_note: t.student_note ?? null,
        deadlineStatus,
      };
    });

  const customRows: UnifiedRow[] = customDeadlines.map((c) => {
    const deadline = c.deadline;
    const deadlineStatus = deadline
      ? getDeadlineStatus(deadline, c.status)
      : {
          label: "—",
          sublabel: "Chưa đặt",
          badgeClass: "bg-muted text-muted-foreground",
          priority: 5,
        };
    return {
      id: c.id,
      type: "custom" as RowType,
      title: c.title,
      description: c.description,
      stageName: null,
      deadline: deadline?.toISOString() ?? null,
      status: c.status,
      mentor_note: c.mentor_note ?? null,
      student_note: c.student_note ?? null,
      deadlineStatus,
    };
  });

  const allRows = [...checklistRows, ...customRows].sort((a, b) => {
    if (a.deadlineStatus.priority !== b.deadlineStatus.priority)
      return a.deadlineStatus.priority - b.deadlineStatus.priority;
    const aTime = a.deadline ? new Date(a.deadline).getTime() : 0;
    const bTime = b.deadline ? new Date(b.deadline).getTime() : 0;
    return aTime - bTime;
  });

  const serializableRows = allRows.map((r) => ({
    ...r,
    deadlineStatus: { ...r.deadlineStatus },
  }));

  const overdueCount = allRows.filter(
    (r) => r.deadlineStatus.priority === 1,
  ).length;
  const urgentCount = allRows.filter(
    (r) => r.deadlineStatus.priority === 2,
  ).length;
  const upcomingCount = allRows.filter(
    (r) => r.deadlineStatus.priority === 3,
  ).length;
  const totalCount = allRows.length;
  const customCount = customRows.length;

  return (
    <div className="min-h-[calc(100vh-theme(spacing.14))] bg-background">
      <div className="container max-w-screen-2xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="space-y-6">
          {/* Header - giống admin users */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Deadline
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Theo dõi hạn chót từ checklist và deadline tùy chỉnh từ mentor
              </p>
            </div>
          </div>

          {/* Stats cards - giống admin users */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Tổng</p>
              <p className="text-2xl font-bold text-foreground">{totalCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Quá hạn / Hôm nay</p>
              <p className="text-2xl font-bold text-destructive">
                {overdueCount}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Sắp hết hạn (≤3 ngày)
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {urgentCount}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Sắp tới</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {upcomingCount}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Deadline tùy chỉnh
              </p>
              <p className="text-2xl font-bold text-primary">{customCount}</p>
            </div>
          </div>

          {/* Table - cùng style admin users */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <StudentDeadlinesTable rows={serializableRows} />
          </div>
        </div>
      </div>
    </div>
  );
}
