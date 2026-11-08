import { authRequest, authRequestWithMeta } from "@/features/auth/api";
import type { Gender } from "@/features/coach/lib/coach-data";

export type ClubRecord = {
  id: string;
  coachId: string;
  name: string;
  gender: Gender;
  imageKey: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ClubInput = {
  name: string;
  address: string | null;
};

type ClubResponse = { club: ClubRecord };

export const CLUBS_PAGE_SIZE = 100;

export function fetchClubs(): Promise<{ clubs: ClubRecord[]; total: number }> {
  return authRequestWithMeta<ClubRecord[]>(`club?page=1&take=${CLUBS_PAGE_SIZE}`).then(({ data, pager }) => ({
    clubs: data,
    total: pager?.total ?? data.length,
  }));
}

export function fetchClub(id: string): Promise<ClubRecord> {
  return authRequest<ClubRecord>(`club/${id}`);
}

export type ClubMembershipRecord = {
  id: string;
  clubId: string;
  studentId: string;
  joinedAt: string;
  isActive: boolean;
  removedAt: string | null;
  club: ClubRecord;
};

export function fetchStudentClubs(studentId: string): Promise<ClubMembershipRecord[]> {
  return authRequest<ClubMembershipRecord[]>(`club/by-student/${studentId}`);
}

export function fetchClubStudentCount(id: string): Promise<number> {
  return authRequestWithMeta<unknown[]>(`club/${id}/students?page=1&take=1&isActive=true`).then(
    ({ pager, data }) => pager?.total ?? data.length,
  );
}

// shortcut: GET /club returns no member count, so one club costs one extra request; collapse to one call when the backend adds counts.
export function fetchClubStudentTotals(ids: string[]): Promise<Record<string, number>> {
  return Promise.all(ids.map(async (id) => [id, await fetchClubStudentCount(id)] as const)).then(Object.fromEntries);
}

export function createClub(input: ClubInput): Promise<ClubRecord> {
  return authRequest<ClubResponse>("club", { method: "post", json: input }).then((result) => result.club);
}

export function updateClub(id: string, input: ClubInput): Promise<ClubRecord> {
  return authRequest<ClubResponse>(`club/${id}`, { method: "patch", json: input }).then((result) => result.club);
}

export function changeClubStatus(id: string, isActive: boolean): Promise<ClubRecord> {
  return authRequest<ClubResponse>(`club/${id}/status`, { method: "patch", json: { isActive } }).then((result) => result.club);
}

export function addStudentToClub(id: string, studentId: string): Promise<void> {
  return authRequest<unknown>(`club/${id}/students`, { method: "post", json: { studentId } }).then(() => undefined);
}

export type ClubMemberRecord = {
  id: string;
  studentId: string;
  joinedAt: string;
  isActive: boolean;
  student: { id: string; fullName: string };
};

export function fetchClubMembers(id: string): Promise<ClubMemberRecord[]> {
  return authRequestWithMeta<ClubMemberRecord[]>(`club/${id}/students?page=1&take=100`).then(({ data }) => data);
}

export function changeClubMemberStatus(id: string, studentId: string, isActive: boolean): Promise<void> {
  return authRequest<unknown>(`club/${id}/students/${studentId}/status`, { method: "patch", json: { isActive } }).then(() => undefined);
}
