import { BELT_EXAMS } from "@/components/coach/coach-data";
import { SectionHeading, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/digits";

export function DashboardExams() {
  return (
    <section>
      <SectionHeading
        title="آزمون های پیش رو"
        action={
          <Button variant="link" size="sm" className="h-auto p-0 text-[10.5px] font-extrabold text-accent-ink">
            همه
          </Button>
        }
      />
      <div className="grid gap-3">
        {BELT_EXAMS.map((exam) => (
          <Card key={exam.id} className="flex-row items-center gap-3 rounded-2xl p-3.5">
            <span className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-brand-50 py-2 text-accent-ink">
              <b className="text-[18px] font-extrabold leading-none tabular-nums">{toPersianDigits(exam.day)}</b>
              <span className="mt-1 text-[9.5px] font-bold">{exam.month}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-1.5">
                <StatusBadge tone="brand">{exam.course}</StatusBadge>
                <StatusBadge tone={exam.status === "open" ? "success" : "neutral"}>
                  {exam.status === "open" ? "در حال ثبت نام" : "به زودی"}
                </StatusBadge>
              </span>
              <b className="mt-1.5 block truncate text-[12.5px] font-extrabold text-ink">{exam.title}</b>
              <span className="mt-1 block text-[10px] font-medium text-ink-subtle">{toPersianDigits(exam.deadline)}</span>
            </span>
          </Card>
        ))}
      </div>
    </section>
  );
}
