import { authRequestWithMeta } from "@/features/auth/api";
import type { Gender } from "@/features/coach/lib/coach-data";

export type BeltExamRecord = {
  id: string;
  name: string;
  examNumber: number;
  description: string | null;
  eventDate: string;
  registerDate: string;
  genders: Gender[];
  eventPlaces: string[];
  belts?: { name: string; level: number }[];
};

export const BELT_EXAMS_PAGE_SIZE = 20;

export function fetchBeltExams(): Promise<BeltExamRecord[]> {
  // shortcut: past exams are never filtered out server-side (eventDate is an exact-match filter), so take the newest page and let the screen keep the upcoming ones.
  return authRequestWithMeta<BeltExamRecord[]>(
    `belt-exam?page=1&take=${BELT_EXAMS_PAGE_SIZE}&sortBy=eventDate&sortDirection=desc&includeBelt=true`,
  ).then(({ data }) => data);
}
