import { authRequestWithMeta } from "@/features/auth/api";
import type { Gender } from "@/features/coach/lib/coach-data";
import { toLatinDigits } from "@/lib/digits";
import { todayJalali, toGregorianDate } from "@/lib/jalali";

export type BeltExamRecord = {
  id: string;
  name: string;
  examNumber: number;
  description: string | null;
  eventDate: string;
  registerDate: string;
  genders: Gender[];
  eventPlaces: string[];
  belts?: { id: string; name: string; level: number }[];
};

export const BELT_EXAMS_PAGE_SIZE = 20;

export function fetchBeltExams(): Promise<BeltExamRecord[]> {
  // shortcut: past exams are never filtered out server-side (eventDate is an exact-match filter), so take the newest page and let the screen keep the upcoming ones.
  return authRequestWithMeta<BeltExamRecord[]>(
    `belt-exam?page=1&take=${BELT_EXAMS_PAGE_SIZE}&sortBy=eventDate&sortDirection=desc&includeBelt=true`,
  ).then(({ data }) => data);
}

// The exam progress bar fills from the start of the current Jalali year toward each exam's own
// event date, so exams at different dates read at different fill levels.
export function examFillPercent(exam: BeltExamRecord) {
  const [jalaliYear] = toLatinDigits(todayJalali()).split("/");
  const yearStartMs = new Date(`${toGregorianDate(`${jalaliYear}/01/01`)}T00:00:00`).getTime();
  const eventMs = new Date(exam.eventDate).getTime();
  if (eventMs <= yearStartMs) return 100;

  return Math.max(0, Math.min(100, ((Date.now() - yearStartMs) / (eventMs - yearStartMs)) * 100));
}
