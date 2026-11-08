"use client";

import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useBeltExams } from "@/features/coach/hooks/use-belt-exams";
import { useExamNames } from "@/features/coach/hooks/use-exam-names";
import type { StudentFeedQuery } from "@/features/coach/lib/student-api";
import { examBeltRangeOf } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";

const COUNT_OPTIONS: (number | null)[] = [10, 25, 50, 100, null];

export function CopyExamNamesSheet({
  open,
  onOpenChange,
  examId,
  query,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  query: StudentFeedQuery;
}) {
  const [limit, setLimit] = useState<number | null>(10);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const exams = useBeltExams();
  const exam = exams.data?.find((item) => item.id === examId);
  const names = useExamNames(query, limit, open && Boolean(examId));

  const list = names.data ?? [];
  const text = [
    `فهرست هنرجویان واجد شرایط ${exam ? `آزمون دوره ${toPersianDigits(String(exam.examNumber))}` : "آزمون"}`,
    [exam ? examBeltRangeOf(exam.belts) : null, exam ? `برگزاری ${toJalaliDate(exam.eventDate)}` : null].filter(Boolean).join(" · "),
    `تعداد: ${toPersianDigits(String(list.length))} نفر`,
    "",
    ...list.map((name, index) => `${toPersianDigits(String(index + 1))}. ${name}`),
  ].join("\n");

  const copy = async () => {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onOpenChange(false);
      }, 1200);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="کپی اسامی آزمون" description="تعداد را انتخاب کن و فهرست را کپی کن.">
      <div className="flex flex-wrap gap-1.5">
        {COUNT_OPTIONS.map((option) => (
          <Button
            key={String(option)}
            type="button"
            variant={limit === option ? "brand" : "outline"}
            size="sm"
            className="h-9 rounded-xl px-3.5 text-[12px] font-bold"
            onClick={() => setLimit(option)}
          >
            {option === null ? "همه" : toPersianDigits(String(option))}
          </Button>
        ))}
      </div>

      {names.error ? (
        <p className="text-[12px] font-bold leading-5 text-danger">
          {names.error instanceof Error ? names.error.message : "خواندن فهرست انجام نشد."}
        </p>
      ) : names.isLoading && !names.data ? (
        <div className="flex flex-col gap-1.5 rounded-xl bg-muted/60 p-3">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      ) : (
        <pre className="max-h-44 overflow-y-auto rounded-xl bg-muted/60 p-3 font-sans text-start text-[12px] leading-5 whitespace-pre-wrap text-ink-body">
          {text}
        </pre>
      )}

      {copyError ? <p className="text-[12px] font-bold leading-5 text-danger">کپی انجام نشد. دسترسی کلیپ‌بورد را بررسی کن.</p> : null}

      <Button
        type="button"
        variant="brand"
        className="h-11 w-full rounded-xl text-[13px] font-extrabold"
        onClick={() => void copy()}
        disabled={names.isLoading || !names.data || copied}
      >
        {names.isLoading ? (
          <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
        ) : copied ? (
          <Check data-icon="inline-start" aria-hidden="true" />
        ) : (
          <Copy data-icon="inline-start" aria-hidden="true" />
        )}
        {copied ? "کپی شد" : names.isLoading ? "در حال آماده سازی..." : `کپی ${toPersianDigits(String(list.length))} نام`}
      </Button>
    </SheetFrame>
  );
}
