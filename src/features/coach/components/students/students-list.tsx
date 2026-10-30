import { SearchX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import type { AgeCategoryRecord, StudentRecord } from "@/features/coach/lib/student-api";
import { StudentsListItem } from "./students-list-item";

export function StudentsList({
  students,
  ageCategories,
  expiringDays,
  hasFilters,
  onClear,
}: {
  students: StudentRecord[];
  ageCategories: AgeCategoryRecord[];
  expiringDays: number;
  hasFilters: boolean;
  onClear: () => void;
}) {
  if (students.length === 0) {
    return (
      <Empty className="mt-4 border-none bg-transparent p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-brand-50 text-accent-ink">
            {hasFilters ? <SearchX aria-hidden="true" /> : <Users aria-hidden="true" />}
          </EmptyMedia>
          <EmptyTitle className="text-[13px] font-extrabold text-ink">
            {hasFilters ? "هنرجویی با این فیلترها پیدا نشد" : "هنوز هنرجویی ثبت نشده"}
          </EmptyTitle>
          <EmptyDescription className="text-[11.5px] leading-5 text-ink-subtle">
            {hasFilters ? "ترکیب فیلترها یا عبارت جستجو را تغییر دهید." : "اولین هنرجو را با فرم ثبت نام یا ارسال دعوت نامه اضافه کنید."}
          </EmptyDescription>
        </EmptyHeader>
        {hasFilters ? (
          <EmptyContent>
            <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={onClear}>
              پاک کردن فیلترها
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2.5">
      {students.map((student) => (
        <StudentsListItem key={student.id} student={student} ageCategories={ageCategories} expiringDays={expiringDays} />
      ))}
    </div>
  );
}
