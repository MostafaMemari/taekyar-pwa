import { ListOrdered, type LucideIcon, Medal, ShieldAlert, ShieldCheck, ShieldX, Type } from "lucide-react";
import { INSURANCE_META, type InsuranceStatus, STUDENTS } from "@/lib/coach/coach-data";
import type { ColorBeltKey } from "@/lib/student-belts";

export type SortKey = "default" | "name" | "belt" | "ins";

export const BELT_ORDER: ColorBeltKey[] = ["white", "yellow", "green", "blue", "red"];

export const INSURANCE_ICONS: Record<InsuranceStatus, LucideIcon> = {
  ok: ShieldCheck,
  soon: ShieldAlert,
  none: ShieldX,
};

export const INSURANCE_TILE_TONES: Record<InsuranceStatus, string> = {
  ok: "bg-success-soft text-success",
  soon: "bg-warning-soft text-warning",
  none: "bg-danger-soft text-danger",
};

export const INSURANCE_FILTERS = (["ok", "soon", "none"] as const).map((value) => ({
  value,
  label: INSURANCE_META[value].label,
  count: STUDENTS.filter((student) => student.insurance === value).length,
}));

export const SORT_OPTIONS: { value: SortKey; label: string; description: string; icon: LucideIcon; tile: string }[] = [
  {
    value: "default",
    label: "ترتیب ثبت نام",
    description: "همان ترتیب پیش فرض لیست",
    icon: ListOrdered,
    tile: "bg-muted text-ink-muted",
  },
  {
    value: "name",
    label: "نام و نام خانوادگی",
    description: "بر اساس حروف الفبا",
    icon: Type,
    tile: "bg-brand-50 text-accent-ink",
  },
  {
    value: "belt",
    label: "رتبه کمربند",
    description: "از بالاترین به پایین ترین",
    icon: Medal,
    tile: "bg-warning-soft text-warning",
  },
  {
    value: "ins",
    label: "تاریخ بیمه",
    description: "نزدیک ترین انقضا در بالا",
    icon: ShieldAlert,
    tile: "bg-danger-soft text-danger",
  },
];

export function normalizeMulti<T extends string>(next: readonly string[], current: readonly T[]): T[] {
  const specific = next.filter((value) => value !== "all") as T[];
  return next.includes("all") && current.length > 0 ? [] : specific;
}
