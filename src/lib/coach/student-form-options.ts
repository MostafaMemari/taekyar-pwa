import { STUDENT_BELT_OPTIONS } from "@/lib/student-belts";

const BELT_VISUALS = new Map(STUDENT_BELT_OPTIONS.map((option) => [option.value, option]));

function assignOption(value: string, label: string, description: string) {
  const visual = BELT_VISUALS.get(value);
  return { value, label, description, color: visual?.color ?? "#1F2937", bottomColor: visual?.bottomColor };
}

export const BELT_ASSIGN_OPTIONS = [
  assignOption("white", "کمربند سفید", "آغاز مسیر — ثبت عضویت"),
  assignOption("yellow", "کمربند زرد", "حداقل ۳ ماه تمرین پس از کمربند قبلی"),
  assignOption("green", "کمربند سبز", "حداقل ۳ ماه تمرین — آزمون فنی"),
  assignOption("blue", "کمربند آبی", "حداقل ۶ ماه تمرین پس از کمربند قبلی"),
  assignOption("red", "کمربند قرمز", "حداقل ۶ ماه تمرین — پیش نیاز آزمون پوم"),
  assignOption("poom-1", "پوم ۱", "کمربند دو رنگ مشکی/قرمز — یک خط"),
  assignOption("poom-2", "پوم ۲", "کمربند دو رنگ مشکی/قرمز — دو خط"),
  assignOption("poom-3", "پوم ۳", "کمربند دو رنگ مشکی/قرمز — سه خط"),
  assignOption("poom-4", "پوم ۴", "کمربند دو رنگ مشکی/قرمز — چهار خط"),
  assignOption("dan-1", "دان ۱", "کمربند مشکی — یک خط"),
  assignOption("dan-2", "دان ۲", "کمربند مشکی — دو خط"),
  assignOption("dan-3", "دان ۳", "کمربند مشکی — سه خط"),
  assignOption("dan-4", "دان ۴", "کمربند مشکی — چهار خط"),
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
