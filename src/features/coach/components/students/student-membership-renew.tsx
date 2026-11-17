"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { membershipChargeOf } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { StudentMembershipSheet } from "./student-membership-sheet";

const NOT_SET = "ثبت نشده";

export function StudentMembershipRenew({ studentId, membershipYear }: { studentId: string; membershipYear: number | null }) {
  const [open, setOpen] = useState(false);
  const [renewed, setRenewed] = useState(false);

  const charge = membershipChargeOf(membershipYear);

  return (
    <section>
      <SectionHeading title="تمدید شارژ" />

      <Card className="gap-0 p-4">
        <div className="flex min-h-6 items-center justify-between gap-3">
          <span className="shrink-0 text-[12px] font-medium text-ink-muted">سال شارژ</span>
          <span className="text-[13px] font-bold text-ink">{membershipYear ? toPersianDigits(String(membershipYear)) : NOT_SET}</span>
        </div>
        <div className="mt-3 flex min-h-6 items-center justify-between gap-3">
          <span className="shrink-0 text-[12px] font-medium text-ink-muted">شارژ بانک اطلاعاتی</span>
          {charge === null ? (
            <span className="text-[13px] font-bold text-ink">{NOT_SET}</span>
          ) : charge.due === 0 ? (
            <span className="text-[13px] font-bold text-success">معتبر</span>
          ) : (
            <span className="text-[13px] font-bold text-warning">{toPersianDigits(String(charge.due))} سال شارژ</span>
          )}
        </div>

        {renewed ? <p className="mt-2 text-[12px] font-bold text-success">سال شارژ به سال جاری به روز شد</p> : null}

        {charge === null || charge.due > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-11 w-full rounded-xl text-[12px] font-bold"
            onClick={() => {
              setOpen(true);
              setRenewed(false);
            }}
          >
            ثبت تمدید شارژ
          </Button>
        ) : null}

        <StudentMembershipSheet open={open} onOpenChange={setOpen} studentId={studentId} />
      </Card>
    </section>
  );
}
