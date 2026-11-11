"use client";

import { Check, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionTime } from "@/features/coach/components/session-time";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { useAddStudentsToSession } from "@/features/coach/hooks/use-session-mutations";
import { useSessions, useStudentSessions } from "@/features/coach/hooks/use-sessions";
import { weekDayLabels } from "@/features/coach/lib/coach-data";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

const LIST_CLASS = "max-h-56 overflow-y-auto no-scrollbar rounded-xl border border-[var(--line-2)]";
const ROW_CLASS = "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-start transition-colors hover:bg-muted/50";
const ROW_SELECTED_CLASS = "bg-brand-50 text-accent-ink";

// Enrolls one fixed student: the coach drills from clubs down to sessions; sessions the student
// already attends render ticked and untouchable.
export function StudentSessionEnrollForm({
  studentId,
  clubId,
  onPickClub,
  onDone,
}: {
  studentId: string;
  // Null shows the club list; a club id shows its sessions.
  clubId: string | null;
  onPickClub: (clubId: string | null) => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { data } = useSessions();
  const { data: clubs } = useClubs();
  const { data: joined } = useStudentSessions(studentId);
  const save = useAddStudentsToSession();

  const clubRecords = (clubs?.clubs ?? []).filter((club) => club.isActive);
  const sessions = (data?.sessions ?? []).filter((session) => session.isActive && clubRecords.some((club) => club.id === session.clubId));
  const joinedIds = new Set((joined ?? []).map((session) => session.id));
  const clubSessions = sessions.filter((session) => session.clubId === clubId);
  const picked = clubSessions.find((session) => session.id === sessionId) ?? null;

  const submit = async () => {
    if (!picked) return;
    try {
      await save.trigger({ sessionId: picked.id, clubId: picked.clubId, studentIds: [studentId] });
      onDone();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  if (clubId === null) {
    return (
      <div className="mt-3 flex flex-col gap-3">
        <div className={LIST_CLASS}>
          {!clubs || !data ? (
            <div className="flex flex-col gap-2 p-2.5">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : clubRecords.length === 0 ? (
            <p className="p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">باشگاه فعالی ثبت نشده است</p>
          ) : (
            clubRecords.map((club) => {
              const count = sessions.filter((session) => session.clubId === club.id).length;

              return (
                <button
                  key={club.id}
                  type="button"
                  className={ROW_CLASS}
                  onClick={() => {
                    setSessionId(null);
                    onPickClub(club.id);
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-[13px] font-extrabold text-ink-body">{club.name}</b>
                    <span className="mt-0.5 block text-[12px] font-medium text-ink-muted">
                      {count > 0 ? `${toPersianDigits(String(count))} سانس` : "بدون سانس فعال"}
                    </span>
                  </span>
                  <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className={LIST_CLASS}>
        {!clubs || !data || joined === undefined ? (
          <div className="flex flex-col gap-2 p-2.5">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        ) : clubSessions.length === 0 ? (
          <p className="p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">کلاس فعالی برای افزودن ثبت نشده است</p>
        ) : (
          clubSessions.map((session) => {
            const isJoined = joinedIds.has(session.id);
            const isSelected = sessionId === session.id;

            return (
              <button
                key={session.id}
                type="button"
                aria-pressed={isJoined || isSelected}
                disabled={isJoined}
                onClick={() => setSessionId(session.id)}
                className={cn(ROW_CLASS, (isJoined || isSelected) && ROW_SELECTED_CLASS)}
              >
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[13px] font-extrabold text-ink-body">{session.name}</b>
                  <span className="mt-0.5 block truncate text-[12px] font-medium text-ink-muted">
                    {weekDayLabels(session.weekDays).join(" · ")} · <SessionTime start={session.startTime} end={session.endTime} />
                  </span>
                </span>
                {isJoined ? (
                  <>
                    <span className="shrink-0 text-[11px] font-bold text-accent-ink">عضو</span>
                    <Check className="size-4 shrink-0 text-accent-ink" aria-hidden="true" />
                  </>
                ) : isSelected ? (
                  <Check className="size-4 shrink-0 text-accent-ink" aria-hidden="true" />
                ) : null}
              </button>
            );
          })
        )}
      </div>

      <AuthFormError message={save.error ? apiErrorMessage(save.error) : ""} />

      <div className="flex items-center gap-2 border-t border-[var(--line-2)] pt-3">
        <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={onDone} disabled={save.isMutating}>
          انصراف
        </Button>
        <Button
          type="button"
          variant="brand"
          className="h-11 flex-1 rounded-xl text-[12px]"
          disabled={!picked || save.isMutating}
          onClick={() => void submit()}
        >
          {save.isMutating ? "در حال افزودن..." : "افزودن به کلاس"}
        </Button>
      </div>
    </div>
  );
}
