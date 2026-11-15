"use client";

import { EllipsisVertical, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { SessionSaveSheet } from "@/features/coach/components/sessions/session-save-sheet";
import { useClub, useClubStudentCount } from "@/features/coach/hooks/use-clubs";
import { useSessionStudentCounts, useSessions } from "@/features/coach/hooks/use-sessions";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import { apiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { ClubBand } from "./club-band";
import { ClubClasses } from "./club-classes";
import { ClubClassesSkeleton } from "./club-classes-skeleton";
import { ClubDetailActions } from "./club-detail-actions";
import { ClubDetailSkeleton } from "./club-detail-skeleton";
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [tab, setTab] = useState<"classes" | "members">("classes");
  // An inactive club takes no new records; editing its info and cancelling payments stay allowed.
  const clubInactive = !club.isActive;

  return (
    <main>
      <ClubBand
        className={PAGE_ENTER}
        club={club}
        studentCount={studentCount}
        backHref="/coach/clubs"
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="عملیات بیشتر"
            className="size-11 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            onClick={() => setMenuOpen(true)}
          >
            <EllipsisVertical aria-hidden="true" />
          </Button>
        }
      />

      <CoachSheet className={cn("flex flex-col gap-4 pb-44", PAGE_ENTER)}>
        {clubInactive ? (
          <p className="rounded-xl bg-muted/60 p-3 text-[12px] font-semibold leading-5 text-ink-subtle">
            این باشگاه غیرفعال است و امکان ثبت کلاس، هنرجو یا شهریه وجود ندارد
          </p>
        ) : null}

        <ToggleGroup
          aria-label="بخش های باشگاه"
          value={[tab]}
          onValueChange={(next) => {
            const selected = next[0];
            if (selected) setTab(selected as "classes" | "members");
          }}
          variant="segmented"
          spacing={1}
          className="w-full rounded-full bg-muted p-1"
        >
          <ToggleGroupItem
            value="classes"
            className="h-9 flex-1 rounded-full text-[12px] font-bold aria-pressed:bg-brand-600 aria-pressed:text-white"
          >
            کلاس های باشگاه
          </ToggleGroupItem>
          <ToggleGroupItem
            value="members"
            className="h-9 flex-1 rounded-full text-[12px] font-bold aria-pressed:bg-brand-600 aria-pressed:text-white"
          >
            هنرجویان باشگاه
          </ToggleGroupItem>
        </ToggleGroup>

        {tab === "classes" ? (
          sessionError ? (
            <ErrorState title="خواندن کلاس ها انجام نشد" message={apiErrorMessage(sessionError)} onRetry={() => void mutateSessions()} />
          ) : sessionsLoading ? (
            <ClubClassesSkeleton />
          ) : (
            <ClubClasses clubId={club.id} clubName={club.name} sessions={sessions} memberCounts={memberCounts} clubActive={club.isActive} />
          )
        ) : (
          <ClubMembers clubId={club.id} />
        )}
      </CoachSheet>

      <ClubSaveSheet open={editOpen} onOpenChange={setEditOpen} clubId={club.id} />
      <SessionSaveSheet open={sessionOpen} onOpenChange={setSessionOpen} clubId={club.id} />

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 flex justify-center">
        <div className="pointer-events-auto grid w-full max-w-md grid-cols-2 gap-3 px-4">
          <Button
            type="button"
            variant="brand"
            className="h-12 rounded-full text-[12px] font-semibold"
            onClick={() => setSessionOpen(true)}
            disabled={clubInactive}
          >
            <Plus data-icon="inline-start" aria-hidden="true" />
            کلاس جدید
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-full text-[12px] font-semibold"
            render={<Link href={`/coach/clubs/${club.id}/fee`} />}
            nativeButton={false}
          >
            <Wallet data-icon="inline-start" aria-hidden="true" />
            شهریه باشگاه
          </Button>
        </div>
      </div>

      <ClubDetailActions club={club} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} onEdit={() => setEditOpen(true)} />
    </main>
  );
}
