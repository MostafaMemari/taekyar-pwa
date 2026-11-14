"use client";

import { ArrowUpDown, CalendarX2, ChevronLeft, Copy, ListFilter, Search, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBandBar } from "@/features/coach/components/coach-band-bar";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { LoadMoreSentinel } from "@/features/coach/components/load-more-sentinel";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { useAgeCategories } from "@/features/coach/hooks/use-age-categories";
import { useBeltExams } from "@/features/coach/hooks/use-belt-exams";
import { useStudentStats } from "@/features/coach/hooks/use-student-stats";
import { useStudentsFeed } from "@/features/coach/hooks/use-students";
import { activeFilterCount, studentFilterParsers, toStudentQuery } from "@/features/coach/lib/student-filters";
import {
  DEFAULT_SORT_DIRECTIONS,
  examBeltRangeOf,
  INSURANCE_META,
  type StudentSortDirection,
  type StudentSortField,
} from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";
import { AddStudentSheet } from "./add-student-sheet";
import { CopyNamesSheet } from "./copy-names-sheet";
import { SortStudentsSheet } from "./sort-students-sheet";
import { StudentsActiveFilters } from "./students-active-filters";
import { StudentsFiltersSheet } from "./students-filters-sheet";
import { StudentsList } from "./students-list";
import { StudentsSkeleton } from "./students-skeleton";

const SEARCH_DEBOUNCE_MS = 500;

const BAND_CIRCLE = "size-11 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20";

const STUCK_CIRCLE = "size-11 rounded-full border bg-background text-ink hover:bg-muted";

export function StudentsDirectory() {
  const [filters, setFilters] = useQueryStates(studentFilterParsers);
  const [searchTerm, setSearchTerm] = useState(filters.q);
  const [addOpen, setAddOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [searchStuck, setSearchStuck] = useState(false);
  const searchRowRef = useRef<HTMLDivElement>(null);

  // The URL keeps every keystroke; the request waits for a pause so the list does not refetch per character.
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(filters.q), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.q]);

  // The glass search row becomes a solid sticky bar once it pins to the viewport top.
  useEffect(() => {
    const onScroll = () => {
      const node = searchRowRef.current;
      if (node) setSearchStuck(node.getBoundingClientRect().top <= 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const feedQuery = toStudentQuery(filters, searchTerm);
  const { data, students, total, hasMore, error, isLoading, isValidating, mutate, setSize } = useStudentsFeed(feedQuery);
  const { data: stats } = useStudentStats();
  const { data: ageCategories } = useAgeCategories();
  const { data: exams } = useBeltExams();
  const examLabel = filters.exam ? (exams?.find((item) => item.id === filters.exam)?.name ?? "آزمون") : null;
  const examChipLabel = examLabel ? toPersianDigits(examLabel) : null;

  // One copy entry point: it always mirrors the on-screen filtered list; the header names the active contexts.
  const examRecord = filters.exam ? exams?.find((item) => item.id === filters.exam) : null;
  const insuranceLine = filters.ins.length > 0 ? `بیمه: ${filters.ins.map((status) => INSURANCE_META[status].label).join(" و ")}` : null;
  const copyContext = examRecord
    ? {
        title: "کپی اسامی واجد شرایط آزمون",
        headerLines: [
          `فهرست هنرجویان واجد شرایط آزمون دوره ${toPersianDigits(String(examRecord.examNumber))}`,
          [examBeltRangeOf(examRecord.belts), `برگزاری ${toJalaliDate(examRecord.eventDate)}`].filter(Boolean).join(" · "),
          insuranceLine,
        ].filter((line): line is string => Boolean(line)),
      }
    : filters.ins.length > 0
      ? {
          title: "کپی اسامی بیمه",
          headerLines: [`فهرست هنرجویان با بیمه ${filters.ins.map((status) => INSURANCE_META[status].label).join(" و ")}`],
        }
      : null;

  const filterCount = activeFilterCount(filters);
  const isDirty = filterCount > 0 || filters.q.trim().length > 0;
  const sortActive = filters.sort !== "beltDate" || filters.dir !== "desc";

  const clearFilters = () => void setFilters({ q: "", belt: [], age: [], ins: [], fee: null, exam: "" });

  const onSortFieldChange = (field: StudentSortField) => void setFilters({ sort: field, dir: DEFAULT_SORT_DIRECTIONS[field] });
  const onSortDirectionChange = (direction: StudentSortDirection) => void setFilters({ dir: direction });

  return (
    <>
      <CoachBand className={PAGE_ENTER}>
        <CoachBandBar
          title="هنرجویان"
          icon={Users}
          chip={
            stats ? (
              <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white tabular-nums">
                {toPersianDigits(String(stats.total))} هنرجو
              </span>
            ) : null
          }
          action={
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="غیبت ها"
                className={BAND_CIRCLE}
                render={<Link href="/coach/students/absences" />}
                nativeButton={false}
              >
                <CalendarX2 aria-hidden="true" />
              </Button>
            </>
          }
        />

        <div className="h-16" />
      </CoachBand>

      <div ref={searchRowRef} className={cn("sticky top-0 z-30 -mt-26 px-4 pb-9", PAGE_ENTER)}>
        <div
          className={cn(
            "flex items-center gap-2 rounded-full py-2 transition-[background-color,box-shadow,border-radius,margin] duration-200",
            searchStuck &&
              "-mx-4 rounded-b-[28px] rounded-t-none bg-[var(--canvas)]/90 px-4 shadow-[0_12px_28px_-24px_rgba(16,18,26,0.55)] backdrop-blur-md",
          )}
        >
          <InputGroup className={cn("h-12 min-w-0 flex-1 rounded-full", searchStuck ? "bg-background" : "border-white/20 bg-white/10")}>
            <InputGroupInput
              type="search"
              placeholder="جستجو با نام یا کد ملی..."
              aria-label="جستجوی هنرجو"
              className={searchStuck ? undefined : "text-white placeholder:text-white/60"}
              value={filters.q}
              onChange={(event) => void setFilters({ q: event.target.value })}
            />
            <InputGroupAddon align="inline-end">
              <Search className={cn("size-4", searchStuck ? "text-ink-subtle" : "text-white/70")} aria-hidden="true" />
            </InputGroupAddon>
          </InputGroup>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="فیلترها"
            aria-haspopup="dialog"
            className={cn("relative", searchStuck ? STUCK_CIRCLE : BAND_CIRCLE)}
            onClick={() => setFiltersOpen(true)}
          >
            <ListFilter aria-hidden="true" />
            {filterCount > 0 ? (
              <span className="absolute -top-1 -end-1 grid min-w-[18px] place-items-center rounded-full bg-brand-500 px-1 text-[12px] font-semibold leading-[18px] text-white tabular-nums">
                {toPersianDigits(String(filterCount))}
              </span>
            ) : null}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="مرتب سازی"
            aria-haspopup="dialog"
            className={cn("relative", searchStuck ? STUCK_CIRCLE : BAND_CIRCLE)}
            onClick={() => setSortOpen(true)}
          >
            <ArrowUpDown aria-hidden="true" />
            {sortActive ? <span className="absolute end-2 top-2 size-1.5 rounded-full bg-brand-500" aria-hidden="true" /> : null}
          </Button>
        </div>
      </div>

      <CoachSheet className={cn("flex flex-col gap-3 pb-44", PAGE_ENTER)}>
        <StudentsActiveFilters
          belts={filters.belt}
          ages={filters.age}
          insurances={filters.ins}
          fee={filters.fee}
          exam={filters.exam ? { label: examChipLabel ?? "آزمون" } : null}
          onRemoveBelt={(value) => void setFilters({ belt: filters.belt.filter((item) => item !== value) })}
          onRemoveAge={(value) => void setFilters({ age: filters.age.filter((item) => item !== value) })}
          onRemoveInsurance={(value) => void setFilters({ ins: filters.ins.filter((item) => item !== value) })}
          onRemoveFee={() => void setFilters({ fee: null })}
          onRemoveExam={() => void setFilters({ exam: "" })}
          onClear={clearFilters}
        />

        {copyContext ? (
          <Button
            type="button"
            variant="outline"
            className="h-14 w-full justify-start gap-3 rounded-xl border-primary/25 bg-brand-50/50 px-3 text-accent-ink hover:bg-brand-50"
            onClick={() => setCopyOpen(true)}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-600 text-white">
              <Copy className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-start">
              <b className="block truncate text-[13px] font-bold">{copyContext.title}</b>
              <span className="text-[11px] font-medium text-ink-subtle">فهرست آماده کپی برای اطلاع رسانی</span>
            </span>
            <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
          </Button>
        ) : null}

        <div aria-busy={isLoading && !data}>
          {isLoading && !data ? <StudentsSkeleton /> : null}

          {error && !data ? (
            <ErrorState
              className="mt-4"
              title="خواندن فهرست هنرجویان انجام نشد"
              message={apiErrorMessage(error)}
              onRetry={() => void mutate()}
            />
          ) : null}

          {data ? (
            <>
              <StudentsList
                students={students}
                ageCategories={ageCategories ?? []}
                expiringDays={stats?.expiringDays ?? 30}
                hasFilters={isDirty}
                onClear={clearFilters}
              />

              {isValidating && hasMore ? <Skeleton className="mt-2.5 h-16 w-full rounded-xl" /> : null}

              {error && students.length > 0 ? (
                <Button type="button" variant="outline" size="sm" className="mt-3 w-full rounded-xl" onClick={() => void mutate()}>
                  بارگذاری بیشتر
                </Button>
              ) : null}

              <LoadMoreSentinel
                disabled={!hasMore || isValidating || Boolean(error)}
                onLoadMore={() => void setSize((current) => current + 1)}
              />
            </>
          ) : null}
        </div>

        <AddStudentSheet open={addOpen} onOpenChange={setAddOpen} />

        <CopyNamesSheet
          open={copyOpen}
          onOpenChange={setCopyOpen}
          query={feedQuery}
          title={copyContext?.title ?? "کپی اسامی هنرجویان"}
          headerLines={copyContext?.headerLines ?? []}
        />

        <SortStudentsSheet
          open={sortOpen}
          onOpenChange={setSortOpen}
          sortBy={filters.sort}
          sortDirection={filters.dir}
          onFieldChange={onSortFieldChange}
          onDirectionChange={onSortDirectionChange}
        />

        <StudentsFiltersSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          belts={filters.belt}
          ages={filters.age}
          insurances={filters.ins}
          fee={filters.fee}
          exam={filters.exam}
          ageCategories={ageCategories}
          resultCount={total}
          onBeltsChange={(value) => void setFilters({ belt: value })}
          onAgesChange={(value) => void setFilters({ age: value })}
          onInsurancesChange={(value) => void setFilters({ ins: value })}
          onFeeChange={(value) => void setFilters({ fee: value || null })}
          onExamChange={(value) => void setFilters({ exam: value })}
          onClear={clearFilters}
        />
      </CoachSheet>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 flex justify-center">
        <Button
          type="button"
          variant="brand"
          aria-haspopup="dialog"
          className="pointer-events-auto h-12 gap-2 rounded-full px-5 text-[13px] font-bold active:scale-95"
          onClick={() => setAddOpen(true)}
        >
          <UserPlus data-icon="inline-start" aria-hidden="true" />
          هنرجو جدید
        </Button>
      </div>
    </>
  );
}
