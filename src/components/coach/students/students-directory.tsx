"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type AgeGroup, BELT_META, type BeltKey, type InsuranceStatus, STUDENTS, studentBeltLabel } from "@/lib/coach/coach-data";
import type { SortKey } from "@/lib/coach/students-options";
import { toLatinDigits } from "@/lib/digits";
import { StudentsFilters } from "./students-filters";
import { StudentsList } from "./students-list";
import { StudentsOverview } from "./students-overview";
import { AddStudentSheet, SortStudentsSheet } from "./students-sheets";
import { StudentsToolbar } from "./students-toolbar";

export function StudentsDirectory() {
  const [query, setQuery] = useState("");
  const [belts, setBelts] = useState<BeltKey[]>([]);
  const [ages, setAges] = useState<AgeGroup[]>([]);
  const [insurance, setInsurance] = useState<InsuranceStatus | null>(null);
  const [sort, setSort] = useState<SortKey>("default");
  const [addOpen, setAddOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const normalizedQuery = toLatinDigits(query).trim().toLowerCase();

  const visible = STUDENTS.filter((student) => {
    if (belts.length > 0 && !belts.includes(student.belt)) return false;
    if (ages.length > 0 && !ages.includes(student.ageGroup)) return false;
    if (insurance && student.insurance !== insurance) return false;
    if (!normalizedQuery) return true;

    const haystack = toLatinDigits(
      `${student.name} ${student.nationalCode} ${studentBeltLabel(student)} ${student.ageLabel} ${student.className}`,
    ).toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const sorted = [...visible].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "fa");
    if (sort === "belt") {
      const byRank = BELT_META[b.belt].rank - BELT_META[a.belt].rank;
      return byRank !== 0 ? byRank : (b.dan ?? 0) - (a.dan ?? 0);
    }
    if (sort === "ins") return a.insuranceDays - b.insuranceDays;
    return 0;
  });

  const filterCount = belts.length + ages.length + (insurance ? 1 : 0);
  const isDirty = filterCount > 0 || query.trim().length > 0;

  const clearFilters = () => {
    setQuery("");
    setBelts([]);
    setAges([]);
    setInsurance(null);
  };

  return (
    <>
      <StudentsOverview count={sorted.length} insurance={insurance} onInsuranceChange={setInsurance} onAdd={() => setAddOpen(true)} />

      <StudentsToolbar
        query={query}
        onQueryChange={setQuery}
        sortActive={sort !== "default"}
        sortOpen={sortOpen}
        onOpenSort={() => setSortOpen(true)}
      />

      <StudentsFilters
        belts={belts}
        ages={ages}
        filterCount={filterCount}
        isDirty={isDirty}
        onBeltsChange={setBelts}
        onAgesChange={setAges}
        onClear={clearFilters}
      />

      <StudentsList students={sorted} onClear={clearFilters} />

      <div className="fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-[var(--app-max-width)] px-4">
        <Button
          type="button"
          variant="field"
          className="h-auto w-full justify-start gap-3 rounded-2xl border-[var(--card-line)] bg-card/95 px-3 py-2.5 whitespace-normal shadow-[var(--card-shadow)] backdrop-blur transition active:scale-[0.99]"
          onClick={() => setAddOpen(true)}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-ink">
            <Plus className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 text-start">
            <b className="block text-[13px] font-extrabold text-ink">افزودن هنرجوی جدید</b>
            <span className="mt-0.5 block text-[10.5px] font-medium text-ink-subtle">با فرم ثبت نام یا ارسال دعوت نامه</span>
          </span>
          <span className="shrink-0 rounded-full bg-brand-50 px-2 py-1 text-[9.5px] font-extrabold text-accent-ink">۲ روش</span>
        </Button>
      </div>

      <AddStudentSheet open={addOpen} onOpenChange={setAddOpen} />

      <SortStudentsSheet open={sortOpen} onOpenChange={setSortOpen} sort={sort} onSortChange={setSort} />
    </>
  );
}
