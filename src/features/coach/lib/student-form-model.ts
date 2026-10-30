import { z } from "zod";
import type { CreateStudentInput } from "@/features/coach/lib/student-api";
import type { StudentProfile } from "@/features/coach/lib/student-profile-data";
import { beltApiName } from "@/features/coach/lib/students-options";
import { toGregorianDate } from "@/lib/jalali";
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

export function studentToForm(profile: StudentProfile): StudentFormValues {
  return {
    fullName: profile.name,
    nationalCode: profile.nationalCode,
    gender: profile.gender,
    birthDate: profile.birthDate,
    fatherName: profile.fatherName,
    phone: profile.phone,
    landline: profile.landline,
    province: profile.province,
    belt: profile.belt,
    beltDate: profile.beltDate,
    height: profile.height,
    weight: profile.weight,
    membershipYear: profile.membershipYear,
    insuranceDate: profile.insuranceDate ?? "",
    expireImageDate: profile.expireImageDate,
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
