import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { BELT_EXAMS } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardExams() {
  return (
    <section>
      <SectionHeading title="آزمون های پیش رو" />
      <Card className="gap-0 p-0">
        {BELT_EXAMS.map((exam, index) => (
          <div key={exam.id} className={cn("flex items-center gap-3 px-4 py-3", index > 0 && "border-t border-[var(--line-2)]")}>
            <span className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-muted py-1.5 text-ink">
              <b className="text-base leading-5 font-extrabold tabular-nums">{toPersianDigits(exam.day)}</b>
              <span className="text-xs font-medium">{exam.month}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-5 font-bold text-ink">{exam.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <StatusBadge tone={exam.status === "open" ? "success" : "neutral"} className="text-xs">
                  {exam.status === "open" ? "در حال ثبت نام" : "به زودی"}
                </StatusBadge>
                <span className="text-xs text-ink-muted">
                  {exam.course} · {toPersianDigits(exam.deadline)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}
