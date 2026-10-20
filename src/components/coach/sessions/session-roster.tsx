import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { AttendanceStatusText, PersonAvatar } from "@/components/coach/coach-ui";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SessionRosterEntry } from "@/lib/coach/session-data";
import { cn } from "@/lib/utils";

export function SessionRoster({
  entries,
  lastSessionDate,
  showNotes = false,
  linkStudents = false,
  className,
}: {
  entries: SessionRosterEntry[];
  lastSessionDate?: string;
  showNotes?: boolean;
  linkStudents?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("gap-0 px-4 py-1", className)}>
      {entries.map((entry, index) => {
        const subline = showNotes ? (entry.note ?? "بدون توضیح") : lastSessionDate ? `آخرین وضعیت: ${lastSessionDate}` : null;
        const row = (
          <div className="flex items-center gap-3 py-2.5">
            <PersonAvatar name={entry.name} className="size-9" fallbackClassName="text-[12px]" />
            <span className="min-w-0 flex-1">
              <b className="block truncate text-[12.5px] font-extrabold text-ink-body">{entry.name}</b>
              {subline ? <span className="mt-0.5 block truncate text-[10px] font-semibold text-ink-subtle">{subline}</span> : null}
            </span>
            <AttendanceStatusText status={entry.status} />
            {linkStudents ? <ChevronLeft className="size-4 shrink-0 text-ink-faint" aria-hidden="true" /> : null}
          </div>
        );

        return (
          <Fragment key={entry.studentId}>
            {index > 0 ? <Separator /> : null}
            {linkStudents ? (
              <Link href={`/coach/students/${entry.studentId}`} className="block rounded-lg transition duration-150 active:scale-[0.995]">
                {row}
              </Link>
            ) : (
              row
            )}
          </Fragment>
        );
      })}
    </Card>
  );
}
