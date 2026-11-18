import { authRequest, authRequestWithMeta } from "@/features/auth/api";
import type { Gender } from "@/features/coach/lib/coach-data";

export type BeltInput = { name: string; level: number; durationMonth: number };

export function saveBelt(id: string | null, input: BeltInput): Promise<unknown> {
  return id ? authRequest(`belt/${id}`, { method: "patch", json: input }) : authRequest("belt", { method: "post", json: input });
}

export function deleteBelt(id: string): Promise<unknown> {
  return authRequest(`belt/${id}`, { method: "delete" });
}

export type AgeCategoryInput = { name: string; startDate: string; endDate: string };

export function saveAgeCategory(id: string | null, input: AgeCategoryInput): Promise<unknown> {
  return id
    ? authRequest(`age-category/${id}`, { method: "patch", json: input })
    : authRequest("age-category", { method: "post", json: input });
}

export function deleteAgeCategory(id: string): Promise<unknown> {
  return authRequest(`age-category/${id}`, { method: "delete" });
}

export type BeltExamInput = {
  name: string;
  examNumber: number;
  genders: Gender[];
  eventPlaces: string[];
  registerDate: string;
  eventDate: string;
  beltIds: string[];
};

export function saveBeltExam(id: string | null, input: BeltExamInput): Promise<unknown> {
  return id ? authRequest(`belt-exam/${id}`, { method: "patch", json: input }) : authRequest("belt-exam", { method: "post", json: input });
}

export function deleteBeltExam(id: string): Promise<unknown> {
  return authRequest(`belt-exam/${id}`, { method: "delete" });
}

export type WeightClassRecord = {
  id: string;
  ageCategoryId: string;
  gender: Gender;
  label: string;
  minWeightKg: string;
  maxWeightKg: string | null;
  order: number;
  excludeMin: boolean;
  excludeMax: boolean;
};

export type WeightClassInput = {
  ageCategoryId: string;
  gender: Gender;
  label: string;
  minWeightKg: number;
  maxWeightKg: number | null;
  order: number;
  excludeMin: boolean;
  excludeMax: boolean;
};

export function fetchWeightClasses(): Promise<{ weightClasses: WeightClassRecord[]; total: number }> {
  return authRequestWithMeta<WeightClassRecord[]>("weight-class?page=1&take=100&sortBy=order&sortDirection=asc").then(
    ({ data, pager }) => ({ weightClasses: data, total: pager?.total ?? data.length }),
  );
}

export function saveWeightClass(id: string | null, input: WeightClassInput): Promise<unknown> {
  return id
    ? authRequest(`weight-class/${id}`, { method: "patch", json: input })
    : authRequest("weight-class", { method: "post", json: input });
}

export function deleteWeightClass(id: string): Promise<unknown> {
  return authRequest(`weight-class/${id}`, { method: "delete" });
}

export type FederationCoachRecord = { id: string; fullName: string };

export function fetchCoaches(): Promise<FederationCoachRecord[]> {
  return authRequestWithMeta<FederationCoachRecord[]>("coach?page=1&take=100&sortBy=fullName&sortDirection=asc").then(({ data }) => data);
}

export type FederationImportInput = {
  coachId: string;
  coachSessionId: string;
  coachingDegree: string;
  province?: string;
};

export type FederationImportResult = {
  fetched: number;
  accepted: number;
  skipped: number;
  skippedReasons: Record<string, number>;
  pagination: { totalRecords: number; totalPages: number } | null;
  import: { message: string; count: number; created: number; updated: number; duplicates: { fullName: string }[] };
};

export type FederationSyncResult = {
  summary: { total: number; synced: number; unchanged: number; failed: number };
};

// The scraper walks federation pages and sync sleeps seconds between students, so these
// calls legitimately run for minutes — the ky default timeout must not apply to them.
const FEDERATION_CALL_OPTIONS = { timeout: false } as const;

export function importCoachStudents(input: FederationImportInput): Promise<FederationImportResult> {
  return authRequest("federation/coach-students/import", { method: "post", json: input, ...FEDERATION_CALL_OPTIONS });
}

export function syncCoachStudents(coachId: string): Promise<FederationSyncResult> {
  return authRequest("federation/coach-students/sync", { method: "post", json: { coachId }, ...FEDERATION_CALL_OPTIONS });
}
