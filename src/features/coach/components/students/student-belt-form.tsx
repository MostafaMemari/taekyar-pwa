"use client";

import { CalendarDays, Info, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { DatePicker } from "@/components/shared/date-picker";
import { NotFoundScreen } from "@/components/shared/not-found-screen";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { ErrorState } from "@/features/coach/components/error-state";
import { FormDock } from "@/features/coach/components/form-dock";
import { FormSection } from "@/features/coach/components/form-section";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { useBelts } from "@/features/coach/hooks/use-belts";
import { useStudent } from "@/features/coach/hooks/use-student";
import { useAssignStudentBelt } from "@/features/coach/hooks/use-student-mutations";
import { beltAssignDescription } from "@/features/coach/lib/student-form-options";
import { beltKeyOf, isBeltAssignmentOpen } from "@/features/coach/lib/students-options";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toLatinDigits, toPersianDigits } from "@/lib/digits";
import { todayJalali, toGregorianDate, toJalaliDate } from "@/lib/jalali";
import { ageFromIso, beltDotStyle, getStudentBeltMeta, nextStudentBelt } from "@/lib/student-belts";

export function StudentBeltForm({ studentId }: { studentId: string }) {
  const router = useRouter();
  const student = useStudent(studentId);
  const belts = useBelts();
  const assign = useAssignStudentBelt();
  const [date, setDate] = useState(() => toLatinDigits(todayJalali()));

  if (student.error) {
    const missing = student.error instanceof ApiError && student.error.status === 404;

    return (
      <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))]">
        <CoachPageHeader title="تخصیص کمربند" backHref={`/coach/students/${studentId}`} />
        {missing ? (
          <NotFoundScreen
            className="mt-4"
            title="این هنرجو پیدا نشد"
            description="پرونده ای با این نشانی در فهرست هنرجویان شما نیست. ممکن است حذف شده باشد یا متعلق به مربی دیگری باشد."
            backHref="/coach/students"
            backLabel="بازگشت به هنرجویان"
          />
        ) : (
          <ErrorState
            className="mt-4"
            title="خواندن پرونده هنرجو انجام نشد"
            message={apiErrorMessage(student.error)}
            onRetry={() => void student.mutate()}
          />
        )}
      </main>
    );
  }

  if (belts.error) {
    return (
      <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))]">
        <CoachPageHeader title="تخصیص کمربند" backHref={`/coach/students/${studentId}`} />
        <ErrorState
          className="mt-4"
          title="خواندن فهرست کمربندها انجام نشد"
          message={apiErrorMessage(belts.error)}
          onRetry={() => void belts.mutate()}
        />
      </main>
    );
  }

  if (!student.data || !belts.data) {
    return (
      <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))]">
        <CoachPageHeader title="تخصیص کمربند" backHref={`/coach/students/${studentId}`} />
        <Skeleton className="mt-4 h-24 rounded-2xl" />
        <Skeleton className="mt-4 h-40 rounded-2xl" />
        <Skeleton className="mt-4 h-52 rounded-2xl" />
      </main>
    );
  }

  const profile = student.data;
  const current = profile.currentBelt;
  const currentKey = current ? beltKeyOf(current.belt.name) : null;
  const currentMeta = currentKey ? getStudentBeltMeta(currentKey) : null;

  if (!isBeltAssignmentOpen(current)) {
    const nextDate = current?.nextBeltDate ?? null;

    return (
      <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))]">
        <CoachPageHeader title="تخصیص کمربند" subtitle={profile.fullName} backHref={`/coach/students/${studentId}`} />
        <Alert className="mt-4 rounded-xl border-none bg-info-soft/60 p-3 text-start">
          <Info className="text-info" aria-hidden="true" />
          <AlertDescription className="text-[12px] leading-5 text-ink-muted">
            موعد کمربند بعدی این هنرجو هنوز نرسیده است
            {nextDate ? ` و از ${toJalaliDate(nextDate)} در دسترس خواهد بود` : ""}. بعد از رسیدن موعد، گزینه تخصیص کمربند در پرونده او فعال
            می شود.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  // shortcut: the seeded nextBelt chain alternates poom/dan, so the age-aware rule drives the choice and the list only maps it to an id.
  const nextKey = currentKey ? nextStudentBelt(currentKey, ageFromIso(profile.birthDate)) : null;
  const nextMeta = nextKey ? getStudentBeltMeta(nextKey) : null;
  const nextBeltId = nextKey
    ? belts.data?.find((belt) => belt.name.toUpperCase() === nextKey.toUpperCase().replace("-", "_"))?.id
    : undefined;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nextBeltId) return;

    const beltDate = toGregorianDate(date);
    if (!beltDate) return;

    try {
      await assign.trigger({ id: studentId, beltId: nextBeltId, beltDate });
      router.push(`/coach/students/${studentId}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="تخصیص کمربند" subtitle={profile.fullName} backHref={`/coach/students/${studentId}`} />

      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <Card className="flex-row items-center gap-3 p-3">
          <PersonAvatar name={profile.fullName} className="size-12" fallbackClassName="text-base" />
          <div className="min-w-0 flex-1">
            <b className="block truncate text-[14px] font-extrabold text-ink">{profile.fullName}</b>
            <span className="mt-1 flex flex-wrap items-center gap-2 text-[12px] font-medium text-ink-subtle">
              <span>کد ملی {toPersianDigits(profile.nationalCode)}</span>
              <span className="text-ink-subtle" aria-hidden="true">
                •
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full ring-2 ring-black/5"
                  style={currentKey ? beltDotStyle(currentKey) : undefined}
                  aria-hidden="true"
                />
                کمربند فعلی: {currentMeta?.label ?? "ثبت نشده"}
              </span>
            </span>
          </div>
        </Card>

        <FormSection icon={TrendingUp} title="کمربند بعدی" tone="amber">
          <p className="-mt-2 text-start text-[12px] font-medium leading-5 text-ink-muted">
            کمربند بعدی هنرجو بر اساس کمربند فعلی و رده سنی او تعیین می شود و تنها همین کمربند قابل ثبت است.
          </p>

          {nextKey && nextMeta && nextBeltId ? (
            <Card className="flex-row items-center gap-4 p-4">
              <BeltStrip
                color={nextMeta.color}
                bottomColor={nextMeta.bottomColor}
                outline={nextMeta.outline}
                stripes={nextMeta.stripeCount}
                className="size-auto w-24 shrink-0"
              />
              <div className="min-w-0 flex-1 text-start">
                <b className="block text-[14px] font-extrabold text-ink">{nextMeta.label}</b>
                <p className="mt-1 text-[12px] font-medium leading-5 text-ink-subtle">{beltAssignDescription(nextKey)}</p>
              </div>
            </Card>
          ) : (
            <Alert className="rounded-xl border-none bg-info-soft/60 p-3 text-start">
              <Info className="text-info" aria-hidden="true" />
              <AlertDescription className="text-[12px] leading-5 text-ink-muted">
                {current
                  ? "این هنرجو در بالاترین کمربند ممکن است و کمربند بعدی برای او تعریف نشده است."
                  : "برای این هنرجو کمربند فعلی ثبت نشده است، بنابراین کمربند بعدی قابل تعیین نیست."}
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
              defaultValue={toLatinDigits(todayJalali())}
              fromYear={1390}
              toYear={1405}
            />
          </AuthField>

          <Card className="gap-2 bg-muted/50 p-3.5 text-[12px] leading-5 text-ink-muted ring-0">
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

        <AuthFormError message={assign.error ? apiErrorMessage(assign.error) : ""} />

        <FormDock cancelHref={`/coach/students/${studentId}`} submitLabel="ثبت کمربند" pending={assign.isMutating} />
      </form>
    </main>
  );
}
