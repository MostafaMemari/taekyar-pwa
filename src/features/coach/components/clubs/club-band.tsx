import { ChevronRight, Landmark, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachBand } from "@/features/coach/components/coach-band";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import { GENDER_META } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";

export function ClubBand({
  club,
  studentCount,
  backHref,
  action,
}: {
  club: ClubRecord;
  studentCount?: number;
  backHref: string;
  action?: ReactNode;
}) {
  return (
    <CoachBand watermark="باشگاه">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="بازگشت"
          className="size-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
          render={<Link href={backHref} />}
          nativeButton={false}
        >
          <ChevronRight aria-hidden="true" />
        </Button>

        {action}
      </div>

      <div className="mt-3 flex items-center gap-3.5">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/15 ring-2 ring-white/25">
          <Landmark className="size-7" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[20px] font-extrabold leading-7">{club.name}</h1>
          <p className="mt-1 truncate text-[11px] font-semibold text-white/65">فضای تمرین و هنرجویان وابسته به این باشگاه</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="meta-glass">{GENDER_META[club.gender].clubLabel}</span>
            <span className="meta-glass">
              <Users aria-hidden="true" />
              {studentCount === undefined ? <Skeleton className="h-3 w-7 bg-white/25" /> : toPersianDigits(String(studentCount))} هنرجو
            </span>
          </div>
        </div>
      </div>
    </CoachBand>
  );
}
