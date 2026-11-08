"use client";

import { CalendarClock, CalendarDays, Check, ChevronLeft, ClipboardCheck, Clock, Minus, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ErrorState } from "@/features/coach/components/error-state";
import { SessionTime } from "@/features/coach/components/session-time";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { useSessionStudentCounts, useSessions } from "@/features/coach/hooks/use-sessions";
import { sessionIsToday, weekDayLabels } from "@/features/coach/lib/coach-data";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";
import { apiErrorMessage } from "@/lib/api/client";
import { toLatinDigits, toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";
import { SessionsSkeleton } from "./sessions/sessions-skeleton";

type Period = "all" | "today";

const PERIODS: { value: Period; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "today", label: "امروز" },
];

function SessionCard({ session, clubName, memberCount }: { session: ClassSessionRecord; clubName: string; memberCount?: number }) {
  return (
    <Card className="gap-0 p-0">
      <Link
        href={`/coach/sessions/${session.id}`}
        className="block rounded-t-xl px-4 pb-3 pt-3.5 transition duration-150 active:bg-muted/40"
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
            <p className="mt-0.5 truncate text-[12px] text-ink-subtle">{clubName}</p>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold text-ink-muted">
              <span className="flex items-center gap-1">
                <CalendarClock className="size-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
                {weekDayLabels(session.weekDays).join(" · ")}
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <Clock className="size-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
                <SessionTime start={session.startTime} end={session.endTime} />
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <Users className="size-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
                {memberCount === undefined ? "" : `${toPersianDigits(String(memberCount))} هنرجو`}
              </span>
            </div>
          </div>

          <ChevronLeft className="mt-1 size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
        </div>
      </Link>

      <div className="border-t border-[var(--line-2)] px-2 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 gap-2 rounded-lg px-2 text-[12px] font-semibold text-accent-ink"
          render={<Link href={`/coach/sessions/${session.id}/attendance`} />}
          nativeButton={false}
        >
          <ClipboardCheck data-icon="inline-start" aria-hidden="true" />
          حضور و غیاب
        </Button>
      </div>
    </Card>
  );
}

export function SessionsDirectory() {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<Period>("all");

  const { data, error, isLoading, mutate } = useSessions();
  const { data: clubData } = useClubs();
  const sessions = data?.sessions ?? [];
  const { data: counts, error: countsError, mutate: mutateCounts } = useSessionStudentCounts(sessions.map((session) => session.id));

  const readError = error ?? countsError;
  const isReady = Boolean(data) && !readError;
  const clubNames = new Map((clubData?.clubs ?? []).map((club) => [club.id, club.name]));

  const normalizedQuery = toLatinDigits(query).trim().toLowerCase();
  const visible = sessions.filter((session) => {
    if (period !== "all" && !sessionIsToday(session.weekDays)) return false;
    if (!normalizedQuery) return true;

    const haystack = toLatinDigits(
      `${session.name} ${clubNames.get(session.clubId) ?? ""} ${weekDayLabels(session.weekDays).join(" ")} ${session.startTime} ${session.endTime}`,
    ).toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const reset = () => {
    setQuery("");
    setPeriod("all");
  };

  const retry = () => {
    void mutate();
    void mutateCounts();
  };

  return (
    <>
      <header className="flex items-center gap-2">
        <h1 className="page-title text-ink">کلاس ها</h1>
        {data && !readError ? (
          <StatusBadge tone="neutral" className="mt-0.5">
            {visible.length === sessions.length
              ? `${toPersianDigits(String(sessions.length))} کلاس`
              : `${toPersianDigits(String(visible.length))} کلاس یافت شد`}
          </StatusBadge>
        ) : null}
      </header>

      <div className="sticky top-0 z-20 -mx-4 mt-4 border-b border-[var(--line-2)] bg-[var(--canvas)]/95 px-4 pb-3 pt-2 backdrop-blur">
        <InputGroup className="h-11 rounded-xl">
          <InputGroupInput
            type="search"
            placeholder="جستجوی نام کلاس..."
            aria-label="جستجوی کلاس"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <Search className="size-4 text-ink-subtle" aria-hidden="true" />
          </InputGroupAddon>
        </InputGroup>

        <ToggleGroup
          aria-label="بازه زمانی کلاس ها"
          value={[period]}
          onValueChange={(next) => {
            const selected = next[0] as Period | undefined;
            if (selected) setPeriod(selected);
          }}
          variant="segmented"
          spacing={1}
          className="mt-3 w-full rounded-xl bg-muted p-1"
        >
          {PERIODS.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value} className="h-9 flex-1 rounded-lg text-[12px] font-bold">
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

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
                برای هر باشگاه، یک کلاس با روزها و ساعت برگزاری بسازید.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" className="rounded-lg" render={<Link href="/coach/sessions/new" />} nativeButton={false}>
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
                عبارت جستجو یا بازه زمانی را تغییر دهید.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={reset}>
                پاک کردن فیلترها
              </Button>
            </EmptyContent>
          </Empty>
        ) : null}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-[var(--app-max-width)] justify-end px-5">
        <Button
          variant="brand"
          size="icon"
          aria-label="کلاس جدید"
          className="pointer-events-auto size-14 rounded-2xl shadow-brand-xl"
          render={<Link href="/coach/sessions/new" />}
          nativeButton={false}
        >
          <Plus className="size-6" aria-hidden="true" />
        </Button>
      </div>
    </>
  );
}
