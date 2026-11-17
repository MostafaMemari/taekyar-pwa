import { authRequest, authRequestWithMeta } from "@/features/auth/api";
import type { AttendanceStatus } from "@/features/coach/lib/coach-data";
import type { StudentFeeStatus } from "@/features/coach/lib/students-options";
import type { PagerMeta } from "@/lib/api/client";

export type AttendanceRecord = {
  id: string;
  classSessionId: string;
  studentId: string;
  sessionDate: string;
  status: AttendanceStatus;
  note: string | null;
};

export type ClassAttendanceEntry = {
  id: string;
  classSessionId: string;
  studentId: string;
  student: { id: string; fullName: string };
  attendance: AttendanceRecord | null;
  isGuest: boolean;
};

export type AttendanceItem = {
  studentId: string;
  status: AttendanceStatus;
  note: string | null;
};

export type SaveAttendanceInput = {
  sessionDate: string;
  items: AttendanceItem[];
};

type SaveAttendanceResponse = { attendance: AttendanceRecord[] };

export type StudentAttendanceSummaryRecord = { total: number; present: number; late: number; absent: number; excused: number };

export type StudentAttendanceEntry = {
  id: string;
  studentId: string;
  sessionDate: string;
  status: AttendanceStatus;
  note: string | null;
  classSession: { id: string; name: string; club: { id: string; name: string } };
};

export type StudentAttendance = { counts: StudentAttendanceSummaryRecord; records: StudentAttendanceEntry[] };

export type CoachWeeklyAttendanceSummary = {
  thisWeek: { present: number; total: number };
  lastWeek: { present: number; total: number };
  days: Array<{ weekDay: string; present: number; total: number; previousPresent: number; previousTotal: number }>;
};

export type AbsentStudentsQuery = { minAbsences: number; clubId?: string | null };

export type AbsentStudentRecord = {
  studentId: string;
  fullName: string;
  absentCount: number;
  clubName: string | null;
  feeStatus: StudentFeeStatus | null;
};

export function fetchClassAttendance(classSessionId: string, date: string): Promise<ClassAttendanceEntry[]> {
  return authRequest<ClassAttendanceEntry[]>(`attendance/class/${classSessionId}/daily?date=${date}`);
}

export function fetchCoachWeeklySummary(): Promise<CoachWeeklyAttendanceSummary> {
  return authRequest<CoachWeeklyAttendanceSummary>("attendance/coach/summary");
}

// The backend window is fixed at the last 30 days and counts ABSENT only; the fee filter is client-side.
export function fetchAbsentStudents({ minAbsences, clubId }: AbsentStudentsQuery): Promise<AbsentStudentRecord[]> {
  const params = new URLSearchParams({ minAbsences: String(minAbsences) });
  if (clubId) params.set("clubId", clubId);

  return authRequest<{ students: AbsentStudentRecord[] }>(`attendance/coach/absent-students?${params}`).then((report) => report.students);
}

// shortcut: one page of 100 sessions feeds the profile panel's trend chart.
export function fetchStudentAttendance(studentId: string): Promise<StudentAttendance> {
  return Promise.all([
    authRequest<StudentAttendanceSummaryRecord>(`attendance/student/${studentId}/summary`),
    authRequestWithMeta<StudentAttendanceEntry[]>(`attendance/student/${studentId}?page=1&take=100`),
  ]).then(([counts, page]) => ({ counts, records: page.data }));
}

export function fetchStudentAttendanceSummary(studentId: string): Promise<StudentAttendanceSummaryRecord> {
  return authRequest<StudentAttendanceSummaryRecord>(`attendance/student/${studentId}/summary`);
}

// The report screen pages through the whole history one 100-row window at a time.
export function fetchStudentAttendancePage(
  studentId: string,
  page: number,
): Promise<{ data: StudentAttendanceEntry[]; pager?: PagerMeta }> {
  return authRequestWithMeta<StudentAttendanceEntry[]>(`attendance/student/${studentId}?page=${page}&take=100`);
}

export function saveClassAttendance(classSessionId: string, input: SaveAttendanceInput): Promise<SaveAttendanceResponse> {
  return authRequest<SaveAttendanceResponse>(`attendance/class/${classSessionId}`, { method: "put", json: input });
}

export function removeClassAttendance(classSessionId: string, studentId: string, sessionDate: string): Promise<void> {
  return authRequest<unknown>(`attendance/class/${classSessionId}/${studentId}?date=${sessionDate}`, { method: "delete" }).then(
    () => undefined,
  );
}
