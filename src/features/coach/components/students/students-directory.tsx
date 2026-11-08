"use client";

import { ChevronLeft, Copy } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/features/coach/components/error-state";
import { LoadMoreSentinel } from "@/features/coach/components/load-more-sentinel";
import { useAgeCategories } from "@/features/coach/hooks/use-age-categories";
import { useBeltExams } from "@/features/coach/hooks/use-belt-exams";
import { useStudentStats } from "@/features/coach/hooks/use-student-stats";
import { useStudentsFeed } from "@/features/coach/hooks/use-students";
import { activeFilterCount, studentFilterParsers, toggleValue, toStudentQuery } from "@/features/coach/lib/student-filters";
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
import { AddStudentSheet } from "./add-student-sheet";
import { CopyNamesSheet } from "./copy-names-sheet";
import { SortStudentsSheet } from "./sort-students-sheet";
import { StudentsActiveFilters } from "./students-active-filters";
import { StudentsFiltersSheet } from "./students-filters-sheet";
import { StudentsList } from "./students-list";
import { StudentsOverview } from "./students-overview";
import { StudentsSkeleton } from "./students-skeleton";
import { StudentsToolbar } from "./students-toolbar";

const SEARCH_DEBOUNCE_MS = 500;

export function StudentsDirectory() {
  const [filters, setFilters] = useQueryStates(studentFilterParsers);
  const [searchTerm, setSearchTerm] = useState(filters.q);
  const [addOpen, setAddOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);

  // The URL keeps every keystroke; the request waits for a pause so the list does not refetch per character.
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(filters.q), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.q]);

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

  const clearFilters = () => void setFilters({ q: "", belt: [], age: [], ins: [], exam: "" });

  const onSortFieldChange = (field: StudentSortField) => void setFilters({ sort: field, dir: DEFAULT_SORT_DIRECTIONS[field] });
  const onSortDirectionChange = (direction: StudentSortDirection) => void setFilters({ dir: direction });

  return (
    <>
      <StudentsOverview
        total={stats?.total}
        stats={stats?.byInsurance}
        active={filters.ins}
        onToggle={(value) => void setFilters({ ins: toggleValue(filters.ins, value) })}
        onAdd={() => setAddOpen(true)}
      />

      <StudentsToolbar
        query={filters.q}
        onQueryChange={(value) => void setFilters({ q: value })}
        filterCount={filterCount}
        onOpenFilters={() => setFiltersOpen(true)}
        sortActive={sortActive}
        onOpenSort={() => setSortOpen(true)}
      />

      <StudentsActiveFilters
        belts={filters.belt}
        ages={filters.age}
        insurances={filters.ins}
        exam={filters.exam ? { label: examChipLabel ?? "آزمون" } : null}
        onRemoveBelt={(value) => void setFilters({ belt: filters.belt.filter((item) => item !== value) })}
        onRemoveAge={(value) => void setFilters({ age: filters.age.filter((item) => item !== value) })}
        onRemoveInsurance={(value) => void setFilters({ ins: filters.ins.filter((item) => item !== value) })}
        onRemoveExam={() => void setFilters({ exam: "" })}
        onClear={clearFilters}
      />

      {copyContext ? (
        <Button
          type="button"
          variant="outline"
          className="mt-3 h-14 w-full justify-start gap-3 rounded-xl border-primary/25 bg-brand-50/50 px-3 text-accent-ink hover:bg-brand-50"
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

      <div aria-busy={isLoading && !data} className={copyContext ? "mt-3" : undefined}>
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
        exam={filters.exam}
        ageCategories={ageCategories}
        resultCount={total}
        onBeltsChange={(value) => void setFilters({ belt: value })}
        onAgesChange={(value) => void setFilters({ age: value })}
        onInsurancesChange={(value) => void setFilters({ ins: value })}
        onExamChange={(value) => void setFilters({ exam: value })}
        onClear={clearFilters}
      />
    </>
  );
}
