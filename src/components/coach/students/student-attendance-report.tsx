"use client";

import { CalendarCheck2 } from "lucide-react";
import { useState } from "react";
import { attendanceTotal } from "@/components/coach/attendance-summary";
import { CoachSheet } from "@/components/coach/coach-band";
import { ATTENDANCE_META, type AttendanceStatus } from "@/components/coach/coach-data";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toPersianDigits } from "@/lib/digits";
import { StudentAttendanceRecordCard } from "./student-attendance-record-card";
import { StudentAttendanceSummary } from "./student-attendance-summary";
import { StudentBand } from "./student-band";
import { groupAttendanceByMonth, type StudentProfile } from "./student-profile-data";

type AttendanceFilter = "ALL" | AttendanceStatus;

const FILTERS: { value: AttendanceFilter; label: string }[] = [
  { value: "ALL", label: "همه" },
  { value: "PRESENT", label: ATTENDANCE_META.PRESENT.label },
  { value: "LATE", label: ATTENDANCE_META.LATE.label },
  { value: "ABSENT", label: ATTENDANCE_META.ABSENT.label },
  { value: "EXCUSED", label: ATTENDANCE_META.EXCUSED.label },
];

export function StudentAttendanceReport({ profile }: { profile: StudentProfile }) {
  const [filter, setFilter] = useState<AttendanceFilter>("ALL");
  const { counts } = profile.attendance;

  const records = filter === "ALL" ? profile.attendance.records : profile.attendance.records.filter((record) => record.status === filter);
  const groups = groupAttendanceByMonth(records);

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <StudentBand
        profile={profile}
        backHref={`/coach/students/${profile.id}`}
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
          footer={<>مجموع: {toPersianDigits(String(attendanceTotal(counts)))} جلسه — از ابتدای عضویت تا شنبه ۲۴ آبان</>}
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
                    <StudentAttendanceRecordCard key={record.id} record={record} showIcon />
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
