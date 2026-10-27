import { Check, Info, Landmark, LogIn, MapPin, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import { GENDER_META } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

export function ClubCard({ club, studentCount }: { club: ClubRecord; studentCount?: number }) {
  const stats = [
    {
      value: studentCount === undefined ? <Skeleton className="h-3.5 w-8" /> : toPersianDigits(String(studentCount)),
      label: "هنرجو",
    },
    { value: toJalaliDate(club.createdAt), label: "تاریخ ثبت" },
  ];

  return (
    <Card className="gap-0 p-0">
      <div className="flex items-center gap-3 p-4 pb-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-accent-ink">
          <Landmark className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <b className="block truncate text-[14.5px] font-extrabold text-ink">{club.name}</b>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <StatusBadge tone={club.isActive ? "success" : "neutral"}>
              {club.isActive ? <Check aria-hidden="true" /> : null}
              {club.isActive ? "فعال" : "غیرفعال"}
            </StatusBadge>
            <StatusBadge>{GENDER_META[club.gender].clubLabel}</StatusBadge>
          </div>
        </div>
        <span className="text-[44px] font-extrabold leading-none text-brand-600/10" aria-hidden="true">
          {club.name.slice(0, 1)}
        </span>
      </div>

      <div className="grid grid-cols-2 border-y border-[var(--line-2)] bg-[var(--surface-2)]">
        {stats.map((stat, index) => (
          <div key={stat.label} className={cn("flex flex-col items-center py-2.5", index > 0 && "border-s border-[var(--line-2)]")}>
            <b className="text-[14px] font-extrabold tabular-nums text-ink">{stat.value}</b>
            <span className="mt-1 text-[9px] font-bold text-ink-subtle">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-1.5 px-4 pt-3 text-[11px] leading-5 text-ink-subtle">
        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span className="line-clamp-2">{club.address || "آدرس ثبت نشده"}</span>
      </div>

      <div className="flex items-center gap-2 px-4 pb-4 pt-3">
        <Button
          variant="brand"
          size="sm"
          className="h-9 flex-1 rounded-xl text-[11.5px] font-extrabold"
          render={<Link href="/coach" />}
          nativeButton={false}
        >
          <LogIn data-icon="inline-start" aria-hidden="true" />
          <span>ورود به باشگاه</span>
        </Button>
        <Button
          type="button"
          variant="field"
          size="icon"
          className="size-10 rounded-xl"
          aria-label={`مشخصات ${club.name}`}
          render={<Link href={`/coach/clubs/${club.id}`} />}
          nativeButton={false}
        >
          <Info aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="field"
          size="icon"
          className="size-10 rounded-xl"
          aria-label={`ویرایش ${club.name}`}
          render={<Link href={`/coach/clubs/${club.id}/edit`} />}
          nativeButton={false}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}
