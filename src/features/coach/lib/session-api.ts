import { authRequest, authRequestWithMeta } from "@/features/auth/api";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import type { WeekDay } from "@/features/coach/lib/coach-data";

export type ClassSessionMember = {
  id: string;
  classSessionId: string;
  studentId: string;
  student: { id: string; fullName: string; clubMemberships?: { isActive: boolean }[] };
  createdAt: string;
};

export type ClassSessionRecord = {
  id: string;
  clubId: string;
  name: string;
  weekDays: WeekDay[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  club?: ClubRecord;
  students?: ClassSessionMember[];
};

export type ClassSessionInput = {
  name: string;
  weekDays: WeekDay[];
  startTime: string;
  endTime: string;
};

export type CreateClassSessionInput = ClassSessionInput & { clubId: string };

type ClassSessionResponse = { classSession: ClassSessionRecord };

export const SESSIONS_PAGE_SIZE = 100;

export type ClassSessionMembershipRecord = { id: string; classSessionId: string; studentId: string; classSession: ClassSessionRecord };

export function fetchStudentSessions(studentId: string): Promise<ClassSessionRecord[]> {
  return authRequest<ClassSessionMembershipRecord[]>(`class-session/by-student/${studentId}`).then((rows) =>
    rows.map((row) => row.classSession),
  );
}

export type SessionStudentRow = { studentId: string; name: string; joinedAt: string; clubActive: boolean };
export type SessionStudentsPage = { members: SessionStudentRow[]; total: number };

// Paged class roster for the session screen.
export function fetchSessionStudentsPage(id: string, page: number): Promise<SessionStudentsPage> {
  const query = new URLSearchParams({ page: String(page), take: "10" });

  return authRequestWithMeta<ClassSessionMember[]>(`class-session/${id}/students?${query.toString()}`).then(({ data, pager }) => ({
    members: data.map((row) => ({
      studentId: row.studentId,
      name: row.student.fullName,
      joinedAt: row.createdAt,
      clubActive: row.student.clubMemberships?.[0]?.isActive ?? true,
    })),
    total: pager?.total ?? data.length,
  }));
}

export function fetchSessions(): Promise<{ sessions: ClassSessionRecord[]; total: number }> {
  return authRequestWithMeta<ClassSessionRecord[]>(`class-session?page=1&take=${SESSIONS_PAGE_SIZE}`).then(({ data, pager }) => ({
    sessions: data,
    total: pager?.total ?? data.length,
  }));
}

export function fetchSession(id: string): Promise<ClassSessionRecord> {
  return authRequest<ClassSessionRecord>(`class-session/${id}`);
}

export function fetchSessionStudentCount(id: string): Promise<number> {
  return authRequestWithMeta<unknown[]>(`class-session/${id}/students?page=1&take=1`).then(
    ({ pager, data }) => pager?.total ?? data.length,
  );
}

// shortcut: GET /class-session returns no member count, so one class costs one extra request; collapse to one call when the backend adds counts.
export function fetchSessionStudentTotals(ids: string[]): Promise<Record<string, number>> {
  return Promise.all(ids.map(async (id) => [id, await fetchSessionStudentCount(id)] as const)).then(Object.fromEntries);
}

export function createSession(input: CreateClassSessionInput): Promise<ClassSessionRecord> {
  return authRequest<ClassSessionResponse>("class-session", { method: "post", json: input }).then((result) => result.classSession);
}

export function updateSession(id: string, input: ClassSessionInput): Promise<ClassSessionRecord> {
  return authRequest<ClassSessionResponse>(`class-session/${id}`, { method: "patch", json: input }).then((result) => result.classSession);
}

export function changeSessionStatus(id: string, isActive: boolean): Promise<ClassSessionRecord> {
  return authRequest<ClassSessionResponse>(`class-session/${id}/status`, { method: "patch", json: { isActive } }).then(
    (result) => result.classSession,
  );
}

export function addStudentsToSession(id: string, studentIds: string[]): Promise<void> {
  return authRequest<unknown>(`class-session/${id}/students`, { method: "post", json: { studentIds } }).then(() => undefined);
}

export function removeStudentFromSession(id: string, studentId: string): Promise<void> {
  return authRequest<unknown>(`class-session/${id}/students/${studentId}`, { method: "delete" }).then(() => undefined);
}

export function deleteSession(id: string): Promise<void> {
  return authRequest<unknown>(`class-session/${id}`, { method: "delete" }).then(() => undefined);
}
