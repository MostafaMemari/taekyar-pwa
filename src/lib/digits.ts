const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toPersianDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));
}

export function digitsOnly(value: string, maxLength?: number): string {
  const digits = toLatinDigits(value).replace(/\D/g, "");
  return maxLength ? digits.slice(0, maxLength) : digits;
}

export function decimalOnly(value: string, maxWhole = 3, maxFraction = 1): string {
  const [whole, ...fractionParts] = toLatinDigits(value)
    .replace(/[^\d.]/g, "")
    .split(".");
  const fraction = fractionParts.join("").slice(0, maxFraction);
  const result = fractionParts.length > 0 ? `${whole.slice(0, maxWhole)}.${fraction}` : whole.slice(0, maxWhole);
  return result;
}

export function formatMobileForDisplay(value: string): string {
  const digits = digitsOnly(value).slice(0, 11);
  return toPersianDigits(`${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`.trim());
}
