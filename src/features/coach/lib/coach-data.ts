import { Check, Clock, type LucideIcon, X, Zap } from "lucide-react";
import { toPersianDigits } from "@/lib/digits";
import { beltDotStyle, studentBeltLabel as beltLabel, type StudentBeltKey } from "@/lib/student-belts";

export type Gender = "MALE" | "FEMALE";
export type InsuranceStatus = "ok" | "soon" | "none";
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export type WeekDay = "SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

export const WEEK_DAY_ORDER: WeekDay[] = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

export const WEEK_DAY_META: Record<WeekDay, { label: string }> = {
  SATURDAY: { label: "شنبه" },
  SUNDAY: { label: "یکشنبه" },
  MONDAY: { label: "دوشنبه" },
  TUESDAY: { label: "سه شنبه" },
  WEDNESDAY: { label: "چهارشنبه" },
  THURSDAY: { label: "پنجشنبه" },
  FRIDAY: { label: "جمعه" },
};

const JS_DAY_TO_WEEK_DAY: WeekDay[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function todayWeekDay(): WeekDay {
  return JS_DAY_TO_WEEK_DAY[new Date().getDay()];
}

export function weekDayLabels(days: WeekDay[]): string[] {
  return days.map((day) => WEEK_DAY_META[day].label);
}

export function sessionIsToday(days: WeekDay[]) {
  return days.includes(todayWeekDay());
}

export const INSURANCE_META: Record<InsuranceStatus, { label: string; tone: "success" | "warning" | "danger" }> = {
  ok: { label: "بیمه فعال", tone: "success" },
  soon: { label: "نزدیک انقضا", tone: "warning" },
  none: { label: "بدون بیمه", tone: "danger" },
};

export const GENDER_META: Record<Gender, { label: string; clubLabel: string }> = {
  MALE: { label: "مرد", clubLabel: "آقایان" },
  FEMALE: { label: "زن", clubLabel: "بانوان" },
};

export const ATTENDANCE_META: Record<AttendanceStatus, { label: string; tone: "success" | "warning" | "danger" | "info"; color: string }> =
  {
    PRESENT: { label: "حاضر", tone: "success", color: "#10b981" },
    LATE: { label: "تأخیر", tone: "warning", color: "#f59e0b" },
    ABSENT: { label: "غایب", tone: "danger", color: "#ef4444" },
    EXCUSED: { label: "موجه", tone: "info", color: "#0ea5e9" },
  };

export type Club = {
  id: string;
  name: string;
  address: string;
  gender: Gender;
  imageKey?: string;
  isActive: boolean;
  classesCount: number;
  studentsCount: number;
  registeredAt: string;
};

export type CoachStudent = {
  id: string;
  name: string;
  nationalCode: string;
  belt: StudentBeltKey;
  hasAccount: boolean;
  insurance: InsuranceStatus;
  insuranceDate?: string;
  insuranceDays: number;
};

export const COACH = {
  name: "محمدرضا یاری",
  nationalCode: "0079458213",
  mobile: "09121112233",
  gender: "MALE" as Gender,
  province: "TEHRAN",
  birthDate: "1366/01/01",
  belt: "dan-8" as StudentBeltKey,
  imageKey: "",
};

export const ACTIVE_CLUB = {
  id: "shohada",
  name: "باشگاه بلوار مارلیک",
  address: "تهران، بلوار مارلیک",
};

export const CLUBS: Club[] = [
  {
    id: "shohada",
    name: "باشگاه بلوار مارلیک",
    address: "تهران، بلوار مارلیک",
    gender: "MALE",
    isActive: true,
    classesCount: 3,
    studentsCount: 12,
    registeredAt: "1403/12/28",
  },
  {
    id: "pars",
    name: "باشگاه میدان گلها",
    address: "تهران، میدان گلها",
    gender: "MALE",
    isActive: true,
    classesCount: 3,
    studentsCount: 6,
    registeredAt: "1404/02/11",
  },
];

export function getClub(id: string): Club | undefined {
  return CLUBS.find((club) => club.id === id);
}

export const STUDENTS: CoachStudent[] = [
  {
    id: "sara-mohammadi",
    name: "سارا محمدی",
    nationalCode: "0064523187",
    belt: "green",
    hasAccount: true,
    insurance: "ok",
    insuranceDate: "1405/05/10",
    insuranceDays: 200,
  },
  {
    id: "amirhossein-mohammadi",
    name: "امیرحسین محمدی",
    nationalCode: "0012345678",
    belt: "green",
    hasAccount: true,
    insurance: "ok",
    insuranceDate: "1406/01/22",
    insuranceDays: 178,
  },
  {
    id: "ali-rezaei",
    name: "علی رضایی",
    nationalCode: "0038475619",
    belt: "yellow",
    hasAccount: false,
    insurance: "ok",
    insuranceDate: "1405/12/05",
    insuranceDays: 130,
  },
  {
    id: "niloofar-kazemi",
    name: "نیلوفر کاظمی",
    nationalCode: "0074582196",
    belt: "white",
    hasAccount: false,
    insurance: "none",
    insuranceDays: 9999,
  },
  {
    id: "mohammad-hosseini",
    name: "محمد حسینی",
    nationalCode: "0041928374",
    belt: "yellow",
    hasAccount: true,
    insurance: "soon",
    insuranceDate: "1405/08/14",
    insuranceDays: 19,
  },
  {
    id: "reza-ghasemi",
    name: "رضا قاسمی",
    nationalCode: "0051029384",
    belt: "blue",
    hasAccount: true,
    insurance: "ok",
    insuranceDate: "1406/04/18",
    insuranceDays: 204,
  },
  {
    id: "sina-moradi",
    name: "سینا مرادی",
    nationalCode: "0073846152",
    belt: "yellow",
    hasAccount: false,
    insurance: "none",
    insuranceDays: 9999,
  },
  {
    id: "parsa-kazemi",
    name: "پارسا کاظمی",
    nationalCode: "0062039184",
    belt: "white",
    hasAccount: true,
    insurance: "ok",
    insuranceDate: "1406/02/11",
    insuranceDays: 197,
  },
  {
    id: "dorsa-mousavi",
    name: "درسا موسوی",
    nationalCode: "0095647382",
    belt: "white",
    hasAccount: true,
    insurance: "soon",
    insuranceDate: "1405/08/02",
    insuranceDays: 7,
  },
  {
    id: "kian-ahmadi",
    name: "کیان احمدی",
    nationalCode: "0089341257",
    belt: "yellow",
    hasAccount: true,
    insurance: "ok",
    insuranceDate: "1405/11/29",
    insuranceDays: 125,
  },
  {
    id: "arash-rostami",
    name: "آرش رستمی",
    nationalCode: "0028475613",
    belt: "dan-1",
    hasAccount: true,
    insurance: "ok",
    insuranceDate: "1406/05/03",
    insuranceDays: 219,
  },
  {
    id: "maryam-sharifi",
    name: "مریم شریفی",
    nationalCode: "0031928475",
    belt: "red",
    hasAccount: true,
    insurance: "ok",
    insuranceDate: "1406/03/09",
    insuranceDays: 214,
  },
];

export type ClassSession = {
  id: string;
  name: string;
  club: string;
  clubId: string;
  weekDays: WeekDay[];
  start: string;
  end: string;
  isActive: boolean;
  studentIds: string[];
  icon: LucideIcon;
};

const MARLIC_STUDENTS = STUDENTS.filter((student) => student.id !== "maryam-sharifi").map((student) => student.id);
const MARLIC_EARLY = MARLIC_STUDENTS.filter((id) => id !== "arash-rostami" && id !== "kian-ahmadi");

export const SESSIONS: ClassSession[] = [
  {
    id: "marlic-1730",
    name: "کیوروگی آقایان",
    club: ACTIVE_CLUB.name,
    clubId: ACTIVE_CLUB.id,
    weekDays: ["SATURDAY", "MONDAY", "WEDNESDAY"],
    start: "17:30",
    end: "19:00",
    isActive: true,
    studentIds: MARLIC_EARLY,
    icon: Zap,
  },
  {
    id: "marlic-1900",
    name: "کیوروگی آقایان",
    club: ACTIVE_CLUB.name,
    clubId: ACTIVE_CLUB.id,
    weekDays: ["SATURDAY", "MONDAY", "WEDNESDAY"],
    start: "19:00",
    end: "20:30",
    isActive: true,
    studentIds: MARLIC_STUDENTS,
    icon: Zap,
  },
  {
    id: "marlic-2030",
    name: "کیوروگی آقایان",
    club: ACTIVE_CLUB.name,
    clubId: ACTIVE_CLUB.id,
    weekDays: ["SATURDAY", "MONDAY", "WEDNESDAY"],
    start: "20:30",
    end: "22:00",
    isActive: true,
    studentIds: MARLIC_STUDENTS.slice(0, 9),
    icon: Zap,
  },
  {
    id: "golha-1600",
    name: "کیوروگی آقایان",
    club: "باشگاه میدان گلها",
    clubId: "pars",
    weekDays: ["SUNDAY", "TUESDAY", "THURSDAY"],
    start: "16:00",
    end: "17:30",
    isActive: true,
    studentIds: MARLIC_EARLY.slice(0, 4),
    icon: Zap,
  },
  {
    id: "golha-1730",
    name: "کیوروگی آقایان",
    club: "باشگاه میدان گلها",
    clubId: "pars",
    weekDays: ["SUNDAY", "TUESDAY", "THURSDAY"],
    start: "17:30",
    end: "19:00",
    isActive: true,
    studentIds: MARLIC_EARLY.slice(0, 5),
    icon: Zap,
  },
  {
    id: "golha-1900",
    name: "کیوروگی آقایان",
    club: "باشگاه میدان گلها",
    clubId: "pars",
    weekDays: ["SUNDAY", "TUESDAY", "THURSDAY"],
    start: "19:00",
    end: "20:30",
    isActive: true,
    studentIds: MARLIC_EARLY.slice(0, 6),
    icon: Zap,
  },
];

export function getClubSessions(clubId: string): ClassSession[] {
  return SESSIONS.filter((session) => session.clubId === clubId);
}

export function studentSessionSummary(studentId: string) {
  const sessions = SESSIONS.filter((session) => session.studentIds.includes(studentId));
  if (sessions.length === 0) return "بدون کلاس";

  const names = [...new Set(sessions.map((session) => session.name))];
  return names.length === 1 ? names[0] : `${names[0]} و ${names.length - 1} کلاس دیگر`;
}

export type InvitationStatus = "PENDING" | "CONFIRMED" | "REJECTED";

export const INVITATION_STATUS_META = {
  PENDING: { label: "در انتظار", tone: "warning", icon: Clock },
  CONFIRMED: { label: "پذیرفته", tone: "success", icon: Check },
  REJECTED: { label: "رد شده", tone: "danger", icon: X },
} as const;

export type Invitation = {
  id: string;
  nationalCode: string;
  studentName?: string;
  status: InvitationStatus;
  sentAt: string;
  respondedAt?: string;
};

export const INVITATIONS: Invitation[] = [
  {
    id: "nima-sadeghi",
    nationalCode: "0012345678",
    studentName: "نیما صادقی",
    status: "PENDING",
    sentAt: "۲۲ آبان ۱۴۰۴",
  },
  {
    id: "dorsa-mousavi",
    nationalCode: "0095647382",
    studentName: "درسا موسوی",
    status: "PENDING",
    sentAt: "۲۳ آبان ۱۴۰۴",
  },
  {
    id: "sina-moradi",
    nationalCode: "0073846152",
    studentName: "سینا مرادی",
    status: "CONFIRMED",
    sentAt: "۸ مهر ۱۴۰۴",
    respondedAt: "۹ مهر ۱۴۰۴",
  },
  {
    id: "amirhossein-rostami",
    nationalCode: "0028475613",
    studentName: "امیرحسین رستمی",
    status: "CONFIRMED",
    sentAt: "۲۰ شهریور ۱۴۰۴",
    respondedAt: "۲۱ شهریور ۱۴۰۴",
  },
  {
    id: "ali-kazemi",
    nationalCode: "0035443322",
    studentName: "علی کاظمی",
    status: "REJECTED",
    sentAt: "۲ شهریور ۱۴۰۴",
    respondedAt: "۴ شهریور ۱۴۰۴",
  },
];

export const BELT_EXAMS = [
  {
    id: "exam-291",
    day: "28",
    month: "آبان",
    course: "دوره 291",
    status: "open" as const,
    title: "آزمون کمربند زرد و سبز — استان تهران",
    deadline: "ثبت نام تا چهارشنبه 26 آبان 1404",
  },
  {
    id: "exam-292",
    day: "19",
    month: "آذر",
    course: "دوره 292",
    status: "soon" as const,
    title: "آزمون کمربند آبی و قرمز — خانه تکواندو",
    deadline: "ثبت نام از یکشنبه 1 آذر 1404",
  },
];

export const WEEKLY_ATTENDANCE = [
  { day: "ش", value: 92, previous: 84 },
  { day: "ی", value: 88, previous: 86 },
  { day: "د", value: 94, previous: 90 },
  { day: "س", value: 90, previous: 88 },
  { day: "چ", value: 84, previous: 80 },
  { day: "پ", value: 95, previous: 92 },
  { day: "ج", value: 78, previous: 74 },
];

export const WEEKLY_TOTAL = { present: 213, total: 245, previousPresent: 199, previousTotal: 240 };

export function studentBeltLabel(student: { belt: StudentBeltKey }) {
  return beltLabel(student.belt);
}

export function studentBeltDotStyle(student: { belt: StudentBeltKey }) {
  return beltDotStyle(student.belt);
}

export function coachBeltLabel(belt: StudentBeltKey) {
  return `دان ${toPersianDigits(belt.replace("dan-", ""))}`;
}
