import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { TaekyarMark } from "@/components/shared/taekyar-mark";
import { Button } from "@/components/ui/button";
import { CoachBell } from "@/features/coach/components/coach-bell";

export function CoachBandBar({
  backHref,
  title,
  chip,
  action,
}: {
  backHref?: string;
  title?: string;
  chip?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-11 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2.5">
        {backHref ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="بازگشت"
            className="size-11 shrink-0 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            render={<Link href={backHref} />}
            nativeButton={false}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        ) : (
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10" aria-hidden="true">
            <TaekyarMark className="size-5 text-white" />
          </span>
        )}
        {title ? <h1 className="page-title truncate">{title}</h1> : null}
        {chip}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {action}
        <CoachBell />
      </div>
    </div>
  );
}
