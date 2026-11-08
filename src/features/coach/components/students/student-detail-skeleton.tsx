import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";

export function StudentDetailSkeleton() {
  return (
    <main>
      <CoachBand>
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="بازگشت"
            className="size-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            render={<Link href="/coach/students" />}
            nativeButton={false}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
          <span className="size-10 rounded-full border border-white/20 bg-white/10" aria-hidden="true" />
        </div>

        <div className="mt-3 flex items-center gap-3.5">
          <Skeleton className="size-16 shrink-0 rounded-2xl bg-white/20" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-1/2 bg-white/25" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Skeleton className="h-6 w-20 rounded-full bg-white/15" />
              <Skeleton className="h-6 w-28 rounded-full bg-white/15" />
            </div>
          </div>
        </div>
      </CoachBand>

      <CoachSheet>
        <output className="flex flex-col gap-4" aria-label="در حال بارگذاری پرونده هنرجو">
          <Skeleton className="h-10 w-full rounded-xl" />

          <Card className="gap-0 p-4">
            <Skeleton className="h-4 w-1/3" />
            <div className="mt-4 flex flex-col gap-3.5">
              {[0, 1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="flex items-center justify-between gap-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="gap-0 p-4">
            <Skeleton className="h-4 w-28" />
            <div className="mt-4 flex items-center gap-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </div>
            </div>
          </Card>
        </output>
      </CoachSheet>
    </main>
  );
}
