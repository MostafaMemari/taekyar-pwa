"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, MapPin, Trash2, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ding-toaster";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthInput } from "@/components/shared/auth-input";
import { DatePicker } from "@/components/shared/date-picker";
import { SheetActions } from "@/components/shared/sheet-actions";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDeleteBeltExam, useSaveBeltExam } from "@/features/admin/hooks/use-belt-exam-mutations";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useBelts } from "@/features/coach/hooks/use-belts";
import { GENDER_META, type Gender } from "@/features/coach/lib/coach-data";
import type { BeltExamRecord } from "@/features/coach/lib/exam-api";
import { beltKeyOf } from "@/features/coach/lib/students-options";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, toLatinDigits, toPersianDigits } from "@/lib/digits";
import { toGregorianDate, toJalaliDate } from "@/lib/jalali";
import { getStudentBeltMeta } from "@/lib/student-belts";

const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
const GENDERS: Gender[] = ["MALE", "FEMALE"];

const beltExamFormSchema = z
  .object({
    name: z.string().trim().min(1, "نام آزمون را وارد کنید").max(120, "نام آزمون حداکثر ۱۲۰ نویسه است"),
    examNumber: z.string().refine((value) => Number(value) >= 1, "شماره آزمون را وارد کنید"),
    genders: z.array(z.enum(GENDERS)).min(1, "حداقل یک جنسیت را انتخاب کنید"),
    eventPlaces: z.array(z.string()).min(1, "حداقل یک محل برگزاری اضافه کنید"),
    registerDate: z.string().regex(datePattern, "تاریخ ثبت نام را انتخاب کنید"),
    eventDate: z.string().regex(datePattern, "تاریخ برگزاری را انتخاب کنید"),
    beltIds: z.array(z.string()).min(1, "حداقل یک کمربند را انتخاب کنید"),
  })
  .refine((values) => values.eventDate >= values.registerDate, { message: "تاریخ برگزاری باید بعد از ثبت نام باشد", path: ["eventDate"] });

type BeltExamFormValues = z.infer<typeof beltExamFormSchema>;
type DateField = "registerDate" | "eventDate";

const emptyBeltExamForm: BeltExamFormValues = {
  name: "",
  examNumber: "1",
  genders: [...GENDERS],
  eventPlaces: [],
  registerDate: "",
  eventDate: "",
  beltIds: [],
};

const jalaliValue = (iso: string) => toLatinDigits(toJalaliDate(iso));

const dateTitles: Record<DateField, string> = { registerDate: "ثبت نام", eventDate: "برگزاری" };

export function BeltExamSaveSheet({
  open,
  onOpenChange,
  exam,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: BeltExamRecord | null;
}) {
  const router = useRouter();
  const { data: belts } = useBelts();
  const save = useSaveBeltExam(exam?.id ?? null);
  const remove = useDeleteBeltExam();
  const [confirmDelete, setConfirmDelete] = useState(false);
  // The date pickers swap views inside this sheet instead of stacking a second sheet on top of it.
  const [picker, setPicker] = useState<DateField | null>(null);
  // Clearing picker on close re-renders the tall form mid-exit; read it from the ref while closed.
  const lastViewRef = useRef<DateField | null>(null);
  if (picker) lastViewRef.current = picker;
  const [placeDraft, setPlaceDraft] = useState("");

  const {
    control,
    reset,
    setValue,
    getValues,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BeltExamFormValues>({ resolver: zodResolver(beltExamFormSchema), defaultValues: emptyBeltExamForm });

  const filled = useRef(false);

  useEffect(() => {
    if (!open) {
      filled.current = false;
      setConfirmDelete(false);
      setPicker(null);
      setPlaceDraft("");
      return;
    }
    if (filled.current) return;

    filled.current = true;
    reset(
      exam
        ? {
            name: exam.name,
            examNumber: String(exam.examNumber),
            genders: exam.genders,
            eventPlaces: exam.eventPlaces,
            registerDate: jalaliValue(exam.registerDate),
            eventDate: jalaliValue(exam.eventDate),
            beltIds: exam.belts?.map((belt) => belt.id) ?? [],
          }
        : emptyBeltExamForm,
    );
  }, [open, exam, reset]);

  const addPlace = () => {
    const place = placeDraft.trim();
    if (!place) return;

    const current = getValues("eventPlaces");
    if (!current.includes(place)) setValue("eventPlaces", [...current, place], { shouldValidate: true });
    setPlaceDraft("");
  };

  const submit = handleSubmit(async (values) => {
    const place = placeDraft.trim();
    const eventPlaces = place && !values.eventPlaces.includes(place) ? [...values.eventPlaces, place] : values.eventPlaces;
    if (eventPlaces.length === 0) return;

    try {
      await save.trigger({
        name: values.name,
        examNumber: Number(values.examNumber),
        genders: values.genders,
        eventPlaces,
        registerDate: toGregorianDate(values.registerDate) ?? values.registerDate,
        eventDate: toGregorianDate(values.eventDate) ?? values.eventDate,
        beltIds: values.beltIds,
      });
      toast.success(exam ? "آزمون ذخیره شد" : "آزمون ثبت شد");
      onOpenChange(false);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  const applyDelete = async () => {
    if (!exam) return;

    try {
      await remove.trigger(exam.id);
      toast.success("آزمون حذف شد");
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
      title={view ? `انتخاب ${dateTitles[view]}` : confirmDelete ? "حذف آزمون" : exam ? "ویرایش آزمون" : "ثبت آزمون کمربند"}
      description={
        view
          ? "روز، ماه و سال را با کشیدن ستون ها انتخاب کنید"
          : confirmDelete
            ? "تایید حذف آزمون"
            : "دوره، جنسیت، محل و بازه کمربندهای آزمون را ثبت کنید"
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
            fromYear={1400}
            toYear={1450}
          />
        </div>
      ) : confirmDelete && exam ? (
        <div key="delete" className="animate-in fade-in duration-200">
          <p className="mt-3 rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
            آزمونی که هنرجویی در آن ثبت نام کرده باشد حذف نمی شود
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
              حذف آزمون
            </Button>
          </SheetActions>
        </div>
      ) : (
        <>
          <div className="no-scrollbar -mx-1.5 -mb-1.5 mt-3 flex max-h-[68dvh] flex-col gap-4 overflow-y-auto px-1.5 pb-1.5">
            <div className="grid grid-cols-12 gap-3">
              <AuthField className="col-span-9" label="نام آزمون" htmlFor="beltExamAdminName" required error={errors.name?.message}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <AuthInput
                      id="beltExamAdminName"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      maxLength={120}
                    />
                  )}
                />
              </AuthField>

              <AuthField
                className="col-span-3"
                label="شماره دوره"
                htmlFor="beltExamAdminNumber"
                required
                error={errors.examNumber?.message}
              >
                <Controller
                  control={control}
                  name="examNumber"
                  render={({ field }) => (
                    <AuthInput
                      id="beltExamAdminNumber"
                      inputMode="numeric"
                      dir="ltr"
                      maxLength={3}
                      placeholder={toPersianDigits("1")}
                      value={toPersianDigits(field.value)}
                      onChange={(event) => field.onChange(digitsOnly(event.target.value, 3))}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  )}
                />
              </AuthField>
            </div>

            <AuthField label="محل برگزاری" htmlFor="beltExamAdminPlace" required error={errors.eventPlaces?.message}>
              <Controller
                control={control}
                name="eventPlaces"
                render={({ field }) => (
                  <InputGroup className="h-auto min-h-12 flex-wrap gap-1.5 rounded-xl py-2 ps-3.5 pe-2">
                    <InputGroupAddon className="ps-0 pe-0 text-ink-subtle transition-colors group-focus-within/input-group:text-ring">
                      <MapPin aria-hidden="true" />
                    </InputGroupAddon>

                    {field.value.map((place) => (
                      <Badge
                        key={place}
                        variant="outline"
                        render={
                          <button
                            type="button"
                            aria-label={`حذف ${place}`}
                            onClick={() => field.onChange(field.value.filter((item) => item !== place))}
                          />
                        }
                        className="h-8 gap-1 rounded-lg border-border bg-background px-2 text-[12px] font-bold text-ink-body hover:text-danger"
                      >
                        {place}
                        <X className="size-3.5" aria-hidden="true" />
                      </Badge>
                    ))}

                    <InputGroupInput
                      id="beltExamAdminPlace"
                      value={placeDraft}
                      placeholder={field.value.length ? "شهر بعدی" : "شهر را بنویسید و Enter بزنید"}
                      onChange={(event) => setPlaceDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        addPlace();
                      }}
                      className="h-8 min-w-24 flex-1 px-1 text-start text-sm"
                    />
                  </InputGroup>
                )}
              />
            </AuthField>

            <AuthField label="جنسیت" required error={errors.genders?.message}>
              <Controller
                control={control}
                name="genders"
                render={({ field }) => (
                  <ToggleGroup
                    multiple
                    value={field.value}
                    onValueChange={(next) => field.onChange(next as Gender[])}
                    variant="outline"
                    size="sm"
                    spacing={1.5}
                    className="grid w-full grid-cols-2"
                    aria-label="جنسیت آزمون"
                  >
                    {GENDERS.map((gender) => (
                      <ToggleGroupItem
                        key={gender}
                        value={gender}
                        className="h-10 gap-1.5 rounded-xl text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                      >
                        <Users className="size-3.5" aria-hidden="true" />
                        {GENDER_META[gender].clubLabel}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
              />
            </AuthField>

            <div className="grid grid-cols-2 gap-3">
              <AuthField label="تاریخ ثبت نام" htmlFor="beltExamAdminRegister" required error={errors.registerDate?.message}>
                <Controller
                  control={control}
                  name="registerDate"
                  render={({ field }) => (
                    <DatePicker
                      id="beltExamAdminRegister"
                      title="ثبت نام"
                      value={field.value}
                      onChange={field.onChange}
                      onOpenRequest={() => setPicker("registerDate")}
                      fromYear={1400}
                      toYear={1450}
                    />
                  )}
                />
              </AuthField>

              <AuthField label="تاریخ برگزاری" htmlFor="beltExamAdminEvent" required error={errors.eventDate?.message}>
                <Controller
                  control={control}
                  name="eventDate"
                  render={({ field }) => (
                    <DatePicker
                      id="beltExamAdminEvent"
                      title="برگزاری"
                      value={field.value}
                      onChange={field.onChange}
                      onOpenRequest={() => setPicker("eventDate")}
                      fromYear={1400}
                      toYear={1450}
                    />
                  )}
                />
              </AuthField>
            </div>

            <AuthField label="کمربندهای آزمون" required error={errors.beltIds?.message}>
              <Controller
                control={control}
                name="beltIds"
                render={({ field }) => (
                  <ToggleGroup
                    multiple
                    value={field.value}
                    onValueChange={field.onChange}
                    variant="outline"
                    spacing={2}
                    className="grid w-full grid-cols-3 gap-2 [&>*:last-child:nth-child(3n+1)]:col-start-2"
                    aria-label="کمربندهای آزمون"
                  >
                    {(belts ?? []).map((belt) => {
                      const meta = getStudentBeltMeta(beltKeyOf(belt.name));

                      return (
                        <ToggleGroupItem
                          key={belt.id}
                          value={belt.id}
                          className="relative h-auto min-w-0 flex-col gap-1.5 rounded-xl border-border bg-field px-3 pt-7 pb-3 text-[12px] font-bold whitespace-normal aria-pressed:border-primary aria-pressed:bg-primary/5 aria-pressed:text-primary"
                        >
                          <span className="absolute start-2 top-2 grid size-4 place-items-center rounded-full border border-border text-transparent group-aria-pressed/toggle:border-primary group-aria-pressed/toggle:bg-primary group-aria-pressed/toggle:text-primary-foreground">
                            <Check className="size-3" aria-hidden="true" />
                          </span>
                          <BeltStrip
                            color={meta.color}
                            bottomColor={meta.bottomColor}
                            outline={meta.outline}
                            stripes={meta.stripeCount}
                            stretch
                            className="h-8 w-full"
                          />
                          <span className="w-full truncate">{meta.label}</span>
                        </ToggleGroupItem>
                      );
                    })}
                  </ToggleGroup>
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
              {exam ? "ذخیره تغییرات" : "ثبت آزمون"}
            </Button>
            {exam ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="حذف آزمون"
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
