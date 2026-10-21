import { STUDENT_BELT_OPTIONS, type StudentBeltKey } from "@/lib/student-belts";

const BELT_VISUALS = new Map(STUDENT_BELT_OPTIONS.map((option) => [option.value, option]));

const BELT_DESCRIPTIONS: Record<string, string> = {
  white: "آغاز مسیر — ثبت عضویت",
  yellow: "حداقل ۳ ماه تمرین پس از کمربند قبلی",
  green: "حداقل ۳ ماه تمرین — آزمون فنی",
  blue: "حداقل ۶ ماه تمرین پس از کمربند قبلی",
  red: "حداقل ۶ ماه تمرین — پیش نیاز آزمون پوم",
};

function assignOption(value: StudentBeltKey, label: string, description: string) {
  const visual = BELT_VISUALS.get(value);
  return { value, label, description, color: visual?.color ?? "#1F2937", bottomColor: visual?.bottomColor };
}

export const BELT_ASSIGN_OPTIONS = STUDENT_BELT_OPTIONS.map((option) =>
  assignOption(
    option.value as StudentBeltKey,
    option.label,
    BELT_DESCRIPTIONS[option.value] ?? `آزمون فنی کمربند ${option.label} — ${option.stripes ?? 0} خط`,
  ),
);

export const GENDER_OPTIONS = [
  { value: "MALE", label: "مرد" },
  { value: "FEMALE", label: "زن" },
] as const;
