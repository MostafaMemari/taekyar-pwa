"use client";

import { Loader2, RotateCcw, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { ErrorState } from "@/features/coach/components/error-state";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useChangeClubMemberStatus } from "@/features/coach/hooks/use-club-mutations";
import { useClubMembers } from "@/features/coach/hooks/use-clubs";
import type { ClubMemberRecord } from "@/features/coach/lib/club-api";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";

export function ClubMembers({ clubId }: { clubId: string }) {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useClubMembers(clubId);
  const changeStatus = useChangeClubMemberStatus(clubId);
  const [target, setTarget] = useState<ClubMemberRecord | null>(null);

  const members = data ?? [];

  const openConfirm = (member: ClubMemberRecord) => {
    changeStatus.reset();
    setTarget(member);
  };

  const applyChange = async () => {
    if (!target) return;
    try {
      await changeStatus.trigger({ studentId: target.studentId, isActive: !target.isActive });
      setTarget(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  return (
    <section>
      <SectionHeading
        title="هنرجویان باشگاه"
        action={
          <StatusBadge>
            <Users aria-hidden="true" />
            {toPersianDigits(String(members.length))} نفر
          </StatusBadge>
        }
      />

      {error ? (
        <ErrorState title="خواندن هنرجویان باشگاه انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
      ) : isLoading && !data ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
          هنوز هنرجویی به این باشگاه اضافه نشده است.
        </p>
      ) : (
        <Card className="gap-0 px-4 py-1">
          {members.map((member, index) => (
            <Fragment key={member.id}>
              {index > 0 ? <Separator /> : null}
              <div className="flex items-center">
                <Link href={`/coach/students/${member.studentId}`} className="min-w-0 flex-1">
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
                  onClick={() => openConfirm(member)}
                >
                  {member.isActive ? (
                    <UserMinus className="size-4" aria-hidden="true" />
                  ) : (
                    <RotateCcw className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </Fragment>
          ))}
        </Card>
      )}

      <SheetFrame
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) setTarget(null);
        }}
        title={target?.isActive ? "غیرفعال کردن عضویت" : "فعال کردن عضویت"}
        description="تایید تغییر وضعیت عضویت"
      >
        <p className="rounded-xl bg-muted/60 p-3 text-[12px] leading-5 text-ink-muted">
          {target?.isActive
            ? `با غیرفعال کردن عضویت، ${target ? target.student.fullName : ""} در فهرست هنرجویان فعال باشگاه نمی آید. این کار قابل بازگشت است.`
            : `با فعال کردن عضویت، ${target ? target.student.fullName : ""} دوباره در فهرست هنرجویان باشگاه قرار می گیرد.`}
        </p>

        {changeStatus.error ? (
          <p className="pt-2 text-[12px] font-bold leading-5 text-danger">{apiErrorMessage(changeStatus.error)}</p>
        ) : null}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setTarget(null)} disabled={changeStatus.isMutating}>
            انصراف
          </Button>
          <Button
            variant={target?.isActive ? "destructive" : "brand"}
            className="h-11 flex-[2] rounded-xl text-[12px] font-semibold"
            onClick={() => void applyChange()}
            disabled={changeStatus.isMutating}
          >
            {changeStatus.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {changeStatus.isMutating ? "در حال ذخیره..." : target?.isActive ? "غیرفعال کردن" : "فعال کردن"}
          </Button>
        </div>
      </SheetFrame>
    </section>
  );
}
