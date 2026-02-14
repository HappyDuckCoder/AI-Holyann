import { Target, PenTool, Lightbulb, User, GraduationCap } from "lucide-react";
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
    case "STUDENT":
      return GraduationCap;
    case "GROUP":
      return User;
    default:
      return User;
  }
};

export const getRoleColor = (roleCode: string) => {
  switch (roleCode) {
    case "AS":
      return { bg: "bg-primary/15", text: "text-primary" };
    case "ACS":
      return { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" };
    case "ARD":
      return { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" };
    case "STUDENT":
      return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" };
    case "GROUP":
      return { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300" };
    default:
      return { bg: "bg-muted", text: "text-muted-foreground" };
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
