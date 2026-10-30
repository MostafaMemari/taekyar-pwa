import { authRequest, authRequestWithMeta } from "@/features/auth/api";
import type { AttendanceStatus } from "@/features/coach/lib/coach-data";

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

export function fetchClassAttendance(classSessionId: string, date: string): Promise<ClassAttendanceEntry[]> {
  return authRequest<ClassAttendanceEntry[]>(`attendance/class/${classSessionId}/daily?date=${date}`);
}

// shortcut: one page of 100 sessions feeds both the file panel and the report screen; add pagination when a student outgrows it.
export function fetchStudentAttendance(studentId: string): Promise<StudentAttendance> {
  return Promise.all([
    authRequest<StudentAttendanceSummaryRecord>(`attendance/student/${studentId}/summary`),
    authRequestWithMeta<StudentAttendanceEntry[]>(`attendance/student/${studentId}?page=1&take=100`),
  ]).then(([counts, page]) => ({ counts, records: page.data }));
}

export function saveClassAttendance(classSessionId: string, input: SaveAttendanceInput): Promise<SaveAttendanceResponse> {
  return authRequest<SaveAttendanceResponse>(`attendance/class/${classSessionId}`, { method: "put", json: input });
}
