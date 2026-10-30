import { Landmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { ClubMembershipRecord } from "@/features/coach/lib/club-api";
import { toJalaliMonth } from "@/lib/jalali";
import { cn } from "@/lib/utils";

export function StudentClubsPanel({ memberships, isLoading }: { memberships: ClubMembershipRecord[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <output className="flex flex-col gap-2.5" aria-busy="true" aria-label="در حال بارگذاری باشگاه ها">
        {[0, 1].map((row) => (
          <Skeleton key={row} className="h-16 w-full rounded-xl" />
        ))}
      </output>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {memberships.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {memberships.map((membership) => (
            <Card key={membership.id} className="flex-row items-center gap-3 p-3.5">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  membership.isActive ? "bg-info-soft text-info" : "bg-muted text-ink-subtle",
                )}
              >
                <Landmark className="size-5" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-ink">{membership.club.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-ink-subtle">
                  {membership.isActive
                    ? `عضویت از ${toJalaliMonth(membership.joinedAt)}`
                    : `تاریخ خروج: ${toJalaliMonth(membership.removedAt ?? membership.joinedAt)}`}
                </p>
              </div>

              <StatusBadge tone={membership.isActive ? "success" : "neutral"}>{membership.isActive ? "فعال" : "غیرفعال"}</StatusBadge>
            </Card>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-muted/60 p-3 text-center text-[11px] font-semibold leading-5 text-ink-subtle">
          این هنرجو هنوز در باشگاهی ثبت نشده است.
        </p>
      )}

      <Button
        variant="outline"
        className="h-11 w-full rounded-xl text-[12px] font-extrabold"
        render={<Link href="/coach/clubs" />}
        nativeButton={false}
      >
        افزودن به باشگاه
      </Button>
    </div>
  );
}
