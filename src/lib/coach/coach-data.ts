import { Activity, Baby, Check, Clock, Dumbbell, Flag, type LucideIcon, Medal, Users, X, Zap } from "lucide-react";
import { toPersianDigits } from "@/lib/digits";

export type BeltKey = "white" | "yellow" | "green" | "blue" | "red" | "black";
export type AgeGroup = "kids" | "teens" | "adults";
export type Gender = "MALE" | "FEMALE";
export type InsuranceStatus = "ok" | "soon" | "none";
export type PeriodFilter = "today" | "week";
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export const BELT_META: Record<BeltKey, { label: string; color: string; outline: string; rank: number }> = {
  white: { label: "سفید", color: "#e5e7eb", outline: "#cbd5e1", rank: 0 },
  yellow: { label: "زرد", color: "#fbbf24", outline: "rgba(23, 26, 37, 0.16)", rank: 1 },
  green: { label: "سبز", color: "#22c55e", outline: "rgba(23, 26, 37, 0.16)", rank: 2 },
  blue: { label: "آبی", color: "#3b82f6", outline: "rgba(23, 26, 37, 0.16)", rank: 3 },
  red: { label: "قرمز", color: "#ef4444", outline: "rgba(23, 26, 37, 0.16)", rank: 4 },
  black: { label: "مشکی", color: "#1f2937", outline: "rgba(255, 255, 255, 0.25)", rank: 5 },
};

export const INSURANCE_META: Record<InsuranceStatus, { label: string; tone: "success" | "warning" | "danger" }> = {
  ok: { label: "بیمه فعال", tone: "success" },
  soon: { label: "نزدیک انقضا", tone: "warning" },
  none: { label: "بدون بیمه", tone: "danger" },
};

export const ATTENDANCE_META: Record<AttendanceStatus, { label: string; tone: "success" | "warning" | "danger" | "info"; color: string }> =
  {
    PRESENT: { label: "حاضر", tone: "success", color: "#10b981" },
    LATE: { label: "تأخیر", tone: "warning", color: "#f59e0b" },
    ABSENT: { label: "غایب", tone: "danger", color: "#ef4444" },
    EXCUSED: { label: "موجه", tone: "info", color: "#0ea5e9" },
  };

export type ClubAdmission = "male" | "female" | "mixed";

export const CLUB_ADMISSION_META: Record<ClubAdmission, { label: string }> = {
  male: { label: "آقایان" },
  female: { label: "بانوان" },
  mixed: { label: "مختلط" },
};

export const CLUB_DISCIPLINES = ["کیوروگی", "پومسه", "شکستن", "دفاع شخصی", "دموهای نمایشی"] as const;

export type Club = {
  id: string;
  name: string;
  watermark: string;
  active: boolean;
  workspace: boolean;
  admission: ClubAdmission;
  classesCount: number;
  studentsCount: number;
  capacity: number;
  attendance: string;
  address: string;
  phone: string;
  disciplines: string[];
  registeredAt: string;
};

export type CoachStudent = {
  id: string;
  name: string;
  nationalCode: string;
  belt: BeltKey;
  poom?: number;
  dan?: number;
  ageGroup: AgeGroup;
  ageLabel: string;
  className: string;
  hasAccount: boolean;
  insurance: InsuranceStatus;
  insuranceDate?: string;
  insuranceDays: number;
};

export const COACH = {
  name: "محمود کریمی",
  phone: "09121112233",
  nationalCode: "0079458213",
  gender: "مرد",
  province: "تهران",
  birthDate: "1366/01/01",
  beltDan: 4,
  startYear: "1396",
  experienceYears: 8,
  certificate: "مدرک فدراسیون",
};

export const ACTIVE_CLUB = {
  id: "shohada",
  name: "باشگاه شهدای گمنام",
  address: "تهران، شهرک غرب، بلوار فرحزادی، سالن ورزشی شهدای گمنام",
};

export const CLUBS: Club[] = [
  {
    id: "shohada",
    name: "باشگاه شهدای گمنام",
    watermark: "ش",
    active: true,
    workspace: true,
    admission: "mixed",
    classesCount: 6,
    studentsCount: 12,
    capacity: 80,
    attendance: "89",
    address: "تهران، شهرک غرب، بلوار فرحزادی، سالن ورزشی شهدای گمنام",
    phone: "02188452310",
    disciplines: ["کیوروگی", "پومسه", "شکستن"],
    registeredAt: "1403/12/28",
  },
  {
    id: "pars",
    name: "باشگاه تکواندو پارس",
    watermark: "پ",
    active: true,
    workspace: false,
    admission: "male",
    classesCount: 2,
    studentsCount: 6,
    capacity: 40,
    attendance: "81",
    address: "تهران، خیابان آزادی، نبش کوچه مهر، سالن ورزشی پارس",
    phone: "02166123456",
    disciplines: ["کیوروگی", "دفاع شخصی"],
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
    ageGroup: "teens",
    ageLabel: "نوجوانان",
    className: "کلاس سبک کیوروگی",
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
    ageGroup: "teens",
    ageLabel: "نوجوانان",
    className: "کلاس نوجوانان",
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
    ageGroup: "teens",
    ageLabel: "نوجوانان",
    className: "کلاس نوجوانان",
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
    ageGroup: "kids",
    ageLabel: "کودکان",
    className: "کلاس کودکان",
    hasAccount: false,
    insurance: "none",
    insuranceDays: 9999,
  },
  {
    id: "mohammad-hosseini",
    name: "محمد حسینی",
    nationalCode: "0041928374",
    belt: "yellow",
    ageGroup: "teens",
    ageLabel: "نوجوانان",
    className: "کلاس نوجوانان",
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
    ageGroup: "adults",
    ageLabel: "بزرگسالان",
    className: "کلاس بزرگسالان",
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
    ageGroup: "kids",
    ageLabel: "کودکان",
    className: "کلاس کودکان",
    hasAccount: false,
    insurance: "none",
    insuranceDays: 9999,
  },
  {
    id: "parsa-kazemi",
    name: "پارسا کاظمی",
    nationalCode: "0062039184",
    belt: "white",
    ageGroup: "kids",
    ageLabel: "کودکان",
    className: "کلاس کودکان",
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
    ageGroup: "kids",
    ageLabel: "کودکان",
    className: "کلاس کودکان",
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
    ageGroup: "adults",
    ageLabel: "بزرگسالان",
    className: "کلاس بزرگسالان",
    hasAccount: true,
    insurance: "ok",
    insuranceDate: "1405/11/29",
    insuranceDays: 125,
  },
  {
    id: "arash-rostami",
    name: "آرش رستمی",
    nationalCode: "0028475613",
    belt: "black",
    dan: 1,
    ageGroup: "adults",
    ageLabel: "بزرگسالان",
    className: "کلاس سبک کیوروگی",
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
    ageGroup: "adults",
    ageLabel: "بزرگسالان",
    className: "کلاس سبک کیوروگی",
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
  days: string[];
  start: string;
  end: string;
  active: boolean;
  when: PeriodFilter[];
  attendance?: { present: number; total: number };
  members?: number;
  icon: LucideIcon;
};

export const SESSIONS: ClassSession[] = [
  {
    id: "kyorugi",
    name: "کلاس سبک کیوروگی",
    club: ACTIVE_CLUB.name,
    clubId: "shohada",
    days: ["شنبه", "دوشنبه"],
    start: "17:00",
    end: "18:30",
    active: true,
    when: ["today", "week"],
    attendance: { present: 18, total: 22 },
    icon: Zap,
  },
  {
    id: "teenagers",
    name: "کلاس نوجوانان",
    club: ACTIVE_CLUB.name,
    clubId: "shohada",
    days: ["یکشنبه", "چهارشنبه"],
    start: "16:30",
    end: "18:00",
    active: true,
    when: ["week"],
    attendance: { present: 16, total: 18 },
    icon: Users,
  },
  {
    id: "adults",
    name: "کلاس بزرگسالان",
    club: ACTIVE_CLUB.name,
    clubId: "shohada",
    days: ["سه شنبه"],
    start: "19:00",
    end: "20:30",
    active: true,
    when: ["week"],
    attendance: { present: 12, total: 15 },
    icon: Dumbbell,
  },
  {
    id: "poomsae",
    name: "کلاس پومسه",
    club: ACTIVE_CLUB.name,
    clubId: "shohada",
    days: ["پنجشنبه"],
    start: "10:00",
    end: "11:30",
    active: true,
    when: ["week"],
    attendance: { present: 10, total: 14 },
    icon: Medal,
  },
  {
    id: "fitness",
    name: "کلاس آمادگی جسمانی",
    club: ACTIVE_CLUB.name,
    clubId: "shohada",
    days: ["جمعه"],
    start: "08:00",
    end: "09:30",
    active: true,
    when: ["week"],
    attendance: { present: 8, total: 12 },
    icon: Activity,
  },
  {
    id: "kids",
    name: "کلاس کودکان",
    club: ACTIVE_CLUB.name,
    clubId: "shohada",
    days: ["شنبه"],
    start: "10:00",
    end: "11:00",
    active: true,
    when: ["today", "week"],
    attendance: { present: 9, total: 10 },
    icon: Baby,
  },
  {
    id: "basics",
    name: "کلاس مبانی",
    club: ACTIVE_CLUB.name,
    clubId: "shohada",
    days: ["دوشنبه"],
    start: "18:00",
    end: "19:30",
    active: false,
    when: [],
    members: 11,
    icon: Flag,
  },
  {
    id: "pars-kids",
    name: "کلاس کودکان پارس",
    club: "باشگاه تکواندو پارس",
    clubId: "pars",
    days: ["شنبه", "سه شنبه"],
    start: "16:00",
    end: "17:15",
    active: true,
    when: ["week"],
    attendance: { present: 8, total: 9 },
    icon: Baby,
  },
  {
    id: "pars-self-defense",
    name: "کلاس دفاع شخصی",
    club: "باشگاه تکواندو پارس",
    clubId: "pars",
    days: ["چهارشنبه"],
    start: "19:00",
    end: "20:00",
    active: true,
    when: ["week"],
    attendance: { present: 11, total: 15 },
    icon: Flag,
  },
];

export function getClubSessions(clubId: string): ClassSession[] {
  return SESSIONS.filter((session) => session.clubId === clubId);
}

export type InvitationStatus = "pending" | "accepted" | "rejected";

export const INVITATION_STATUS_META = {
  pending: { label: "در انتظار", tone: "warning", icon: Clock },
  accepted: { label: "پذیرفته", tone: "success", icon: Check },
  rejected: { label: "رد شده", tone: "danger", icon: X },
} as const;

export type Invitation = {
  id: string;
  name: string;
  phone: string;
  status: InvitationStatus;
  sentAt: string;
  respondedAt?: string;
};

export const INVITATIONS: Invitation[] = [
  { id: "nima-sadeghi", name: "نیما صادقی", phone: "09120987654", status: "pending", sentAt: "۲۲ آبان ۱۴۰۴" },
  { id: "dorsa-mousavi", name: "درسا موسوی", phone: "09107786543", status: "pending", sentAt: "۲۳ آبان ۱۴۰۴" },
  {
    id: "sina-moradi",
    name: "سینا مرادی",
    phone: "09198887766",
    status: "accepted",
    sentAt: "۸ مهر ۱۴۰۴",
    respondedAt: "۹ مهر ۱۴۰۴",
  },
  {
    id: "amirhossein-rostami",
    name: "امیرحسین رستمی",
    phone: "09123344566",
    status: "accepted",
    sentAt: "۲۰ شهریور ۱۴۰۴",
    respondedAt: "۲۱ شهریور ۱۴۰۴",
  },
  {
    id: "ali-kazemi",
    name: "علی کاظمی",
    phone: "09354433221",
    status: "rejected",
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
  { day: "ش", value: 92 },
  { day: "ی", value: 88 },
  { day: "د", value: 94 },
  { day: "س", value: 90 },
  { day: "چ", value: 84 },
  { day: "پ", value: 95 },
  { day: "ج", value: 78 },
];

export const WEEKLY_TOTAL = { present: 213, total: 245 };

export function studentBeltLabel(student: CoachStudent) {
  if (student.poom) return `پوم ${toPersianDigits(String(student.poom))}`;
  if (student.dan) return `دان ${toPersianDigits(String(student.dan))}`;
  return BELT_META[student.belt].label;
}

export function studentBeltDotStyle(student: Pick<CoachStudent, "belt" | "poom">) {
  if (!student.poom) return { backgroundColor: BELT_META[student.belt].color };
  return { background: `linear-gradient(to bottom, ${BELT_META.black.color} 50%, #DC2626 50%)` };
}
