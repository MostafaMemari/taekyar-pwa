"use client";

import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { ErrorState } from "@/features/coach/components/error-state";
import { useAgeCategories } from "@/features/coach/hooks/use-age-categories";
import { useStudentStats } from "@/features/coach/hooks/use-student-stats";
import { useStudents } from "@/features/coach/hooks/use-students";
import { activeFilterCount, studentFilterParsers, toggleValue, toStudentQuery } from "@/features/coach/lib/student-filters";
import { type StudentSortKey, sortPreset } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { AddStudentSheet } from "./add-student-sheet";
import { SortStudentsSheet } from "./sort-students-sheet";
import { StudentsActiveFilters } from "./students-active-filters";
import { StudentsFiltersSheet } from "./students-filters-sheet";
import { StudentsList } from "./students-list";
import { StudentsOverview } from "./students-overview";
import { StudentsPagination } from "./students-pagination";
import { StudentsSkeleton } from "./students-skeleton";
import { StudentsToolbar } from "./students-toolbar";

const SEARCH_DEBOUNCE_MS = 300;

export function StudentsDirectory() {
  const [filters, setFilters] = useQueryStates(studentFilterParsers);
  const [searchTerm, setSearchTerm] = useState(filters.q);
  const [addOpen, setAddOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // The URL keeps every keystroke; the request waits for a pause so the list does not refetch per character.
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(filters.q), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.q]);

  const { data, error, isLoading, mutate } = useStudents(toStudentQuery(filters, searchTerm));
  const { data: stats } = useStudentStats();
  const { data: ageCategories } = useAgeCategories();

  const pager = data?.pager;

  useEffect(() => {
    if (pager && pager.totalPages > 0 && filters.page > pager.totalPages) void setFilters({ page: pager.totalPages });
  }, [pager, filters.page, setFilters]);

  const filterCount = activeFilterCount(filters);
  const isDirty = filterCount > 0 || filters.q.trim().length > 0;
  const sortActive = filters.sort !== "createdAt" || filters.dir !== "desc";

  const clearFilters = () => void setFilters({ q: "", belt: [], age: [], ins: [], page: 1 });

  const changeSort = (key: StudentSortKey) => {
    const preset = sortPreset(key);
    void setFilters({ sort: preset.sortBy, dir: preset.sortDirection, page: 1 });
    setSortOpen(false);
  };

  return (
    <>
      <StudentsOverview
        total={stats?.total}
        stats={stats?.byInsurance}
        active={filters.ins}
        onToggle={(value) => void setFilters({ ins: toggleValue(filters.ins, value), page: 1 })}
        onAdd={() => setAddOpen(true)}
      />

      <StudentsToolbar
        query={filters.q}
        onQueryChange={(value) => void setFilters({ q: value, page: 1 })}
        filterCount={filterCount}
        onOpenFilters={() => setFiltersOpen(true)}
        sortActive={sortActive}
        onOpenSort={() => setSortOpen(true)}
      />

      <StudentsActiveFilters
        belts={filters.belt}
        ages={filters.age}
        insurances={filters.ins}
        onRemoveBelt={(value) => void setFilters({ belt: filters.belt.filter((item) => item !== value), page: 1 })}
        onRemoveAge={(value) => void setFilters({ age: filters.age.filter((item) => item !== value), page: 1 })}
        onRemoveInsurance={(value) => void setFilters({ ins: filters.ins.filter((item) => item !== value), page: 1 })}
        onClear={clearFilters}
      />

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
            students={data.students}
            ageCategories={ageCategories ?? []}
            expiringDays={stats?.expiringDays ?? 30}
            hasFilters={isDirty}
            onClear={clearFilters}
          />
          {pager ? (
            <StudentsPagination
              page={pager.page}
              perPage={pager.perPage}
              total={pager.total}
              onPageChange={(value) => void setFilters({ page: value })}
            />
          ) : null}
        </>
      ) : null}

      <AddStudentSheet open={addOpen} onOpenChange={setAddOpen} />

      <SortStudentsSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        sortBy={filters.sort}
        sortDirection={filters.dir}
        onChange={changeSort}
      />

      <StudentsFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        belts={filters.belt}
        ages={filters.age}
        insurances={filters.ins}
        ageCategories={ageCategories}
        resultCount={pager?.total}
        onBeltsChange={(value) => void setFilters({ belt: value, page: 1 })}
        onAgesChange={(value) => void setFilters({ age: value, page: 1 })}
        onInsurancesChange={(value) => void setFilters({ ins: value, page: 1 })}
        onClear={clearFilters}
      />
    </>
  );
}
