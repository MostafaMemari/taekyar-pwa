"use client";

import { CalendarDays, ListFilter, Plus, Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBandBar } from "@/features/coach/components/coach-band-bar";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { SessionCard } from "@/features/coach/components/sessions/session-card";
import { SessionSaveSheet } from "@/features/coach/components/sessions/session-save-sheet";
import { SessionsFiltersSheet } from "@/features/coach/components/sessions/sessions-filters-sheet";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { useSessionStudentCounts, useSessions } from "@/features/coach/hooks/use-sessions";
import { activeClubIds, type WeekDay, weekDayLabels } from "@/features/coach/lib/coach-data";
import { activeSessionFilterCount, sessionFilterParsers } from "@/features/coach/lib/sessions-filters";
import { apiErrorMessage } from "@/lib/api/client";
import { toLatinDigits, toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";
import { SessionsSkeleton } from "./sessions/sessions-skeleton";

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
