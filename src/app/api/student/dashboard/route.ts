import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";

function getGpaFromProfile(academicProfile: any): { value: string; scale: number } | null {
  if (!academicProfile?.gpa_transcript_details) return null;
  const gpaDetails = academicProfile.gpa_transcript_details as Record<string, unknown>;
  const raw =
    (gpaDetails.grade12 ?? gpaDetails.grade11 ?? gpaDetails.grade10 ?? gpaDetails.grade9 ?? gpaDetails.gpa) as
      | string
      | number
      | undefined;
  if (raw == null) return null;
  const num = typeof raw === "string" ? parseFloat(raw) : raw;
  if (Number.isNaN(num)) return null;
  const scale = (gpaDetails.scale as number) ?? 10;
  return { value: num.toFixed(1), scale };
}

function dueDateToPriority(dueDate: Date): "low" | "medium" | "high" {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dueDate);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "high";
  if (diffDays <= 3) return "high";
  if (diffDays <= 7) return "medium";
  return "low";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const studentId = session.user.id;

    const student = await prisma.students.findUnique({
      where: { user_id: studentId },
      include: {
        background: {
          include: {
            subject_scores: true,
          },
        },
        academic_profile: true,
      },
    });

    const [taskProgressList, customDeadlines, checklistTasks] = await Promise.all([
      prisma.student_task_progress.findMany({
        where: { student_id: studentId },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              stage: { select: { name: true } },
            },
          },
        },
      }),
      prisma.mentor_custom_deadlines.findMany({
        where: { student_id: studentId },
        orderBy: { deadline: "asc" },
        select: {
          id: true,
          title: true,
          deadline: true,
          status: true,
        },
      }),
      prisma.checklist_tasks.findMany({
        include: {
          stage: { select: { name: true } },
        },
        orderBy: [{ stage: { order_index: "asc" } }, { order_index: "asc" }],
      }),
    ]);

    const completedCount = taskProgressList.filter(
      (p) => p.status === TaskStatus.COMPLETED || p.status === TaskStatus.SUBMITTED
    ).length;
    const inProgressCount = taskProgressList.filter((p) => p.status === TaskStatus.IN_PROGRESS).length;
    const pendingCount = taskProgressList.filter(
      (p) => p.status === TaskStatus.PENDING || p.status === TaskStatus.NEEDS_REVISION
    ).length;
    const totalTasks = checklistTasks.length;

    const deadlinesWithDue: { id: string; title: string; subject: string; dueDate: Date; priority: "low" | "medium" | "high"; completed: boolean }[] = [];

    taskProgressList
      .filter((p) => p.deadline && p.task)
      .forEach((p) => {
        const completed = p.status === TaskStatus.COMPLETED || p.status === TaskStatus.SUBMITTED;
        deadlinesWithDue.push({
          id: p.id,
          title: p.task!.title,
          subject: p.task!.stage?.name ?? "—",
          dueDate: p.deadline!,
          priority: dueDateToPriority(p.deadline!),
          completed,
        });
      });
    customDeadlines.forEach((c) => {
      if (!c.deadline) return;
      const completed = c.status === TaskStatus.COMPLETED || c.status === TaskStatus.SUBMITTED;
      deadlinesWithDue.push({
        id: c.id,
        title: c.title,
        subject: "Mentor",
        dueDate: c.deadline,
        priority: dueDateToPriority(c.deadline),
        completed,
      });
    });
    deadlinesWithDue.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const upcomingDeadlines = deadlinesWithDue.filter((d) => !d.completed).slice(0, 10);

    const gpaInfo = student?.academic_profile
      ? getGpaFromProfile(student.academic_profile)
      : null;

    const subjectScores = student?.background?.subject_scores ?? [];
    const gradesBySubject = subjectScores.map((s) => ({
      subject: s.subject,
      grade: s.score,
    }));

    const quickStats = [
      {
        id: "gpa",
        label: "GPA",
        value: gpaInfo ? `${gpaInfo.value}/${gpaInfo.scale}` : "—",
        trend: undefined as { value: number; label: string } | undefined,
        icon: "GraduationCap",
        accent: "blue" as const,
      },
      {
        id: "courses",
        label: "Completed Courses",
        value: completedCount,
        trend: { value: 0, label: "Checklist" },
        icon: "BookOpen",
        accent: "emerald" as const,
      },
      {
        id: "tasks",
        label: "Pending Tasks",
        value: pendingCount + inProgressCount,
        trend: undefined,
        icon: "CheckSquare",
        accent: "amber" as const,
      },
      {
        id: "deadlines",
        label: "Upcoming Deadlines",
        value: upcomingDeadlines.length,
        trend: undefined,
        icon: "Calendar",
        accent: "violet" as const,
      },
      {
        id: "attendance",
        label: "Attendance Rate",
        value: "—",
        trend: undefined,
        icon: "UserCheck",
        accent: "rose" as const,
      },
    ];

    const taskCompletionPie = [
      { name: "Done", value: totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0 },
      { name: "In progress", value: totalTasks ? Math.round((inProgressCount / totalTasks) * 100) : 0 },
      { name: "Pending", value: totalTasks ? Math.round((pendingCount / totalTasks) * 100) : 0 },
    ].filter((d) => d.value > 0);
    if (taskCompletionPie.length === 0) {
      taskCompletionPie.push({ name: "Chưa có", value: 100 });
    }

    const recentCompleted = taskProgressList
      .filter((p) => p.completed_at)
      .sort((a, b) => (b.completed_at!.getTime() - a.completed_at!.getTime()))
      .slice(0, 5);
    const activity = recentCompleted.map((p, i) => ({
      id: p.id,
      type: "task" as const,
      title: p.task ? `Hoàn thành: ${p.task.title}` : "Hoàn thành nhiệm vụ",
      time: formatTimeAgo(p.completed_at!),
      meta: p.task?.stage?.name ?? undefined,
    }));

    return NextResponse.json({
      quickStats,
      deadlines: upcomingDeadlines.map((d) => ({
        id: d.id,
        title: d.title,
        subject: d.subject,
        dueDate: d.dueDate.toISOString(),
        priority: d.priority,
        completed: d.completed,
      })),
      taskCompletion: taskCompletionPie,
      gradesBySubject,
      weeklyStudy: [] as { day: string; hours: number }[],
      activity,
      aiInsights: [] as { id: string; text: string; tone: "positive" | "warning" | "neutral" }[],
    });
  } catch (e) {
    console.error("[Dashboard API]", e);
    return NextResponse.json(
      { error: "Lỗi tải dữ liệu dashboard" },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return diffMins <= 1 ? "Vừa xong" : `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}
