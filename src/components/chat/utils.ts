import { Target, PenTool, Lightbulb, User } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { vi } from "date-fns/locale";

export const getRoleIcon = (roleCode: string) => {
  switch (roleCode) {
    case "AS":
      return Target;
    case "ACS":
      return PenTool;
    case "ARD":
      return Lightbulb;
    default:
      return User;
  }
};

export const getRoleColor = (roleCode: string) => {
  switch (roleCode) {
    case "AS":
      return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" };
    case "ACS":
      return { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" };
    case "ARD":
      return { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" };
    default:
      return { bg: "bg-gray-100 dark:bg-slate-700", text: "text-gray-700 dark:text-gray-300" };
  }
};

export const formatTime = (date: Date | string) => {
  const d = new Date(date);
  if (isToday(d)) {
    return format(d, "HH:mm");
  }
  if (isYesterday(d)) {
    return "Hôm qua";
  }
  return format(d, "dd/MM");
};

export const formatMessageTime = (date: Date | string) => {
  return format(new Date(date), "HH:mm");
};
