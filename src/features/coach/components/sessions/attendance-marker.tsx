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
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { shiftJalaliDate, todayJalali, toGregorianDate, toJalaliDate } from "@/lib/jalali";
import { AttendanceForm } from "./attendance-form";
import { AttendanceFormSkeleton } from "./attendance-form-skeleton";

export function AttendanceMarker({ sessionId, initialDate = "" }: { sessionId: string; initialDate?: string }) {
  const router = useRouter();
  const initialJalali = toJalaliDate(initialDate);
  const [date, setDate] = useState(initialJalali);
  const isoDate = date ? toGregorianDate(date) : null;
  const session = useSession(sessionId);
  const roster = useClassAttendance(sessionId, isoDate ?? "");
  const save = useSaveAttendance(sessionId);

  // Today is resolved after mount so a prerendered page never keeps the build date.
  useEffect(() => {
    if (!initialJalali) setDate(todayJalali());
  }, [initialJalali]);

  const handleSave = async (items: AttendanceItem[]) => {
    if (!isoDate) return;

    try {
      await save.trigger({ sessionDate: isoDate, items });
      router.push(`/coach/sessions/${sessionId}/report?date=${isoDate}`);
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

  const clubName = session.data.club?.name ?? "باشگاه حذف شده";
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
            render={<Link href={`/coach/sessions/${sessionId}/report?date=${isoDate ?? ""}`} />}
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
              تاریخ جلسه
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
                onClick={() => setDate(shiftJalaliDate(date, -1))}
              >
                روز قبل
              </Button>
            </div>
          </div>
          <DatePicker title="تاریخ جلسه" value={date} onChange={setDate} />
        </div>
      </Card>

      {total > 0 ? (
        <AttendanceForm
          key={isoDate}
          entries={roster.data}
          pending={save.isMutating}
          error={save.error ? apiErrorMessage(save.error) : ""}
          onSave={(items) => void handleSave(items)}
        />
      ) : (
        <Alert className="mt-4 rounded-xl border-none bg-info-soft/60 p-3 text-start">
          <Info className="text-info" aria-hidden="true" />
          <AlertDescription className="text-[12px] leading-5 text-ink-muted">
            هنوز هنرجویی در این کلاس ثبت نشده است. بعد از افزودن هنرجو می توانید حضور و غیاب را ثبت کنید.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
