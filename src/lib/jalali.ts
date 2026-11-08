import { toLatinDigits, toPersianDigits } from "@/lib/digits";

const jalaliFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "short" });
const jalaliDayFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" });
const jalaliMonthFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "long", year: "numeric" });
const jalaliDayMonthFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long" });
const jalaliMonthNameFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "long" });

const BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

const div = (a: number, b: number) => ~~(a / b);
const mod = (a: number, b: number) => a - ~~(a / b) * b;

function jalCal(jy: number) {
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];

  if (jy < jp || jy >= BREAKS[BREAKS.length - 1]) throw new Error("Invalid Jalali year");

  let jump = 0;
  for (let i = 1; i < BREAKS.length; i += 1) {
    const jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }

  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;

  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  return { gy, march };
}

function g2d(gy: number, gm: number, gd: number) {
  let day = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  day = day - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return day;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;

  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);

  return { gy, gm, gd };
}

function j2d(jy: number, jm: number, jd: number) {
  const { gy, march } = jalCal(jy);
  return g2d(gy, 3, march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

export function toGregorianDate(jalali: string): string | null {
  const match = toLatinDigits(jalali).match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;

  const [jy, jm, jd] = [Number(match[1]), Number(match[2]), Number(match[3])];

  try {
    const { gy, gm, gd } = d2g(j2d(jy, jm, jd));
    return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
  } catch {
    return null;
  }
}

export function toJalaliDate(isoDate: string): string {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "" : jalaliFormatter.format(date);
}

export function toJalaliDay(isoDate: string): string {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "" : jalaliDayFormatter.format(date);
}

export function toJalaliMonth(isoDate: string): string {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "" : jalaliMonthFormatter.format(date);
}

export function toJalaliDayMonth(isoDate: string): string {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "" : jalaliDayMonthFormatter.format(date);
}

export function toJalaliMonthName(isoDate: string): string {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "" : jalaliMonthNameFormatter.format(date);
}

export function todayJalali(): string {
  return jalaliFormatter.format(new Date());
}

// Calendar-exact breakdown so 112 days reads like «۳ ماه و ۲۲ روز», borrowing real month lengths as it goes.
export function durationLabel(from: Date, to: Date): string {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${toPersianDigits(String(years))} سال`);
  if (months > 0) parts.push(`${toPersianDigits(String(months))} ماه`);
  if (days > 0 || parts.length === 0) parts.push(`${toPersianDigits(String(days))} روز`);
  return parts.join(" و ");
}

export function shiftJalaliDate(jalali: string, days: number): string {
  const iso = toGregorianDate(jalali);
  if (!iso) return jalali;

  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return jalaliFormatter.format(date);
}
