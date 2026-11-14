"use client";

import { CalendarX2, ChevronLeft, Landmark } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useAbsentStudents } from "@/features/coach/hooks/use-attendance";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { FEE_META, STUDENT_FEE_STATUSES, type StudentFeeStatus } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

const THRESHOLDS = [1, 2, 3];

const FEE_TONE: Record<StudentFeeStatus, string> = {
  PAID: "text-success",
  OWED: "text-danger",
};

const absentFilterParsers = {
  min: parseAsInteger.withDefault(2),
  club: parseAsString.withDefault(""),
  fee: parseAsStringEnum<StudentFeeStatus>([...STUDENT_FEE_STATUSES]),
};

export function AbsentStudentsList() {
  const [filters, setFilters] = useQueryStates(absentFilterParsers);
  const { data, error, isLoading, mutate } = useAbsentStudents({ minAbsences: filters.min, clubId: filters.club || null });
  const { data: clubData } = useClubs();
  const students = data ?? [];
  const visible = filters.fee ? students.filter((student) => student.feeStatus === filters.fee) : students;
  const clubs = (clubData?.clubs ?? []).filter((club) => club.isActive);

  return (
    <>
      <CoachPageHeader
        title="غیبت ها"
        backHref="/coach/students"
        subtitle="۳۰ روز اخیر · غیبت غیرموجه"
        action={
          <StatusBadge tone="neutral" className="mt-0.5">
            {data === undefined ? (
              <Skeleton className="h-3 w-5" />
            ) : (
              <b className="tabular-nums">{toPersianDigits(String(visible.length))}</b>
            )}
            <span>هنرجو</span>
          </StatusBadge>
        }
      />

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="shrink-0 text-[11px] font-bold text-ink-subtle">باشگاه</span>
          <Button
            type="button"
            variant="field"
            aria-pressed={!filters.club}
            onClick={() => void setFilters({ club: "" })}
            className={cn(
              "h-9 gap-1.5 rounded-xl px-2.5 text-[12px] font-bold",
              !filters.club && "border-primary/35 bg-brand-50 text-accent-ink",
            )}
          >
            همه
          </Button>
          {clubs.map((club) => {
            const isActive = filters.club === club.id;

            return (
              <Button
                key={club.id}
                type="button"
                variant="field"
                aria-pressed={isActive}
                onClick={() => void setFilters({ club: isActive ? "" : club.id })}
                className={cn(
                  "h-9 max-w-44 gap-1.5 rounded-xl px-2.5 text-[12px] font-bold",
                  isActive && "border-primary/35 bg-brand-50 text-accent-ink",
                )}
              >
                <Landmark className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{club.name}</span>
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="shrink-0 text-[11px] font-bold text-ink-subtle">شهریه</span>
          {(Object.keys(FEE_META) as StudentFeeStatus[]).map((value) => {
            const meta = FEE_META[value];
            const Icon = meta.icon;
            const isActive = filters.fee === value;

            return (
              <Button
                key={value}
                type="button"
                variant="field"
                aria-pressed={isActive}
                onClick={() => void setFilters({ fee: isActive ? null : value })}
                className={cn(
                  "h-9 gap-1.5 rounded-xl px-2.5 text-[12px] font-bold",
                  isActive && "border-primary/35 bg-brand-50 text-accent-ink",
                )}
              >
                <Icon className={cn("size-3.5", FEE_TONE[value])} aria-hidden="true" />
                <span>{meta.shortLabel}</span>
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="shrink-0 text-[11px] font-bold text-ink-subtle">تعداد غیبت</span>
          {THRESHOLDS.map((threshold) => {
            const isActive = filters.min === threshold;

            return (
              <Button
                key={threshold}
                type="button"
                variant="field"
                aria-pressed={isActive}
                onClick={() => void setFilters({ min: threshold })}
                className={cn(
                  "h-9 gap-1.5 rounded-xl px-2.5 text-[12px] font-bold",
                  isActive && "border-primary/35 bg-brand-50 text-accent-ink",
                )}
              >
                {toPersianDigits(String(threshold))}+
              </Button>
            );
          })}
        </div>
      </div>

      <CoachSheet className="mt-3 flex flex-col gap-2">
        {isLoading && !data ? (
          [0, 1, 2].map((row) => <Skeleton key={row} className="h-[68px] w-full rounded-2xl" />)
        ) : error && !data ? (
          <ErrorState title="خواندن غیبت ها انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
        ) : visible.length === 0 ? (
          students.length === 0 ? (
            <Empty className="mt-2 border-none bg-transparent p-6">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-brand-50 text-accent-ink">
                  <CalendarX2 aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle className="text-[13px] font-extrabold text-ink">در ۳۰ روز اخیر غیبتی با این شرط ثبت نشده</EmptyTitle>
                <EmptyDescription className="text-[12px] leading-5 text-ink-subtle">
                  شرط کمتری را انتخاب کنید یا حضور و غیاب جلسه های اخیر را ثبت کنید
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Empty className="mt-2 border-none bg-transparent p-6">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-brand-50 text-accent-ink">
                  <CalendarX2 aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle className="text-[13px] font-extrabold text-ink">با این فیلترها هنرجویی یافت نشد</EmptyTitle>
                <EmptyDescription className="text-[12px] leading-5 text-ink-subtle">فیلتر باشگاه یا شهریه را بردارید</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => void setFilters({ club: "", fee: null })}
                >
                  پاک کردن فیلترها
                </Button>
              </EmptyContent>
            </Empty>
          )
        ) : (
          visible.map((student) => (
            <Link
              key={student.studentId}
              href={`/coach/students/${student.studentId}`}
              className="block transition duration-150 active:scale-[0.995]"
            >
              <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
                <PersonAvatar name={student.fullName} />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[13px] font-extrabold text-ink">{student.fullName}</b>
                  <span className="mt-1 flex min-w-0 items-center gap-1.5">
                    {student.clubName ? (
                      <span className="flex min-w-0 items-center gap-1 text-[12px] font-medium text-ink-subtle">
                        <Landmark className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{student.clubName}</span>
                      </span>
                    ) : null}
                    {student.feeStatus ? (
                      <StatusBadge
                        tone={student.feeStatus === "OWED" ? "danger" : "success"}
                        className="shrink-0 px-1.5 py-[3px] text-[12px]"
                      >
                        {student.feeStatus === "OWED" ? "بدهکار" : "تسویه"}
                      </StatusBadge>
                    ) : null}
                  </span>
                </span>
                <StatusBadge tone="danger" className="shrink-0 px-1.5 py-[3px] text-[12px]">
                  {toPersianDigits(String(student.absentCount))} غیبت
                </StatusBadge>
                <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
              </Card>
            </Link>
          ))
        )}
      </CoachSheet>
    </>
  );
}
