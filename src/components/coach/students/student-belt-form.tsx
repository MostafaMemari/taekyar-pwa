"use client";

import { CalendarDays, Info, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormDock, FormSection } from "@/components/coach/coach-form";
import { PersonAvatar } from "@/components/coach/coach-ui";
import { AuthField } from "@/components/shared/auth-field";
import { DatePicker } from "@/components/shared/date-picker";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { studentBeltDotStyle, studentBeltLabel } from "@/lib/coach/coach-data";
import { beltAssignDescription } from "@/lib/coach/student-form-options";
import { type StudentProfile, studentAge } from "@/lib/coach/student-profile-data";
import { toPersianDigits } from "@/lib/digits";
import { getStudentBeltMeta, nextStudentBelt } from "@/lib/student-belts";

export function StudentBeltForm({ profile }: { profile: StudentProfile }) {
  const router = useRouter();
  const [date, setDate] = useState(profile.beltDate);

  const nextBelt = nextStudentBelt(profile.belt, studentAge(profile.birthDate));
  const nextBeltMeta = nextBelt ? getStudentBeltMeta(nextBelt) : null;

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
              <span className="size-2.5 rounded-full ring-2 ring-black/5" style={studentBeltDotStyle(profile)} aria-hidden="true" />
              کمربند فعلی: {studentBeltLabel(profile)}
            </span>
          </span>
        </div>
      </Card>

      <FormSection icon={TrendingUp} title="کمربند بعدی" tone="amber">
        <p className="-mt-2 text-start text-[11px] font-medium leading-5 text-ink-muted">
          کمربند بعدی هنرجو بر اساس کمربند فعلی و رده سنی او تعیین می شود و تنها همین کمربند قابل ثبت است.
        </p>

        {nextBelt && nextBeltMeta ? (
          <Card className="flex-row items-center gap-4 p-4">
            <BeltStrip
              color={nextBeltMeta.color}
              bottomColor={nextBeltMeta.bottomColor}
              outline={nextBeltMeta.outline}
              stripes={nextBeltMeta.stripeCount}
              className="size-auto w-24 shrink-0"
            />
            <div className="min-w-0 flex-1 text-start">
              <b className="block text-[14px] font-extrabold text-ink">{nextBeltMeta.label}</b>
              <p className="mt-1 text-[11px] font-medium leading-5 text-ink-subtle">{beltAssignDescription(nextBelt)}</p>
            </div>
          </Card>
        ) : (
          <Alert className="rounded-xl border-none bg-info-soft/60 p-3 text-start">
            <Info className="text-info" aria-hidden="true" />
            <AlertDescription className="text-[11px] leading-5 text-ink-muted">
              این هنرجو در بالاترین کمربند ممکن است و کمربند بعدی برای او تعریف نشده است.
            </AlertDescription>
          </Alert>
        )}
      </FormSection>

      <FormSection icon={CalendarDays} title="جزئیات تخصیص" tone="sky">
        <AuthField label="تاریخ دریافت کمربند" htmlFor="beltDate" required hint="تاریخ را مطابق آزمون فنی ثبت کنید.">
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

        <Card className="gap-2 bg-muted/50 p-3.5 text-[11px] leading-5 text-ink-muted ring-0">
          <p className="flex items-start gap-1.5">
            <Info className="mt-0.5 size-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
            <span>تاریخ آزمون کمربند بعدی به صورت خودکار بر اساس مدت زمان کمربند جدید محاسبه می شود.</span>
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
