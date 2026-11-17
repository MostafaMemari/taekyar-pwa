"use client";

import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { StudentMembershipForm } from "./student-membership-form";

// One membership-renewal confirmation shared by the panels and the quick-info sheet.
export function StudentMembershipSheet({
  open,
  onOpenChange,
  studentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
}) {
  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="تمدید شارژ" description="تایید تمدید سال شارژ هنرجو">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
        <StudentMembershipForm studentId={studentId} onDone={() => onOpenChange(false)} />
      </div>
    </SheetFrame>
  );
}
