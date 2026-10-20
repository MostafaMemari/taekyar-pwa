"use client";

import { CalendarDays, Check, Info, Medal } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormDock, FormSection } from "@/components/coach/coach-form";
import { PersonAvatar } from "@/components/coach/coach-ui";
import { AuthField } from "@/components/shared/auth-field";
import { DatePicker } from "@/components/shared/date-picker";
import { Card } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { BELT_META, type BeltKey } from "@/lib/coach/coach-data";
import { BELT_ASSIGN_OPTIONS } from "@/lib/coach/student-form-options";
import type { StudentProfile } from "@/lib/coach/student-profile-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function StudentBeltForm({ profile }: { profile: StudentProfile }) {
  const router = useRouter();
  const [belt, setBelt] = useState<BeltKey>(profile.belt);
  const [date, setDate] = useState(profile.beltDate);
  const [note, setNote] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/coach/students/${profile.id}`);
  };

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <Card className="flex-row items-center gap-3 p-3">
        <PersonAvatar name={profile.name} className="size-12" fallbackClassName="text-base" />
        <div className="min-w-0 flex-1">
          <b className="block truncate text-[14px] font-extrabold text-ink">{profile.name}</b>
          <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-ink-subtle">
            <span>کد ملی {toPersianDigits(profile.nationalCode)}</span>
            <span className="text-ink-faint" aria-hidden="true">
              •
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full ring-2 ring-black/5"
                style={{ backgroundColor: BELT_META[profile.belt].color }}
                aria-hidden="true"
              />
              کمربند فعلی: {BELT_META[profile.belt].label}
              {profile.dan ? ` دان ${toPersianDigits(String(profile.dan))}` : null}
            </span>
          </span>
        </div>
      </Card>

      <FormSection icon={Medal} title="انتخاب کمربند" tone="amber">
        <p className="-mt-2 text-start text-[11px] font-medium leading-5 text-ink-muted">
          کمربند بعدی هنرجو را از میان کمربندهای رنگی انتخاب کنید.
        </p>

        <RadioGroup aria-label="انتخاب کمربند" value={belt} onValueChange={(value) => setBelt(value as BeltKey)} className="gap-2">
          {BELT_ASSIGN_OPTIONS.map((option) => {
            const selected = belt === option.value;

            return (
              <FieldLabel
                key={option.value}
                htmlFor={`belt-${option.value}`}
                onClick={() => setBelt(option.value)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                  selected ? "border-primary/35 bg-brand-50/60" : "border-border bg-field hover:bg-muted/50",
                )}
              >
                <RadioGroupItem id={`belt-${option.value}`} value={option.value} className="shrink-0" />
                <span
                  className="size-3.5 shrink-0 rounded-full ring-2 ring-black/5"
                  style={{ backgroundColor: BELT_META[option.value].color }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <b className="block text-[13px] font-bold text-ink">{option.label}</b>
                  <span className="mt-0.5 block text-[11px] text-ink-subtle">{option.description}</span>
                </span>
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent",
                  )}
                  aria-hidden="true"
                >
                  <Check className="size-3" />
                </span>
              </FieldLabel>
            );
          })}
        </RadioGroup>
      </FormSection>

      <FormSection icon={CalendarDays} title="جزئیات تخصیص" tone="sky">
        <AuthField
          label="تاریخ دریافت کمربند"
          htmlFor="beltDate"
          required
          hint="تاریخ را مطابق آزمون فنی ثبت کنید؛ قالب نمونه: ۱۴۰۴/۰۸/۲۵."
        >
          <DatePicker
            id="beltDate"
            title="تاریخ دریافت کمربند"
            value={date}
            onChange={setDate}
            defaultValue="1404/08/25"
            fromYear={1390}
            toYear={1405}
          />
        </AuthField>

        <AuthField label="یادداشت مربی" htmlFor="beltNote">
          <Textarea
            id="beltNote"
            name="beltNote"
            rows={3}
            placeholder="مثلاً: قبولی در آزمون فنی با میانگین نمره ۱۸"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-24 rounded-xl p-3 text-sm leading-6"
          />
        </AuthField>

        <Card className="gap-2 bg-muted/50 p-3.5 text-[11px] leading-5 text-ink-muted ring-0">
          <p className="flex items-start gap-1.5">
            <Info className="mt-0.5 size-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
            <span>
              تاریخ آزمون کمربند بعدی به صورت خودکار بر اساس مدت زمان کمربند فعلی محاسبه و ثبت می شود؛ یادآوری ارتقاء ۱۰ روز قبل ارسال خواهد
              شد.
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <Info className="mt-0.5 size-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
            <span>با ثبت، این کمربند به عنوان کمربند فعلی هنرجو ثبت و در سابقه کمربند او درج می شود.</span>
          </p>
        </Card>
      </FormSection>

      <FormDock cancelHref={`/coach/students/${profile.id}`} submitLabel="ثبت کمربند" />
    </form>
  );
}
