import { z } from "zod";
import type { ClubRecord } from "@/features/coach/lib/club-api";

export const clubFormSchema = z.object({
  name: z.string().trim().min(2, "نام باشگاه باید حداقل ۲ حرف باشد.").max(80, "نام باشگاه بیش از حد طولانی است."),
  address: z
    .string()
    .trim()
    .max(200, "آدرس بیش از حد طولانی است.")
    .refine((value) => !value || value.length >= 5, "آدرس باید حداقل ۵ حرف باشد."),
});

export type ClubFormValues = z.infer<typeof clubFormSchema>;

export const emptyClubForm: ClubFormValues = { name: "", address: "" };

export function clubToForm(club: ClubRecord): ClubFormValues {
  return { name: club.name, address: club.address ?? "" };
}
