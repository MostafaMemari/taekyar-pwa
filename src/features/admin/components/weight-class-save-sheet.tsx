"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Scale, Trash2 } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDeleteWeightClass, useSaveWeightClass } from "@/features/admin/hooks/use-weight-class-mutations";
import type { WeightClassRecord } from "@/features/admin/lib/admin-api";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useAgeCategories } from "@/features/coach/hooks/use-age-categories";
import type { AgeCategoryRecord } from "@/features/coach/lib/student-api";
import { AGE_CATEGORY_LABELS, type AgeCategoryName } from "@/features/coach/lib/students-options";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { decimalOnly, digitsOnly, toLatinDigits, toPersianDigits } from "@/lib/digits";

const weightClassFormSchema = z
  .object({
    ageCategoryId: z.string().min(1, "رده سنی را انتخاب کنید"),
    gender: z.enum(["MALE", "FEMALE"]),
    label: z.string().trim().min(1, "عنوان رده را بنویسید").max(30, "عنوان رده بیش از حد طولانی است"),
    minWeight: z
      .string()
      .regex(/^\d{1,2}(\.\d{1,3})?$/, "وزن را با عدد وارد کنید")
      .refine((value) => Number(value) > 0, "وزن باید بزرگتر از صفر باشد"),
    maxWeight: z.string().regex(/^$|^\d{1,2}(\.\d{1,3})?$/, "وزن را با عدد وارد کنید"),
    order: z.string().regex(/^\d{1,2}$/, "ترتیب را با عدد وارد کنید"),
    excludeMin: z.boolean(),
    excludeMax: z.boolean(),
  })
  .refine((values) => !values.maxWeight || Number(values.maxWeight) > Number(values.minWeight), {
    message: "وزن پایان باید بیشتر از وزن شروع باشد",
    path: ["maxWeight"],
  });

type WeightClassFormValues = z.infer<typeof weightClassFormSchema>;

// Taekwondo convention: the lower bound counts, the upper bound is the next class's territory.
const emptyWeightClassForm: WeightClassFormValues = {
  ageCategoryId: "",
  gender: "MALE",
  label: "",
  minWeight: "",
  maxWeight: "",
  order: "",
  excludeMin: false,
  excludeMax: true,
};

const GENDER_OPTIONS = [
  { value: "MALE", label: "آقایان" },
  { value: "FEMALE", label: "بانوان" },
] as const;

// Whether the athlete standing exactly on the boundary weight belongs to this class or the next one.
const START_BOUNDARY_OPTIONS = [
  { value: "in", label: "از همین وزن" },
  { value: "out", label: "بعد از این وزن" },
] as const;

const END_BOUNDARY_OPTIONS = [
  { value: "in", label: "تا همین وزن" },
  { value: "out", label: "قبل از این وزن" },
] as const;

export function WeightClassSaveSheet({
  open,
  onOpenChange,
  weightClass,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weightClass: WeightClassRecord | null;
}) {
  const router = useRouter();
  const save = useSaveWeightClass(weightClass?.id ?? null);
  const remove = useDeleteWeightClass();
  const { data: categories } = useAgeCategories();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const filled = useRef(false);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WeightClassFormValues>({ resolver: zodResolver(weightClassFormSchema), defaultValues: emptyWeightClassForm });

  useEffect(() => {
    if (!open) {
      filled.current = false;
      setConfirmDelete(false);
      return;
    }
    if (filled.current) return;

    filled.current = true;
    reset(
      weightClass
        ? {
            ageCategoryId: weightClass.ageCategoryId,
            gender: weightClass.gender,
            label: weightClass.label,
            minWeight: weightClass.minWeightKg,
            maxWeight: weightClass.maxWeightKg ?? "",
            order: String(weightClass.order),
            excludeMin: weightClass.excludeMin,
            excludeMax: weightClass.excludeMax,
          }
        : emptyWeightClassForm,
    );
  }, [open, weightClass, reset]);

  const categoryOptions = (categories ?? []).map((category: AgeCategoryRecord) => ({
    value: category.id,
    label: AGE_CATEGORY_LABELS[category.name as AgeCategoryName] ?? category.name,
  }));

  const submit = handleSubmit(async (values) => {
    try {
      await save.trigger({
        ageCategoryId: values.ageCategoryId,
        gender: values.gender,
        label: values.label.trim(),
        minWeightKg: Number(values.minWeight),
        maxWeightKg: values.maxWeight ? Number(values.maxWeight) : null,
        order: Number(values.order),
        excludeMin: values.excludeMin,
        excludeMax: values.excludeMax,
      });
      toast.success(weightClass ? "رده وزنی ذخیره شد" : "رده وزنی ثبت شد");
      onOpenChange(false);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  const applyDelete = async () => {
    if (!weightClass) return;

    try {
      await remove.trigger(weightClass.id);
      toast.success("رده وزنی حذف شد");
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
      title={confirmDelete ? "حذف رده وزنی" : weightClass ? "ویرایش رده وزنی" : "ثبت رده وزنی"}
      description={confirmDelete ? "تایید حذف رده وزنی" : "رده سنی، جنسیت و بازه وزن هر رده را ثبت کنید"}
    >
      {confirmDelete && weightClass ? (
        <div key="delete" className="animate-in fade-in duration-200">
          <p className="mt-3 rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
            با حذف این رده، محاسبه خودکار وزن برای آن دیگر انجام نمی شود
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
              حذف رده وزنی
            </Button>
          </SheetActions>
        </div>
      ) : (
        <>
          <div className="no-scrollbar -mx-1.5 -mb-1.5 mt-3 flex max-h-[68dvh] flex-col gap-3.5 overflow-y-auto px-1.5 pb-1.5">
            <AuthField label="رده سنی" htmlFor="weightClassAdminAge" required error={errors.ageCategoryId?.message}>
              <Controller
                control={control}
                name="ageCategoryId"
                render={({ field }) => (
                  <AuthSelect
                    id="weightClassAdminAge"
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                    placeholder="رده سنی را انتخاب کنید"
                    options={categoryOptions}
                    icon={Scale}
                  />
                )}
              />
            </AuthField>

            <AuthField label="جنسیت" htmlFor="weightClassAdminGender" required>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <ToggleGroup
                    aria-label="جنسیت"
                    value={[field.value]}
                    onValueChange={(next) => {
                      const selected = next[0];
                      if (selected) field.onChange(selected);
                    }}
                    variant="segmented"
                    spacing={1}
                    className="w-full rounded-full bg-muted p-1"
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        className="h-9 flex-1 rounded-full text-[12px] font-bold aria-pressed:bg-brand-600 aria-pressed:text-white"
                      >
                        {option.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
              />
            </AuthField>

            <AuthField label="عنوان رده" htmlFor="weightClassAdminLabel" required error={errors.label?.message}>
              <Controller
                control={control}
                name="label"
                render={({ field }) => (
                  <AuthInput
                    id="weightClassAdminLabel"
                    dir="ltr"
                    maxLength={30}
                    placeholder={toPersianDigits("-58kg")}
                    value={toPersianDigits(field.value)}
                    onChange={(event) => field.onChange(toLatinDigits(event.target.value))}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </AuthField>

            <div className="grid grid-cols-2 gap-3">
              <AuthField label="وزن شروع (کیلوگرم)" htmlFor="weightClassAdminMin" required error={errors.minWeight?.message}>
                <Controller
                  control={control}
                  name="minWeight"
                  render={({ field }) => (
                    <AuthInput
                      id="weightClassAdminMin"
                      dir="ltr"
                      inputMode="decimal"
                      placeholder="۴۸٫۵"
                      value={toPersianDigits(field.value)}
                      onChange={(event) => field.onChange(decimalOnly(event.target.value, 2, 3))}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  )}
                />
              </AuthField>

              <AuthField label="وزن پایان (کیلوگرم)" htmlFor="weightClassAdminMax" optional error={errors.maxWeight?.message}>
                <Controller
                  control={control}
                  name="maxWeight"
                  render={({ field }) => (
                    <AuthInput
                      id="weightClassAdminMax"
                      dir="ltr"
                      inputMode="decimal"
                      placeholder="۵۲"
                      value={toPersianDigits(field.value)}
                      onChange={(event) => field.onChange(decimalOnly(event.target.value, 2, 3))}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  )}
                />
              </AuthField>
            </div>

            <AuthField label="ترتیب" htmlFor="weightClassAdminOrder" required error={errors.order?.message}>
              <Controller
                control={control}
                name="order"
                render={({ field }) => (
                  <AuthInput
                    id="weightClassAdminOrder"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={2}
                    value={toPersianDigits(field.value)}
                    onChange={(event) => field.onChange(digitsOnly(event.target.value, 2))}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </AuthField>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="excludeMin"
                render={({ field }) => (
                  <ToggleGroup
                    aria-label="مرز شروع"
                    value={[field.value ? "out" : "in"]}
                    onValueChange={(next) => {
                      const selected = next[0];
                      if (selected) field.onChange(selected === "out");
                    }}
                    variant="segmented"
                    spacing={1}
                    className="w-full rounded-full bg-muted p-1"
                  >
                    {START_BOUNDARY_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        className="h-8 flex-1 rounded-full text-[11px] font-bold aria-pressed:bg-brand-600 aria-pressed:text-white"
                      >
                        {option.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
              />

              <Controller
                control={control}
                name="excludeMax"
                render={({ field }) => (
                  <ToggleGroup
                    aria-label="مرز پایان"
                    value={[field.value ? "out" : "in"]}
                    onValueChange={(next) => {
                      const selected = next[0];
                      if (selected) field.onChange(selected === "out");
                    }}
                    variant="segmented"
                    spacing={1}
                    className="w-full rounded-full bg-muted p-1"
                  >
                    {END_BOUNDARY_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        className="h-8 flex-1 rounded-full text-[11px] font-bold aria-pressed:bg-brand-600 aria-pressed:text-white"
                      >
                        {option.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
              />
            </div>

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
              {weightClass ? "ذخیره تغییرات" : "ثبت رده وزنی"}
            </Button>
            {weightClass ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="حذف رده وزنی"
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
