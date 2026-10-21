import type { AttendanceCounts } from "@/components/coach/attendance-summary";
import { type AttendanceStatus, type ClassSession, COACH, SESSIONS, STUDENTS } from "@/lib/coach/coach-data";

export type SessionRosterEntry = {
  studentId: string;
  name: string;
  status: AttendanceStatus;
  note?: string;
};

export type SessionDetail = ClassSession & {
  memberCount: number;
  lastSession: {
    date: string;
    counts: AttendanceCounts;
    recordedBy: string;
  };
  roster: SessionRosterEntry[];
};

const STATUS_PATTERN: { status: AttendanceStatus; note?: string }[] = [
  { status: "PRESENT" },
  { status: "PRESENT" },
  { status: "LATE", note: "۱۵ دقیقه دیر رسید · گرم کردن را از دست داد" },
  { status: "PRESENT" },
  { status: "ABSENT", note: "مسافرت خانوادگی · اطلاع قبلی داده بود" },
  { status: "PRESENT" },
  { status: "EXCUSED", note: "مرخص استعلاجی · مدرک پزشکی هفته آینده ارائه می شود" },
  { status: "PRESENT" },
  { status: "PRESENT" },
];

function buildRoster(session: ClassSession): SessionRosterEntry[] {
  return session.studentIds.flatMap((studentId, index) => {
    const student = STUDENTS.find((item) => item.id === studentId);
    if (!student) return [];

    return [
      {
        studentId,
        name: student.name,
        ...STATUS_PATTERN[index % STATUS_PATTERN.length],
      },
    ];
  });
}

function countRoster(roster: SessionRosterEntry[]): AttendanceCounts {
  const counts: AttendanceCounts = { present: 0, late: 0, absent: 0, excused: 0, total: roster.length };

  for (const entry of roster) {
    if (entry.status === "PRESENT") counts.present += 1;
    if (entry.status === "LATE") counts.late += 1;
    if (entry.status === "ABSENT") counts.absent += 1;
    if (entry.status === "EXCUSED") counts.excused = (counts.excused ?? 0) + 1;
  }

  return counts;
}

export function getSession(id: string): ClassSession | undefined {
  return SESSIONS.find((session) => session.id === id);
}

export function getSessionDetail(id: string): SessionDetail | undefined {
  const session = getSession(id);
  if (!session) return undefined;

  const roster = buildRoster(session);

  return {
    ...session,
    memberCount: roster.length,
    lastSession: {
      date: "شنبه ۲۴ آبان ۱۴۰۴",
      counts: countRoster(roster),
      recordedBy: COACH.name,
    },
    roster,
  };
}
