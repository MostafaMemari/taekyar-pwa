import type { BeltOption } from "@/components/shared/belt-picker";

export const STUDENT_BELT_OPTIONS: BeltOption[] = [
  { value: "white", label: "سفید", color: "#F3F4F6", outline: "#D1D5DB", knotColor: "#E5E7EB" },
  { value: "yellow", label: "زرد", color: "#FBBF24", knotColor: "#F59E0B" },
  { value: "green", label: "سبز", color: "#22C55E", knotColor: "#16A34A" },
  { value: "blue", label: "آبی", color: "#3B82F6", knotColor: "#2563EB" },
  { value: "red", label: "قرمز", color: "#EF4444", knotColor: "#DC2626" },
  { value: "poom-1", label: "پوم ۱", color: "#1F2937", bottomColor: "#DC2626", knotColor: "#111827", stripes: 1 },
  { value: "dan-1", label: "دان ۱", color: "#1F2937", knotColor: "#111827", stripes: 1 },
  { value: "dan-2", label: "دان ۲", color: "#1F2937", knotColor: "#111827", stripes: 2 },
  { value: "dan-3", label: "دان ۳", color: "#1F2937", knotColor: "#111827", stripes: 3 },
];

export const BELT_ASSIGN_OPTIONS: { value: string; label: string; description: string; color: string; bottomColor?: string }[] = [
  { value: "white", label: "کمربند سفید", description: "آغاز مسیر — ثبت عضویت", color: "#F3F4F6" },
  { value: "yellow", label: "کمربند زرد", description: "حداقل ۳ ماه تمرین پس از کمربند قبلی", color: "#FBBF24" },
  { value: "green", label: "کمربند سبز", description: "حداقل ۳ ماه تمرین — آزمون فنی", color: "#22C55E" },
  { value: "blue", label: "کمربند آبی", description: "حداقل ۶ ماه تمرین پس از کمربند قبلی", color: "#3B82F6" },
  { value: "red", label: "کمربند قرمز", description: "حداقل ۶ ماه تمرین — پیش نیاز آزمون پوم", color: "#EF4444" },
  { value: "poom-1", label: "پوم ۱", description: "کمربند دو رنگ مشکی/قرمز — یک خط", color: "#1F2937", bottomColor: "#DC2626" },
  { value: "dan-1", label: "دان ۱", description: "کمربند مشکی — یک خط", color: "#1F2937" },
  { value: "dan-2", label: "دان ۲", description: "کمربند مشکی — دو خط", color: "#1F2937" },
  { value: "dan-3", label: "دان ۳", description: "کمربند مشکی — سه خط", color: "#1F2937" },
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
