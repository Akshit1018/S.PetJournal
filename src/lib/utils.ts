import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function ageLabel(iso: string, now = new Date()) {
  const d = parseISO(iso);
  const years = differenceInYears(now, d);
  const months = differenceInMonths(now, d) % 12;
  if (years >= 2) return `${years} yrs`;
  if (years === 1) return months ? `1 yr ${months} mo` : "1 yr";
  if (months > 0) return `${months} mo`;
  const days = differenceInDays(now, d);
  return `${Math.max(days, 0)} days`;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function formatWhen(iso: string) {
  const d = parseISO(iso);
  if (isToday(d)) return `Today · ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday · ${format(d, "h:mm a")}`;
  return format(d, "MMM d · h:mm a");
}

export function formatDay(iso: string) {
  return format(parseISO(iso), "MMM d");
}

export function formatDue(iso: string) {
  const d = parseISO(iso);
  const days = differenceInDays(d, new Date());
  if (days < 0) return `${formatDistanceToNowStrict(d)} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Tomorrow";
  if (days < 14) return `In ${days} days`;
  return format(d, "MMM d");
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
