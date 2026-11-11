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
    <SheetFrame open={open} onOpenChange={onOpenChange} title="تمدید سال عضویت" description="تایید تمدید سال عضویت هنرجو">
      <StudentMembershipForm studentId={studentId} onDone={() => onOpenChange(false)} />
    </SheetFrame>
  );
}
