import { CalendarDays, ChevronRight, Landmark, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CoachBand } from "@/components/coach/coach-band";
import { Button } from "@/components/ui/button";
import { CLUB_ADMISSION_META, type Club } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";

export function ClubBand({ club, backHref, action }: { club: Club; backHref: string; action?: ReactNode }) {
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
            <span className="meta-glass">{CLUB_ADMISSION_META[club.admission].label}</span>
            <span className="meta-glass">
              <CalendarDays aria-hidden="true" />
              {toPersianDigits(String(club.classesCount))} کلاس
            </span>
            <span className="meta-glass">
              <Users aria-hidden="true" />
              {toPersianDigits(String(club.studentsCount))} هنرجو
            </span>
          </div>
        </div>
      </div>
    </CoachBand>
  );
}
