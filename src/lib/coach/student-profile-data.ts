import type { AttendanceCounts } from "@/components/coach/attendance-summary";
import {
  ACTIVE_CLUB,
  type AttendanceStatus,
  BELT_META,
  type BeltKey,
  type CoachStudent,
  type Gender,
  SESSIONS,
  STUDENTS,
} from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";

export type StudentClub = {
  name: string;
  active: boolean;
  since?: string;
  leftAt?: string;
};

export type StudentBeltHistoryEntry = {
  belt: BeltKey;
  poom?: number;
  dan?: number;
  date: string;
  note: string;
  current?: boolean;
};

export type StudentAttendanceRecord = {
  id: string;
  status: AttendanceStatus;
  className: string;
  club: string;
  date: string;
  month: string;
  note?: string;
};

export type StudentAttendance = {
  counts: AttendanceCounts;
  records: StudentAttendanceRecord[];
};

export type StudentProfile = CoachStudent & {
  gender: Gender;
  birthDate: string;
  fatherName: string;
  phone: string;
  landline: string;
  province: string;
  beltDate: string;
  ageClass: string;
  weightClass: string;
  height: string;
  weight: string;
  membershipYear: string;
  registeredAt: string;
  imageExpireDate: string;
  trainingDays: string[];
  clubs: StudentClub[];
  beltHistory: StudentBeltHistoryEntry[];
  attendance: StudentAttendance;
};

const FEMALE_IDS = new Set(["sara-mohammadi", "niloofar-kazemi", "dorsa-mousavi", "maryam-sharifi"]);

const AGE_DIMENSIONS: Record<CoachStudent["ageGroup"], { birthDate: string; ageClass: string; height: string; weight: string }> = {
  kids: { birthDate: "1398/01/01", ageClass: "شکوفه", height: "130", weight: "30" },
  teens: { birthDate: "1388/01/01", ageClass: "نوجوان", height: "160", weight: "50" },
  adults: { birthDate: "1375/01/01", ageClass: "بزرگسال", height: "175", weight: "70" },
};

const BELT_CHAIN: { belt: BeltKey; date: string; note: string }[] = [
  { belt: "white", date: "1403/05/15", note: `ثبت در بدو عضویت — ${ACTIVE_CLUB.name}` },
  { belt: "yellow", date: "1403/10/02", note: "آزمون فنی دوره ۲۸۳ — استان تهران" },
  { belt: "green", date: "1404/08/25", note: "آزمون فنی دوره ۲۹۱ — استان تهران" },
  { belt: "blue", date: "1405/01/12", note: "آزمون فنی — استان تهران" },
  { belt: "red", date: "1405/06/20", note: "آزمون فنی — استان تهران" },
  { belt: "black", date: "1405/10/01", note: "ارتقا به رده دان — آزمون پوم" },
];

const DEFAULT_ATTENDANCE: AttendanceCounts = { present: 20, late: 2, absent: 1, excused: 0, total: 23 };

const DEFAULT_RECORD_TEMPLATE: { status: AttendanceStatus; date: string; month: string; note?: string }[] = [
  { status: "PRESENT", date: "شنبه ۲۴ آبان", month: "آبان ۱۴۰۴" },
  { status: "PRESENT", date: "دوشنبه ۱۹ آبان", month: "آبان ۱۴۰۴" },
  { status: "LATE", date: "شنبه ۱۷ آبان", month: "آبان ۱۴۰۴", note: "ترافیک" },
  { status: "PRESENT", date: "دوشنبه ۱۲ آبان", month: "آبان ۱۴۰۴" },
  { status: "PRESENT", date: "یکشنبه ۲۷ مهر", month: "مهر ۱۴۰۴" },
  { status: "ABSENT", date: "سه شنبه ۲۲ مهر", month: "مهر ۱۴۰۴", note: "عدم حضور بدون اطلاع" },
];

const SARA_BELT_HISTORY: StudentBeltHistoryEntry[] = [
  { belt: "green", date: "1404/08/25", note: "آزمون فنی دوره ۲۹۱ — استان تهران", current: true },
  { belt: "yellow", date: "1403/10/02", note: "آزمون فنی دوره ۲۸۳ — استان تهران" },
  { belt: "white", date: "1403/05/15", note: `ثبت در بدو عضویت — ${ACTIVE_CLUB.name}` },
];

const SARA_ATTENDANCE_RECORDS: StudentAttendanceRecord[] = (
  [
    { id: "sara-1", status: "PRESENT", date: "شنبه ۲۴ آبان", month: "آبان ۱۴۰۴" },
    { id: "sara-2", status: "PRESENT", date: "دوشنبه ۱۹ آبان", month: "آبان ۱۴۰۴" },
    { id: "sara-3", status: "LATE", date: "شنبه ۱۷ آبان", month: "آبان ۱۴۰۴", note: "ترافیک" },
    { id: "sara-4", status: "PRESENT", date: "دوشنبه ۱۲ آبان", month: "آبان ۱۴۰۴" },
    { id: "sara-5", status: "PRESENT", date: "یکشنبه ۲۷ مهر", month: "مهر ۱۴۰۴" },
    { id: "sara-6", status: "EXCUSED", date: "سه شنبه ۲۲ مهر", month: "مهر ۱۴۰۴", note: "مریضی — با اطلاع مربی" },
    { id: "sara-7", status: "PRESENT", date: "یکشنبه ۲۰ مهر", month: "مهر ۱۴۰۴" },
    { id: "sara-8", status: "LATE", date: "سه شنبه ۱۵ مهر", month: "مهر ۱۴۰۴" },
    { id: "sara-9", status: "PRESENT", date: "یکشنبه ۱۳ مهر", month: "مهر ۱۴۰۴" },
    { id: "sara-10", status: "PRESENT", date: "سه شنبه ۸ مهر", month: "مهر ۱۴۰۴" },
  ] satisfies Omit<StudentAttendanceRecord, "className" | "club">[]
).map((record) => ({ ...record, className: "کیوروگی آقایان", club: ACTIVE_CLUB.name }));

function buildBeltHistory(student: CoachStudent): StudentBeltHistoryEntry[] {
  return BELT_CHAIN.slice(0, BELT_META[student.belt].rank + 1)
    .reverse()
    .map((entry, index) => ({
      ...entry,
      poom: entry.belt === "black" ? student.poom : undefined,
      dan: entry.belt === "black" ? student.dan : undefined,
      current: index === 0,
    }));
}

function buildAttendanceRecords(className: string): StudentAttendanceRecord[] {
  return DEFAULT_RECORD_TEMPLATE.map((record, index) => ({
    ...record,
    id: `record-${index}`,
    className,
    club: ACTIVE_CLUB.name,
  }));
}

function buildStudentProfile(student: CoachStudent): StudentProfile {
  const age = AGE_DIMENSIONS[student.ageGroup];
  const session = SESSIONS.find((item) => item.name === student.className);

  const base: StudentProfile = {
    ...student,
    gender: FEMALE_IDS.has(student.id) ? "FEMALE" : "MALE",
    birthDate: age.birthDate,
    fatherName: "علی",
    phone: `0912${student.nationalCode.slice(-7)}`,
    landline: "02144556677",
    province: "تهران",
    beltDate: BELT_CHAIN[BELT_META[student.belt].rank].date,
    ageClass: age.ageClass,
    weightClass: "وزن چهارم (−۵۷)",
    height: age.height,
    weight: age.weight,
    membershipYear: "1403",
    registeredAt: "1403/05/15",
    imageExpireDate: "1405/08/01",
    trainingDays: session?.days ?? ["شنبه", "دوشنبه"],
    clubs: [{ name: ACTIVE_CLUB.name, active: true, since: "مرداد ۱۴۰۳" }],
    beltHistory: buildBeltHistory(student),
    attendance: { counts: DEFAULT_ATTENDANCE, records: buildAttendanceRecords(student.className) },
  };

  if (student.id !== "sara-mohammadi") return base;

  return {
    ...base,
    gender: "FEMALE",
    birthDate: "1385/02/14",
    fatherName: "علی",
    phone: "09121234567",
    landline: "02144556677",
    province: "تهران",
    beltDate: "1404/08/25",
    ageClass: "بزرگسال",
    weightClass: "وزن چهارم (−۵۷)",
    height: "164",
    weight: "54",
    membershipYear: "1403",
    registeredAt: "1403/05/15",
    insuranceDate: "1405/05/10",
    imageExpireDate: "1405/08/01",
    trainingDays: ["شنبه", "دوشنبه", "چهارشنبه"],
    clubs: [
      { name: ACTIVE_CLUB.name, active: true, since: "مرداد ۱۴۰۳" },
      { name: "باشگاه میدان گلها", active: false, leftAt: "اردیبهشت ۱۴۰۴" },
    ],
    beltHistory: SARA_BELT_HISTORY,
    attendance: {
      counts: { present: 29, late: 3, absent: 1, excused: 1, total: 34 },
      records: SARA_ATTENDANCE_RECORDS,
    },
  };
}

export const STUDENT_PROFILES: Record<string, StudentProfile> = Object.fromEntries(
  STUDENTS.map((student) => [student.id, buildStudentProfile(student)]),
);

export function getStudentProfile(id: string): StudentProfile | undefined {
  return STUDENT_PROFILES[id];
}

export function studentBeltText(student: CoachStudent): string {
  if (student.poom) return `کمربند پوم ${toPersianDigits(String(student.poom))}`;
  if (student.dan) return `کمربند دان ${toPersianDigits(String(student.dan))}`;
  return `کمربند ${BELT_META[student.belt].label}`;
}

export function groupAttendanceByMonth(records: StudentAttendanceRecord[]) {
  const groups: { month: string; records: StudentAttendanceRecord[] }[] = [];

  for (const record of records) {
    const last = groups[groups.length - 1];
    if (last?.month === record.month) last.records.push(record);
    else groups.push({ month: record.month, records: [record] });
  }

  return groups;
}
