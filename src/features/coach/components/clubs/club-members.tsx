"use client";

import { Loader2, RotateCcw, Trash2, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "@/components/ding-toaster";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { ErrorState } from "@/features/coach/components/error-state";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useChangeClubMemberStatus, useRemoveClubStudent } from "@/features/coach/hooks/use-club-mutations";
import { useClubMembersFeed } from "@/features/coach/hooks/use-clubs";
import type { ClubMemberRecord } from "@/features/coach/lib/club-api";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";

type MemberFilter = "all" | "active" | "inactive";

const MEMBER_FILTERS: { value: MemberFilter; label: string }[] = [
  { value: "active", label: "فعال" },
  { value: "inactive", label: "غیرفعال" },
  { value: "all", label: "همه" },
];

export function ClubMembers({ clubId }: { clubId: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<MemberFilter>("active");
  const isActiveParam = filter === "all" ? undefined : filter === "active";

  const feed = useClubMembersFeed(clubId, isActiveParam);
  const changeStatus = useChangeClubMemberStatus(clubId);
  const removeMember = useRemoveClubStudent();

  const [statusTarget, setStatusTarget] = useState<ClubMemberRecord | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ClubMemberRecord | null>(null);
  // A guarded delete answers 400 with its reason; the sheet then offers the soft deactivation instead.
  const removeBlocked = removeMember.error instanceof ApiError && removeMember.error.status === 400;

  const members = feed.members;
  const emptyText =
    filter === "all"
      ? "هنوز هنرجویی به این باشگاه اضافه نشده است"
      : filter === "active"
        ? "عضویت فعالی وجود ندارد"
        : "عضویت غیرفعالی وجود ندارد";

  const openStatusConfirm = (member: ClubMemberRecord) => {
    changeStatus.reset();
    setStatusTarget(member);
  };

  const openRemoveConfirm = (member: ClubMemberRecord) => {
    removeMember.reset();
    setRemoveTarget(member);
  };

  const applyStatusChange = async () => {
    if (!statusTarget) return;
    try {
      await changeStatus.trigger({ studentId: statusTarget.studentId, isActive: !statusTarget.isActive });
      setStatusTarget(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
      else toast.error(apiErrorMessage(requestError));
    }
  };

  const applyRemove = async () => {
    if (!removeTarget) return;
    try {
      await removeMember.trigger({ clubId, studentId: removeTarget.studentId });
      toast.success("هنرجو از باشگاه حذف شد");
      setRemoveTarget(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  const deactivateInstead = async () => {
    if (!removeTarget) return;
    try {
      await changeStatus.trigger({ studentId: removeTarget.studentId, isActive: false });
      toast.success("عضویت هنرجو غیرفعال شد");
      setRemoveTarget(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
      else toast.error(apiErrorMessage(requestError));
    }
  };

  return (
    <section>
      <SectionHeading
        title="هنرجویان باشگاه"
        action={
          <StatusBadge>
            <Users aria-hidden="true" />
            {toPersianDigits(String(feed.total))} نفر
          </StatusBadge>
        }
      />

      <ToggleGroup
        aria-label="فیلتر هنرجویان باشگاه"
        value={[filter]}
        onValueChange={(next) => {
          const selected = next[0];
          if (selected) setFilter(selected as MemberFilter);
        }}
        variant="segmented"
        spacing={1}
        className="w-full rounded-full bg-muted p-1"
      >
        {MEMBER_FILTERS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="h-9 flex-1 rounded-full text-[12px] font-bold aria-pressed:bg-background aria-pressed:text-accent-ink"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {feed.error ? (
        <div className="mt-3">
          <ErrorState title="خواندن هنرجویان باشگاه انجام نشد" message={apiErrorMessage(feed.error)} onRetry={() => void feed.mutate()} />
        </div>
      ) : feed.isLoading && members.length === 0 ? (
        <div className="mt-3 flex flex-col gap-2">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <p className="mt-3 rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">{emptyText}</p>
      ) : (
        <>
          <Card className="mt-3 gap-0 px-4 py-1">
            {members.map((member, index) => (
              <Fragment key={member.id}>
                {index > 0 ? <Separator /> : null}
                <div className="flex items-center">
                  <Link href={`/coach/students/${member.studentId}?from=/coach/clubs/${clubId}`} className="min-w-0 flex-1">
                    <span className="flex items-center gap-3 py-2.5">
                      <PersonAvatar name={member.student.fullName} className="size-9" fallbackClassName="text-[12px]" />
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-[12px] font-semibold text-ink-body">{member.student.fullName}</b>
                        <span className="mt-0.5 block truncate text-[12px] font-semibold tabular-nums text-ink-subtle">
                          عضویت از {toJalaliDate(member.joinedAt)}
                        </span>
                      </span>
                      <StatusBadge tone={member.isActive ? "success" : "neutral"} className="shrink-0">
                        {member.isActive ? "فعال" : "غیرفعال"}
                      </StatusBadge>
                    </span>
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 rounded-lg text-ink-subtle hover:bg-danger-soft hover:text-danger"
                    aria-label={
                      member.isActive ? `غیرفعال کردن عضویت ${member.student.fullName}` : `فعال کردن عضویت ${member.student.fullName}`
                    }
                    onClick={() => openStatusConfirm(member)}
                  >
                    {member.isActive ? (
                      <UserMinus className="size-4" aria-hidden="true" />
                    ) : (
                      <RotateCcw className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                  {member.isActive ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 rounded-lg text-ink-subtle hover:bg-danger-soft hover:text-danger"
                      aria-label={`حذف ${member.student.fullName} از باشگاه`}
                      onClick={() => openRemoveConfirm(member)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
              </Fragment>
            ))}
          </Card>

          {feed.hasMore ? (
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-11 w-full rounded-xl text-[12px] font-bold"
              disabled={feed.isValidating}
              onClick={() => void feed.setSize(feed.size + 1)}
            >
              {feed.isValidating ? "در حال بارگذاری..." : "نمایش بیشتر"}
            </Button>
          ) : null}
        </>
      )}

      <SheetFrame
        open={statusTarget !== null}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
        title={statusTarget?.isActive ? "غیرفعال کردن عضویت" : "فعال کردن عضویت"}
        description="تایید تغییر وضعیت عضویت"
      >
        <p className="rounded-xl bg-muted/60 p-3 text-[12px] leading-5 text-ink-muted">
          {statusTarget?.isActive
            ? `با غیرفعال کردن عضویت، ${statusTarget ? statusTarget.student.fullName : ""} در فهرست هنرجویان فعال باشگاه نمی آید. این کار قابل بازگشت است`
            : `با فعال کردن عضویت، ${statusTarget ? statusTarget.student.fullName : ""} دوباره در فهرست هنرجویان باشگاه قرار می گیرد`}
        </p>

        {changeStatus.error ? (
          <p className="pt-2 text-[12px] font-bold leading-5 text-danger">{apiErrorMessage(changeStatus.error)}</p>
        ) : null}

        <SheetActions onSecondary={() => setStatusTarget(null)} secondaryDisabled={changeStatus.isMutating}>
          <Button
            variant={statusTarget?.isActive ? "destructive" : "brand"}
            className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
            onClick={() => void applyStatusChange()}
            disabled={changeStatus.isMutating}
          >
            {changeStatus.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {changeStatus.isMutating ? "در حال ذخیره..." : statusTarget?.isActive ? "غیرفعال کردن" : "فعال کردن"}
          </Button>
        </SheetActions>
      </SheetFrame>

      <SheetFrame
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title="حذف از باشگاه"
        description={removeTarget?.student.fullName ?? ""}
      >
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
          با حذف، ثبت نام های این هنرجو در کلاس های این باشگاه هم پاک می شود. اگر سابقه شهریه یا حضور و غیاب در این باشگاه داشته باشد، عضویت
          حذف نمی شود و فقط می توان آن را غیرفعال کرد
        </p>

        {removeMember.error ? (
          <p className="pt-2 text-[12px] font-bold leading-5 text-danger">{apiErrorMessage(removeMember.error)}</p>
        ) : null}

        <SheetActions onSecondary={() => setRemoveTarget(null)} secondaryDisabled={removeMember.isMutating || changeStatus.isMutating}>
          {removeBlocked ? (
            <Button
              variant="destructive"
              className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
              onClick={() => void deactivateInstead()}
              disabled={changeStatus.isMutating}
            >
              {changeStatus.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
              {changeStatus.isMutating ? "در حال ذخیره..." : "غیرفعال سازی عضویت"}
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
              onClick={() => void applyRemove()}
              disabled={removeMember.isMutating}
            >
              {removeMember.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
              {removeMember.isMutating ? "در حال حذف..." : "حذف از باشگاه"}
            </Button>
          )}
        </SheetActions>
      </SheetFrame>
    </section>
  );
}
