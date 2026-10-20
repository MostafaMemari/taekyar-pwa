import { ChevronLeft, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { CoachBand } from "@/components/coach/coach-band";
import { CoachBell } from "@/components/coach/coach-ui";
import { Card } from "@/components/ui/card";
import { COACH } from "@/lib/coach/coach-data";

export function DashboardHero() {
  return (
    <CoachBand>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[21px] font-extrabold leading-7">سلام، مربی {COACH.name}</h1>
          <p className="mt-1 text-[11px] font-semibold text-white/55">شنبه ۲۴ آبان ۱۴۰۴</p>
        </div>
        <CoachBell />
      </div>

      <Link href="/coach/sessions" className="mt-3.5 block transition duration-150 active:scale-[0.99]">
        <Card className="flex-row items-center gap-3 rounded-2xl bg-card px-3.5 py-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand-xl">
            <ClipboardCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block text-[14px] font-extrabold text-ink">ثبت حضور و غیاب</b>
            <span className="mt-0.5 block text-[10.5px] font-semibold text-ink-subtle">لیست امروز را علامت بزنید</span>
          </span>
          <ChevronLeft className="size-5 shrink-0 text-accent-ink" aria-hidden="true" />
        </Card>
      </Link>
    </CoachBand>
  );
}
