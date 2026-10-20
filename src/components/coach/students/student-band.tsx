import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CoachBand } from "@/components/coach/coach-band";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BELT_META } from "@/lib/coach/coach-data";
import { type StudentProfile, studentBeltText } from "@/lib/coach/student-profile-data";

export function StudentBand({
  profile,
  backHref,
  watermark = "پرونده",
  chip,
  action,
  meta,
}: {
  profile: StudentProfile;
  backHref: string;
  watermark?: string;
  chip?: ReactNode;
  action?: ReactNode;
  meta?: ReactNode;
}) {
  const belt = BELT_META[profile.belt];

  return (
    <CoachBand watermark={watermark}>
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

        {chip ? <span className="hero-chip border-white/20 bg-white/10 text-white backdrop-blur-sm">{chip}</span> : null}
        {action}
      </div>

      <div className="mt-3 flex items-center gap-3.5">
        <Avatar className="size-16 shrink-0 ring-2 ring-white/25">
          <AvatarFallback className="bg-white/15 text-xl font-extrabold text-white">{profile.name.slice(0, 1)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[20px] font-extrabold leading-7">{profile.name}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="meta-glass">
              <span className="size-2.5 rounded-full ring-2 ring-white/30" style={{ backgroundColor: belt.color }} aria-hidden="true" />
              {studentBeltText(profile)}
            </span>
            <span className="meta-glass">{profile.clubs[0]?.name ?? "بدون باشگاه"}</span>
            {meta}
          </div>
        </div>
      </div>
    </CoachBand>
  );
}
