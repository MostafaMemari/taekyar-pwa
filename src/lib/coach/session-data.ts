import type { AttendanceCounts } from "@/components/coach/attendance-summary";
import { type AttendanceStatus, type ClassSession, COACH, SESSIONS, STUDENTS } from "@/lib/coach/coach-data";

export type SessionRosterEntry = {
  studentId: string;
  name: string;
  status: AttendanceStatus;
  note?: string;
};

export type SessionDetail = ClassSession & {
  capacity: number;
  memberCount: number;
  lastSession: {
    date: string;
    counts: AttendanceCounts;
    recordedBy: string;
  };
  roster: SessionRosterEntry[];
};

const ROSTER_TEMPLATE: { studentId: string; status: AttendanceStatus; note?: string }[] = [
  { studentId: "sara-mohammadi", status: "PRESENT" },
  { studentId: "amirhossein-mohammadi", status: "PRESENT" },
  { studentId: "ali-rezaei", status: "LATE", note: "۱۵ دقیقه دیر رسید · گرم کردن را از دست داد" },
  { studentId: "mohammad-hosseini", status: "PRESENT" },
  { studentId: "reza-ghasemi", status: "ABSENT", note: "مسافرت خانوادگی · اطلاع قبلی داده بود" },
  { studentId: "parsa-kazemi", status: "PRESENT" },
  { studentId: "sina-moradi", status: "EXCUSED", note: "مرخص استعلاجی · مدرک پزشکی هفته آینده ارائه می شود" },
  { studentId: "maryam-sharifi", status: "PRESENT" },
];

function buildLastSessionCounts(session: ClassSession): AttendanceCounts {
  const total = session.attendance?.total ?? session.members ?? 12;
  const present = session.attendance?.present ?? Math.max(total - 2, 0);
  const late = Math.min(total >= 10 ? 2 : 1, Math.max(total - present, 0));
  const absent = Math.max(total - present - late, 0);

  return { present, late, absent, excused: 0, total };
}

export function getSession(id: string): ClassSession | undefined {
  return SESSIONS.find((session) => session.id === id);
}

export function getSessionDetail(id: string): SessionDetail | undefined {
  const session = getSession(id);
  if (!session) return undefined;

  const memberCount = session.attendance?.total ?? session.members ?? 12;
  const roster = ROSTER_TEMPLATE.map((entry) => {
    const student = STUDENTS.find((item) => item.id === entry.studentId);

    return {
      ...entry,
      name: student?.name ?? "هنرجو",
    };
  });

  return {
    ...session,
    capacity: memberCount + 2,
    memberCount,
    lastSession: {
      date: "شنبه ۲۴ آبان ۱۴۰۴",
      counts: buildLastSessionCounts(session),
      recordedBy: COACH.name,
    },
    roster,
  };
}
