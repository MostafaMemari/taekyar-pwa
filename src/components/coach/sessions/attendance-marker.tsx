"use client";

import { CalendarDays, Check, ClipboardList, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionDock } from "@/components/coach/coach-form";
import { CoachPageHeader } from "@/components/coach/coach-page-header";
import { GymContext, SectionHeading, SessionTime, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ATTENDANCE_META, type AttendanceStatus } from "@/lib/coach/coach-data";
import { getSessionDetail, type SessionRosterEntry } from "@/lib/coach/session-data";
import { toPersianDigits } from "@/lib/digits";
import { AttendanceNoteSheet } from "./attendance-note-sheet";
import { AttendanceRosterCard } from "./attendance-roster-card";

const STATUS_ORDER: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"];

export function AttendanceMarker({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const detail = getSessionDetail(sessionId);
  const roster = detail?.roster ?? [];
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    for (const entry of roster) initial[entry.studentId] = entry.status;
    return initial;
  });
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const entry of roster) if (entry.note) initial[entry.studentId] = entry.note;
    return initial;
  });
  const [noteTarget, setNoteTarget] = useState<SessionRosterEntry | null>(null);

  if (!detail) return null;

  const counts: Record<AttendanceStatus, number> = { PRESENT: 0, LATE: 0, ABSENT: 0, EXCUSED: 0 };
  for (const entry of detail.roster) counts[statuses[entry.studentId]] += 1;

  const total = detail.roster.length;

  const markAllPresent = () => {
    const next: Record<string, AttendanceStatus> = {};
    for (const entry of detail.roster) next[entry.studentId] = "PRESENT";
    setStatuses(next);
  };

  const save = () => {
    router.push(`/coach/sessions/${detail.id}/report`);
  };

  return (
    <>
      <CoachPageHeader
        title="ثبت حضور و غیاب"
        subtitle={detail.name}
        backHref={`/coach/sessions/${detail.id}`}
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="گزارش جلسه"
            className="size-10 rounded-xl text-ink-body"
            render={<Link href={`/coach/sessions/${detail.id}/report`} />}
            nativeButton={false}
          >
            <ClipboardList aria-hidden="true" />
          </Button>
        }
      />

      <GymContext className="mt-4" name={detail.club} subtitle="حضور و غیاب اختصاصی این باشگاه" />

      <Card className="mt-4 gap-0 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-ink">
            <Zap className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-[13.5px] font-extrabold text-ink">{detail.name}</b>
            <p className="mt-0.5 truncate text-[11px] text-ink-subtle">
              {detail.club} · <SessionTime start={detail.start} end={detail.end} />
            </p>
          </div>
          <StatusBadge tone="brand" className="shrink-0">
            <Users aria-hidden="true" />
            {toPersianDigits(String(detail.memberCount))} هنرجو
          </StatusBadge>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[var(--line-1)] pt-3">
          <span className="text-[11px] font-bold text-ink-subtle">تاریخ جلسه:</span>
          <StatusBadge tone="brand">
            <CalendarDays aria-hidden="true" />
            {detail.lastSession.date}
          </StatusBadge>
        </div>
      </Card>

      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--card-line)] bg-card px-4 py-3 shadow-[var(--card-shadow)]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold text-ink-body">پیشرفت علامت گذاری</span>
            <span className="text-[10.5px] font-bold text-ink-subtle">
              {toPersianDigits(String(total))} از {toPersianDigits(String(total))} هنرجو
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <span className="block h-full w-full rounded-full bg-gradient-to-l from-brand-400 to-brand-600" />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {STATUS_ORDER.map((status) => (
              <StatusBadge key={status} tone={ATTENDANCE_META[status].tone}>
                {ATTENDANCE_META[status].label} <b className="tabular-nums">{toPersianDigits(String(counts[status]))}</b>
              </StatusBadge>
            ))}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-9 shrink-0 rounded-xl px-3 text-[10.5px] font-extrabold"
          onClick={markAllPresent}
        >
          <Check data-icon="inline-start" aria-hidden="true" />
          همه حاضر
        </Button>
      </div>

      <section className="mt-4">
        <SectionHeading
          title="هنرجویان کلاس"
          action={
            <StatusBadge>
              <Users aria-hidden="true" />
              {toPersianDigits(String(total))} نفر
            </StatusBadge>
          }
        />
        <div className="flex flex-col gap-2.5">
          {detail.roster.map((entry) => (
            <AttendanceRosterCard
              key={entry.studentId}
              entry={entry}
              status={statuses[entry.studentId]}
              note={notes[entry.studentId]}
              onStatusChange={(status) => setStatuses((current) => ({ ...current, [entry.studentId]: status }))}
              onNoteOpen={() => setNoteTarget(entry)}
            />
          ))}
        </div>
      </section>

      <ActionDock>
        <Button type="button" variant="brand" className="h-12 w-full rounded-xl text-[13px] font-extrabold" onClick={save}>
          <Check data-icon="inline-start" aria-hidden="true" />
          ذخیره حضور و غیاب ({toPersianDigits(String(total))})
        </Button>
      </ActionDock>

      <AttendanceNoteSheet
        open={noteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setNoteTarget(null);
        }}
        studentName={noteTarget?.name ?? ""}
        note={noteTarget ? (notes[noteTarget.studentId] ?? "") : ""}
        onSave={(value) => {
          if (!noteTarget) return;
          setNotes((current) => ({ ...current, [noteTarget.studentId]: value }));
        }}
        onClear={() => {
          if (!noteTarget) return;
          setNotes((current) => {
            const next = { ...current };
            delete next[noteTarget.studentId];
            return next;
          });
        }}
      />
    </>
  );
}
