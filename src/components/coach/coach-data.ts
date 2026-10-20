import { Activity, Baby, Dumbbell, Flag, type LucideIcon, Medal, Users, Zap } from "lucide-react";

export type BeltKey = "white" | "yellow" | "green" | "blue" | "red" | "black";
export type AgeGroup = "kids" | "teens" | "adults";
export type InsuranceStatus = "ok" | "soon" | "none";
export type PeriodFilter = "today" | "week";

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

export type CoachStudent = {
  id: string;
  name: string;
  nationalCode: string;
  belt: BeltKey;
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
  name: "باشگاه شهدای گمنام",
  address: "تهران، شهرک غرب، بلوار فرحزادی، سالن ورزشی شهدای گمنام",
};

export const CLUBS = [
  {
    id: "shohada",
    name: "باشگاه شهدای گمنام",
    watermark: "ش",
    active: true,
    workspace: true,
    gender: null,
    classesCount: 6,
    studentsCount: 12,
    attendance: "89",
    address: "تهران، شهرک غرب، بلوار فرحزادی، سالن ورزشی شهدای گمنام",
  },
  {
    id: "pars",
    name: "باشگاه تکواندو پارس",
    watermark: "پ",
    active: true,
    workspace: false,
    gender: "آقایان",
    classesCount: 2,
    studentsCount: 6,
    attendance: "81",
    address: "تهران، خیابان آزادی، نبش کوچه مهر، سالن ورزشی پارس",
  },
] as const;

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
    days: ["دوشنبه"],
    start: "18:00",
    end: "19:30",
    active: false,
    when: [],
    members: 11,
    icon: Flag,
  },
];

export const INVITATIONS = [
  { id: "nima-sadeghi", name: "نیما صادقی", sentAt: "دوشنبه 22 آبان 1404" },
  { id: "pouya-naderi", name: "پویا نادری", sentAt: "پنجشنبه 17 آبان 1404" },
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
  return student.dan ? `مشکی دان ${student.dan}` : BELT_META[student.belt].label;
}
