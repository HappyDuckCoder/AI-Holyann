/** Dashboard stat card definition */
export interface QuickStatItem {
  id: string;
  label: string;
  value: string | number;
  trend?: { value: number; label: string };
  icon: string;
  accent: "blue" | "emerald" | "amber" | "violet" | "rose" | "sky";
}

/** Upcoming deadline / task */
export interface DashboardDeadline {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed?: boolean;
}

/** Activity feed item */
export interface ActivityItem {
  id: string;
  type: "task" | "grade" | "deadline" | "milestone";
  title: string;
  time: string;
  meta?: string;
}

/** AI insight line */
export interface AIInsight {
  id: string;
  text: string;
  tone: "positive" | "warning" | "neutral";
}

/** Payload from GET /api/student/dashboard */
export interface DashboardData {
  quickStats: QuickStatItem[];
  deadlines: DashboardDeadline[];
  taskCompletion: { name: string; value: number }[];
  gradesBySubject: { subject: string; grade: number }[];
  weeklyStudy: { day: string; hours: number }[];
  activity: ActivityItem[];
  aiInsights: AIInsight[];
}
