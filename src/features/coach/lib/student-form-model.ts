import { z } from "zod";
import type { CreateStudentInput, StudentDetailRecord, UpdateStudentInput } from "@/features/coach/lib/student-api";
import { beltApiName, beltKeyOf } from "@/features/coach/lib/students-options";
import { toLatinDigits } from "@/lib/digits";
import { toGregorianDate, toJalaliDate } from "@/lib/jalali";
import type { StudentBeltKey } from "@/lib/student-belts";

const JALALI_PATTERN = /^\d{4}\/\d{1,2}\/\d{1,2}$/;

function isPastOrToday(jalali: string) {
  const iso = toGregorianDate(jalali);
  if (!iso) return false;

  const date = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
}

export const studentFormSchema = z.object({
  fullName: z.string().trim().min(2, "نام هنرجو باید حداقل ۲ حرف باشد.").max(80, "نام هنرجو بیش از حد طولانی است."),
  nationalCode: z.string().regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد."),
  gender: z.enum(["MALE", "FEMALE"]),
  birthDate: z.string().regex(JALALI_PATTERN, "تاریخ تولد را انتخاب کنید.").refine(isPastOrToday, "تاریخ تولد نمی تواند در آینده باشد."),
  fatherName: z.string().trim().max(80, "نام پدر بیش از حد طولانی است."),
  phone: z.string().regex(/^$|^09\d{9}$/, "شماره تماس باید ۱۱ رقم و با ۰۹ شروع شود."),
  landline: z.string().regex(/^$|^0\d{9,10}$/, "تلفن ثابت باید با پیش شماره شهر شروع شود."),
  province: z.string().min(1, "استان را انتخاب کنید."),
  belt: z.string().min(1, "کمربند فعلی را انتخاب کنید."),
  beltDate: z
    .string()
    .regex(JALALI_PATTERN, "تاریخ دریافت کمربند را انتخاب کنید.")
    .refine(isPastOrToday, "تاریخ دریافت کمربند نمی تواند در آینده باشد."),
  height: z
    .string()
    .regex(/^$|^\d{2,3}$/, "قد را با عدد وارد کنید.")
    .refine((value) => !value || (Number(value) >= 50 && Number(value) <= 260), "قد باید بین ۵۰ تا ۲۶۰ سانتی متر باشد."),
  weight: z
    .string()
    .regex(/^$|^\d{2,3}$/, "وزن را با عدد وارد کنید.")
    .refine((value) => !value || (Number(value) >= 10 && Number(value) <= 300), "وزن باید بین ۱۰ تا ۳۰۰ کیلوگرم باشد."),
  membershipYear: z.string().regex(/^$|^\d{4}$/, "سال عضویت باید ۴ رقم باشد."),
  insuranceDate: z.string().regex(/^$|^\d{4}\/\d{1,2}\/\d{1,2}$/, "تاریخ بیمه معتبر نیست."),
  expireImageDate: z.string(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;

// Belt and belt date are create-only: the backend PATCH ignores them, so edit must not block on them.
export const studentEditFormSchema = studentFormSchema.extend({ belt: z.string(), beltDate: z.string() });

export const emptyStudentForm: StudentFormValues = {
  fullName: "",
  nationalCode: "",
  gender: "MALE",
  birthDate: "",
  fatherName: "",
  phone: "",
  landline: "",
  province: "",
  belt: "",
  beltDate: "",
  height: "",
  weight: "",
  membershipYear: "",
  insuranceDate: "",
  expireImageDate: "",
};

export function studentDetailToForm(student: StudentDetailRecord): StudentFormValues {
  const toDateInput = (iso: string | null) => (iso ? toLatinDigits(toJalaliDate(iso)) : "");

  return {
    fullName: student.fullName,
    nationalCode: student.nationalCode,
    gender: student.gender,
    birthDate: toDateInput(student.birthDate),
    fatherName: student.fatherName ?? "",
    phone: student.phoneNumber ?? "",
    landline: student.landlineNumber ?? "",
    province: student.province ?? "",
    belt: student.currentBelt ? beltKeyOf(student.currentBelt.belt.name) : "",
    beltDate: student.currentBelt ? toDateInput(student.currentBelt.beltDate) : "",
    height: student.height ?? "",
    weight: student.weight ?? "",
    membershipYear: student.membershipYear ? String(student.membershipYear) : "",
    insuranceDate: toDateInput(student.sportsInsuranceDate),
    expireImageDate: toDateInput(student.expireImageDate),
  };
}

export function studentFormToUpdateInput(values: StudentFormValues): UpdateStudentInput {
  return {
    fullName: values.fullName.trim(),
    nationalCode: values.nationalCode,
    gender: values.gender,
    birthDate: toGregorianDate(values.birthDate) ?? "",
    province: values.province,
    fatherName: values.fatherName.trim() || null,
    phoneNumber: values.phone || null,
    landlineNumber: values.landline || null,
    membershipYear: values.membershipYear ? Number(values.membershipYear) : null,
    sportsInsuranceDate: values.insuranceDate ? toGregorianDate(values.insuranceDate) : null,
    expireImageDate: values.expireImageDate ? toGregorianDate(values.expireImageDate) : null,
  };
}

export function studentFormToInput(values: StudentFormValues): CreateStudentInput {
  const insuranceDate = values.insuranceDate ? toGregorianDate(values.insuranceDate) : null;

  return {
    fullName: values.fullName.trim(),
    nationalCode: values.nationalCode,
    gender: values.gender,
    birthDate: toGregorianDate(values.birthDate) ?? "",
    belt: beltApiName(values.belt as StudentBeltKey),
    beltDate: toGregorianDate(values.beltDate) ?? "",
    province: values.province,
    ...(values.fatherName.trim() ? { fatherName: values.fatherName.trim() } : {}),
    ...(values.phone ? { phoneNumber: values.phone } : {}),
    ...(values.landline ? { landlineNumber: values.landline } : {}),
    ...(values.membershipYear ? { membershipYear: Number(values.membershipYear) } : {}),
    ...(insuranceDate ? { sportsInsuranceDate: insuranceDate } : {}),
    ...(values.height ? { height: Number(values.height) } : {}),
    ...(values.weight ? { weight: Number(values.weight) } : {}),
  };
}
