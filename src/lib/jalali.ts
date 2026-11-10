import { d2j, isValidJalaaliDate, j2d, jalaaliMonthLength, toGregorian } from "jalaali-js";
import { toLatinDigits, toPersianDigits } from "@/lib/digits";

const jalaliFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "short" });
const jalaliDayFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" });
const jalaliMonthFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "long", year: "numeric" });
const jalaliDayMonthFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long" });
const jalaliMonthNameFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "long" });

function parseJalaliParts(jalali: string): { jy: number; jm: number; jd: number } | null {
  const match = toLatinDigits(jalali).match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;

  const [jy, jm, jd] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return isValidJalaaliDate(jy, jm, jd) ? { jy, jm, jd } : null;
}

export function toGregorianDate(jalali: string): string | null {
  const parts = parseJalaliParts(jalali);
  if (!parts) return null;

  const { gy, gm, gd } = toGregorian(parts.jy, parts.jm, parts.jd);
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
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

// Same-day date one or more Jalali years ahead; Esfand 30 falls back to 29 in common years.
export function addJalaliYears(jalali: string, years: number): string {
  const parts = parseJalaliParts(jalali);
  if (!parts) return jalali;

  const jy = parts.jy + years;
  const jd = Math.min(parts.jd, jalaaliMonthLength(jy, parts.jm));
  return `${jy}/${String(parts.jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

export function shiftJalaliDate(jalali: string, days: number): string {
  const parts = parseJalaliParts(jalali);
  if (!parts) return jalali;

  const shifted = d2j(j2d(parts.jy, parts.jm, parts.jd) + days);
  return `${shifted.jy}/${String(shifted.jm).padStart(2, "0")}/${String(shifted.jd).padStart(2, "0")}`;
}
