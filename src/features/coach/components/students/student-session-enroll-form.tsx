"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionTime } from "@/features/coach/components/session-time";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { useAddStudentsToSession } from "@/features/coach/hooks/use-session-mutations";
import { useSessions } from "@/features/coach/hooks/use-sessions";
import { weekDayLabels } from "@/features/coach/lib/coach-data";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

// Enrolls one fixed student into a picked session; lives inside the quick-info sheet as a swapped view.
export function StudentSessionEnrollForm({ studentId, onDone }: { studentId: string; onDone: () => void }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { data } = useSessions();
  const { data: clubs } = useClubs();
  const save = useAddStudentsToSession();

  const clubNames = new Map((clubs?.clubs ?? []).map((club) => [club.id, club.name]));
  const activeClubs = new Set((clubs?.clubs ?? []).filter((club) => club.isActive).map((club) => club.id));
  const sessions = (data?.sessions ?? []).filter((session) => session.isActive && activeClubs.has(session.clubId));
  const picked = sessions.find((session) => session.id === sessionId) ?? null;

  const submit = async () => {
    if (!picked) return;
    try {
      await save.trigger({ sessionId: picked.id, clubId: picked.clubId, studentIds: [studentId] });
      onDone();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="max-h-56 overflow-y-auto no-scrollbar rounded-xl border border-[var(--line-2)]">
        {!data ? (
          <div className="flex flex-col gap-2 p-2.5">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">کلاس فعالی برای افزودن ثبت نشده است</p>
        ) : (
          sessions.map((session) => {
            const isSelected = sessionId === session.id;

            return (
              <button
                key={session.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSessionId(session.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-start transition-colors hover:bg-muted/50",
                  isSelected && "bg-brand-50 text-accent-ink",
                )}
              >
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[13px] font-extrabold text-ink-body">{session.name}</b>
                  <span className="mt-0.5 block truncate text-[12px] font-medium text-ink-muted">
                    {clubNames.get(session.clubId) ?? ""} · {weekDayLabels(session.weekDays).join(" · ")} ·{" "}
                    <SessionTime start={session.startTime} end={session.endTime} />
                  </span>
                </span>
                {isSelected ? <Check className="size-4 shrink-0 text-accent-ink" aria-hidden="true" /> : null}
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
