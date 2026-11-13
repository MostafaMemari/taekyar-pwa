import { CalendarPlus, Info, Landmark, MapPin, Pencil, Wallet } from "lucide-react";
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

export function ClubCard({
  club,
  studentCount,
  onAddSession,
  onEdit,
}: {
  club: ClubRecord;
  studentCount?: number;
  // Open the session/club sheets hosted by the directory instead of navigating to form routes.
  onAddSession: (club: ClubRecord) => void;
  onEdit: (club: ClubRecord) => void;
}) {
  const stats = [
    {
      value: studentCount === undefined ? <Skeleton className="h-3.5 w-8" /> : toPersianDigits(String(studentCount)),
      label: "هنرجو",
    },
    { value: toJalaliDate(club.createdAt), label: "تاریخ ثبت" },
  ];

  return (
    <Card className="gap-0 p-0">
      <Link
        href={`/coach/clubs/${club.id}`}
        className="flex items-center gap-3 rounded-t-xl p-4 pb-3 transition-colors active:bg-muted/40"
        aria-label={`جزئیات ${club.name}`}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-accent-ink">
          <Landmark className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <b className="block truncate text-[14px] font-extrabold text-ink">{club.name}</b>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <StatusBadge>{GENDER_META[club.gender].clubLabel}</StatusBadge>
          </div>
        </div>
        <span className="text-[44px] font-extrabold leading-none text-brand-600/10" aria-hidden="true">
          {club.name.slice(0, 1)}
        </span>
      </Link>

      <div className="grid grid-cols-2 border-y border-[var(--line-2)] bg-[var(--surface-2)]">
        {stats.map((stat, index) => (
          <div key={stat.label} className={cn("flex flex-col items-center py-2.5", index > 0 && "border-s border-[var(--line-2)]")}>
            <b className="text-[14px] font-extrabold tabular-nums text-ink">{stat.value}</b>
            <span className="mt-1 text-[12px] font-bold text-ink-subtle">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-1.5 px-4 pt-3 text-[12px] leading-5 text-ink-subtle">
        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span className="line-clamp-2">{club.address || "آدرس ثبت نشده"}</span>
      </div>

      <div className="flex items-center gap-2 px-4 pb-4 pt-3">
        <Button
          type="button"
          variant="brand"
          size="sm"
          className="h-9 flex-1 rounded-xl text-[12px] font-semibold"
          onClick={() => onAddSession(club)}
        >
          <CalendarPlus data-icon="inline-start" aria-hidden="true" />
          <span>کلاس جدید</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 flex-1 rounded-xl text-[12px] font-semibold"
          render={<Link href={`/coach/clubs/${club.id}/fee`} />}
          nativeButton={false}
        >
          <Wallet data-icon="inline-start" aria-hidden="true" />
          <span>شهریه</span>
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
          onClick={() => onEdit(club)}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}
