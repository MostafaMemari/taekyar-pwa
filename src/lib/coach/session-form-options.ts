import { WEEK_DAY_META, WEEK_DAY_ORDER, type WeekDay } from "@/lib/coach/coach-data";

export const SESSION_DAY_OPTIONS: { value: WeekDay; label: string }[] = WEEK_DAY_ORDER.map((value) => ({
  value,
  label: WEEK_DAY_META[value].label,
}));
