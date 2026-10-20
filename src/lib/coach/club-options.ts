import type { ClubAdmission } from "@/lib/coach/coach-data";

export const CLUB_ADMISSION_OPTIONS: { value: ClubAdmission; label: string }[] = [
  { value: "male", label: "آقایان" },
  { value: "female", label: "بانوان" },
  { value: "mixed", label: "مختلط" },
];
