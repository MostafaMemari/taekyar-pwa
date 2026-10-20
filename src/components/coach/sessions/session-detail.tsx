"use client";

import { Check, ChevronLeft, ClipboardCheck, EllipsisVertical, FileBarChart, Minus, Users } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { AttendanceBars, attendanceRate, attendanceTotal } from "@/components/coach/attendance-summary";
import { CoachSheet } from "@/components/coach/coach-band";
import { SectionHeading, SessionTime, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessionDetail } from "@/lib/coach/session-data";
import { toPersianDigits } from "@/lib/digits";
import { SessionBand } from "./session-band";
import { SessionDetailActions } from "./session-detail-actions";
import { SessionRoster } from "./session-roster";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--line-1)] py-2.5 last:border-b-0">
      <dt className="shrink-0 text-[11.5px] font-medium text-ink-subtle">{label}</dt>
      <dd className="min-w-0 text-end text-[12px] font-extrabold text-ink">{children}</dd>
    </div>
  );
}

export function SessionDetailView({ sessionId }: { sessionId: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const detail = getSessionDetail(sessionId);

  if (!detail) return null;

  const rate = attendanceRate(detail.lastSession.counts);
  const total = attendanceTotal(detail.lastSession.counts);
  const reportStudent = detail.roster[0];

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <SessionBand
        detail={detail}
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
              <detail.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[15px] font-extrabold text-ink">{detail.name}</h2>
              <p className="mt-1 truncate text-[12px] text-ink-muted">{detail.club}</p>
            </div>
            <StatusBadge tone={detail.active ? "success" : "neutral"} className="shrink-0">
              {detail.active ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
              {detail.active ? "فعال" : "غیرفعال"}
            </StatusBadge>
          </div>

          <dl className="mt-4 border-t border-[var(--line-1)] pt-2">
            <InfoRow label="روزهای برگزاری">
              <span className="flex flex-wrap justify-end gap-1">
                {detail.days.map((day) => (
                  <StatusBadge key={day}>{day}</StatusBadge>
                ))}
              </span>
            </InfoRow>
            <InfoRow label="ساعت برگزاری">
              <SessionTime start={detail.start} end={detail.end} />
            </InfoRow>
            <InfoRow label="تعداد هنرجو">{toPersianDigits(String(detail.memberCount))} نفر</InfoRow>
            <InfoRow label="ظرفیت کلاس">{toPersianDigits(String(detail.capacity))} نفر</InfoRow>
          </dl>
        </Card>

        <Card className="gap-3 p-4">
          <SectionHeading title="خلاصه جلسه اخیر" className="mb-0" action={<StatusBadge>{detail.lastSession.date}</StatusBadge>} />
          <AttendanceBars counts={detail.lastSession.counts} />
          <div className="flex items-center justify-between gap-2 border-t border-[var(--line-1)] pt-2.5">
            <span className="text-[10.5px] font-semibold text-ink-subtle">
              از مجموع {toPersianDigits(String(total))} هنرجو · نرخ حضور {toPersianDigits(String(rate))}٪
            </span>
            <Link
              href={`/coach/sessions/${detail.id}/report`}
              className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-accent-ink"
            >
              گزارش جلسه
              <ChevronLeft className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="brand"
            className="h-12 rounded-xl text-[12px] font-extrabold"
            render={<Link href={`/coach/sessions/${detail.id}/attendance`} />}
            nativeButton={false}
          >
            <ClipboardCheck data-icon="inline-start" aria-hidden="true" />
            ثبت حضور
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl text-[12px] font-extrabold"
            render={<Link href={reportStudent ? `/coach/students/${reportStudent.studentId}/attendance` : "/coach/students"} />}
            nativeButton={false}
          >
            <FileBarChart data-icon="inline-start" aria-hidden="true" />
            گزارش هنرجو
          </Button>
        </div>

        <section>
          <SectionHeading
            title="هنرجویان کلاس"
            action={
              <StatusBadge>
                <Users aria-hidden="true" />
                {toPersianDigits(String(detail.memberCount))} نفر
              </StatusBadge>
            }
          />
          <SessionRoster entries={detail.roster} lastSessionDate={detail.lastSession.date} linkStudents />
          <p className="mt-3 text-center text-[10.5px] font-semibold text-ink-subtle">
            نمایش {toPersianDigits(String(detail.roster.length))} هنرجو از {toPersianDigits(String(detail.memberCount))} نفر
          </p>
        </section>
      </CoachSheet>

      <SessionDetailActions detail={detail} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
    </main>
  );
}
