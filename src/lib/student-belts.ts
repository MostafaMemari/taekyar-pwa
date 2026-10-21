import type { BeltOption, BeltOptionGroup } from "@/components/shared/belt-picker";
import { toPersianDigits } from "@/lib/digits";

const COLOR_BELTS: BeltOption[] = [
  { value: "white", label: "سفید", color: "#F3F4F6", outline: "#D1D5DB", knotColor: "#E5E7EB" },
  { value: "yellow", label: "زرد", color: "#FBBF24", knotColor: "#F59E0B" },
  { value: "green", label: "سبز", color: "#22C55E", knotColor: "#16A34A" },
  { value: "blue", label: "آبی", color: "#3B82F6", knotColor: "#2563EB" },
  { value: "red", label: "قرمز", color: "#EF4444", knotColor: "#DC2626" },
];

const BLACK_RANKS = [1, 2, 3, 4] as const;

const POOM_BELTS: BeltOption[] = BLACK_RANKS.map((rank) => ({
  value: `poom-${rank}`,
  label: `پوم ${toPersianDigits(String(rank))}`,
  color: "#1F2937",
  bottomColor: "#DC2626",
  knotColor: "#111827",
  stripes: rank,
}));

const DAN_BELTS: BeltOption[] = BLACK_RANKS.map((rank) => ({
  value: `dan-${rank}`,
  label: `دان ${toPersianDigits(String(rank))}`,
  color: "#1F2937",
  knotColor: "#111827",
  stripes: rank,
}));

export const STUDENT_BELT_GROUPS: BeltOptionGroup[] = [
  { value: "color", label: "رنگی", columns: 3, options: COLOR_BELTS },
  { value: "poom", label: "پوم", columns: 2, options: POOM_BELTS },
  { value: "dan", label: "دان", columns: 2, options: DAN_BELTS },
];

export const STUDENT_BELT_OPTIONS: readonly BeltOption[] = STUDENT_BELT_GROUPS.flatMap((group) => group.options);
