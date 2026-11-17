"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Award, CalendarRange, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ding-toaster";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthInput } from "@/components/shared/auth-input";
import { AuthSelect } from "@/components/shared/auth-select";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { useDeleteBelt, useSaveBelt } from "@/features/admin/hooks/use-belt-mutations";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import type { BeltRecord } from "@/features/coach/lib/student-api";
import { BELT_API_NAMES, beltKeyOf } from "@/features/coach/lib/students-options";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { studentBeltLabel } from "@/lib/student-belts";

const DURATION_MONTHS = [0, 2, 3, 4, 6, 9, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120];

const beltOptions = BELT_API_NAMES.map((name) => ({ value: name, label: studentBeltLabel(beltKeyOf(name)) }));
const durationOptions = DURATION_MONTHS.map((months) => ({
  value: String(months),
  label: months === 0 ? "بدون بازه" : `${toPersianDigits(String(months))} ماه`,
}));

const beltFormSchema = z.object({
  name: z.enum(BELT_API_NAMES),
  level: z
    .string()
    .min(1, "سطح را وارد کنید")
    .refine((value) => Number(value) >= 1 && Number(value) <= 15, "سطح بین ۱ تا ۱۵ است"),
  durationMonth: z.string(),
});

type BeltFormValues = z.infer<typeof beltFormSchema>;

const emptyBeltForm: BeltFormValues = { name: "WHITE", level: "1", durationMonth: "0" };

export function BeltSaveSheet({
  open,
  onOpenChange,
  belt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  belt: BeltRecord | null;
}) {
  const router = useRouter();
  const save = useSaveBelt(belt?.id ?? null);
  const remove = useDeleteBelt();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BeltFormValues>({ resolver: zodResolver(beltFormSchema), defaultValues: emptyBeltForm });

  const filled = useRef(false);

  useEffect(() => {
    if (!open) {
      filled.current = false;
      setConfirmDelete(false);
      return;
    }
    if (filled.current) return;

    filled.current = true;
    reset(
      belt
        ? { name: belt.name as BeltFormValues["name"], level: String(belt.level), durationMonth: String(belt.durationMonth ?? 0) }
        : emptyBeltForm,
    );
  }, [open, belt, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await save.trigger({ name: values.name, level: Number(values.level), durationMonth: Number(values.durationMonth) });
      toast.success(belt ? "کمربند ذخیره شد" : "کمربند ثبت شد");
      onOpenChange(false);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  const applyDelete = async () => {
    if (!belt) return;

    try {
      await remove.trigger(belt.id);
      toast.success("کمربند حذف شد");
      onOpenChange(false);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  const deletePending = remove.isMutating;
  const deleteError = remove.error ? apiErrorMessage(remove.error) : "";

  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      onBack={confirmDelete ? () => setConfirmDelete(false) : undefined}
      title={confirmDelete ? "حذف کمربند" : belt ? "ویرایش کمربند" : "ثبت کمربند"}
      description={confirmDelete ? "تایید حذف کمربند" : "نام، سطح و بازه اعطای کمربند را ثبت کنید"}
    >
      {confirmDelete && belt ? (
        <div key="delete" className="animate-in fade-in duration-200">
          <p className="mt-3 rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
            کمربندی که به هنرجویی تعلق گرفته باشد حذف نمی شود
          </p>

          {deleteError ? <p className="pt-2 text-[12px] font-bold leading-5 text-danger">{deleteError}</p> : null}

          <SheetActions className="mt-3" onSecondary={() => setConfirmDelete(false)} secondaryDisabled={deletePending}>
            <Button
              type="button"
              variant="destructive"
              className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
              disabled={deletePending}
              onClick={() => void applyDelete()}
            >
              {deletePending ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
              حذف کمربند
            </Button>
          </SheetActions>
        </div>
      ) : (
        <>
          <div className="no-scrollbar -mx-1.5 -mb-1.5 mt-3 flex max-h-[68dvh] flex-col gap-3.5 overflow-y-auto px-1.5 pb-1.5">
            <AuthField label="کمربند" htmlFor="beltAdminName" required error={errors.name?.message}>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <AuthSelect
                    id="beltAdminName"
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? emptyBeltForm.name)}
                    placeholder="کمربند را انتخاب کنید"
                    options={beltOptions}
                    icon={Award}
                    placeholderAsOption={false}
                  />
                )}
              />
            </AuthField>

            <AuthField label="سطح" htmlFor="beltAdminLevel" required error={errors.level?.message}>
              <Controller
                control={control}
                name="level"
                render={({ field }) => (
                  <AuthInput
                    id="beltAdminLevel"
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={2}
                    placeholder={toPersianDigits("1")}
                    value={toPersianDigits(field.value)}
                    onChange={(event) => field.onChange(digitsOnly(event.target.value, 2))}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </AuthField>

            <AuthField label="بازه اعطا" htmlFor="beltAdminDuration" required error={errors.durationMonth?.message}>
              <Controller
                control={control}
                name="durationMonth"
                render={({ field }) => (
                  <AuthSelect
                    id="beltAdminDuration"
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "0")}
                    placeholder="بازه را انتخاب کنید"
                    options={durationOptions}
                    icon={CalendarRange}
                    placeholderAsOption={false}
                  />
                )}
              />
            </AuthField>

            <AuthFormError message={save.error ? apiErrorMessage(save.error) : ""} />
          </div>

          <SheetActions className="mt-3" onSecondary={() => onOpenChange(false)} secondaryDisabled={isSubmitting}>
            <Button
              type="button"
              variant="brand"
              className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
              disabled={isSubmitting}
              onClick={() => void submit()}
            >
              {isSubmitting ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
              {belt ? "ذخیره تغییرات" : "ثبت کمربند"}
            </Button>
            {belt ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="حذف کمربند"
                className="size-11 shrink-0 rounded-xl text-danger hover:bg-danger-soft"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            ) : null}
          </SheetActions>
        </>
      )}
    </SheetFrame>
  );
}
