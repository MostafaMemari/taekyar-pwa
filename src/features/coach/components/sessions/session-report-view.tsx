"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { useClassAttendance } from "@/features/coach/hooks/use-attendance";
import { useSession } from "@/features/coach/hooks/use-sessions";
import { apiErrorMessage } from "@/lib/api/client";
import { SessionReport } from "./session-report";

export function SessionReportView({ sessionId, initialDate }: { sessionId: string; initialDate: string }) {
  const router = useRouter();
  const session = useSession(sessionId);
  const roster = useClassAttendance(sessionId, initialDate);

  const changeDate = (date: string) => router.replace(`/coach/sessions/${sessionId}/report?date=${date}`);

  if (session.error || roster.error) {
    return (
      <main className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <CoachPageHeader title="گزارش جلسه" backHref={`/coach/sessions/${sessionId}`} />
        <ErrorState
          className="mt-4"
          title="خواندن گزارش جلسه انجام نشد"
          message={apiErrorMessage(session.error ?? roster.error)}
          onRetry={() => {
            void session.mutate();
            void roster.mutate();
          }}
        />
      </main>
    );
  }

  if (!session.data || !roster.data) return <ReportSkeleton sessionId={sessionId} />;

  return <SessionReport session={session.data} date={initialDate} entries={roster.data} onDateChange={changeDate} />;
}

function ReportSkeleton({ sessionId }: { sessionId: string }) {
  return (
    <main>
      <CoachBand>
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="بازگشت"
            className="size-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            render={<Link href={`/coach/sessions/${sessionId}`} />}
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
            <Skeleton className="mt-1.5 h-3 w-3/4 bg-white/15" />
          </div>
        </div>
      </CoachBand>

      <CoachSheet>
        <output className="flex flex-col gap-4" aria-label="در حال بارگذاری گزارش جلسه">
          <Card className="gap-0 p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-[86px] shrink-0 rounded-full" />
              <div className="flex w-full flex-1 flex-col gap-2">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-4/5" />
                <Skeleton className="h-2 w-3/5" />
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-2.5">
            {[0, 1, 2].map((index) => (
              <Card key={index} className="flex-row items-center gap-3 px-4 py-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="ms-auto h-5 w-14 rounded-full" />
              </Card>
            ))}
          </div>
        </output>
      </CoachSheet>
    </main>
  );
}
