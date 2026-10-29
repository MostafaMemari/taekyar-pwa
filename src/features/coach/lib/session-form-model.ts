import { z } from "zod";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const sessionFormSchema = z
  .object({
    name: z.string().trim().min(2, "نام کلاس باید حداقل ۲ حرف باشد.").max(80, "نام کلاس بیش از حد طولانی است."),
    clubId: z.string().min(1, "باشگاه کلاس را انتخاب کنید."),
    weekDays: z
      .array(z.enum(["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]))
      .min(1, "حداقل یک روز برگزاری را انتخاب کنید."),
    startTime: z.string().regex(TIME_PATTERN, "ساعت شروع را انتخاب کنید."),
    endTime: z.string().regex(TIME_PATTERN, "ساعت پایان را انتخاب کنید."),
  })
  .refine((values) => values.startTime < values.endTime, {
    path: ["endTime"],
    message: "ساعت پایان باید بعد از ساعت شروع باشد.",
  });

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

export const emptySessionForm: SessionFormValues = {
  name: "",
  clubId: "",
  weekDays: ["SATURDAY", "MONDAY"],
  startTime: "17:00",
  endTime: "18:30",
};

export function sessionToForm(session: ClassSessionRecord): SessionFormValues {
  return {
    name: session.name,
    clubId: session.clubId,
    weekDays: session.weekDays,
    startTime: session.startTime,
    endTime: session.endTime,
  };
}
