"use client";

import { CalendarDays, Check, ClipboardCheck, ClipboardList, EllipsisVertical, Minus, Plus, Users } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { SessionTime } from "@/features/coach/components/session-time";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useSession } from "@/features/coach/hooks/use-sessions";
import { weekDayLabels } from "@/features/coach/lib/coach-data";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { AddClassStudentsSheet } from "./add-class-students-sheet";
import { SessionBand } from "./session-band";
import { SessionDetailActions } from "./session-detail-actions";
import { SessionDetailSkeleton } from "./session-detail-skeleton";
import { SessionRoster } from "./session-roster";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--line-2)] py-2.5 last:border-b-0">
      <dt className="shrink-0 text-[12px] font-medium text-ink-subtle">{label}</dt>
      <dd className="min-w-0 text-end text-[12px] font-semibold text-ink">{children}</dd>
    </div>
  );
}

export function SessionDetailView({ sessionId }: { sessionId: string }) {
  const { data: session, error, mutate } = useSession(sessionId);

  if (error) {
    return (
      <main className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <CoachPageHeader title="مشخصات کلاس" backHref="/coach/sessions" />
        <ErrorState className="mt-4" title="خواندن کلاس انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
      </main>
    );
  }

  if (!session) return <SessionDetailSkeleton />;

  return <SessionDetailScreen session={session} />;
}

function SessionDetailScreen({ session }: { session: ClassSessionRecord }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const clubName = session.club?.name ?? "باشگاه حذف شده";
  const members = (session.students ?? []).map((membership) => ({
    studentId: membership.studentId,
    name: membership.student.fullName,
  }));

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <SessionBand
        name={session.name}
        clubName={clubName}
        weekDays={session.weekDays}
        start={session.startTime}
        end={session.endTime}
        backHref="/coach/sessions"
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
        <Card className="gap-0 p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-ink">
              <CalendarDays className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[15px] font-extrabold text-ink">{session.name}</h2>
              <p className="mt-1 truncate text-[12px] text-ink-muted">{clubName}</p>
            </div>
            <StatusBadge tone={session.isActive ? "success" : "neutral"} className="shrink-0">
              {session.isActive ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
              {session.isActive ? "فعال" : "غیرفعال"}
            </StatusBadge>
          </div>

          <dl className="mt-4 border-t border-[var(--line-2)] pt-2">
            <InfoRow label="روزهای برگزاری">
              <span className="flex flex-wrap justify-end gap-1">
                {weekDayLabels(session.weekDays).map((day) => (
                  <StatusBadge key={day}>{day}</StatusBadge>
                ))}
              </span>
            </InfoRow>
            <InfoRow label="ساعت برگزاری">
              <SessionTime start={session.startTime} end={session.endTime} />
            </InfoRow>
            <InfoRow label="تعداد هنرجو">{toPersianDigits(String(members.length))} نفر</InfoRow>
          </dl>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="brand"
            className="h-11 rounded-xl text-[12px] font-semibold"
            render={<Link href={`/coach/sessions/${session.id}/attendance`} />}
            nativeButton={false}
          >
            <ClipboardCheck data-icon="inline-start" aria-hidden="true" />
            ثبت حضور و غیاب
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-xl text-[12px] font-semibold"
            render={<Link href={`/coach/sessions/${session.id}/report`} />}
            nativeButton={false}
          >
            <ClipboardList data-icon="inline-start" aria-hidden="true" />
            گزارش جلسه
          </Button>
        </div>

        <section>
          <SectionHeading
            title="هنرجویان کلاس"
            action={
              <div className="flex items-center gap-2">
                <StatusBadge>
                  <Users aria-hidden="true" />
                  {toPersianDigits(String(members.length))} نفر
                </StatusBadge>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-lg px-2.5 text-[12px] font-bold"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus data-icon="inline-start" aria-hidden="true" />
                  افزودن
                </Button>
              </div>
            }
          />

          {members.length > 0 ? (
            <SessionRoster entries={members} linkStudents />
          ) : (
            <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
              هنوز هنرجویی در این کلاس ثبت نشده است.
            </p>
          )}
        </section>
      </CoachSheet>

      <SessionDetailActions session={session} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />

      <AddClassStudentsSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        sessionId={session.id}
        clubId={session.clubId}
        clubGender={session.club?.gender}
        existingStudentIds={members.map((member) => member.studentId)}
      />
    </main>
  );
}
