"use client";

import { Check, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { ErrorState } from "@/features/coach/components/error-state";
import { LoadMoreSentinel } from "@/features/coach/components/load-more-sentinel";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { useStudentsFeed } from "@/features/coach/hooks/use-students";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 500;

export function AttendanceGuestSheet({
  open,
  onOpenChange,
  excludeIds,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeIds: Set<string>;
  onConfirm: (picked: Array<{ id: string; fullName: string }>) => void;
}) {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // The API does the search; typing waits for a pause so the list does not refetch per character.
  useEffect(() => {
    const timer = setTimeout(() => setTerm(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const { students, hasMore, error, isLoading, isValidating, mutate, setSize } = useStudentsFeed({ search: term || undefined });

  const visible = students.filter((student) => !excludeIds.has(student.id));

  // A full page of already-marked students renders nothing; pull the next page instead of showing a dead end.
  useEffect(() => {
    if (open && !isLoading && !isValidating && !error && visible.length === 0 && hasMore) void setSize((current) => current + 1);
  }, [error, hasMore, isLoading, isValidating, open, setSize, visible.length]);

  const close = () => {
    setSearch("");
    setTerm("");
    setSelected([]);
    onOpenChange(false);
  };

  const toggle = (studentId: string) => {
    setSelected((current) => (current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]));
  };

  return (
    <SheetFrame
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title="افزودن هنرجوی مهمان"
      description="هنرجوهای خودت که عضو این کلاس نیستند را برای این جلسه انتخاب کن"
    >
      <div className="mt-3 flex flex-col gap-3">
        {students.length > 0 || term ? (
          <div className="relative">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجوی نام یا کد ملی"
              aria-label="جستجوی نام یا کد ملی"
              className="h-11 rounded-xl ps-10"
            />
          </div>
        ) : null}

        <div className="max-h-[45vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <ErrorState title="خواندن هنرجویان انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
          ) : students.length === 0 ? (
            <p className="rounded-xl bg-muted/60 p-4 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
              {term ? "هنرجویی با این نام یا کد ملی پیدا نشد" : "هنوز هنرجویی ثبت نشده است. ابتدا در بخش هنرجویان یک پرونده بسازید"}
            </p>
          ) : visible.length === 0 ? (
            <p className="rounded-xl bg-muted/60 p-4 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
              هنرجوی دیگری برای افزودن نمانده است
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {visible.map((student) => {
                const isSelected = selected.includes(student.id);

                return (
                  <Button
                    key={student.id}
                    type="button"
                    variant="field"
                    aria-pressed={isSelected}
                    onClick={() => toggle(student.id)}
                    className={cn("h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5", isSelected && "border-primary bg-primary/5")}
                  >
                    <PersonAvatar name={student.fullName} className="size-9" fallbackClassName="text-[12px]" />
                    <span className="min-w-0 flex-1 text-start">
                      <b className="block truncate text-[13px] font-extrabold text-ink-body">{student.fullName}</b>
                      <span className="text-[11px] font-medium text-ink-subtle">کد ملی {toPersianDigits(student.nationalCode)}</span>
                    </span>
                    {isSelected ? <Check className="text-primary" aria-hidden="true" /> : null}
                  </Button>
                );
              })}

              {isValidating && hasMore ? <Skeleton className="h-14 w-full rounded-xl" /> : null}
              <LoadMoreSentinel
                disabled={!hasMore || isValidating || Boolean(error)}
                onLoadMore={() => void setSize((current) => current + 1)}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--line-2)] pt-3">
          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={close}>
            بستن
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-11 flex-1 rounded-xl text-[12px]"
            disabled={!selected.length}
            onClick={() => {
              onConfirm(students.filter((student) => selected.includes(student.id)).map(({ id, fullName }) => ({ id, fullName })));
              close();
            }}
          >
            افزودن {toPersianDigits(String(selected.length))} مهمان
          </Button>
        </div>
      </div>
    </SheetFrame>
  );
}
