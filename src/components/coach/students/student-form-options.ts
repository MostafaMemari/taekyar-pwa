import type { BeltKey } from "@/components/coach/coach-data";
import type { BeltOption } from "@/components/shared/belt-picker";

export const STUDENT_BELT_OPTIONS: BeltOption[] = [
  { value: "white", label: "سفید", color: "#F3F4F6", outline: "#D1D5DB", knotColor: "#E5E7EB" },
  { value: "yellow", label: "زرد", color: "#FBBF24", knotColor: "#F59E0B" },
  { value: "green", label: "سبز", color: "#22C55E", knotColor: "#16A34A" },
  { value: "blue", label: "آبی", color: "#3B82F6", knotColor: "#2563EB" },
  { value: "red", label: "قرمز", color: "#EF4444", knotColor: "#DC2626" },
  { value: "black", label: "مشکی", color: "#1F2937", knotColor: "#111827" },
];

export const BELT_ASSIGN_OPTIONS: { value: BeltKey; label: string; description: string }[] = [
  { value: "white", label: "کمربند سفید", description: "آغاز مسیر — ثبت عضویت" },
  { value: "yellow", label: "کمربند زرد", description: "حداقل ۳ ماه تمرین پس از کمربند قبلی" },
  { value: "green", label: "کمربند سبز", description: "حداقل ۳ ماه تمرین — آزمون فنی" },
  { value: "blue", label: "کمربند آبی", description: "حداقل ۶ ماه تمرین پس از کمربند قبلی" },
  { value: "red", label: "کمربند قرمز", description: "حداقل ۶ ماه تمرین — پیش نیاز آزمون پوم" },
  { value: "black", label: "کمربند مشکی", description: "ورود به رده دان — آزمون پوم" },
];

export const AGE_CLASS_OPTIONS = [
  { value: "شکوفه", label: "شکوفه" },
  { value: "نوجوان", label: "نوجوان" },
  { value: "کادت", label: "کادت" },
  { value: "جوان", label: "جوان" },
  { value: "بزرگسال", label: "بزرگسال" },
];

export const WEIGHT_CLASS_OPTIONS = [
  { value: "وزن اول (−۴۵)", label: "وزن اول (−۴۵)" },
  { value: "وزن دوم (−۴۸)", label: "وزن دوم (−۴۸)" },
  { value: "وزن سوم (−۵۱)", label: "وزن سوم (−۵۱)" },
  { value: "وزن چهارم (−۵۵)", label: "وزن چهارم (−۵۵)" },
  { value: "وزن پنجم (+۵۹)", label: "وزن پنجم (+۵۹)" },
];

export const TRAINING_DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه"] as const;

export const GENDER_OPTIONS = [
  { value: "MALE", label: "مرد" },
  { value: "FEMALE", label: "زن" },
] as const;
