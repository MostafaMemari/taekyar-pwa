"use client";

import { CalendarDays, Check, ChevronLeft, Minus, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GymContext, SessionTime, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ACTIVE_CLUB, type ClassSession, SESSIONS, sessionIsToday, weekDayLabels } from "@/lib/coach/coach-data";
import { toLatinDigits, toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

type Period = "all" | "today";

const PERIODS: { value: Period; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "today", label: "امروز" },
];

function SessionCard({ session }: { session: ClassSession }) {
  return (
    <Link href={`/coach/sessions/${session.id}`} className="block rounded-xl transition duration-150 active:scale-[0.995]">
      <Card className="gap-0 p-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl",
              session.isActive ? "bg-brand-50 text-accent-ink" : "bg-muted text-ink-subtle",
            )}
          >
            <session.icon className="size-5" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <b className="truncate text-[13px] font-extrabold text-ink">{session.name}</b>
              <StatusBadge tone={session.isActive ? "success" : "neutral"} className="shrink-0">
                {session.isActive ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
                {session.isActive ? "فعال" : "غیرفعال"}
              </StatusBadge>
            </div>
            <p className="mt-1 truncate text-[11px] text-ink-subtle">{session.club}</p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {weekDayLabels(session.weekDays).map((day) => (
                <StatusBadge key={day} className="text-[10px]">
                  {day}
                </StatusBadge>
              ))}
              <StatusBadge className="text-[10px]">
                <SessionTime start={session.start} end={session.end} />
              </StatusBadge>
              <StatusBadge tone="brand" className="text-[10px]">
                <Users aria-hidden="true" />
                {toPersianDigits(String(session.studentIds.length))} هنرجو
              </StatusBadge>
            </div>
          </div>

          <ChevronLeft className="mt-1 size-4 shrink-0 text-ink-faint" aria-hidden="true" />
        </div>
      </Card>
    </Link>
  );
}

export function SessionsDirectory() {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<Period>("all");

  const clubSessions = SESSIONS.filter((session) => session.clubId === ACTIVE_CLUB.id);
  const normalizedQuery = toLatinDigits(query).trim().toLowerCase();
  const visible = clubSessions.filter((session) => {
    const matchesPeriod = period === "all" || sessionIsToday(session.weekDays);
    if (!matchesPeriod) return false;
    if (!normalizedQuery) return true;

    const haystack = toLatinDigits(
      `${session.name} ${session.club} ${weekDayLabels(session.weekDays).join(" ")} ${session.start} ${session.end}`,
    ).toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const reset = () => {
    setQuery("");
    setPeriod("all");
  };

  return (
    <>
      <header className="flex items-center gap-2">
        <h1 className="text-[22px] font-extrabold text-ink">کلاس ها</h1>
        <StatusBadge tone="neutral" className="mt-0.5">
          {visible.length === clubSessions.length
            ? `${toPersianDigits(String(clubSessions.length))} کلاس`
            : `${toPersianDigits(String(visible.length))} کلاس یافت شد`}
        </StatusBadge>
      </header>

      <GymContext className="mt-4" subtitle="کلاس بندی و حضور و غیاب این باشگاه" actionLabel="تغییر باشگاه" />

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
            <ToggleGroupItem key={option.value} value={option.value} className="h-9 flex-1 rounded-lg text-[11px] font-bold">
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {visible.length > 0 ? (
        <div className="mt-3 flex flex-col gap-3">
          {visible.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <Empty className="mt-4 border-none bg-transparent p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-brand-50 text-accent-ink">
              <CalendarDays aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="text-[13px] font-extrabold text-ink">کلاسی یافت نشد</EmptyTitle>
            <EmptyDescription className="text-[11.5px] leading-5 text-ink-subtle">
              عبارت جستجو یا بازه زمانی را تغییر دهید.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={reset}>
              پاک کردن فیلترها
            </Button>
          </EmptyContent>
        </Empty>
      )}

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
