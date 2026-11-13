"use client";

import { CalendarDays, Pencil, Plus, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { SessionSaveSheet } from "@/features/coach/components/sessions/session-save-sheet";
import { useClub, useClubStudentCount } from "@/features/coach/hooks/use-clubs";
import { useSessionStudentCounts, useSessions } from "@/features/coach/hooks/use-sessions";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";
import { ClubBand } from "./club-band";
import { ClubClasses } from "./club-classes";
import { ClubClassesSkeleton } from "./club-classes-skeleton";
import { ClubDetailSkeleton } from "./club-detail-skeleton";
import { ClubInfoCard } from "./club-info-card";
import { ClubMembers } from "./club-members";
import { ClubSaveSheet } from "./club-save-sheet";

export function ClubDetail({ clubId }: { clubId: string }) {
  const { data: club, error, mutate } = useClub(clubId);
  const { data: studentCount, error: countError, mutate: mutateCount } = useClubStudentCount(clubId);

  const readError = error ?? countError;

  if (readError) {
    return (
      <main className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <CoachPageHeader title="مشخصات باشگاه" backHref="/coach/clubs" />

        <ErrorState
          className="mt-4"
          title="خواندن باشگاه انجام نشد"
          message={apiErrorMessage(readError)}
          onRetry={() => {
            void mutate();
            void mutateCount();
          }}
        />
      </main>
    );
  }

  if (!club) return <ClubDetailSkeleton />;

  return <ClubDetailScreen club={club} studentCount={studentCount} />;
}

function ClubDetailScreen({ club, studentCount }: { club: ClubRecord; studentCount?: number }) {
  const { data: sessionData, error: sessionError, isLoading: sessionsLoading, mutate: mutateSessions } = useSessions();
  const sessions = (sessionData?.sessions ?? []).filter((session) => session.clubId === club.id);
  const { data: memberCounts } = useSessionStudentCounts(sessions.map((session) => session.id));

  const [editOpen, setEditOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);

  const stats = [
    {
      icon: Users,
      value: studentCount === undefined ? <Skeleton className="h-4 w-8" /> : toPersianDigits(String(studentCount)),
      label: "هنرجو",
      accent: true,
    },
    { icon: CalendarDays, value: toJalaliDate(club.createdAt), label: "تاریخ ثبت" },
  ];

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <ClubBand club={club} studentCount={studentCount} backHref="/coach/clubs" />

      <CoachSheet className="flex flex-col gap-4">
        <ClubInfoCard club={club} />

        <Button
          type="button"
          variant="brand"
          className="h-12 w-full rounded-xl text-[12px] font-semibold"
          onClick={() => setSessionOpen(true)}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          کلاس جدید
        </Button>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className={cn("items-center gap-1.5 p-3 text-center", stat.accent && "bg-accent ring-1 ring-[var(--ak-tint-line)]")}
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-lg",
                  stat.accent ? "bg-brand-50 text-accent-ink" : "bg-muted text-ink-muted",
                )}
              >
                <stat.icon className="size-4" aria-hidden="true" />
              </span>
              <b className="text-[17px] font-extrabold leading-none tabular-nums text-ink">{stat.value}</b>
              <span className="text-[12px] font-bold text-ink-subtle">{stat.label}</span>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          className="h-12 w-full rounded-xl text-[12px] font-semibold"
          render={<Link href={`/coach/clubs/${club.id}/fee`} />}
          nativeButton={false}
        >
          <Wallet data-icon="inline-start" aria-hidden="true" />
          شهریه باشگاه
        </Button>

        {sessionError ? (
          <ErrorState title="خواندن کلاس ها انجام نشد" message={apiErrorMessage(sessionError)} onRetry={() => void mutateSessions()} />
        ) : sessionsLoading ? (
          <ClubClassesSkeleton />
        ) : (
          <ClubClasses clubId={club.id} sessions={sessions} memberCounts={memberCounts} />
        )}

        <ClubMembers clubId={club.id} />

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="h-12 rounded-xl text-[12px] font-semibold" onClick={() => setEditOpen(true)}>
            <Pencil data-icon="inline-start" aria-hidden="true" />
            ویرایش باشگاه
          </Button>
          <Button
            variant="brand"
            className="h-12 rounded-xl text-[12px] font-semibold"
            render={<Link href="/coach/sessions" />}
            nativeButton={false}
          >
            <CalendarDays data-icon="inline-start" aria-hidden="true" />
            همه کلاس ها
          </Button>
        </div>
      </CoachSheet>

      <ClubSaveSheet open={editOpen} onOpenChange={setEditOpen} clubId={club.id} />
      <SessionSaveSheet open={sessionOpen} onOpenChange={setSessionOpen} clubId={club.id} />
    </main>
  );
}
