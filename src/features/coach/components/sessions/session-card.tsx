import { Check, ChevronLeft, ClipboardCheck, Landmark, Minus, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { weekDayLabels } from "@/features/coach/lib/coach-data";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function SessionCard({
  session,
  clubName,
  memberCount,
  canAttend,
}: {
  session: ClassSessionRecord;
  clubName: string;
  memberCount?: number;
  canAttend: boolean;
}) {
  return (
    <Card className="gap-0 p-0">
      <Link
        href={`/coach/sessions/${session.id}`}
        className="block rounded-t-xl p-4 pb-3 transition-colors active:bg-muted/40"
        aria-label={`جزئیات ${session.name}`}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid w-14 shrink-0 place-items-center rounded-2xl px-1 py-2.5",
              session.isActive ? "bg-brand-50 text-accent-ink" : "bg-muted text-ink-subtle",
            )}
          >
            <b className="text-[15px] font-extrabold leading-5 tabular-nums">{toPersianDigits(session.startTime)}</b>
            <span className="mt-0.5 text-[10px] font-bold text-ink-subtle">تا {toPersianDigits(session.endTime)}</span>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <b className="truncate text-[14px] font-extrabold text-ink">{session.name}</b>
              <StatusBadge tone={session.isActive ? "success" : "neutral"} className="shrink-0">
                {session.isActive ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
                {session.isActive ? "فعال" : "غیرفعال"}
              </StatusBadge>
            </div>
            <p className="mt-1 flex min-w-0 items-center gap-1 text-[12px] text-ink-subtle">
              <Landmark className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{clubName}</span>
            </p>
          </div>

          <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {weekDayLabels(session.weekDays).map((label) => (
            <span key={label} className="rounded-lg bg-muted px-2 py-1 text-[11px] font-bold text-ink-muted">
              {label}
            </span>
          ))}
          <span className="ms-auto flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-[11px] font-bold tabular-nums text-accent-ink">
            <Users className="size-3" aria-hidden="true" />
            {memberCount === undefined ? "—" : toPersianDigits(String(memberCount))} هنرجو
          </span>
        </div>
      </Link>

      <div className="border-t border-[var(--line-2)] bg-[var(--surface-2)]">
        <Button
          variant="ghost"
          size="sm"
          className="h-11 w-full justify-between rounded-none px-4 text-[12px] font-semibold text-accent-ink"
          render={<Link href={`/coach/sessions/${session.id}/attendance`} />}
          nativeButton={false}
          disabled={!canAttend}
        >
          <span className="flex items-center gap-2">
            <ClipboardCheck className="size-4" aria-hidden="true" />
            حضور و غیاب
          </span>
          <ChevronLeft className="size-3.5 text-ink-subtle" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}
