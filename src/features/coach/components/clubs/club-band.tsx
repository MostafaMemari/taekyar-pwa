import { Landmark, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBandBar } from "@/features/coach/components/coach-band-bar";
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
    <CoachBand>
      <CoachBandBar backHref={backHref} action={action} />

      <div className="mt-4 flex items-center gap-3.5">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/15 ring-1 ring-white/20">
          <Landmark className="size-7" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="page-title truncate">{club.name}</h1>
          <p className="mt-1 truncate text-[12px] font-semibold text-white/65">فضای تمرین و هنرجویان وابسته به این باشگاه</p>
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
