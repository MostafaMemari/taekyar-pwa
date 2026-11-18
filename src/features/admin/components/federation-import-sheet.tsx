"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, Medal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ding-toaster";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthInput } from "@/components/shared/auth-input";
import { AuthSelect } from "@/components/shared/auth-select";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { CoachSelectField } from "@/features/admin/components/coach-select-field";
import { useImportCoachStudents } from "@/features/admin/hooks/use-federation-mutations";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";

// Values go to the federation scraper, so they must match the site's own dropdown texts
// (DropDownList4 codes 76..82); a made-up option like «بین المللی» alone is rejected there.
const COACHING_DEGREE_OPTIONS = [
  "درجه 3",
  "درجه 2",
  "درجه 1",
  "ممتاز-ملی",
  "بین المللی درجه 3",
  "بین المللی درجه 2",
  "بین المللی درجه 1",
].map((value) => ({ value, label: toPersianDigits(value) }));

// The federation province dropdown (DropDownList1): the UI sends the site code 23..54,
// so no name/alias matching on the scraper side can miss.
const FEDERATION_PROVINCE_OPTIONS = [
  { value: "23", label: "آذربایجان شرقی" },
  { value: "24", label: "آذربایجان غربی" },
  { value: "25", label: "اردبیل" },
  { value: "26", label: "اصفهان" },
  { value: "27", label: "ایلام" },
  { value: "28", label: "بوشهر" },
  { value: "29", label: "تهران و توابع" },
  { value: "30", label: "البرز" },
  { value: "31", label: "چهار محال بختیاری" },
  { value: "32", label: "خراسان رضوی" },
  { value: "33", label: "خراسان شمالی" },
  { value: "34", label: "خراسان جنوبی" },
  { value: "35", label: "خوزستان" },
  { value: "36", label: "زنجان" },
  { value: "37", label: "سمنان" },
  { value: "38", label: "سیستان و بلوچستان" },
  { value: "39", label: "فارس" },
  { value: "40", label: "قزوین" },
  { value: "41", label: "قم" },
  { value: "42", label: "کردستان" },
  { value: "43", label: "کرمان" },
  { value: "44", label: "کرمانشاه" },
  { value: "45", label: "کهگیلویه و بویر احمد" },
  { value: "46", label: "گلستان" },
  { value: "47", label: "گیلان" },
  { value: "48", label: "لرستان" },
  { value: "49", label: "مازندران" },
  { value: "50", label: "مرکزی" },
  { value: "51", label: "هرمزگان" },
  { value: "52", label: "همدان" },
  { value: "53", label: "یزد" },
  { value: "54", label: "کیش" },
];

const importSchema = z.object({
  coachId: z.string().min(1, "مربی را انتخاب کنید"),
  coachSessionId: z.string().trim().min(10, "شناسه نشست فدراسیون را کامل وارد کنید").max(128, "شناسه نشست فدراسیون بیش از حد طولانی است"),
  coachingDegree: z.string().min(1, "درجه مربیگری را انتخاب کنید").max(40),
  province: z.string().trim().max(40, "استان بیش از حد طولانی است"),
});

type ImportFormValues = z.infer<typeof importSchema>;

const emptyImportForm: ImportFormValues = { coachId: "", coachSessionId: "", coachingDegree: "", province: "" };

export function FederationImportSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const importAction = useImportCoachStudents();
  const filled = useRef(false);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ImportFormValues>({ resolver: zodResolver(importSchema), defaultValues: emptyImportForm });

  useEffect(() => {
    if (open && !filled.current) {
      filled.current = true;
      reset(emptyImportForm);
    }
    if (!open) filled.current = false;
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      const result = await importAction.trigger({
        coachId: values.coachId,
        coachSessionId: values.coachSessionId.trim(),
        coachingDegree: values.coachingDegree,
        ...(values.province.trim() ? { province: values.province.trim() } : {}),
      });
      toast.success(
        `از ${toPersianDigits(String(result.fetched))} ردیف فدراسیون، ${toPersianDigits(String(result.accepted))} هنرجو ثبت شد`,
      );
      onOpenChange(false);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  const pending = isSubmitting || importAction.isMutating;
  const error = importAction.error ? apiErrorMessage(importAction.error) : "";

  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="ورود از فدراسیون" description="هنرجویان مربی از سامانه فدراسیون ثبت می شوند">
      <div className="no-scrollbar -mx-1.5 -mb-1.5 mt-3 flex max-h-[68dvh] flex-col gap-3.5 overflow-y-auto px-1.5 pb-1.5">
        <Controller
          control={control}
          name="coachId"
          render={({ field }) => (
            <CoachSelectField
              id="federationImportCoach"
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              error={errors.coachId?.message}
            />
          )}
        />

        <AuthField label="شناسه نشست فدراسیون" htmlFor="federationImportSession" required error={errors.coachSessionId?.message}>
          <Controller
            control={control}
            name="coachSessionId"
            render={({ field }) => (
              <AuthInput
                id="federationImportSession"
                dir="ltr"
                maxLength={128}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
        </AuthField>

        <div className="grid grid-cols-2 gap-3">
          <AuthField label="درجه مربیگری" htmlFor="federationImportDegree" required error={errors.coachingDegree?.message}>
            <Controller
              control={control}
              name="coachingDegree"
              render={({ field }) => (
                <AuthSelect
                  id="federationImportDegree"
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  placeholder="درجه را انتخاب کنید"
                  options={COACHING_DEGREE_OPTIONS}
                  icon={Medal}
                />
              )}
            />
          </AuthField>

          <AuthField label="استان" htmlFor="federationImportProvince" optional error={errors.province?.message}>
            <Controller
              control={control}
              name="province"
              render={({ field }) => (
                <AuthSelect
                  id="federationImportProvince"
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  placeholder="پیش فرض: استان مربی"
                  options={FEDERATION_PROVINCE_OPTIONS}
                  icon={MapPin}
                />
              )}
            />
          </AuthField>
        </div>

        <AuthFormError message={error} />
      </div>

      <SheetActions className="mt-3" onSecondary={() => onOpenChange(false)} secondaryDisabled={pending}>
        <Button
          type="button"
          variant="brand"
          className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
          disabled={pending}
          onClick={() => void submit()}
        >
          {pending ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
          دریافت و ثبت هنرجویان
        </Button>
      </SheetActions>
    </SheetFrame>
  );
}
