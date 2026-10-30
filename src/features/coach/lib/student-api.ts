import { authRequest, authRequestWithMeta } from "@/features/auth/api";
import type { Gender } from "@/features/coach/lib/coach-data";
import type { PagerMeta } from "@/lib/api/client";

export type StudentBeltRecord = {
  id: string;
  name: string;
  level: number;
};

export type StudentBeltAssignment = { beltDate: string; belt: StudentBeltRecord };

export type StudentMetricsRecord = { height: string | number | null; weight: string | number | null };

export type StudentRecord = {
  id: string;
  userId: string | null;
  fullName: string;
  gender: Gender;
  nationalCode: string;
  birthDate: string | null;
  sportsInsuranceDate: string | null;
  currentBelt: StudentBeltAssignment | null;
  metrics: StudentMetricsRecord[];
};

export type StudentDetailRecord = {
  id: string;
  userId: string | null;
  fullName: string;
  gender: Gender;
  nationalCode: string;
  birthDate: string | null;
  sportsInsuranceDate: string | null;
  fatherName: string | null;
  phoneNumber: string | null;
  landlineNumber: string | null;
  province: string | null;
  membershipYear: number | null;
  expireImageDate: string | null;
  imageKey: string | null;
  createdAt: string;
  currentBelt: StudentBeltAssignment | null;
  height: string | null;
  weight: string | null;
};

export type StudentQuery = {
  page: number;
  take: number;
  search?: string;
  belt?: string[];
  ageCategory?: string[];
  insurance?: string[];
  gender?: Gender;
  sortBy?: string;
  sortDirection?: string;
};

export type CreateStudentInput = {
  fullName: string;
  nationalCode: string;
  gender: Gender;
  birthDate: string;
  belt: string;
  beltDate: string;
  province: string;
  fatherName?: string;
  phoneNumber?: string;
  landlineNumber?: string;
  membershipYear?: number;
  sportsInsuranceDate?: string;
  height?: number;
  weight?: number;
};

export type StudentInsuranceSummary = { valid: number; expiring: number; expired: number; none: number };

export type StudentStats = { total: number; byInsurance: StudentInsuranceSummary; expiringDays: number };

export type AgeCategoryRecord = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export const STUDENTS_PAGE_SIZE = 20;

function toQueryString(query: StudentQuery) {
  const params = new URLSearchParams({ page: String(query.page), take: String(query.take) });

  if (query.search) params.set("search", query.search);
  for (const belt of query.belt ?? []) params.append("belt", belt);
  for (const ageCategory of query.ageCategory ?? []) params.append("ageCategory", ageCategory);
  for (const insurance of query.insurance ?? []) params.append("insurance", insurance);
  if (query.gender) params.set("gender", query.gender);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDirection) params.set("sortDirection", query.sortDirection);

  return params.toString();
}

export function fetchStudents(query: StudentQuery): Promise<{ students: StudentRecord[]; pager?: PagerMeta }> {
  return authRequestWithMeta<StudentRecord[]>(`student?${toQueryString(query)}`).then(({ data, pager }) => ({ students: data, pager }));
}

export function createStudent(input: CreateStudentInput): Promise<void> {
  return authRequest<unknown>("student", { method: "post", json: input }).then(() => undefined);
}

export function deleteStudent(id: string): Promise<void> {
  return authRequest<unknown>(`student/${id}`, { method: "delete" }).then(() => undefined);
}

// Prisma Decimal reaches JSON as a string or a number; anything else is not a value the screen can render.
function decimalText(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : null;
}

// shortcut: GET /student/:id returns no belt and no metrics, so the list item (unique nationalCode) supplies both.
export async function fetchStudent(id: string): Promise<StudentDetailRecord> {
  const profile = await authRequest<Omit<StudentDetailRecord, "currentBelt" | "height" | "weight">>(`student/${id}`);
  const listed = (await fetchStudents({ page: 1, take: 1, search: profile.nationalCode })).students[0];

  return {
    ...profile,
    currentBelt: listed?.currentBelt ?? null,
    height: decimalText(listed?.metrics[0]?.height),
    weight: decimalText(listed?.metrics[0]?.weight),
  };
}

export function fetchStudentStats(): Promise<StudentStats> {
  return authRequest<StudentStats>("student/stats");
}

export function fetchAgeCategories(): Promise<AgeCategoryRecord[]> {
  return authRequestWithMeta<AgeCategoryRecord[]>("age-category?page=1&take=100").then(({ data }) => data);
}
