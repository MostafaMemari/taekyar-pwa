"use client";

import { CalendarDays, Check, ChevronLeft, ClipboardCheck, Clock, Landmark, ListFilter, Minus, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBandBar } from "@/features/coach/components/coach-band-bar";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { SessionTime } from "@/features/coach/components/session-time";
import { SessionSaveSheet } from "@/features/coach/components/sessions/session-save-sheet";
import { SessionsFiltersSheet } from "@/features/coach/components/sessions/sessions-filters-sheet";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { useSessionStudentCounts, useSessions } from "@/features/coach/hooks/use-sessions";
import { activeClubIds, type WeekDay, weekDayLabels } from "@/features/coach/lib/coach-data";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";
import { activeSessionFilterCount, sessionFilterParsers } from "@/features/coach/lib/sessions-filters";
import { apiErrorMessage } from "@/lib/api/client";
import { toLatinDigits, toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";
import { SessionsSkeleton } from "./sessions/sessions-skeleton";

function SessionCard({
  session,
  clubName,
  memberCount,
  canAttend,
}: {
  session: ClassSessionRecord;
  clubName: string;
  memberCount?: number;
  canAttend: boolean;
}) {
  return (
    <Card className="gap-0 p-0">
      <Link
        href={`/coach/sessions/${session.id}`}
        className="block rounded-t-xl px-4 pb-3.5 pt-3.5 transition duration-150 active:bg-muted/40"
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl",
              session.isActive ? "bg-brand-50 text-accent-ink" : "bg-muted text-ink-subtle",
            )}
          >
            <CalendarDays className="size-5" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <b className="truncate text-[13px] font-extrabold text-ink">{session.name}</b>
              <StatusBadge tone={session.isActive ? "success" : "neutral"} className="shrink-0">
                {session.isActive ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
                {session.isActive ? "فعال" : "غیرفعال"}
              </StatusBadge>
            </div>
            <p className="mt-1 flex min-w-0 items-center gap-1 text-[12px] text-ink-subtle">
              <Landmark className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{clubName}</span>
            </p>
            <div className="mt-1.5 flex items-center gap-x-2 text-[12px] font-semibold text-ink-muted">
              <span className="truncate">{weekDayLabels(session.weekDays).join(" · ")}</span>
              <span className="flex shrink-0 items-center gap-1 tabular-nums">
                <Clock className="size-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
                <SessionTime start={session.startTime} end={session.endTime} />
              </span>
            </div>
          </div>

          <span className="flex shrink-0 flex-col items-center gap-1">
            <span className="flex items-center gap-1 text-[13px] font-extrabold tabular-nums text-accent-ink">
              <Users className="size-3.5" aria-hidden="true" />
              {memberCount === undefined ? "—" : toPersianDigits(String(memberCount))}
            </span>
            <ChevronLeft className="size-4 text-ink-subtle" aria-hidden="true" />
          </span>
        </div>
      </Link>

      <div className="border-t border-[var(--line-2)] px-2 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 gap-2 rounded-lg px-2 text-[12px] font-semibold text-accent-ink"
          render={<Link href={`/coach/sessions/${session.id}/attendance`} />}
          nativeButton={false}
          disabled={!canAttend}
        >
          <ClipboardCheck data-icon="inline-start" aria-hidden="true" />
          حضور و غیاب
        </Button>
      </div>
    </Card>
  );
}

const BAND_CIRCLE = "size-11 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20";

const STUCK_CIRCLE = "size-11 rounded-full border bg-background text-ink hover:bg-muted";

export function SessionsDirectory() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useQueryStates(sessionFilterParsers);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchStuck, setSearchStuck] = useState(false);
  const searchRowRef = useRef<HTMLDivElement>(null);

  // The glass search row becomes a full-bleed sticky bar once it pins to the viewport top.
  useEffect(() => {
    const onScroll = () => {
      const node = searchRowRef.current;
      if (node) setSearchStuck(node.getBoundingClientRect().top <= 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data, error, isLoading, mutate } = useSessions();
  const { data: clubData } = useClubs();
  const sessions = data?.sessions ?? [];
  const { data: counts, error: countsError, mutate: mutateCounts } = useSessionStudentCounts(sessions.map((session) => session.id));

  const readError = error ?? countsError;
  const isReady = Boolean(data) && !readError;
  const clubNames = new Map((clubData?.clubs ?? []).map((club) => [club.id, club.name]));
  const activeIds = activeClubIds(clubData?.clubs);

  const normalizedQuery = toLatinDigits(query).trim().toLowerCase();
  const filterCount = activeSessionFilterCount(filters);

  const visible = sessions.filter((session) => {
    if (filters.status !== "ALL" && (filters.status === "ACTIVE") !== session.isActive) return false;
    if (filters.club && session.clubId !== filters.club) return false;
    if (filters.days.length > 0 && !filters.days.some((day) => session.weekDays.includes(day))) return false;
    if (!normalizedQuery) return true;

    const haystack = toLatinDigits(
      `${session.name} ${clubNames.get(session.clubId) ?? ""} ${weekDayLabels(session.weekDays).join(" ")} ${session.startTime} ${session.endTime}`,
    ).toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const reset = () => {
    setQuery("");
    void setFilters({ status: "ACTIVE", club: "", days: [] });
  };

  const retry = () => {
    void mutate();
    void mutateCounts();
  };

  return (
    <>
      <CoachBand className={PAGE_ENTER}>
        <CoachBandBar title="کلاس ها" icon={CalendarDays} />

        <div className="h-16" />
      </CoachBand>

      <div ref={searchRowRef} className={cn("sticky top-0 z-30 -mt-26 px-4 pb-9", PAGE_ENTER)}>
        <div
          className={cn(
            "flex items-center gap-2 rounded-full py-2 transition-[background-color,box-shadow,border-radius,margin] duration-200",
            searchStuck &&
              "-mx-4 rounded-b-[28px] rounded-t-none bg-[var(--canvas)]/90 px-4 shadow-[0_12px_28px_-24px_rgba(16,18,26,0.55)] backdrop-blur-md",
          )}
        >
          <InputGroup className={cn("h-12 min-w-0 flex-1 rounded-full", searchStuck ? "bg-background" : "border-white/20 bg-white/10")}>
            <InputGroupInput
              type="search"
              placeholder="جستجوی نام کلاس یا باشگاه..."
              aria-label="جستجوی کلاس"
              className={searchStuck ? undefined : "text-white placeholder:text-white/60"}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <Search className={cn("size-4", searchStuck ? "text-ink-subtle" : "text-white/70")} aria-hidden="true" />
            </InputGroupAddon>
          </InputGroup>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="فیلترها"
            aria-haspopup="dialog"
            className={cn("relative", searchStuck ? STUCK_CIRCLE : BAND_CIRCLE)}
            onClick={() => setFiltersOpen(true)}
          >
            <ListFilter aria-hidden="true" />
            {filterCount > 0 ? (
              <span className="absolute -top-1 -end-1 grid min-w-[18px] place-items-center rounded-full bg-brand-500 px-1 text-[12px] font-semibold leading-[18px] text-white tabular-nums">
                {toPersianDigits(String(filterCount))}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <CoachSheet className={cn("flex flex-col gap-4 pb-44", PAGE_ENTER)}>
        <div aria-busy={isLoading && !readError}>
          {isLoading && !readError ? <SessionsSkeleton /> : null}

          {readError ? (
            <ErrorState className="mt-6" title="خواندن کلاس ها انجام نشد" message={apiErrorMessage(readError)} onRetry={retry} />
          ) : null}

          {isReady && sessions.length === 0 ? (
            <Empty className="mt-4 border-none bg-transparent p-6">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-brand-50 text-accent-ink">
                  <CalendarDays aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle className="text-[13px] font-extrabold text-ink">هنوز کلاسی ثبت نشده</EmptyTitle>
                <EmptyDescription className="text-[12px] leading-5 text-ink-subtle">
                  برای هر باشگاه، یک کلاس با روزها و ساعت برگزاری بسازید
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" size="sm" className="rounded-lg" type="button" onClick={() => setCreateOpen(true)}>
                  <Plus data-icon="inline-start" aria-hidden="true" />
                  کلاس جدید
                </Button>
              </EmptyContent>
            </Empty>
          ) : null}

          {isReady && visible.length > 0 ? (
            <div className="mt-3 flex flex-col gap-3">
              {visible.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  clubName={clubNames.get(session.clubId) ?? "باشگاه حذف شده"}
                  memberCount={counts?.[session.id]}
                  canAttend={session.isActive && activeIds.has(session.clubId)}
                />
              ))}
            </div>
          ) : null}

          {isReady && sessions.length > 0 && visible.length === 0 ? (
            <Empty className="mt-4 border-none bg-transparent p-6">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-brand-50 text-accent-ink">
                  <CalendarDays aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle className="text-[13px] font-extrabold text-ink">کلاسی یافت نشد</EmptyTitle>
                <EmptyDescription className="text-[12px] leading-5 text-ink-subtle">
                  وضعیت، باشگاه یا روز برگزاری دیگری را انتخاب کنید
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={reset}>
                  پاک کردن فیلترها
                </Button>
              </EmptyContent>
            </Empty>
          ) : null}

          <SessionsFiltersSheet
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            status={filters.status}
            club={filters.club}
            days={filters.days}
            clubs={clubData?.clubs ?? []}
            resultCount={isReady ? visible.length : undefined}
            onStatusChange={(value) => void setFilters({ status: value })}
            onClubChange={(value) => void setFilters({ club: value })}
            onDaysChange={(value) => void setFilters({ days: value as WeekDay[] })}
            onClear={() => void setFilters({ status: "ACTIVE", club: "", days: [] })}
          />

          <SessionSaveSheet open={createOpen} onOpenChange={setCreateOpen} />
        </div>
      </CoachSheet>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 flex justify-center">
        <Button
          type="button"
          variant="brand"
          aria-haspopup="dialog"
          className="pointer-events-auto h-12 gap-2 rounded-full px-5 text-[13px] font-bold active:scale-95"
          onClick={() => setCreateOpen(true)}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          کلاس جدید
        </Button>
      </div>
    </>
  );
}
