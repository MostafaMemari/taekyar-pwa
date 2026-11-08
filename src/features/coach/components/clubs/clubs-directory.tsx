"use client";

import { Info, Landmark, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBandBar } from "@/features/coach/components/coach-band-bar";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { useClubStudentCounts, useClubs } from "@/features/coach/hooks/use-clubs";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { ClubCard } from "./club-card";
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
  const activeCount = clubs.filter((club) => club.isActive).length;
  const studentTotal = Object.values(counts ?? {}).reduce((sum, count) => sum + count, 0);

  const retry = () => {
    void mutate();
    void mutateCounts();
  };

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachBand>
        <CoachBandBar title="باشگاه های من" />

        <p className="mt-2 text-[12px] font-semibold text-white/55">هر باشگاه، حضور و غیاب و کلاس بندی مستقل خودش را دارد</p>

        <div className="mt-3 flex items-center gap-2.5">
          <GlassStat
            value={data ? toPersianDigits(String(activeCount)) : <Skeleton className="h-4 w-8 bg-white/25" />}
            label="باشگاه فعال"
          />
          <GlassStat value={data ? toPersianDigits(String(data.total)) : <Skeleton className="h-4 w-8 bg-white/25" />} label="باشگاه" />
          <GlassStat
            value={data && counts ? toPersianDigits(String(studentTotal)) : <Skeleton className="h-4 w-8 bg-white/25" />}
            label="هنرجو"
          />
        </div>
      </CoachBand>

      <CoachSheet>
        <h2 className="text-[17px] font-extrabold text-ink">وارد کدام باشگاه می شوید؟</h2>

        {isLoading && !readError ? <ClubsSkeleton /> : null}

        {readError ? (
          <ErrorState className="mt-6" title="خواندن باشگاه ها انجام نشد" message={apiErrorMessage(readError)} onRetry={retry} />
        ) : null}

        {isReady && clubs.length === 0 ? (
          <Empty className="mt-4 border-none bg-transparent p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-brand-50 text-accent-ink">
                <Landmark aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-[13px] font-extrabold text-ink">هنوز باشگاهی ثبت نشده</EmptyTitle>
              <EmptyDescription className="text-[11px] leading-5 text-ink-subtle">
                اولین باشگاه خود را بسازید تا کلاس بندی و حضور و غیاب شروع شود.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {isReady ? (
          <div className="mt-4 flex flex-col gap-3.5">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} studentCount={counts?.[club.id]} />
            ))}
          </div>
        ) : null}

        {!readError ? (
          <Button
            type="button"
            variant="outline"
            className="mt-3.5 h-auto w-full flex-col gap-1.5 whitespace-normal rounded-2xl border-dashed py-5 text-center"
            render={<Link href="/coach/clubs/new" />}
            nativeButton={false}
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-ink">
              <Plus className="size-5" aria-hidden="true" />
            </span>
            <span className="text-[13px] font-extrabold text-ink">ثبت باشگاه جدید</span>
            <span className="text-[10px] font-medium leading-5 text-ink-subtle">هر تعداد باشگاه که داشته باشید، همین جا اضافه کنید</span>
          </Button>
        ) : null}

        <Alert className="mt-5 rounded-2xl border-[var(--ak-tint-line)] bg-accent p-3.5 text-start">
          <Info className="text-accent-ink" aria-hidden="true" />
          <AlertTitle className="text-[12px] font-extrabold text-accent-ink">اینجا چطور کار می کند؟</AlertTitle>
          <AlertDescription className="text-[11px] leading-5 text-ink-muted">
            اول باشگاه را انتخاب و وارد می شوید؛ حضور و غیاب، کلاس بندی و هنرجویان همان باشگاه را می بینید. با «تغییر باشگاه» هر لحظه می
            توانید فضای کاری را عوض کنید.
          </AlertDescription>
        </Alert>
      </CoachSheet>
    </main>
  );
}
