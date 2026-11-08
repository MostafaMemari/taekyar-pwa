"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useInvitations } from "@/features/coach/hooks/use-invitations";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

export function DashboardInvitations() {
  const { data } = useInvitations();
  const pending = (data?.invitations ?? []).filter((invitation) => invitation.status === "PENDING");

  if (pending.length === 0) return null;

  return (
    <section>
      <SectionHeading
        title="دعوت نامه های در انتظار"
        action={
          <Button
            variant="link"
            size="sm"
            className="h-9 text-[12px] font-semibold text-accent-ink"
            render={<Link href="/coach/invitations" />}
            nativeButton={false}
          >
            همه
          </Button>
        }
      />
      <Card className="gap-0 p-0">
        <ul>
          {pending.map((invitation, index) => (
            <li key={invitation.id} className={cn("flex items-center gap-3 px-4 py-3", index > 0 && "border-t border-[var(--line-2)]")}>
              <PersonAvatar name={invitation.student?.fullName ?? invitation.nationalCode} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-ink">{invitation.student?.fullName ?? "هنرجوی بدون حساب"}</p>
                <p className="mt-0.5 truncate text-[12px] font-medium tabular-nums text-ink-subtle">
                  {toJalaliDate(invitation.createdAt)} · {toPersianDigits(invitation.nationalCode)}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-warning">
                <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
                در انتظار
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
