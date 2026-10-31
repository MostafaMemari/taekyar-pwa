"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useInvitations } from "@/features/coach/hooks/use-invitations";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

export function DashboardInvitations() {
  const { data, isLoading } = useInvitations();
  const pending = (data?.invitations ?? []).filter((invitation) => invitation.status === "PENDING");

  return (
    <section>
      <SectionHeading
        title="دعوت نامه های در انتظار"
        action={
          <Button
            variant="link"
            size="sm"
            className="h-9 text-sm font-bold text-accent-ink"
            render={<Link href="/coach/invitations" />}
            nativeButton={false}
          >
            همه دعوت نامه ها
          </Button>
        }
      />
      <Card className="gap-0 p-0">
        {isLoading && !data ? (
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        ) : pending.length > 0 ? (
          pending.map((invitation, index) => (
            <div key={invitation.id} className={cn("flex items-center gap-3 px-4 py-3", index > 0 && "border-t border-[var(--line-2)]")}>
              <PersonAvatar name={invitation.student?.fullName ?? invitation.nationalCode} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{invitation.student?.fullName ?? "هنرجوی بدون حساب"}</p>
                <p className="mt-1 truncate text-xs text-ink-muted">کد ملی {toPersianDigits(invitation.nationalCode)}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-ink-muted">{toJalaliDate(invitation.createdAt)}</span>
            </div>
          ))
        ) : (
          <p className="p-4 text-center text-sm font-semibold text-ink-muted">دعوت نامه در انتظاری وجود ندارد.</p>
        )}
      </Card>
    </section>
  );
}
