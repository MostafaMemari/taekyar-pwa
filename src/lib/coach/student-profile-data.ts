import type { AttendanceCounts } from "@/components/coach/attendance-summary";
import {
  ACTIVE_CLUB,
  type AttendanceStatus,
  type CoachStudent,
  type Gender,
  STUDENTS,
  studentSessionSummary,
} from "@/lib/coach/coach-data";
import { studentBeltLabel } from "@/lib/student-belts";

export type StudentClub = {
  id: string;
  name: string;
  active: boolean;
  joinedAt?: string;
  removedAt?: string;
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
  height: string;
  weight: string;
  membershipYear: string;
  registeredAt: string;
  expireImageDate: string;
  clubs: StudentClub[];
  attendance: StudentAttendance;
};

const FEMALE_IDS = new Set(["sara-mohammadi", "niloofar-kazemi", "dorsa-mousavi", "maryam-sharifi"]);

type DemoAgeGroup = "kids" | "teens" | "adults";

const DEMO_AGE_GROUPS: Record<string, DemoAgeGroup> = {
  "sara-mohammadi": "teens",
  "amirhossein-mohammadi": "teens",
  "ali-rezaei": "teens",
  "niloofar-kazemi": "kids",
  "mohammad-hosseini": "teens",
  "reza-ghasemi": "adults",
  "sina-moradi": "kids",
  "parsa-kazemi": "kids",
  "dorsa-mousavi": "kids",
  "kian-ahmadi": "adults",
  "arash-rostami": "adults",
  "maryam-sharifi": "adults",
};

const AGE_DIMENSIONS: Record<DemoAgeGroup, { birthDate: string; height: string; weight: string }> = {
  kids: { birthDate: "1398/01/01", height: "130", weight: "30" },
  teens: { birthDate: "1388/01/01", height: "160", weight: "50" },
  adults: { birthDate: "1375/01/01", height: "175", weight: "70" },
};

const BELT_DATE_BY_RANK = [
  "1403/05/15",
  "1403/10/02",
  "1404/08/25",
  "1405/01/12",
  "1405/06/20",
  "1405/10/01",
  "1405/12/15",
  "1406/02/20",
  "1406/05/10",
  "1406/07/01",
  "1406/08/12",
  "1406/09/20",
  "1406/10/05",
  "1406/11/18",
  "1407/01/10",
  "1407/03/22",
  "1407/05/14",
  "1407/07/09",
  "1407/09/01",
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

function beltRankIndex(belt: string) {
  if (belt.startsWith("poom-")) return 5 + Number(belt.slice(5));
  if (belt.startsWith("dan-")) return 9 + Math.min(Number(belt.slice(4)), 10);
  return ["white", "yellow", "green", "blue", "red"].indexOf(belt);
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
  const age = AGE_DIMENSIONS[DEMO_AGE_GROUPS[student.id] ?? "teens"];
  const rank = Math.max(0, beltRankIndex(student.belt));

  const base: StudentProfile = {
    ...student,
    gender: FEMALE_IDS.has(student.id) ? "FEMALE" : "MALE",
    birthDate: age.birthDate,
    fatherName: "علی",
    phone: `0912${student.nationalCode.slice(-7)}`,
    landline: "02144556677",
    province: "TEHRAN",
    beltDate: BELT_DATE_BY_RANK[Math.min(rank, BELT_DATE_BY_RANK.length - 1)],
    height: age.height,
    weight: age.weight,
    membershipYear: "1403",
    registeredAt: "1403/05/15",
    expireImageDate: "1405/08/01",
    clubs: [{ id: ACTIVE_CLUB.id, name: ACTIVE_CLUB.name, active: true, joinedAt: "مرداد ۱۴۰۳" }],
    attendance: { counts: DEFAULT_ATTENDANCE, records: buildAttendanceRecords(studentSessionSummary(student.id)) },
  };

  if (student.id !== "sara-mohammadi") return base;

  return {
    ...base,
    gender: "FEMALE",
    birthDate: "1385/02/14",
    fatherName: "علی",
    phone: "09121234567",
    landline: "02144556677",
    province: "TEHRAN",
    beltDate: "1404/08/25",
    height: "164",
    weight: "54",
    membershipYear: "1403",
    registeredAt: "1403/05/15",
    insuranceDate: "1405/05/10",
    expireImageDate: "1405/08/01",
    clubs: [
      { id: ACTIVE_CLUB.id, name: ACTIVE_CLUB.name, active: true, joinedAt: "مرداد ۱۴۰۳" },
      { id: "pars", name: "باشگاه میدان گلها", active: false, joinedAt: "مهر ۱۴۰۳", removedAt: "اردیبهشت ۱۴۰۴" },
    ],
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
  return studentBeltLabel(student.belt);
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
