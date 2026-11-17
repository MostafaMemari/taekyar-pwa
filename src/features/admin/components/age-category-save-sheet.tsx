"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ding-toaster";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthSelect } from "@/components/shared/auth-select";
import { DatePicker } from "@/components/shared/date-picker";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { useDeleteAgeCategory, useSaveAgeCategory } from "@/features/admin/hooks/use-age-category-mutations";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import type { AgeCategoryRecord } from "@/features/coach/lib/student-api";
import { AGE_CATEGORY_LABELS, AGE_CATEGORY_NAMES } from "@/features/coach/lib/students-options";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toLatinDigits } from "@/lib/digits";
import { toGregorianDate, toJalaliDate } from "@/lib/jalali";

const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;

const nameOptions = AGE_CATEGORY_NAMES.map((name) => ({ value: name, label: AGE_CATEGORY_LABELS[name] }));

const ageCategoryFormSchema = z
  .object({
    name: z.enum(AGE_CATEGORY_NAMES),
    startDate: z.string().regex(datePattern, "تاریخ شروع را انتخاب کنید"),
    endDate: z.string().regex(datePattern, "تاریخ پایان را انتخاب کنید"),
  })
  .refine((values) => values.endDate >= values.startDate, { message: "تاریخ پایان باید بعد از شروع باشد", path: ["endDate"] });

type AgeCategoryFormValues = z.infer<typeof ageCategoryFormSchema>;
type DateField = "startDate" | "endDate";

const emptyAgeCategoryForm: AgeCategoryFormValues = { name: "BLOSSOM", startDate: "", endDate: "" };

const jalaliValue = (iso: string) => toLatinDigits(toJalaliDate(iso));

const dateTitles: Record<DateField, string> = { startDate: "شروع بازه", endDate: "پایان بازه" };

export function AgeCategorySaveSheet({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: AgeCategoryRecord | null;
}) {
  const router = useRouter();
  const save = useSaveAgeCategory(category?.id ?? null);
  const remove = useDeleteAgeCategory();
  const [confirmDelete, setConfirmDelete] = useState(false);
  // The date pickers swap views inside this sheet instead of stacking a second sheet on top of it.
  const [picker, setPicker] = useState<DateField | null>(null);
  // Clearing picker on close re-renders the tall form mid-exit; read it from the ref while closed.
  const lastViewRef = useRef<DateField | null>(null);
  if (picker) lastViewRef.current = picker;

  const {
    control,
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AgeCategoryFormValues>({ resolver: zodResolver(ageCategoryFormSchema), defaultValues: emptyAgeCategoryForm });

  const filled = useRef(false);

  useEffect(() => {
    if (!open) {
      filled.current = false;
      setConfirmDelete(false);
      setPicker(null);
      return;
    }
    if (filled.current) return;

    filled.current = true;
    reset(
      category
        ? {
            name: category.name as AgeCategoryFormValues["name"],
            startDate: jalaliValue(category.startDate),
            endDate: jalaliValue(category.endDate),
          }
        : emptyAgeCategoryForm,
    );
  }, [open, category, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await save.trigger({
        name: values.name,
        startDate: toGregorianDate(values.startDate) ?? values.startDate,
        endDate: toGregorianDate(values.endDate) ?? values.endDate,
      });
      toast.success(category ? "رده سنی ذخیره شد" : "رده سنی ثبت شد");
      onOpenChange(false);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  const applyDelete = async () => {
    if (!category) return;

    try {
      await remove.trigger(category.id);
      toast.success("رده سنی حذف شد");
      onOpenChange(false);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  const deletePending = remove.isMutating;
  const deleteError = remove.error ? apiErrorMessage(remove.error) : "";
  const view = open ? picker : lastViewRef.current;

  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      onBack={view ? () => setPicker(null) : confirmDelete ? () => setConfirmDelete(false) : undefined}
      title={view ? `انتخاب ${dateTitles[view]}` : confirmDelete ? "حذف رده سنی" : category ? "ویرایش رده سنی" : "ثبت رده سنی"}
      description={
        view
          ? "روز، ماه و سال را با کشیدن ستون ها انتخاب کنید"
          : confirmDelete
            ? "تایید حذف رده سنی"
            : "نام و بازه تاریخ تولد هر رده را ثبت کنید"
      }
    >
      {view ? (
        <div key={view} className="animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
          <DatePicker
            embedded
            title={dateTitles[view]}
            value={watch(view)}
            onChange={(value) => setValue(view, value, { shouldValidate: true })}
            onDone={() => setPicker(null)}
            onCancel={() => setPicker(null)}
            fromYear={1300}
            toYear={1450}
          />
        </div>
      ) : confirmDelete && category ? (
        <div key="delete" className="animate-in fade-in duration-200">
          <p className="mt-3 rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
            رده ای که به هنرجویی تعلق گرفته باشد حذف نمی شود
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
              حذف رده سنی
            </Button>
          </SheetActions>
        </div>
      ) : (
        <>
          <div className="no-scrollbar -mx-1.5 -mb-1.5 mt-3 flex max-h-[68dvh] flex-col gap-3.5 overflow-y-auto px-1.5 pb-1.5">
            <AuthField label="رده سنی" htmlFor="ageCategoryAdminName" required error={errors.name?.message}>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <AuthSelect
                    id="ageCategoryAdminName"
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? emptyAgeCategoryForm.name)}
                    placeholder="رده را انتخاب کنید"
                    options={nameOptions}
                    icon={CalendarRange}
                    placeholderAsOption={false}
                  />
                )}
              />
            </AuthField>

            <div className="grid grid-cols-2 gap-3">
              <AuthField label="از تاریخ تولد" htmlFor="ageCategoryAdminStart" required error={errors.startDate?.message}>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DatePicker
                      id="ageCategoryAdminStart"
                      title="شروع بازه"
                      value={field.value}
                      onChange={field.onChange}
                      onOpenRequest={() => setPicker("startDate")}
                      fromYear={1300}
                      toYear={1450}
                    />
                  )}
                />
              </AuthField>

              <AuthField label="تا تاریخ تولد" htmlFor="ageCategoryAdminEnd" required error={errors.endDate?.message}>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DatePicker
                      id="ageCategoryAdminEnd"
                      title="پایان بازه"
                      value={field.value}
                      onChange={field.onChange}
                      onOpenRequest={() => setPicker("endDate")}
                      fromYear={1300}
                      toYear={1450}
                    />
                  )}
                />
              </AuthField>
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
              {category ? "ذخیره تغییرات" : "ثبت رده سنی"}
            </Button>
            {category ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="حذف رده سنی"
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
