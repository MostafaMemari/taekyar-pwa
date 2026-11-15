"use client";

import { ChevronLeft, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ding-toaster";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { SessionTime } from "@/features/coach/components/session-time";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { StudentSessionEnrollForm } from "@/features/coach/components/students/student-session-enroll-form";
import { useAddClubStudent, useRemoveClubStudent, useSetClubMemberStatus } from "@/features/coach/hooks/use-club-mutations";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { useRemoveSessionStudent } from "@/features/coach/hooks/use-session-mutations";
import { useStudentSessions } from "@/features/coach/hooks/use-sessions";
import type { ClubMembershipRecord } from "@/features/coach/lib/club-api";
import { weekDayLabels } from "@/features/coach/lib/coach-data";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toJalaliMonth } from "@/lib/jalali";
import { cn } from "@/lib/utils";

// One card shape serves live and past memberships; the active/inactive difference is the action row.
function MembershipCard({
  membership,
  clubClasses,
  classesLoading,
  statusMutating,
  onEnroll,
  onRemoveClub,
  onRemoveSession,
  onReactivate,
}: {
  membership: ClubMembershipRecord;
  clubClasses: ClassSessionRecord[];
  classesLoading: boolean;
  statusMutating: boolean;
  onEnroll: () => void;
  onRemoveClub: () => void;
  onRemoveSession: (session: ClassSessionRecord) => void;
  onReactivate: () => void;
}) {
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            membership.isActive ? "bg-info-soft text-info" : "bg-muted text-ink-subtle",
          )}
        >
          <Landmark className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-ink">{membership.club.name}</p>
          <p className="mt-0.5 truncate text-[12px] text-ink-subtle">
            {membership.isActive
              ? `عضویت از ${toJalaliMonth(membership.joinedAt)}`
              : `عضویت از ${toJalaliMonth(membership.joinedAt)} · خروج ${toJalaliMonth(membership.removedAt ?? membership.joinedAt)}`}
          </p>
        </div>
        <StatusBadge tone={membership.isActive ? "success" : "neutral"}>{membership.isActive ? "فعال" : "غیرفعال"}</StatusBadge>
      </div>

      {classesLoading ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-[var(--line-2)] pt-3">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ) : clubClasses.length > 0 ? (
        <div className="mt-3 border-t border-[var(--line-2)] pt-3">
          <span className="text-[11px] font-bold text-ink-subtle">کلاس ها</span>
          <div className="mt-2 flex flex-col gap-2">
            {clubClasses.map((session) => (
              <div key={session.id} className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2">
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[12px] font-bold text-ink">{session.name}</b>
                  <span className="mt-0.5 block truncate text-[11px] font-medium text-ink-muted">
                    {weekDayLabels(session.weekDays).join(" · ")} · <SessionTime start={session.startTime} end={session.endTime} />
                  </span>
                </span>
                <button
                  type="button"
                  className="shrink-0 text-[11px] font-bold text-danger transition-colors hover:text-danger/80"
                  onClick={() => onRemoveSession(session)}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 border-t border-[var(--line-2)] pt-3 text-[12px] font-medium leading-5 text-ink-subtle">
          این هنرجو در هیچ کلاسی از این باشگاه ثبت نشده است
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        {membership.isActive ? (
          <>
            <Button type="button" variant="outline" className="h-10 w-full rounded-xl text-[12px] font-bold" onClick={onEnroll}>
              ثبت نام در کلاس
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full rounded-xl text-[12px] font-bold text-danger hover:bg-danger-soft/60"
              onClick={onRemoveClub}
            >
              حذف از باشگاه
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="col-span-2 h-10 w-full rounded-xl text-[12px] font-bold"
            disabled={statusMutating}
            onClick={onReactivate}
          >
            فعال سازی مجدد عضویت
          </Button>
        )}
      </div>
    </Card>
  );
}

export function StudentMembershipsPanel({
  studentId,
  memberships,
  isLoading,
}: {
  studentId: string;
  memberships: ClubMembershipRecord[];
  isLoading: boolean;
}) {
  const router = useRouter();
  const sessions = useStudentSessions(studentId);
  const { data: clubs } = useClubs();

  const [addOpen, setAddOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollClubId, setEnrollClubId] = useState<string | null>(null);
  const [removeSessionOpen, setRemoveSessionOpen] = useState(false);
  const [removeSession, setRemoveSession] = useState<ClassSessionRecord | null>(null);
  const [removeClubOpen, setRemoveClubOpen] = useState(false);
  const [removeClubTarget, setRemoveClubTarget] = useState<ClubMembershipRecord | null>(null);

  const joinClub = useAddClubStudent();
  const leaveSession = useRemoveSessionStudent(removeSession?.id ?? "");
  const removeClub = useRemoveClubStudent();
  const setMemberStatus = useSetClubMemberStatus();

  const sessionList = sessions.data ?? [];
  const activeMemberships = memberships.filter((membership) => membership.isActive);
  const pastMemberships = memberships.filter((membership) => !membership.isActive);
  const activeClubIds = new Set(activeMemberships.map((membership) => membership.club.id));
  const joinableClubs = (clubs?.clubs ?? []).filter((club) => club.isActive && !activeClubIds.has(club.id));
  const enrollClubName = memberships.find((membership) => membership.club.id === enrollClubId)?.club.name ?? "";
  // A guarded delete answers 400 with its reason; the sheet then offers the soft deactivation instead.
  const removeClubBlocked = removeClub.error instanceof ApiError && removeClub.error.status === 400;

  const joinClubNow = async (clubId: string) => {
    try {
      await joinClub.trigger({ clubId, studentId });
      toast.success("هنرجو به باشگاه اضافه شد");
      setAddOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  const removeSessionNow = async () => {
    if (!removeSession) return;
    try {
      await leaveSession.trigger(studentId);
      toast.success("هنرجو از کلاس حذف شد");
      setRemoveSessionOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  const removeClubNow = async () => {
    if (!removeClubTarget) return;
    try {
      await removeClub.trigger({ clubId: removeClubTarget.club.id, studentId });
      toast.success("هنرجو از باشگاه حذف شد");
      setRemoveClubOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  const deactivateNow = async () => {
    if (!removeClubTarget) return;
    try {
      await setMemberStatus.trigger({ clubId: removeClubTarget.club.id, studentId, isActive: false });
      toast.success("عضویت باشگاه غیرفعال شد");
      setRemoveClubOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  const reactivateNow = async (membership: ClubMembershipRecord) => {
    try {
      await setMemberStatus.trigger({ clubId: membership.club.id, studentId, isActive: true });
      toast.success("عضویت باشگاه دوباره فعال شد");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
      toast.error(apiErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <output className="flex flex-col gap-2.5" aria-busy="true" aria-label="در حال بارگذاری عضویت ها">
        {[0, 1].map((row) => (
          <Skeleton key={row} className="h-24 w-full rounded-2xl" />
        ))}
      </output>
    );
  }

  const renderMembership = (membership: ClubMembershipRecord) => (
    <MembershipCard
      key={membership.id}
      membership={membership}
      clubClasses={sessionList.filter((session) => session.clubId === membership.club.id)}
      classesLoading={sessions.data === undefined}
      statusMutating={setMemberStatus.isMutating}
      onEnroll={() => {
        setEnrollClubId(membership.club.id);
        setEnrollOpen(true);
      }}
      onRemoveClub={() => {
        setRemoveClubTarget(membership);
        setRemoveClubOpen(true);
      }}
      onRemoveSession={(session) => {
        setRemoveSession(session);
        setRemoveSessionOpen(true);
      }}
      onReactivate={() => void reactivateNow(membership)}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      {memberships.length === 0 ? (
        <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
          این هنرجو هنوز در باشگاهی ثبت نشده است
        </p>
      ) : null}

      {activeMemberships.length > 0 ? (
        <section className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-ink-subtle">عضویت های فعال</span>
          {activeMemberships.map(renderMembership)}
        </section>
      ) : null}

      {pastMemberships.length > 0 ? (
        <section className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-ink-subtle">سوابق عضویت</span>
          {pastMemberships.map(renderMembership)}
        </section>
      ) : null}

      <Button type="button" variant="outline" className="h-11 w-full rounded-xl text-[12px] font-semibold" onClick={() => setAddOpen(true)}>
        افزودن به باشگاه
      </Button>

      <SheetFrame open={addOpen} onOpenChange={setAddOpen} title="افزودن به باشگاه" description="یک باشگاه فعال برای عضویت انتخاب کنید">
        <div className="mt-3 flex flex-col gap-2">
          {clubs === undefined ? (
            [0, 1, 2].map((row) => <Skeleton key={row} className="h-12 w-full rounded-xl" />)
          ) : joinableClubs.length === 0 ? (
            <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
              باشگاه فعالی برای افزودن وجود ندارد
            </p>
          ) : (
            joinableClubs.map((club) => (
              <button
                key={club.id}
                type="button"
                disabled={joinClub.isMutating}
                className="flex w-full items-center gap-2.5 rounded-xl border border-[var(--line-2)] px-3 py-2.5 text-start transition-colors hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => void joinClubNow(club.id)}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-info-soft text-info">
                  <Landmark className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-ink-body">{club.name}</span>
                <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
              </button>
            ))
          )}
        </div>
        <AuthFormError message={joinClub.error ? apiErrorMessage(joinClub.error) : ""} />
      </SheetFrame>

      <SheetFrame
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        title={`کلاس های ${enrollClubName}`}
        description="کلاس مورد نظر را انتخاب کنید"
      >
        {enrollClubId ? (
          <StudentSessionEnrollForm
            studentId={studentId}
            clubId={enrollClubId}
            onPickClub={() => undefined}
            onDone={() => setEnrollOpen(false)}
          />
        ) : null}
      </SheetFrame>

      <SheetFrame open={removeSessionOpen} onOpenChange={setRemoveSessionOpen} title="حذف از کلاس" description={removeSession?.name ?? ""}>
        <p className="mt-3 rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
          این هنرجو از این کلاس حذف می شود و سابقه حضور و غیاب او در کلاس حفظ می شود. بعداً می توانید دوباره به همین کلاس اضافه اش کنید
        </p>
        <AuthFormError message={leaveSession.error ? apiErrorMessage(leaveSession.error) : ""} />
        <SheetActions onSecondary={() => setRemoveSessionOpen(false)}>
          <Button
            variant="destructive"
            className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
            disabled={leaveSession.isMutating}
            onClick={() => void removeSessionNow()}
          >
            {leaveSession.isMutating ? "در حال حذف..." : "حذف از کلاس"}
          </Button>
        </SheetActions>
      </SheetFrame>

      <SheetFrame
        open={removeClubOpen}
        onOpenChange={setRemoveClubOpen}
        title="حذف از باشگاه"
        description={removeClubTarget?.club.name ?? ""}
      >
        <p className="mt-3 rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
          با حذف، ثبت نام های این هنرجو در کلاس های این باشگاه هم پاک می شود. اگر سابقه شهریه یا حضور و غیاب در این باشگاه داشته باشد، عضویت
          حذف نمی شود و فقط می توان آن را غیرفعال کرد
        </p>
        <AuthFormError message={removeClub.error ? apiErrorMessage(removeClub.error) : ""} />
        <SheetActions onSecondary={() => setRemoveClubOpen(false)}>
          {removeClubBlocked ? (
            <Button
              variant="destructive"
              className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
              disabled={setMemberStatus.isMutating}
              onClick={() => void deactivateNow()}
            >
              {setMemberStatus.isMutating ? "در حال غیرفعال سازی..." : "غیرفعال سازی عضویت"}
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
              disabled={removeClub.isMutating}
              onClick={() => void removeClubNow()}
            >
              {removeClub.isMutating ? "در حال حذف..." : "حذف از باشگاه"}
            </Button>
          )}
        </SheetActions>
      </SheetFrame>
    </div>
  );
}
