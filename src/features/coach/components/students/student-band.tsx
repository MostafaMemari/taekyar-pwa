import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CoachBand } from "@/features/coach/components/coach-band";
import { beltDotStyle, type StudentBeltKey, studentBeltLabel } from "@/lib/student-belts";

export function StudentBand({
  fullName,
  belt,
  clubName,
  backHref,
  watermark = "پرونده",
  chip,
  action,
  meta,
}: {
  fullName: string;
  belt?: StudentBeltKey | null;
  clubName?: string | null;
  backHref: string;
  watermark?: string;
  chip?: ReactNode;
  action?: ReactNode;
  meta?: ReactNode;
}) {
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
          <AvatarFallback className="bg-white/15 text-xl font-extrabold text-white">{fullName.slice(0, 1)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[20px] font-extrabold leading-7">{fullName}</h1>
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
