import { z } from "zod";
import type { CoachProfileInput, CoachProfileRecord } from "@/features/coach/lib/coach-profile-api";
import { toLatinDigits } from "@/lib/digits";
import { toGregorianDate, toJalaliDate } from "@/lib/jalali";

export const coachProfileFormSchema = z.object({
  fullName: z.string().trim().min(2, "نام و نام خانوادگی را کامل وارد کنید.").max(80, "نام و نام خانوادگی بیش از حد طولانی است."),
  nationalCode: z.string().regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد."),
  province: z.string().min(1, "استان را انتخاب کنید."),
  birthDate: z.string().regex(/^$|^\d{4}\/\d{1,2}\/\d{1,2}$/, "تاریخ تولد معتبر نیست."),
  belt: z.string(),
});

export type CoachProfileFormValues = z.infer<typeof coachProfileFormSchema>;

export const emptyCoachProfileForm: CoachProfileFormValues = {
  fullName: "",
  nationalCode: "",
  province: "",
  birthDate: "",
  belt: "",
};

export function coachProfileToForm(profile: CoachProfileRecord): CoachProfileFormValues {
  return {
    fullName: profile.fullName,
    nationalCode: profile.nationalCode,
    province: profile.province,
    birthDate: profile.birthDate ? toLatinDigits(toJalaliDate(profile.birthDate)) : "",
    belt: profile.belt ?? "",
  };
}

export function coachProfileFormToInput(values: CoachProfileFormValues): CoachProfileInput {
  return {
    fullName: values.fullName.trim(),
    nationalCode: values.nationalCode,
    province: values.province,
    ...(values.birthDate ? { birthDate: toGregorianDate(values.birthDate) ?? undefined } : {}),
    belt: values.belt || null,
  };
}
