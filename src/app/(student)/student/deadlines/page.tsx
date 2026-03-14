import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentDeadlinesTable from "@/components/student/deadlines/StudentDeadlinesTable";
import { StudentPageContainer } from "@/components/student";

const ACCENT = "#0052FF";
const ACCENT_SEC = "#4D7CFF";

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
        checklist_tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            checklist_stages: { select: { name: true } },
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
    .filter((t) => t.checklist_tasks && t.deadline)
    .map((t) => {
      const deadlineStatus = getDeadlineStatus(t.deadline!, t.status);
      return {
        id: t.id,
        type: "checklist" as RowType,
        title: t.checklist_tasks!.title,
        description: t.checklist_tasks!.description,
        stageName: t.checklist_tasks!.checklist_stages?.name ?? null,
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
    <StudentPageContainer className="min-h-[60vh]">
      <div className="mx-auto max-w-6xl min-w-0 space-y-8">
        {/* Hero: section label + gradient headline */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-8 shadow-md sm:px-10 sm:py-10">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-[0.06]"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SEC})`,
            }}
          />
          <div className="relative">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2"
              style={{
                borderColor: "rgba(0, 82, 255, 0.3)",
                backgroundColor: "rgba(0, 82, 255, 0.05)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: ACCENT }}
              />
              <span
                className="font-mono text-xs uppercase tracking-[0.15em]"
                style={{ color: ACCENT }}
              >
                Hạn chót
              </span>
            </div>
            <h1 className="mt-4 font-university-display text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl">
              <span className="relative inline-block">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${ACCENT}, ${ACCENT_SEC})`,
                  }}
                >
                  Deadline
                </span>
                <span
                  className="pointer-events-none absolute -bottom-1 left-0 h-2 w-full rounded-full opacity-20"
                  style={{
                    background: `linear-gradient(to right, ${ACCENT}, ${ACCENT_SEC})`,
                  }}
                />
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Theo dõi hạn chót từ checklist và deadline tùy chỉnh từ mentor
            </p>
          </div>
        </section>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-md transition-shadow hover:shadow-lg">
            <p className="text-sm text-muted-foreground">Tổng</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {totalCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-md transition-shadow hover:shadow-lg">
            <p className="text-sm text-muted-foreground">Quá hạn / Hôm nay</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-destructive">
              {overdueCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-md transition-shadow hover:shadow-lg">
            <p className="text-sm text-muted-foreground">Sắp hết hạn (≤3 ngày)</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {urgentCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-md transition-shadow hover:shadow-lg">
            <p className="text-sm text-muted-foreground">Sắp tới</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {upcomingCount}
            </p>
          </div>
          <div
            className="rounded-2xl border p-5 shadow-md transition-shadow hover:shadow-lg"
            style={{
              borderColor: "rgba(0, 82, 255, 0.25)",
              background: "linear-gradient(to bottom, rgba(0, 82, 255, 0.04), transparent)",
            }}
          >
            <p className="text-sm text-muted-foreground">Deadline tùy chỉnh</p>
            <p
              className="mt-1 text-2xl font-bold tracking-tight"
              style={{ color: ACCENT }}
            >
              {customCount}
            </p>
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-md transition-shadow hover:shadow-lg">
          <StudentDeadlinesTable rows={serializableRows} />
        </div>
      </div>
    </StudentPageContainer>
  );
}
