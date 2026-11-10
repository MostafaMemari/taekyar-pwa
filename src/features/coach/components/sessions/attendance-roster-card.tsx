"use client";

import { NotebookPen, StickyNote, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import type { AttendanceStatus } from "@/features/coach/lib/coach-data";
import { AttendanceStatusControl } from "./attendance-status-control";

export function AttendanceRosterCard({
  name,
  isGuest = false,
  status,
  note,
  onStatusChange,
  onNoteOpen,
  onRemove,
}: {
  name: string;
  isGuest?: boolean;
  status: AttendanceStatus;
  note?: string;
  onStatusChange: (status: AttendanceStatus) => void;
  onNoteOpen: () => void;
  onRemove?: () => void;
}) {
  return (
    <Card className="gap-0 p-3.5">
      <div className="flex items-center gap-3">
        <PersonAvatar name={name} className="size-9" fallbackClassName="text-[12px]" />
        <b className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-ink-body">{name}</b>
        {isGuest && onRemove ? (
          <button
            type="button"
            aria-label={`حذف ${name} از مهمان ها`}
            onClick={onRemove}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger"
          >
            مهمان
            <X className="size-3" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <AttendanceStatusControl name={name} value={status} onChange={onStatusChange} />

      <div className="mt-2.5 flex items-center gap-2 border-t border-[var(--line-2)] pt-2.5">
        <Button
          type="button"
          variant="ghost"
          className="h-8 shrink-0 gap-1.5 rounded-full bg-muted px-3 text-[12px] font-semibold text-ink-muted hover:bg-muted"
          onClick={onNoteOpen}
        >
          <StickyNote data-icon="inline-start" aria-hidden="true" />
          توضیح
        </Button>
        {note ? (
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-info-soft px-2.5 py-1.5 text-[12px] font-bold text-info">
            <NotebookPen className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{note}</span>
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink-subtle">یادداشتی ثبت نشده</span>
        )}
      </div>
    </Card>
  );
}
