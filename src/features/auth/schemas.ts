import { z } from "zod";

const OTP_CODE_LENGTH = 5;

const fullName = z.string().trim().min(2, "نام و نام خانوادگی را کامل وارد کنید.").max(80, "نام و نام خانوادگی بیش از حد طولانی است.");
const nationalCode = z.string().regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد.");
const gender = z.enum(["MALE", "FEMALE"]);
const province = z.string().min(1, "استان را انتخاب کنید.");
const requiredDate = (message: string) => z.string().min(1, message);

export const mobileFormSchema = z.object({
  mobile: z.string().regex(/^09\d{9}$/, "شماره موبایل را کامل وارد کنید."),
});
export type MobileForm = z.infer<typeof mobileFormSchema>;

export const otpFormSchema = z.object({
  code: z.string().regex(new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`), "کد تایید را کامل وارد کنید."),
});
export type OtpForm = z.infer<typeof otpFormSchema>;

const stepOneShape = { fullName, nationalCode, gender, province };

export const stepOneSchema = z.object({ ...stepOneShape, birthDate: z.string() });
export type StepOneForm = z.infer<typeof stepOneSchema>;

export const studentSignupSchema = z.object({
  ...stepOneShape,
  birthDate: requiredDate("تاریخ تولد را انتخاب کنید."),
  belt: z.string().min(1, "کمربند فعلی را انتخاب کنید."),
  beltDate: requiredDate("تاریخ دریافت کمربند را انتخاب کنید."),
  insuranceDate: z.string(),
  weight: z.string().refine((value) => !value || (Number(value) >= 10 && Number(value) <= 300), "وزن باید بین ۱۰ تا ۳۰۰ کیلوگرم باشد."),
  height: z.string().refine((value) => !value || (Number(value) >= 50 && Number(value) <= 260), "قد باید بین ۵۰ تا ۲۶۰ سانتی متر باشد."),
});
export type StudentSignupForm = z.infer<typeof studentSignupSchema>;

export const coachSignupSchema = z.object({
  ...stepOneShape,
  birthDate: z.string(),
  belt: z.string(),
});
export type CoachSignupValues = z.infer<typeof coachSignupSchema>;

export const completeProfileSchema = z.object({
  fullName,
  nationalCode,
  gender,
  birthDate: z.string(),
  fatherName: z
    .string()
    .trim()
    .max(80, "نام پدر بیش از حد طولانی است.")
    .refine((value) => !value || value.length >= 2, "نام پدر باید حداقل ۲ حرف باشد."),
  phoneNumber: z.string().refine((value) => !value || /^\d{10,11}$/.test(value), "شماره تماس باید ۱۰ یا ۱۱ رقم باشد."),
});
export type CompleteProfileValues = z.infer<typeof completeProfileSchema>;
