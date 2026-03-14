import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardList,
  FileBarChart,
  Sparkles,
  Building2,
  MessageCircle,
  CalendarClock,
  Video,
  Target,
  FileUp,
} from "lucide-react";

const STUDENT_BASE = "/student";

export type NavFeature = {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
  tier: "free" | "premium";
};

export const mainFeatures: NavFeature[] = [
  {
    name: "Phân tích hồ sơ",
    href: `${STUDENT_BASE}/profile-analysis`,
    icon: BarChart3,
    description: "Phân tích điểm mạnh – điểm yếu hồ sơ ứng tuyển",
    tier: "free",
  },
  {
    name: "Danh sách trường",
    href: `${STUDENT_BASE}/universities`,
    icon: Building2,
    description: "Khám phá các trường đại học trong và ngoài nước",
    tier: "free",
  },
  {
    name: "Báo cáo",
    href: `${STUDENT_BASE}/reports`,
    icon: FileBarChart,
    description: "Báo cáo tiến độ và kết quả học tập",
    tier: "free",
  },
  {
    name: "Quản lý tài liệu",
    href: `${STUDENT_BASE}/manage-upload`,
    icon: FileUp,
    description: "Quản lý tài liệu của bạn",
    tier: "free",
  },
];

export const premiumFeatures: NavFeature[] = [
  {
    name: "Chat với cố vấn",
    href: `${STUDENT_BASE}/chat`,
    icon: MessageCircle,
    description: "Trao đổi trực tiếp với mentor và hỗ trợ AI",
    tier: "premium",
  },
  {
    name: "Checklist",
    href: `${STUDENT_BASE}/checklist`,
    icon: ClipboardList,
    description: "Danh sách công việc cần hoàn thành",
    tier: "premium",
  },
  {
    name: "Deadline",
    href: `${STUDENT_BASE}/deadlines`,
    icon: CalendarClock,
    description: "Theo dõi hạn nộp hồ sơ và các mốc quan trọng",
    tier: "premium",
  },
  {
    name: "Đặt lịch mentor",
    href: `${STUDENT_BASE}/meeting`,
    icon: Video,
    description: "Đặt lịch gặp và tư vấn 1-1 với mentor",
    tier: "premium",
  },
];
