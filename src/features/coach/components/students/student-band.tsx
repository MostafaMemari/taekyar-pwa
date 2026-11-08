import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBandBar } from "@/features/coach/components/coach-band-bar";
import { beltDotStyle, type StudentBeltKey, studentBeltLabel } from "@/lib/student-belts";

export function StudentBand({
  fullName,
  belt,
  clubName,
  backHref,
  chip,
  action,
  meta,
}: {
  fullName: string;
  belt?: StudentBeltKey | null;
  clubName?: string | null;
  backHref: string;
  chip?: ReactNode;
  action?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <CoachBand>
      <CoachBandBar
        backHref={backHref}
        chip={chip ? <span className="hero-chip border-white/20 bg-white/10 text-white">{chip}</span> : null}
        action={action}
      />

      <div className="mt-4 flex items-center gap-3.5">
        <Avatar className="size-16 shrink-0 ring-1 ring-white/20">
          <AvatarFallback className="bg-white/15 text-xl font-extrabold text-white">{fullName.slice(0, 1)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h1 className="page-title truncate">{fullName}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="meta-glass">
              <span
                className="size-2.5 rounded-full ring-2 ring-white/30"
                style={belt ? beltDotStyle(belt) : undefined}
                aria-hidden="true"
              />
              {belt ? studentBeltLabel(belt) : "بدون کمربند"}
            </span>
            <span className="meta-glass">{clubName ?? "بدون باشگاه"}</span>
            {meta}
          </div>
        </div>
      </div>
    </CoachBand>
  );
}
