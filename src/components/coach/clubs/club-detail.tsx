"use client";

import { CalendarDays, ClipboardCheck, EllipsisVertical, Pencil, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CoachSheet } from "@/components/coach/coach-band";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type Club, getClubSessions } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";
import { ClubBand } from "./club-band";
import { ClubClasses } from "./club-classes";
import { ClubDetailActions } from "./club-detail-actions";
import { ClubInfoCard } from "./club-info-card";

export function ClubDetail({ club }: { club: Club }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const sessions = getClubSessions(club.id);
  const nextSession = sessions.find((session) => session.isActive);
  const attendanceHref = nextSession ? `/coach/sessions/${nextSession.id}/attendance` : "/coach/sessions/new";

  const stats = [
    { icon: CalendarDays, value: club.classesCount, label: "کلاس فعال" },
    { icon: Users, value: club.studentsCount, label: "هنرجو", accent: true },
  ];

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <ClubBand
        club={club}
        backHref="/coach/clubs"
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="عملیات بیشتر"
            className="size-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            onClick={() => setMenuOpen(true)}
          >
            <EllipsisVertical aria-hidden="true" />
          </Button>
        }
      />

      <CoachSheet className="flex flex-col gap-4">
        <ClubInfoCard club={club} />

        <Button
          variant="brand"
          className="h-12 w-full rounded-xl text-[12.5px] font-extrabold"
          render={<Link href={attendanceHref} />}
          nativeButton={false}
        >
          <ClipboardCheck data-icon="inline-start" aria-hidden="true" />
          ثبت حضور و غیاب این باشگاه
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
              <b className="text-[17px] font-extrabold leading-none tabular-nums text-ink">{toPersianDigits(String(stat.value))}</b>
              <span className="text-[9.5px] font-bold text-ink-subtle">{stat.label}</span>
            </Card>
          ))}
        </div>

        <ClubClasses sessions={sessions} />

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl text-[12px] font-extrabold"
            render={<Link href={`/coach/clubs/${club.id}/edit`} />}
            nativeButton={false}
          >
            <Pencil data-icon="inline-start" aria-hidden="true" />
            ویرایش باشگاه
          </Button>
          <Button
            variant="brand"
            className="h-12 rounded-xl text-[12px] font-extrabold"
            render={<Link href="/coach/sessions/new" />}
            nativeButton={false}
          >
            <Plus data-icon="inline-start" aria-hidden="true" />
            کلاس جدید
          </Button>
        </div>
      </CoachSheet>

      <ClubDetailActions club={club} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
    </main>
  );
}
