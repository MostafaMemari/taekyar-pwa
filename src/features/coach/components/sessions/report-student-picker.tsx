"use client";

import { ChevronLeft, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { ClassAttendanceEntry } from "@/features/coach/lib/attendance-api";
import { ATTENDANCE_META, type AttendanceStatus } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";

// The entry list is the picker: one tap opens that student's attendance report.
export function ReportStudentPicker({ entries }: { entries: ClassAttendanceEntry[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex cursor-pointer items-center gap-0.5 text-[12px] font-semibold text-accent-ink"
        onClick={() => setOpen(true)}
      >
        گزارش تک هنرجو
        <ChevronLeft className="size-3" aria-hidden="true" />
      </button>

      <SheetFrame open={open} onOpenChange={setOpen} title="گزارش تک هنرجو" description="هنرجو را برای دیدن گزارش حضور و غیاب انتخاب کن">
        <div className="mt-3 h-[50vh] overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <Link
                key={entry.studentId}
                href={`/coach/students/${entry.studentId}/attendance`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50"
                onClick={() => setOpen(false)}
              >
                <PersonAvatar name={entry.student.fullName} className="size-9" fallbackClassName="text-[12px]" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-ink-body">{entry.student.fullName}</span>
                {entry.attendance ? (
                  <StatusBadge tone={ATTENDANCE_META[entry.attendance.status as AttendanceStatus]?.tone} className="shrink-0">
                    {ATTENDANCE_META[entry.attendance.status as AttendanceStatus]?.label}
                  </StatusBadge>
                ) : null}
                <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
              </Link>
            ))}
          </div>
          {entries.length === 0 ? (
            <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
              هنرجویی برای این جلسه ثبت نشده است
            </p>
          ) : (
            <p className="mt-2 flex items-center justify-center gap-1 text-center text-[12px] font-semibold text-ink-subtle">
              <Users className="size-3.5" aria-hidden="true" />
              {toPersianDigits(String(entries.length))} هنرجو
            </p>
          )}
        </div>
      </SheetFrame>
    </>
  );
}
