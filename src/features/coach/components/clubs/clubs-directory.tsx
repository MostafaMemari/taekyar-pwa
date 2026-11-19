"use client";

import { Landmark, Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBandBar } from "@/features/coach/components/coach-band-bar";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { SessionSaveSheet } from "@/features/coach/components/sessions/session-save-sheet";
import { useClubStudentCounts, useClubs } from "@/features/coach/hooks/use-clubs";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";
import { ClubCard } from "./club-card";
import { ClubSaveSheet } from "./club-save-sheet";
import { ClubsSkeleton } from "./clubs-skeleton";

function GlassStat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <span className="flex flex-1 flex-col items-center rounded-xl border border-white/15 bg-white/10 px-2 py-1.5">
      <b className="text-[16px] font-extrabold leading-none tabular-nums">{value}</b>
      <span className="mt-1 text-[12px] font-semibold text-white/65">{label}</span>
    </span>
  );
}

export function ClubsDirectory() {
  const { data, error, isLoading, mutate } = useClubs();
  const { data: counts, error: countsError, mutate: mutateCounts } = useClubStudentCounts((data?.clubs ?? []).map((club) => club.id));

  const clubs = data?.clubs ?? [];
  const readError = error ?? countsError;
  const isReady = Boolean(data) && !readError;
  const studentTotal = Object.values(counts ?? {}).reduce((sum, count) => sum + count, 0);

  const [clubSheetOpen, setClubSheetOpen] = useState(false);
  const [clubSheetId, setClubSheetId] = useState<string | null>(null);
  const [sessionSheetOpen, setSessionSheetOpen] = useState(false);
  const [sessionSheetClubId, setSessionSheetClubId] = useState<string | null>(null);

  const retry = () => {
    void mutate();
    void mutateCounts();
  };

  return (
    <main>
      <CoachBand className={PAGE_ENTER}>
        <CoachBandBar title="باشگاه های من" icon={Landmark} />

        <p className="mt-2 text-[12px] font-semibold text-white/55">هر باشگاه، حضور و غیاب و کلاس بندی مستقل خودش را دارد</p>

        <div className="mt-3 flex items-center gap-2.5">
          <GlassStat value={data ? toPersianDigits(String(data.total)) : <Skeleton className="h-4 w-8 bg-white/25" />} label="باشگاه" />
          <GlassStat
            value={data && counts ? toPersianDigits(String(studentTotal)) : <Skeleton className="h-4 w-8 bg-white/25" />}
            label="هنرجو"
          />
        </div>
      </CoachBand>

      <CoachSheet className={cn("pb-44", PAGE_ENTER)}>
        <div aria-busy={isLoading && !readError}>
          {isLoading && !readError ? <ClubsSkeleton /> : null}

          {readError ? (
            <ErrorState className="mt-6" title="خواندن باشگاه ها انجام نشد" message={apiErrorMessage(readError)} onRetry={retry} />
          ) : null}

          {isReady && clubs.length === 0 ? (
            <Empty className="mt-4 min-h-[45dvh] border-none bg-transparent p-4">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-14 rounded-2xl bg-brand-50 text-accent-ink">
                  <Landmark aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle className="text-[14px] font-extrabold text-ink">هنوز باشگاهی ثبت نشده</EmptyTitle>
                <EmptyDescription className="text-[11px] leading-5 text-ink-subtle">
                  اولین باشگاه خود را بسازید تا کلاس بندی و حضور و غیاب شروع شود
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}

          {isReady ? (
            <div className="mt-4 flex flex-col gap-3.5">
              {clubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  studentCount={counts?.[club.id]}
                  onEdit={(target) => {
                    setClubSheetId(target.id);
                    setClubSheetOpen(true);
                  }}
                  onAddSession={(target) => {
                    setSessionSheetClubId(target.id);
                    setSessionSheetOpen(true);
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </CoachSheet>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 flex justify-center">
        <Button
          type="button"
          variant="brand"
          aria-haspopup="dialog"
          className="pointer-events-auto h-12 gap-2 rounded-full px-5 text-[13px] font-bold active:scale-95"
          onClick={() => {
            setClubSheetId(null);
            setClubSheetOpen(true);
          }}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          باشگاه جدید
        </Button>
      </div>

      {/* Both stay mounted so Base UI runs the slide animations; the last id is kept through the close
          animation so the content does not swap while the sheet slides out. */}
      <ClubSaveSheet open={clubSheetOpen} onOpenChange={setClubSheetOpen} clubId={clubSheetId ?? undefined} />
      <SessionSaveSheet open={sessionSheetOpen} onOpenChange={setSessionSheetOpen} clubId={sessionSheetClubId ?? undefined} />
    </main>
  );
}
