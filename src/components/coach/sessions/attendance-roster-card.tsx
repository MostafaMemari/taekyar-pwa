"use client";

import { NotebookPen, StickyNote } from "lucide-react";
import { AttendanceStatusText, PersonAvatar } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AttendanceStatus } from "@/lib/coach/coach-data";
import type { SessionRosterEntry } from "@/lib/coach/session-data";
import { AttendanceStatusControl } from "./attendance-status-control";

export function AttendanceRosterCard({
  entry,
  status,
  note,
  onStatusChange,
  onNoteOpen,
}: {
  entry: SessionRosterEntry;
  status: AttendanceStatus;
  note?: string;
  onStatusChange: (status: AttendanceStatus) => void;
  onNoteOpen: () => void;
}) {
  return (
    <Card className="gap-0 p-3.5">
      <div className="flex items-center gap-3">
        <PersonAvatar name={entry.name} className="size-9" fallbackClassName="text-[12px]" />
        <b className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-ink-body">{entry.name}</b>
        <AttendanceStatusText status={status} />
      </div>

      <AttendanceStatusControl name={entry.name} value={status} onChange={onStatusChange} />

      <div className="mt-2.5 flex items-center gap-2 border-t border-[var(--line-1)] pt-2.5">
        <Button
          type="button"
          variant="ghost"
          className="h-8 shrink-0 gap-1.5 rounded-full bg-muted px-3 text-[10.5px] font-extrabold text-ink-muted hover:bg-muted"
          onClick={onNoteOpen}
        >
          <StickyNote data-icon="inline-start" aria-hidden="true" />
          توضیح
        </Button>
        {note ? (
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-info-soft px-2.5 py-1.5 text-[10px] font-bold text-info">
            <NotebookPen className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{note}</span>
          </span>
        ) : null}
      </div>
    </Card>
  );
}
