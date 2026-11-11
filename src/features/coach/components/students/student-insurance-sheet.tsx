"use client";

import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { StudentInsuranceForm } from "./student-insurance-form";

// One insurance form shared by the student panels and the quick-info sheet.
export function StudentInsuranceSheet({
  open,
  onOpenChange,
  studentId,
  hasInsurance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  hasInsurance: boolean;
}) {
  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="ثبت بیمه ورزشی" description="تاریخ اعتبار بیمه سالانه هنرجو را تایید کنید">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
        <StudentInsuranceForm studentId={studentId} hasInsurance={hasInsurance} onDone={() => onOpenChange(false)} />
      </div>
    </SheetFrame>
  );
}
