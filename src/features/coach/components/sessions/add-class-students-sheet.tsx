"use client";

import { Check, Search, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { ErrorState } from "@/features/coach/components/error-state";
import { useAddStudentsToSession } from "@/features/coach/hooks/use-session-mutations";
import { useStudents } from "@/features/coach/hooks/use-students";
import type { Gender } from "@/features/coach/lib/coach-data";
import { beltKeyOf } from "@/features/coach/lib/students-options";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { studentBeltLabel } from "@/lib/student-belts";
import { cn } from "@/lib/utils";

export function AddClassStudentsSheet({
  open,
  onOpenChange,
  sessionId,
  clubId,
  clubGender,
  existingStudentIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  clubId: string;
  clubGender?: Gender;
  existingStudentIds: string[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const { data, error, isLoading, mutate } = useStudents({ page: 1, take: 100, gender: clubGender });
  const save = useAddStudentsToSession(sessionId);

  const students = data?.students ?? [];
  const existing = new Set(existingStudentIds);
  const term = search.trim();
  const visible = students.filter((student) => !existing.has(student.id) && (!term || student.fullName.includes(term)));

  const close = () => {
    setSearch("");
    setSelected([]);
    save.reset();
    onOpenChange(false);
  };

  const toggle = (studentId: string) => {
    setSelected((current) => (current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]));
  };

  const submit = async () => {
    try {
      await save.trigger({ clubId, studentIds: selected });
      close();
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  return (
    <SheetFrame
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title="افزودن هنرجو به کلاس"
      description="هنرجویان ثبت شده را انتخاب کنید تا هم عضو باشگاه و هم عضو این کلاس شوند."
    >
      <div className="mt-3 flex flex-col gap-3">
        {students.length > 0 ? (
          <div className="relative">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجوی نام هنرجو"
              aria-label="جستجوی نام هنرجو"
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
            <p className="rounded-xl bg-muted/60 p-4 text-center text-[11px] font-semibold leading-5 text-ink-subtle">
              هنوز هنرجویی ثبت نشده است. ابتدا در بخش هنرجویان یک پرونده بسازید، بعد او را به این کلاس اضافه کنید.
            </p>
          ) : visible.length === 0 ? (
            <p className="rounded-xl bg-muted/60 p-4 text-center text-[11px] font-semibold leading-5 text-ink-subtle">
              {term ? "هنرجویی با این نام پیدا نشد." : "هنرجوی دیگری برای افزودن نمانده است."}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {visible.map((student) => {
                const isSelected = selected.includes(student.id);
                const belt = student.currentBelt ? studentBeltLabel(beltKeyOf(student.currentBelt.belt.name)) : null;

                return (
                  <Button
                    key={student.id}
                    type="button"
                    variant="field"
                    aria-pressed={isSelected}
                    onClick={() => toggle(student.id)}
                    className={cn("h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5", isSelected && "border-primary bg-primary/5")}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full",
                        isSelected ? "bg-primary/10 text-primary" : "bg-muted text-ink-muted",
                      )}
                    >
                      <UserPlus className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 text-start">
                      <b className="block truncate text-[12px] font-extrabold text-ink">{student.fullName}</b>
                      <span className="text-[10px] font-medium text-ink-subtle">{belt ?? "بدون کمربند"}</span>
                    </span>
                    {isSelected ? <Check className="text-primary" aria-hidden="true" /> : null}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <AuthFormError message={save.error ? apiErrorMessage(save.error) : ""} />

        <div className="flex items-center gap-2 border-t border-[var(--line-2)] pt-3">
          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={close}>
            بستن
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-11 flex-1 rounded-xl text-[12px]"
            disabled={!selected.length || save.isMutating}
            onClick={() => void submit()}
          >
            {save.isMutating ? "در حال افزودن..." : `افزودن ${toPersianDigits(String(selected.length))} هنرجو`}
          </Button>
        </div>
      </div>
    </SheetFrame>
  );
}
