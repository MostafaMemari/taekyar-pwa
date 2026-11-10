"use client";

import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthInput } from "@/components/shared/auth-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { useStudentOptions } from "@/features/coach/hooks/use-students";
import { toPersianDigits } from "@/lib/digits";

const SEARCH_DEBOUNCE_MS = 400;

export function AttendanceGuestSheet({
  open,
  onOpenChange,
  excludeIds,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeIds: Set<string>;
  onPick: (student: { id: string; fullName: string }) => void;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const students = useStudentOptions(search);
  const candidates = (students.data ?? []).filter((student) => !excludeIds.has(student.id));

  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title="افزودن هنرجوی مهمان"
      description="هنرجویی از فهرست خودت که عضو این کلاس نیست را برای این جلسه علامت بزن"
    >
      <AuthInput
        aria-label="جست و جوی هنرجو"
        placeholder="جست و جو بر اساس نام یا کد ملی"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />

      <div className="max-h-72 overflow-y-auto">
        {students.error ? (
          <p className="rounded-xl bg-danger-soft/60 p-3 text-[12px] font-bold leading-5 text-danger">
            {students.error instanceof Error ? students.error.message : "خواندن فهرست هنرجویان انجام نشد"}
          </p>
        ) : !students.data ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : candidates.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {candidates.map((student) => (
              <div key={student.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
                <PersonAvatar name={student.fullName} className="size-9" fallbackClassName="text-[12px]" />
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[13px] font-extrabold text-ink-body">{student.fullName}</b>
                  <span className="text-[11px] font-medium text-ink-subtle">کد ملی {toPersianDigits(student.nationalCode)}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg px-2.5 text-[11px] font-bold"
                  onClick={() => onPick({ id: student.id, fullName: student.fullName })}
                >
                  <UserPlus data-icon="inline-start" aria-hidden="true" />
                  افزودن
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
            هنرجویی برای افزودن پیدا نشد
          </p>
        )}
      </div>
    </SheetFrame>
  );
}
