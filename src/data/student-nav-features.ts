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
    name: "Trắc nghiệm ngành",
    href: `${STUDENT_BASE}/tests`,
    icon: ClipboardList,
    description: "Khám phá ngành học phù hợp với bản thân",
    tier: "free",
  },
  {
    name: "Cải thiện hồ sơ",
    href: `${STUDENT_BASE}/improve`,
    icon: Sparkles,
    description: "Enhance & phân tích hồ sơ, CV và bài luận",
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
    name: "Reach / Match / Safety",
    href: `${STUDENT_BASE}/target`,
    icon: Target,
    description: "Xem danh sách ngành theo mức độ phù hợp",
    tier: "free",
  },
  {
    name: "Báo cáo",
    href: `${STUDENT_BASE}/reports`,
    icon: FileBarChart,
    description: "Báo cáo tiến độ và kết quả học tập",
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
