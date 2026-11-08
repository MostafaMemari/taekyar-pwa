import { ListOrdered, type LucideIcon, Medal, ShieldAlert, ShieldCheck, ShieldOff, ShieldX, Type } from "lucide-react";
import type { AgeCategoryRecord } from "@/features/coach/lib/student-api";
import { digitsOnly } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import type { StudentBeltKey } from "@/lib/student-belts";

export type StudentInsuranceStatus = "valid" | "expiring" | "expired" | "none";
export type StudentSortKey = "default" | "name" | "belt" | "ins";

export const INSURANCE_STATUSES = ["valid", "expiring", "expired", "none"] as const;

export const INSURANCE_META: Record<
  StudentInsuranceStatus,
  { label: string; shortLabel: string; tone: "success" | "warning" | "danger" | "neutral"; icon: LucideIcon; tile: string }
> = {
  valid: { label: "بیمه معتبر", shortLabel: "معتبر", tone: "success", icon: ShieldCheck, tile: "bg-success-soft text-success" },
  expiring: { label: "نزدیک انقضا", shortLabel: "نزدیک انقضا", tone: "warning", icon: ShieldAlert, tile: "bg-warning-soft text-warning" },
  expired: { label: "بیمه منقضی", shortLabel: "منقضی", tone: "danger", icon: ShieldX, tile: "bg-danger-soft text-danger" },
  none: { label: "بدون بیمه", shortLabel: "بدون بیمه", tone: "neutral", icon: ShieldOff, tile: "bg-muted text-ink-muted" },
};

const DAY_MS = 86_400_000;

export function insuranceStatusOf(expiryDate: string | null, expiringDays: number): StudentInsuranceStatus {
  if (!expiryDate) return "none";

  const expiry = new Date(expiryDate).getTime();
  if (Number.isNaN(expiry)) return "none";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expiry < today.getTime()) return "expired";
  return expiry < today.getTime() + expiringDays * DAY_MS ? "expiring" : "valid";
}

export const BELT_API_NAMES = [
  "WHITE",
  "YELLOW",
  "GREEN",
  "BLUE",
  "RED",
  "POOM_1",
  "POOM_2",
  "POOM_3",
  "POOM_4",
  "DAN_1",
  "DAN_2",
  "DAN_3",
  "DAN_4",
  "DAN_5",
  "DAN_6",
  "DAN_7",
  "DAN_8",
  "DAN_9",
  "DAN_10",
] as const;

export type StudentBeltApiName = (typeof BELT_API_NAMES)[number];

export function beltApiName(key: StudentBeltKey): StudentBeltApiName {
  return key.toUpperCase().replace("-", "_") as StudentBeltApiName;
}

export function beltKeyOf(name: string): StudentBeltKey {
  return name.toLowerCase().replace("_", "-") as StudentBeltKey;
}

export const AGE_CATEGORY_NAMES = ["BLOSSOM", "YOUTH", "CADET", "JUNIOR", "YOUNG", "SENIOR", "ULTRA"] as const;

export type AgeCategoryName = (typeof AGE_CATEGORY_NAMES)[number];

export const AGE_CATEGORY_LABELS: Record<AgeCategoryName, string> = {
  BLOSSOM: "شکوفه",
  YOUTH: "خردسالان",
  CADET: "نونهالان",
  JUNIOR: "نوجوانان",
  YOUNG: "جوانان",
  SENIOR: "بزرگسالان",
  ULTRA: "پیشکسوت",
};

export function ageCategoryOf(birthDate: string | null, categories: AgeCategoryRecord[]): AgeCategoryName | null {
  if (!birthDate) return null;

  const birth = new Date(birthDate).getTime();
  if (Number.isNaN(birth)) return null;

  const match = categories.find(
    (category) => birth >= new Date(category.startDate).getTime() && birth <= new Date(category.endDate).getTime(),
  );

  return (match?.name as AgeCategoryName | undefined) ?? null;
}

// membershipYear is the last year the federation database charge covers; the value is how many years are owed.
export function membershipChargeOf(membershipYear: number | null | undefined): { due: number } | null {
  if (typeof membershipYear !== "number") return null;

  const currentYear = Number(digitsOnly(toJalaliDate(new Date().toISOString()).split("/")[0]));
  return { due: Math.max(0, currentYear - membershipYear) };
}

export const SORT_FIELDS = ["createdAt", "updatedAt", "fullName", "belt", "insurance"] as const;
export type StudentSortField = (typeof SORT_FIELDS)[number];
export type StudentSortDirection = "asc" | "desc";

export const SORT_PRESETS: {
  key: StudentSortKey;
  label: string;
  description: string;
  icon: LucideIcon;
  tile: string;
  sortBy: StudentSortField;
  sortDirection: StudentSortDirection;
}[] = [
  {
    key: "default",
    label: "ترتیب ثبت نام",
    description: "جدیدترین هنرجوها اول",
    icon: ListOrdered,
    tile: "bg-muted text-ink-muted",
    sortBy: "createdAt",
    sortDirection: "desc",
  },
  {
    key: "name",
    label: "نام و نام خانوادگی",
    description: "بر اساس حروف الفبا",
    icon: Type,
    tile: "bg-brand-50 text-accent-ink",
    sortBy: "fullName",
    sortDirection: "asc",
  },
  {
    key: "belt",
    label: "رتبه کمربند",
    description: "از بالاترین به پایین ترین",
    icon: Medal,
    tile: "bg-warning-soft text-warning",
    sortBy: "belt",
    sortDirection: "desc",
  },
  {
    key: "ins",
    label: "تاریخ بیمه",
    description: "نزدیک ترین انقضا در بالا",
    icon: ShieldAlert,
    tile: "bg-danger-soft text-danger",
    sortBy: "insurance",
    sortDirection: "asc",
  },
];

export function sortPresetKey(sortBy: StudentSortField, sortDirection: StudentSortDirection): StudentSortKey | "" {
  return SORT_PRESETS.find((preset) => preset.sortBy === sortBy && preset.sortDirection === sortDirection)?.key ?? "";
}

export function sortPreset(key: StudentSortKey) {
  return SORT_PRESETS.find((preset) => preset.key === key) ?? SORT_PRESETS[0];
}
