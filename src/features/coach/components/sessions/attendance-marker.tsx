"use client";

import { CalendarDays, ClipboardList, Info, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DatePicker } from "@/components/shared/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { ErrorState } from "@/features/coach/components/error-state";
import { SessionTime } from "@/features/coach/components/session-time";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useClassAttendance } from "@/features/coach/hooks/use-attendance";
import { useSaveAttendance } from "@/features/coach/hooks/use-attendance-mutations";
import { useSession } from "@/features/coach/hooks/use-sessions";
import type { AttendanceItem } from "@/features/coach/lib/attendance-api";
import {
  nextSessionDate,
  previousSessionDate,
  snapToSessionDate,
  WEEK_DAY_META,
  type WeekDay,
  weekDayOfDate,
} from "@/features/coach/lib/coach-data";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { todayJalali, toGregorianDate, toJalaliDate } from "@/lib/jalali";
import { AttendanceForm } from "./attendance-form";
import { AttendanceFormSkeleton } from "./attendance-form-skeleton";

export function AttendanceMarker({ sessionId, initialDate = "" }: { sessionId: string; initialDate?: string }) {
  const router = useRouter();
  const initialJalali = toJalaliDate(initialDate);
  const [date, setDate] = useState(initialJalali);
  const session = useSession(sessionId);
  const save = useSaveAttendance(sessionId);

  // Today is resolved after mount so a prerendered page never keeps the build date.
  useEffect(() => {
    if (!initialJalali) setDate(todayJalali());
  }, [initialJalali]);

  const weekDays: WeekDay[] = session.data?.weekDays ?? [];
  const isoDate = date ? toGregorianDate(date) : null;
  // Attendance follows the class's real session days; a picked or opened non-class day snaps back to the latest one.
  const sessionDate = isoDate ? snapToSessionDate(isoDate, weekDays) : null;
  const roster = useClassAttendance(sessionId, sessionDate ?? "");
  const previousIso = sessionDate ? previousSessionDate(sessionDate, weekDays) : null;
  const nextIso = sessionDate ? nextSessionDate(sessionDate, weekDays) : null;
  const todayIso = toGregorianDate(todayJalali()) ?? "";

  const handleSave = async (items: AttendanceItem[]) => {
    if (!sessionDate) return;

    try {
      await save.trigger({ sessionDate, items });
      router.push(`/coach/sessions/${sessionId}/report?date=${sessionDate}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  const sessionError = session.error;
  const rosterError = roster.error;

  if (sessionError || rosterError) {
    return (
      <>
        <CoachPageHeader title="ثبت حضور و غیاب" backHref={`/coach/sessions/${sessionId}`} />
        <ErrorState
          className="mt-4"
          title="خواندن لیست حضور و غیاب انجام نشد"
          message={apiErrorMessage(sessionError ?? rosterError)}
          onRetry={() => {
            void session.mutate();
            void roster.mutate();
          }}
        />
      </>
    );
  }

  if (!date || !session.data || !roster.data) return <AttendanceFormSkeleton />;

  const shownDate = sessionDate ?? "";
  const hasUpcoming = nextIso !== null && nextIso <= todayIso;
  const clubName = session.data.club?.name ?? "باشگاه حذف شده";
  // An inactive class (or one in an inactive club) records nothing.
  const operable = session.data.isActive && (session.data.club?.isActive ?? true);
  const total = roster.data.length;

  return (
    <>
      <CoachPageHeader
        title="ثبت حضور و غیاب"
        subtitle={session.data.name}
        backHref={`/coach/sessions/${sessionId}`}
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="گزارش جلسه"
            className="size-10 rounded-xl text-ink-body"
            render={<Link href={`/coach/sessions/${sessionId}/report?date=${shownDate}`} />}
            nativeButton={false}
          >
            <ClipboardList aria-hidden="true" />
          </Button>
        }
      />

      <Card className="mt-4 gap-0 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-ink">
            <Zap className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-[13px] font-extrabold text-ink">{session.data.name}</b>
            <p className="mt-0.5 truncate text-[12px] text-ink-subtle">
              {clubName} · <SessionTime start={session.data.startTime} end={session.data.endTime} />
            </p>
          </div>
          <StatusBadge tone="brand" className="shrink-0">
            <Users aria-hidden="true" />
            {toPersianDigits(String(total))} هنرجو
          </StatusBadge>
        </div>

        <div className="mt-3 border-t border-[var(--line-2)] pt-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-ink-subtle">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              تاریخ جلسه · {WEEK_DAY_META[weekDayOfDate(shownDate)].label}
            </span>
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-lg px-2.5 text-[11px] font-bold"
                onClick={() => setDate(todayJalali())}
              >
                امروز
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-lg px-2.5 text-[11px] font-bold"
                onClick={() => previousIso && setDate(toJalaliDate(previousIso))}
              >
                جلسه قبل
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-lg px-2.5 text-[11px] font-bold"
                disabled={!hasUpcoming}
                onClick={() => nextIso && setDate(toJalaliDate(nextIso))}
              >
                جلسه بعد
              </Button>
            </div>
          </div>
          <DatePicker title="تاریخ جلسه" value={shownDate ? toJalaliDate(shownDate) : date} onChange={setDate} to={todayJalali()} />
        </div>
      </Card>

      {!operable ? (
        <Alert className="mt-4 rounded-xl border-none bg-info-soft/60 p-3 text-start">
          <Info className="text-info" aria-hidden="true" />
          <AlertDescription className="text-[12px] leading-5 text-ink-muted">
            این کلاس غیرفعال است و امکان ثبت حضور و غیاب وجود ندارد
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {total === 0 ? (
            <Alert className="mt-4 rounded-xl border-none bg-info-soft/60 p-3 text-start">
              <Info className="text-info" aria-hidden="true" />
              <AlertDescription className="text-[12px] leading-5 text-ink-muted">
                هنوز هنرجویی در این کلاس ثبت نشده است. با «افزودن مهمان» می توانی حضور و غیاب این جلسه را ثبت کنی
              </AlertDescription>
            </Alert>
          ) : null}

          <AttendanceForm
            key={shownDate}
            entries={roster.data}
            pending={save.isMutating}
            error={save.error ? apiErrorMessage(save.error) : ""}
            onSave={(items) => void handleSave(items)}
          />
        </>
      )}
    </>
  );
}
