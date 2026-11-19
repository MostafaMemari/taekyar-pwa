"use client";

import { CalendarX2, ChevronLeft, Landmark, ListFilter } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBandBar } from "@/features/coach/components/coach-band-bar";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useAbsentStudents } from "@/features/coach/hooks/use-attendance";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { STUDENT_FEE_STATUSES, type StudentFeeStatus } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { AbsentStudentsFiltersSheet } from "./absent-filters-sheet";

const THRESHOLDS = [1, 2, 3];

const BAND_CIRCLE = "relative size-11 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20";

const absentFilterParsers = {
  min: parseAsInteger.withDefault(2),
  club: parseAsString.withDefault(""),
  fee: parseAsStringEnum<StudentFeeStatus>([...STUDENT_FEE_STATUSES]),
};

export function AbsentStudentsList() {
  const [filters, setFilters] = useQueryStates(absentFilterParsers);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data, error, isLoading, mutate } = useAbsentStudents({ minAbsences: filters.min, clubId: filters.club || null });
  const { data: clubData } = useClubs();
  const students = data ?? [];
  const visible = filters.fee ? students.filter((student) => student.feeStatus === filters.fee) : students;
  const filterCount = (filters.club ? 1 : 0) + (filters.fee ? 1 : 0);

  return (
    <>
      <CoachBand>
        <CoachBandBar
          backHref="/coach/students"
          title="غیبت ها"
          subtitle="غیبت های غیرموجه در ۳۰ روز اخیر"
          chip={
            data ? (
              <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white tabular-nums">
                {toPersianDigits(String(visible.length))} هنرجو
              </span>
            ) : null
          }
          action={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="فیلترها"
              aria-haspopup="dialog"
              className={BAND_CIRCLE}
              onClick={() => setFiltersOpen(true)}
            >
              <ListFilter aria-hidden="true" />
              {filterCount > 0 ? (
                <span className="absolute -top-1 -end-1 grid min-w-[18px] place-items-center rounded-full bg-brand-500 px-1 text-[12px] font-semibold leading-[18px] text-white tabular-nums">
                  {toPersianDigits(String(filterCount))}
                </span>
              ) : null}
            </Button>
          }
        />
      </CoachBand>

      <CoachSheet className="flex flex-col gap-3 pb-44">
        <ToggleGroup
          aria-label="حداقل تعداد غیبت"
          value={[String(filters.min)]}
          onValueChange={(next) => {
            const selected = next[0];
            if (selected) void setFilters({ min: Number(selected) });
          }}
          variant="segmented"
          spacing={1}
          className="w-full rounded-full bg-muted p-1"
        >
          {THRESHOLDS.map((threshold) => (
            <ToggleGroupItem
              key={threshold}
              value={String(threshold)}
              className="h-9 flex-1 rounded-full text-[12px] font-bold aria-pressed:bg-brand-600 aria-pressed:text-white"
            >
              {toPersianDigits(String(threshold))}+
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div aria-busy={isLoading && !data} className="flex flex-col gap-2">
          {isLoading && !data ? (
            [0, 1, 2].map((row) => <Skeleton key={row} className="h-[68px] w-full rounded-2xl" />)
          ) : error && !data ? (
            <ErrorState title="خواندن غیبت ها انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
          ) : visible.length === 0 ? (
            students.length === 0 ? (
              <Empty className="mt-2 min-h-[45dvh] border-none bg-transparent p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="size-14 rounded-2xl bg-brand-50 text-accent-ink">
                    <CalendarX2 aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle className="text-[14px] font-extrabold text-ink">در ۳۰ روز اخیر غیبتی با این شرط ثبت نشده</EmptyTitle>
                  <EmptyDescription className="text-[12px] leading-5 text-ink-subtle">
                    شرط کمتری را انتخاب کنید یا حضور و غیاب جلسه های اخیر را ثبت کنید
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Empty className="mt-2 min-h-[45dvh] border-none bg-transparent p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="size-14 rounded-2xl bg-brand-50 text-accent-ink">
                    <CalendarX2 aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle className="text-[14px] font-extrabold text-ink">با این فیلترها هنرجویی یافت نشد</EmptyTitle>
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
        </div>

        <AbsentStudentsFiltersSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          club={filters.club}
          fee={filters.fee}
          clubs={clubData?.clubs ?? []}
          resultCount={data ? visible.length : undefined}
          onClubChange={(value) => void setFilters({ club: value })}
          onFeeChange={(value) => void setFilters({ fee: value || null })}
          onClear={() => void setFilters({ club: "", fee: null })}
        />
      </CoachSheet>
    </>
  );
}
