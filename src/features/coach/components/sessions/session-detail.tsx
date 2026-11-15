"use client";

import { CalendarDays, Check, ClipboardCheck, ClipboardList, EllipsisVertical, Loader2, Minus, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "@/components/ding-toaster";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { ErrorState } from "@/features/coach/components/error-state";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { SessionTime } from "@/features/coach/components/session-time";
import { SessionSaveSheet } from "@/features/coach/components/sessions/session-save-sheet";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useRemoveSessionStudent } from "@/features/coach/hooks/use-session-mutations";
import { useSession, useSessionStudentsFeed } from "@/features/coach/hooks/use-sessions";
import { weekDayLabels } from "@/features/coach/lib/coach-data";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
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
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ studentId: string; name: string } | null>(null);
  const removeStudent = useRemoveSessionStudent(session.id);
  const clubName = session.club?.name ?? "باشگاه حذف شده";
  // An inactive class (or one in an inactive club) records nothing.
  const sessionOperable = session.isActive && (session.club?.isActive ?? true);
  const members = (session.students ?? []).map((membership) => ({
    studentId: membership.studentId,
    name: membership.student.fullName,
    clubActive: membership.student.clubMemberships?.[0]?.isActive ?? true,
  }));
  const studentsFeed = useSessionStudentsFeed(session.id);
  const [rosterFilter, setRosterFilter] = useState<"active" | "inactive" | "all">("active");
  const activeCount = members.filter((member) => member.clubActive).length;
  const inactiveCount = members.length - activeCount;
  const rosterTotal = rosterFilter === "all" ? members.length : rosterFilter === "active" ? activeCount : inactiveCount;
  const visibleStudents = studentsFeed.members.filter((member) =>
    rosterFilter === "all" ? true : rosterFilter === "active" ? member.clubActive : !member.clubActive,
  );

  // Filtered views must not hide rows that sit on unloaded pages, so the feed drains to the end.
  useEffect(() => {
    if (rosterFilter !== "all" && studentsFeed.hasMore && !studentsFeed.isValidating) void studentsFeed.setSize(studentsFeed.size + 1);
  }, [rosterFilter, studentsFeed.hasMore, studentsFeed.isValidating, studentsFeed.size]);

  const applyRemove = async () => {
    if (!removeTarget) return;
    try {
      await removeStudent.trigger(removeTarget.studentId);
      setRemoveTarget(null);
      toast.success("هنرجو از کلاس حذف شد");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
      else toast.error(apiErrorMessage(requestError));
    }
  };

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
            className="size-11 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
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
            disabled={!sessionOperable}
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

        {!sessionOperable ? (
          <p className="rounded-xl bg-muted/60 p-3 text-[12px] font-semibold leading-5 text-ink-subtle">
            این کلاس غیرفعال است و امکان ثبت حضور و غیاب یا افزودن هنرجو وجود ندارد
          </p>
        ) : null}

        <section>
          <SectionHeading
            title="هنرجویان کلاس"
            action={
              <div className="flex items-center gap-2">
                <StatusBadge>
                  <Users aria-hidden="true" />
                  {toPersianDigits(String(rosterTotal))} نفر
                </StatusBadge>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-lg px-2.5 text-[12px] font-bold"
                  onClick={() => setAddOpen(true)}
                  disabled={!sessionOperable}
                >
                  <Plus data-icon="inline-start" aria-hidden="true" />
                  افزودن
                </Button>
              </div>
            }
          />

          {members.length === 0 ? (
            <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
              هنوز هنرجویی در این کلاس ثبت نشده است
            </p>
          ) : (
            <>
              <ToggleGroup
                aria-label="فیلتر هنرجویان کلاس"
                value={[rosterFilter]}
                onValueChange={(next) => {
                  const selected = next[0];
                  if (selected) setRosterFilter(selected as "active" | "inactive" | "all");
                }}
                variant="segmented"
                spacing={1}
                className="w-full rounded-full bg-muted p-1"
              >
                {[
                  { value: "active", label: "فعال" },
                  { value: "inactive", label: "غیرفعال" },
                  { value: "all", label: "همه" },
                ].map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="h-9 flex-1 rounded-full text-[12px] font-bold aria-pressed:bg-brand-600 aria-pressed:text-white"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              {studentsFeed.isLoading && studentsFeed.members.length === 0 ? (
                <Card className="mt-3 gap-0 px-4 py-1">
                  {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-14 my-1 rounded-xl" />
                  ))}
                </Card>
              ) : visibleStudents.length === 0 ? (
                <p className="mt-3 rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
                  {rosterFilter === "inactive" ? "هیچ هنرجویی با عضویت غیرفعال در این کلاس نیست" : "هنرجوی فعالی در این کلاس وجود ندارد"}
                </p>
              ) : (
                <>
                  <SessionRoster
                    className="mt-3"
                    entries={visibleStudents.map((member) => ({
                      studentId: member.studentId,
                      name: member.name,
                      subline: member.clubActive ? `عضویت از ${toJalaliDate(member.joinedAt)}` : "عضویت باشگاه غیرفعال است",
                    }))}
                    linkStudents
                    onRemove={(entry) => {
                      removeStudent.reset();
                      setRemoveTarget(entry);
                    }}
                  />
                  {studentsFeed.hasMore ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 h-11 w-full rounded-xl text-[12px] font-bold"
                      disabled={studentsFeed.isValidating}
                      onClick={() => void studentsFeed.setSize(studentsFeed.size + 1)}
                    >
                      {studentsFeed.isValidating ? "در حال بارگذاری..." : "نمایش بیشتر"}
                    </Button>
                  ) : null}
                </>
              )}
            </>
          )}
        </section>
      </CoachSheet>

      <SessionDetailActions session={session} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} onEdit={() => setEditOpen(true)} />

      <AddClassStudentsSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        sessionId={session.id}
        clubId={session.clubId}
        clubGender={session.club?.gender}
        existingStudentIds={members.map((member) => member.studentId)}
      />

      <SessionSaveSheet open={editOpen} onOpenChange={setEditOpen} sessionId={session.id} />

      <SheetFrame
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title="حذف از کلاس"
        description={removeTarget?.name ?? ""}
      >
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
          این هنرجو از این کلاس حذف می شود و سابقه حضور و غیاب او در کلاس حفظ می شود. بعداً می توانید دوباره به همین کلاس اضافه اش کنید
        </p>

        {removeStudent.error ? (
          <p className="pt-2 text-[12px] font-bold leading-5 text-danger">{apiErrorMessage(removeStudent.error)}</p>
        ) : null}

        <SheetActions onSecondary={() => setRemoveTarget(null)} secondaryDisabled={removeStudent.isMutating}>
          <Button
            variant="destructive"
            className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
            onClick={() => void applyRemove()}
            disabled={removeStudent.isMutating}
          >
            {removeStudent.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {removeStudent.isMutating ? "در حال حذف..." : "حذف از کلاس"}
          </Button>
        </SheetActions>
      </SheetFrame>
    </main>
  );
}
