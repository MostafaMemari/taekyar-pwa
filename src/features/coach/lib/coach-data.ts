import { Check, Clock, X } from "lucide-react";
import { toPersianDigits } from "@/lib/digits";
import type { StudentBeltKey } from "@/lib/student-belts";

export type Gender = "MALE" | "FEMALE";
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export type WeekDay = "SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

export const WEEK_DAY_ORDER: WeekDay[] = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

export const WEEK_DAY_META: Record<WeekDay, { label: string }> = {
  SATURDAY: { label: "شنبه" },
  SUNDAY: { label: "یکشنبه" },
  MONDAY: { label: "دوشنبه" },
  TUESDAY: { label: "سه شنبه" },
  WEDNESDAY: { label: "چهارشنبه" },
  THURSDAY: { label: "پنجشنبه" },
  FRIDAY: { label: "جمعه" },
};

const JS_DAY_TO_WEEK_DAY: WeekDay[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function todayWeekDay(): WeekDay {
  return JS_DAY_TO_WEEK_DAY[new Date().getDay()];
}

export function weekDayLabels(days: WeekDay[]): string[] {
  return days.map((day) => WEEK_DAY_META[day].label);
}

export function sessionIsToday(days: WeekDay[]) {
  return days.includes(todayWeekDay());
}

// Sessions of a deactivated club never run; undefined keeps everything visible while clubs are still loading.
export function activeClubIds(clubs: { id: string; isActive: boolean }[] | undefined) {
  return new Set((clubs ?? []).filter((club) => club.isActive).map((club) => club.id));
}

const DAY_MS = 86_400_000;

export function weekDayOfDate(isoDate: string): WeekDay {
  return JS_DAY_TO_WEEK_DAY[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];
}

// The attendance page steps between the class's real session days only, so ±1..7 days covers every rotation.
export function previousSessionDate(isoDate: string, weekDays: WeekDay[]): string {
  for (let step = 1; step <= 7; step += 1) {
    const candidate = new Date(new Date(`${isoDate}T00:00:00Z`).getTime() - step * DAY_MS);
    if (weekDays.includes(weekDayOfDate(candidate.toISOString().slice(0, 10)))) return candidate.toISOString().slice(0, 10);
  }
  return isoDate;
}

export function nextSessionDate(isoDate: string, weekDays: WeekDay[]): string {
  for (let step = 1; step <= 7; step += 1) {
    const candidate = new Date(new Date(`${isoDate}T00:00:00Z`).getTime() + step * DAY_MS);
    if (weekDays.includes(weekDayOfDate(candidate.toISOString().slice(0, 10)))) return candidate.toISOString().slice(0, 10);
  }
  return isoDate;
}

// A picked date that is not a class day lands on the most recent session before it.
export function snapToSessionDate(isoDate: string, weekDays: WeekDay[]): string {
  return weekDays.includes(weekDayOfDate(isoDate)) ? isoDate : previousSessionDate(isoDate, weekDays);
}

export const GENDER_META: Record<Gender, { label: string; clubLabel: string }> = {
  MALE: { label: "آقا", clubLabel: "آقایان" },
  FEMALE: { label: "خانم", clubLabel: "بانوان" },
};

export const ATTENDANCE_META: Record<AttendanceStatus, { label: string; tone: "success" | "warning" | "danger" | "info"; color: string }> =
  {
    PRESENT: { label: "حاضر", tone: "success", color: "#10b981" },
    LATE: { label: "تأخیر", tone: "warning", color: "#f59e0b" },
    ABSENT: { label: "غایب", tone: "danger", color: "#ef4444" },
    EXCUSED: { label: "موجه", tone: "info", color: "#0ea5e9" },
  };

export type InvitationStatus = "PENDING" | "CONFIRMED" | "REJECTED";

export const INVITATION_STATUS_META = {
  PENDING: { label: "در انتظار", tone: "warning", icon: Clock },
  CONFIRMED: { label: "پذیرفته", tone: "success", icon: Check },
  REJECTED: { label: "رد شده", tone: "danger", icon: X },
} as const;

export function coachBeltLabel(belt: StudentBeltKey) {
  return `دان ${toPersianDigits(belt.replace("dan-", ""))}`;
}
