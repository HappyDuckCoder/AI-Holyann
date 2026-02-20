import type { Task } from "@/components/types";

/** Lấy tên file hiển thị từ submission_url (path) hoặc tên đã lưu */
export function getCVDisplayName(uploadedFile: string | undefined): string {
  if (!uploadedFile) return "";
  if (uploadedFile.startsWith("/uploads/")) {
    const parts = uploadedFile.split("/");
    return parts[parts.length - 1] || "CV";
  }
  return uploadedFile;
}

export type TaskGroupKey = "overdue" | "today" | "upcoming" | "completed";

export function getTaskGroup(task: Task): TaskGroupKey {
  if (task.isCompleted) return "completed";
  const raw = task.deadlineRaw;
  if (!raw) return "upcoming";
  const d = typeof raw === "string" ? new Date(raw) : raw;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  const diff = Math.ceil((day.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  return "upcoming";
}

/** Derive priority from deadline for display */
export function getTaskPriority(task: Task): "low" | "medium" | "high" {
  if (task.isCompleted) return "low";
  const raw = task.deadlineRaw;
  if (!raw) return "medium";
  const d = typeof raw === "string" ? new Date(raw) : raw;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  const diff = Math.ceil((day.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "high";
  if (diff <= 3) return "high";
  if (diff <= 7) return "medium";
  return "low";
}

export function groupTasksByDate(tasks: Task[]): Record<TaskGroupKey, Task[]> {
  const groups: Record<TaskGroupKey, Task[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    completed: [],
  };
  tasks.forEach((t) => {
    const key = getTaskGroup(t);
    groups[key].push(t);
  });
  return groups;
}

export const GROUP_LABELS: Record<TaskGroupKey, string> = {
  overdue: "Quá hạn",
  today: "Hôm nay",
  upcoming: "Sắp tới",
  completed: "Đã hoàn thành",
};

function taskDueTime(task: Task): number {
  const raw = task.deadlineRaw;
  if (!raw) return Number.MAX_SAFE_INTEGER;
  const d = typeof raw === "string" ? new Date(raw) : raw;
  return new Date(d).getTime();
}

export function sortTasks(
  tasks: Task[],
  sortBy: "due" | "priority" | "title"
): Task[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...tasks];
  if (sortBy === "due") {
    sorted.sort((a, b) => taskDueTime(a) - taskDueTime(b));
  } else if (sortBy === "priority") {
    sorted.sort(
      (a, b) =>
        priorityOrder[getTaskPriority(a)] - priorityOrder[getTaskPriority(b)]
    );
  } else {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  }
  return sorted;
}
