"use client";

import { Check, Copy, Ruler, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthInput } from "@/components/shared/auth-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useAgeCategories } from "@/features/coach/hooks/use-age-categories";
import { useAddStudentMetrics } from "@/features/coach/hooks/use-student-mutations";
import { useWeightClassSuggestion } from "@/features/coach/hooks/use-weight-class";
import { GENDER_META } from "@/features/coach/lib/coach-data";
import type { AgeCategoryRecord, StudentDetailRecord } from "@/features/coach/lib/student-api";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { PROVINCES } from "@/lib/provinces";

const NOT_SET = "ثبت نشده";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 border-b border-[var(--line-2)] px-4 last:border-b-0">
      <dt className="shrink-0 text-[12px] font-medium text-ink-muted">{label}</dt>
      <dd className="min-w-0 truncate text-[13px] font-bold text-ink">{children}</dd>
    </div>
  );
}

function NationalCodeRow({ nationalCode }: { nationalCode: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(nationalCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (insecure context); nothing to recover
    }
  };

  return (
    <InfoRow label="کد ملی">
      <span className="inline-flex items-center gap-1.5">
        {toPersianDigits(nationalCode)}
        <button
          type="button"
          aria-label="کپی کد ملی"
          onClick={() => void copy()}
          className="grid size-6 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-muted hover:text-ink"
        >
          {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
        </button>
      </span>
    </InfoRow>
  );
}

function PhoneRow({ label, value }: { label: string; value: string | null }) {
  return (
    <InfoRow label={label}>
      {value ? (
        <a href={`tel:${value}`} dir="ltr" className="text-accent-ink underline-offset-4 hover:underline">
          {toPersianDigits(value)}
        </a>
      ) : (
        NOT_SET
      )}
    </InfoRow>
  );
}

function nextDayIso(iso: string) {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

// Same bounds the backend uses to place a student in an age category: birthDate >= startDate && < endDate + 1 day.
function ageCategoryForBirthDate(birthDate: string | null, categories: AgeCategoryRecord[]) {
  if (!birthDate) return null;
  const day = birthDate.slice(0, 10);
  return categories.find((category) => day >= category.startDate.slice(0, 10) && day < nextDayIso(category.endDate)) ?? null;
}

function StudentWeightClassRow({ student }: { student: StudentDetailRecord }) {
  const { data: categories } = useAgeCategories();
  const category = ageCategoryForBirthDate(student.birthDate, categories ?? []);
  const weightKg = student.weight ? Number(student.weight) : null;
  const ready = category !== null && weightKg !== null && weightKg > 0;
  const { data: suggestion, error } = useWeightClassSuggestion(
    ready ? { ageCategoryId: category.id, gender: student.gender, weightKg } : null,
  );

  let value: ReactNode = NOT_SET;
  if (ready) {
    if (error) value = <span className="text-ink-subtle">در دسترس نیست</span>;
    else if (!suggestion) value = <Skeleton className="h-4 w-20" />;
    else value = suggestion.weightClass.label;
  }

  return <InfoRow label="رده وزنی پیشنهادی">{value}</InfoRow>;
}

export function StudentSpecsPanel({ student }: { student: StudentDetailRecord }) {
  const router = useRouter();
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [saved, setSaved] = useState(false);
  const metrics = useAddStudentMetrics();

  const openMetrics = () => {
    setHeight("");
    setWeight("");
    setHeightError("");
    setWeightError("");
    setSaved(false);
    setMetricsOpen(true);
  };

  const submitMetrics = async () => {
    const heightProblem =
      height === "" ? "قد را وارد کنید." : Number(height) < 50 || Number(height) > 260 ? "قد باید بین ۵۰ تا ۲۶۰ سانتی متر باشد." : "";
    const weightProblem =
      weight === "" ? "وزن را وارد کنید." : Number(weight) < 10 || Number(weight) > 300 ? "وزن باید بین ۱۰ تا ۳۰۰ کیلوگرم باشد." : "";
    setHeightError(heightProblem);
    setWeightError(weightProblem);
    if (heightProblem || weightProblem) return;

    try {
      await metrics.trigger({ id: student.id, height: Number(height), weight: Number(weight) });
      setMetricsOpen(false);
      setSaved(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  const dimensions =
    student.height && student.weight
      ? `${toPersianDigits(student.height)} سانتی متر · ${toPersianDigits(student.weight)} کیلوگرم`
      : NOT_SET;
  const province = PROVINCES.find((option) => option.value === student.province)?.label ?? student.province ?? NOT_SET;

  return (
    <div className="flex flex-col gap-4">
      <section>
        <SectionHeading title="شناسنامه" />
        <Card className="gap-0 py-1">
          <NationalCodeRow nationalCode={student.nationalCode} />
          <InfoRow label="تاریخ تولد">{student.birthDate ? toJalaliDate(student.birthDate) : NOT_SET}</InfoRow>
          <InfoRow label="جنسیت">{GENDER_META[student.gender].label}</InfoRow>
          <InfoRow label="استان">{province}</InfoRow>
        </Card>
      </section>

      <section>
        <SectionHeading title="تماس" />
        <Card className="gap-0 py-1">
          <PhoneRow label="شماره تماس" value={student.phoneNumber} />
          <PhoneRow label="تلفن ثابت" value={student.landlineNumber} />
          <InfoRow label="نام پدر">{student.fatherName || NOT_SET}</InfoRow>
        </Card>
      </section>

      <section>
        <SectionHeading
          title="پرونده"
          action={
            <Button type="button" variant="outline" size="sm" className="rounded-lg text-[11px] font-bold" onClick={openMetrics}>
              ثبت اندازه گیری
            </Button>
          }
        />
        <Card className="gap-0 py-1">
          <InfoRow label="قد / وزن">{dimensions}</InfoRow>
          <StudentWeightClassRow student={student} />
          <InfoRow label="انقضای عکس پرونده">{student.expireImageDate ? toJalaliDate(student.expireImageDate) : NOT_SET}</InfoRow>
          <InfoRow label="تاریخ ثبت پرونده">{toJalaliDate(student.createdAt)}</InfoRow>
        </Card>
        {saved ? <p className="mt-2 text-[12px] font-bold text-success">اندازه گیری جدید ثبت شد.</p> : null}
      </section>

      <SheetFrame
        open={metricsOpen}
        onOpenChange={setMetricsOpen}
        title="ثبت اندازه گیری"
        description="قد و وزن جدید به سابقه اندازه گیری ها اضافه می شود."
      >
        <div className="grid grid-cols-2 gap-3">
          <AuthField label="قد (سانتی متر)" htmlFor="metricHeight" required error={heightError}>
            <AuthInput
              id="metricHeight"
              dir="ltr"
              inputMode="numeric"
              maxLength={3}
              icon={Ruler}
              placeholder={toPersianDigits("170")}
              value={toPersianDigits(height)}
              onChange={(event) => {
                setHeight(digitsOnly(event.target.value, 3));
                setHeightError("");
              }}
            />
          </AuthField>

          <AuthField label="وزن (کیلوگرم)" htmlFor="metricWeight" required error={weightError}>
            <AuthInput
              id="metricWeight"
              dir="ltr"
              inputMode="numeric"
              maxLength={3}
              icon={Scale}
              placeholder={toPersianDigits("60")}
              value={toPersianDigits(weight)}
              onChange={(event) => {
                setWeight(digitsOnly(event.target.value, 3));
                setWeightError("");
              }}
            />
          </AuthField>
        </div>

        <AuthFormError message={metrics.error ? apiErrorMessage(metrics.error) : ""} />

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setMetricsOpen(false)}>
            انصراف
          </Button>
          <Button
            variant="brand"
            className="h-11 flex-[2] rounded-xl text-[12px] font-semibold"
            disabled={metrics.isMutating}
            onClick={() => void submitMetrics()}
          >
            {metrics.isMutating ? "در حال ثبت..." : "ثبت اندازه گیری"}
          </Button>
        </div>
      </SheetFrame>
    </div>
  );
}
