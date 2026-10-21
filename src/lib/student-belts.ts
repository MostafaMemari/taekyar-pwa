import type { BeltOption, BeltOptionGroup } from "@/components/shared/belt-picker";
import { toPersianDigits } from "@/lib/digits";

export type ColorBeltKey = "white" | "yellow" | "green" | "blue" | "red";
export type PoomBeltKey = `poom-${1 | 2 | 3 | 4}`;
export type DanBeltKey = `dan-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;
export type StudentBeltKey = ColorBeltKey | PoomBeltKey | DanBeltKey;

export type StudentBeltMeta = {
  label: string;
  color: string;
  bottomColor?: string;
  outline?: string;
  stripeCount: number;
  rank: number;
};

const COLOR_BELTS: readonly (BeltOption & { rank: number })[] = [
  { value: "white", label: "سفید", color: "#F3F4F6", outline: "#D1D5DB", knotColor: "#E5E7EB", rank: 0 },
  { value: "yellow", label: "زرد", color: "#FBBF24", knotColor: "#F59E0B", rank: 1 },
  { value: "green", label: "سبز", color: "#22C55E", knotColor: "#16A34A", rank: 2 },
  { value: "blue", label: "آبی", color: "#3B82F6", knotColor: "#2563EB", rank: 3 },
  { value: "red", label: "قرمز", color: "#EF4444", knotColor: "#DC2626", rank: 4 },
];

const POOM_RANKS = [1, 2, 3, 4] as const;
const DAN_RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const POOM_BELTS: readonly (BeltOption & { rank: number })[] = POOM_RANKS.map((rank) => ({
  value: `poom-${rank}`,
  label: `پوم ${toPersianDigits(String(rank))}`,
  color: "#1F2937",
  bottomColor: "#DC2626",
  knotColor: "#111827",
  stripes: rank,
  rank: 5 + rank,
}));

const DAN_BELTS: readonly (BeltOption & { rank: number })[] = DAN_RANKS.map((rank) => ({
  value: `dan-${rank}`,
  label: `دان ${toPersianDigits(String(rank))}`,
  color: "#1F2937",
  knotColor: "#111827",
  stripes: rank,
  rank: 9 + rank,
}));

export const STUDENT_BELT_GROUPS: BeltOptionGroup[] = [
  { value: "color", label: "رنگی", columns: 3, options: COLOR_BELTS },
  { value: "poom", label: "پوم", columns: 3, options: POOM_BELTS },
  { value: "dan", label: "دان", columns: 3, options: DAN_BELTS },
];

export const STUDENT_BELT_OPTIONS: readonly BeltOption[] = STUDENT_BELT_GROUPS.flatMap((group) => group.options);

export const COLOR_BELT_KEYS: ColorBeltKey[] = ["white", "yellow", "green", "blue", "red"];

const BELT_META: Record<string, StudentBeltMeta> = Object.fromEntries(
  [...COLOR_BELTS, ...POOM_BELTS, ...DAN_BELTS].map((option) => [
    option.value,
    {
      label: option.label,
      color: option.color,
      bottomColor: option.bottomColor,
      outline: option.outline,
      stripeCount: option.stripes ?? 0,
      rank: option.rank,
    },
  ]),
);

export function getStudentBeltMeta(belt: StudentBeltKey): StudentBeltMeta {
  return BELT_META[belt] ?? BELT_META.white;
}

export function studentBeltLabel(belt: StudentBeltKey) {
  return getStudentBeltMeta(belt).label;
}

export function isPoomBelt(belt: StudentBeltKey): belt is PoomBeltKey {
  return belt.startsWith("poom-");
}

export function isDanBelt(belt: StudentBeltKey): belt is DanBeltKey {
  return belt.startsWith("dan-");
}

export function isRankBelt(belt: StudentBeltKey) {
  return isPoomBelt(belt) || isDanBelt(belt);
}

export function beltRank(belt: StudentBeltKey) {
  return getStudentBeltMeta(belt).rank;
}

export function beltDotStyle(belt: StudentBeltKey) {
  const meta = getStudentBeltMeta(belt);
  if (!meta.bottomColor) return { backgroundColor: meta.color };
  return { background: `linear-gradient(to bottom, ${meta.color} 50%, ${meta.bottomColor} 50%)` };
}
