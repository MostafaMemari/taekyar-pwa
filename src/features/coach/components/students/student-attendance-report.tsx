"use client";

import { CalendarCheck2 } from "lucide-react";
import { useState } from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { useStudentAttendance } from "@/features/coach/hooks/use-attendance";
import { useStudentClubs } from "@/features/coach/hooks/use-clubs";
import { useStudent } from "@/features/coach/hooks/use-student";
import type { StudentAttendanceEntry } from "@/features/coach/lib/attendance-api";
import { attendanceTotal } from "@/features/coach/lib/attendance-summary";
import { ATTENDANCE_META, type AttendanceStatus } from "@/features/coach/lib/coach-data";
import { beltKeyOf } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDay, toJalaliMonth } from "@/lib/jalali";
import { StudentAttendanceRecordCard } from "./student-attendance-record-card";
import { StudentAttendanceSummary } from "./student-attendance-summary";
import { StudentBand } from "./student-band";

type AttendanceFilter = "ALL" | AttendanceStatus;

const FILTERS: { value: AttendanceFilter; label: string }[] = [
  { value: "ALL", label: "همه" },
  { value: "PRESENT", label: ATTENDANCE_META.PRESENT.label },
  { value: "LATE", label: ATTENDANCE_META.LATE.label },
  { value: "ABSENT", label: ATTENDANCE_META.ABSENT.label },
  { value: "EXCUSED", label: ATTENDANCE_META.EXCUSED.label },
];

function groupByMonth(records: StudentAttendanceEntry[]) {
  const groups: { month: string; records: StudentAttendanceEntry[] }[] = [];

  for (const record of records) {
    const month = toJalaliMonth(record.sessionDate);
    const last = groups[groups.length - 1];
    if (last?.month === month) last.records.push(record);
    else groups.push({ month, records: [record] });
  }

  return groups;
}

export function StudentAttendanceReport({ studentId }: { studentId: string }) {
  const [filter, setFilter] = useState<AttendanceFilter>("ALL");
  const student = useStudent(studentId);
  const attendance = useStudentAttendance(studentId);
  const clubs = useStudentClubs(studentId);

  const error = student.error ?? attendance.error;

  if (error) {
    return (
      <CoachSheet className="flex flex-col gap-3">
        <ErrorState
          title="خواندن گزارش حضور و غیاب انجام نشد"
          message={apiErrorMessage(error)}
          onRetry={() => {
            void student.mutate();
            void attendance.mutate();
          }}
        />
      </CoachSheet>
    );
  }

  if (!student.data || !attendance.data) {
    return (
      <CoachSheet className="flex flex-col gap-3">
        <Skeleton className="h-28 w-full rounded-2xl" />
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-16 w-full rounded-xl" />
        ))}
      </CoachSheet>
    );
  }

  const profile = student.data;
  const { counts, records } = attendance.data;
  const belt = profile.currentBelt ? beltKeyOf(profile.currentBelt.belt.name) : null;
  const visible = filter === "ALL" ? records : records.filter((record) => record.status === filter);
  const groups = groupByMonth(visible);
  const lastSession = records[0] ? toJalaliDay(records[0].sessionDate) : "";

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <StudentBand
        fullName={profile.fullName}
        belt={belt}
        clubName={clubs.data?.[0]?.club.name ?? null}
        backHref={`/coach/students/${studentId}`}
        watermark="گزارش"
        chip="گزارش حضور و غیاب"
        meta={
          <span className="meta-glass">
            کد ملی <span dir="ltr">{toPersianDigits(profile.nationalCode)}</span>
          </span>
        }
      />

      <CoachSheet className="flex flex-col gap-3">
        <StudentAttendanceSummary
          counts={counts}
          footer={
            <>
              مجموع: {toPersianDigits(String(attendanceTotal(counts)))} جلسه — از ابتدای عضویت{lastSession ? ` تا ${lastSession}` : ""}
            </>
          }
        />

        <ToggleGroup
          aria-label="فیلتر وضعیت حضور"
          value={[filter]}
          onValueChange={(next) => {
            const selected = next[0] as AttendanceFilter | undefined;
            if (selected) setFilter(selected);
          }}
          variant="outline"
          spacing={2}
          className="w-full flex-wrap"
        >
          {FILTERS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="h-8 rounded-full px-3.5 text-[10.5px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {groups.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {groups.map((group) => (
              <section key={group.month}>
                <h2 className="mb-2 mt-1 text-[12.5px] font-extrabold text-ink-muted">{group.month}</h2>
                <div className="flex flex-col gap-2.5">
                  {group.records.map((record) => (
                    <StudentAttendanceRecordCard
                      key={record.id}
                      sessionName={record.classSession.name}
                      clubName={record.classSession.club.name}
                      date={toJalaliDay(record.sessionDate)}
                      status={record.status}
                      note={record.note}
                      showIcon
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <Empty className="mt-2 border-none bg-transparent p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-brand-50 text-accent-ink">
                <CalendarCheck2 aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-[13px] font-extrabold text-ink">رکوردی با این وضعیت یافت نشد</EmptyTitle>
              <EmptyDescription className="text-[11.5px] leading-5 text-ink-subtle">وضعیت دیگری را انتخاب کنید.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CoachSheet>
    </main>
  );
}
