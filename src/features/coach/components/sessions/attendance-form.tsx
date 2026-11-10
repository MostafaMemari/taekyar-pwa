"use client";

import { Check, Loader2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ActionDock } from "@/features/coach/components/action-dock";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { AttendanceItem, ClassAttendanceEntry } from "@/features/coach/lib/attendance-api";
import { ATTENDANCE_META, type AttendanceStatus } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { AttendanceGuestSheet } from "./attendance-guest-sheet";
import { AttendanceNoteSheet } from "./attendance-note-sheet";
import { AttendanceRosterCard } from "./attendance-roster-card";

const STATUS_ORDER: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"];

export function AttendanceForm({
  entries,
  pending,
  error,
  onSave,
}: {
  entries: ClassAttendanceEntry[];
  pending: boolean;
  error: string;
  onSave: (items: AttendanceItem[]) => void;
}) {
  const [guests, setGuests] = useState<ClassAttendanceEntry[]>([]);
  const [guestOpen, setGuestOpen] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(entries.filter((entry) => entry.attendance?.note).map((entry) => [entry.studentId, entry.attendance?.note ?? ""])),
  );
  const [reviewed, setReviewed] = useState<Set<string>>(
    () => new Set(entries.filter((entry) => entry.attendance).map((entry) => entry.studentId)),
  );
  const [noteTarget, setNoteTarget] = useState<ClassAttendanceEntry | null>(null);

  // Guests picked here are local until save; the roster refetch returns them as saved entries.
  const allEntries = [...entries, ...guests];

  const statusOf = (entry: ClassAttendanceEntry): AttendanceStatus => overrides[entry.studentId] ?? entry.attendance?.status ?? "PRESENT";

  const total = allEntries.length;
  const counts: Record<AttendanceStatus, number> = { PRESENT: 0, LATE: 0, ABSENT: 0, EXCUSED: 0 };
  for (const entry of allEntries) counts[statusOf(entry)] += 1;

  const changeStatus = (studentId: string, status: AttendanceStatus) => {
    setOverrides((current) => ({ ...current, [studentId]: status }));
    setReviewed((current) => new Set(current).add(studentId));
  };

  const markAllPresent = () => {
    setOverrides(Object.fromEntries(allEntries.map((entry) => [entry.studentId, "PRESENT" as const])));
    setReviewed(new Set(allEntries.map((entry) => entry.studentId)));
  };

  const save = () => {
    onSave(
      allEntries.map((entry) => ({
        studentId: entry.studentId,
        status: statusOf(entry),
        note: notes[entry.studentId]?.trim() || null,
      })),
    );
  };

  const pickGuest = (student: { id: string; fullName: string }) => {
    setGuests((current) =>
      current.some((guest) => guest.studentId === student.id)
        ? current
        : [
            ...current,
            {
              id: student.id,
              classSessionId: "",
              studentId: student.id,
              student: { id: student.id, fullName: student.fullName },
              attendance: null,
              isGuest: true,
            },
          ],
    );
    setGuestOpen(false);
  };

  return (
    <>
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--card-line)] bg-card px-4 py-3 shadow-[var(--card-shadow)]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold text-ink-body">پیشرفت علامت گذاری</span>
            <span className="text-[12px] font-bold text-ink-subtle">
              {toPersianDigits(String(reviewed.size))} از {toPersianDigits(String(total))} هنرجو
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full w-full origin-left rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-transform duration-200"
              style={{ transform: `scaleX(${total ? reviewed.size / total : 0})` }}
            />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {STATUS_ORDER.map((status) => (
              <StatusBadge key={status} tone={ATTENDANCE_META[status].tone}>
                {ATTENDANCE_META[status].label} <b className="tabular-nums">{toPersianDigits(String(counts[status]))}</b>
              </StatusBadge>
            ))}
          </div>
        </div>
        <Button type="button" variant="outline" className="h-9 shrink-0 rounded-xl px-3 text-[12px] font-semibold" onClick={markAllPresent}>
          <Check data-icon="inline-start" aria-hidden="true" />
          همه حاضر
        </Button>
      </div>

      <section className="mt-4">
        <SectionHeading
          title="هنرجویان کلاس"
          action={
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 rounded-lg px-2.5 text-[11px] font-bold"
                onClick={() => setGuestOpen(true)}
              >
                <UserPlus data-icon="inline-start" aria-hidden="true" />
                افزودن مهمان
              </Button>
              <StatusBadge>
                <Users aria-hidden="true" />
                {toPersianDigits(String(total))} نفر
              </StatusBadge>
            </div>
          }
        />
        <div className="flex flex-col gap-2.5">
          {allEntries.map((entry) => (
            <AttendanceRosterCard
              key={entry.studentId}
              name={entry.student.fullName}
              isGuest={entry.isGuest}
              status={statusOf(entry)}
              note={notes[entry.studentId]}
              onStatusChange={(status) => changeStatus(entry.studentId, status)}
              onNoteOpen={() => setNoteTarget(entry)}
              onRemove={
                guests.some((guest) => guest.studentId === entry.studentId)
                  ? () => setGuests((current) => current.filter((guest) => guest.studentId !== entry.studentId))
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      <ActionDock>
        {error ? (
          <p role="alert" className="mb-2 rounded-xl bg-danger-soft px-3 py-2 text-[12px] font-bold leading-5 text-danger">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          variant="brand"
          className="h-12 w-full rounded-xl text-[13px] font-extrabold"
          onClick={save}
          disabled={pending || total === 0}
        >
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
          ) : (
            <Check data-icon="inline-start" aria-hidden="true" />
          )}
          {pending ? "در حال ذخیره..." : `ذخیره حضور و غیاب (${toPersianDigits(String(total))})`}
        </Button>
      </ActionDock>

      <AttendanceGuestSheet
        open={guestOpen}
        onOpenChange={setGuestOpen}
        excludeIds={new Set(allEntries.map((entry) => entry.studentId))}
        onPick={pickGuest}
      />

      <AttendanceNoteSheet
        open={noteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setNoteTarget(null);
        }}
        studentName={noteTarget?.student.fullName ?? ""}
        note={noteTarget ? (notes[noteTarget.studentId] ?? "") : ""}
        onSave={(value) => {
          if (!noteTarget) return;
          setNotes((current) => ({ ...current, [noteTarget.studentId]: value }));
          setReviewed((current) => new Set(current).add(noteTarget.studentId));
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
