"use client";

import { Check, Copy, Loader2, Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useExamStudents } from "@/features/coach/hooks/use-exam-students";
import type { StudentFeedQuery } from "@/features/coach/lib/student-api";
import { membershipChargeOf } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";

const COUNT_OPTIONS: (number | null)[] = [10, 25, 50, 100, null];

// Valid charges stay silent on the line; only owed or missing charges get a suffix.
function chargeLabelOf(membershipYear: number | null): string {
  const charge = membershipChargeOf(membershipYear);
  if (charge === null) return "شارژ ثبت نشده";
  return `${toPersianDigits(String(charge.due))} سال شارژ`;
}

export function CopyNamesSheet({
  open,
  onOpenChange,
  query,
  title,
  headerLines,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: StudentFeedQuery;
  title: string;
  headerLines: string[];
}) {
  const [limit, setLimit] = useState<number | null>(10);
  const [withCharge, setWithCharge] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const students = useExamStudents(query, limit, open);

  const list = students.data ?? [];
  const text = [
    ...headerLines,
    `تعداد: ${toPersianDigits(String(list.length))} نفر`,
    "",
    ...list.map((student, index) => {
      const charge = membershipChargeOf(student.membershipYear);
      const suffix = withCharge && (charge === null || charge.due > 0) ? ` · ${chargeLabelOf(student.membershipYear)}` : "";
      return `${toPersianDigits(String(index + 1))}. ${student.fullName}${suffix}`;
    }),
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
    <SheetFrame open={open} onOpenChange={onOpenChange} title={title} description="تعداد را انتخاب کن و فهرست را کپی کن.">
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
        <Button
          type="button"
          variant={withCharge ? "brand" : "outline"}
          size="sm"
          className="h-9 gap-1.5 rounded-xl px-3.5 text-[12px] font-bold"
          onClick={() => setWithCharge((current) => !current)}
          aria-pressed={withCharge}
        >
          <Wallet className="size-3.5" aria-hidden="true" />
          وضعیت شارژ
        </Button>
      </div>

      {students.error ? (
        <p className="text-[12px] font-bold leading-5 text-danger">
          {students.error instanceof Error ? students.error.message : "خواندن فهرست انجام نشد."}
        </p>
      ) : students.isLoading && !students.data ? (
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
        disabled={students.isLoading || !students.data || copied}
      >
        {students.isLoading ? (
          <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
        ) : copied ? (
          <Check data-icon="inline-start" aria-hidden="true" />
        ) : (
          <Copy data-icon="inline-start" aria-hidden="true" />
        )}
        {copied ? "کپی شد" : students.isLoading ? "در حال آماده سازی..." : `کپی ${toPersianDigits(String(list.length))} نام`}
      </Button>
    </SheetFrame>
  );
}
