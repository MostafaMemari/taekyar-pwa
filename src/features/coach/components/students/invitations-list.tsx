"use client";

import { IdCard, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/features/coach/components/error-state";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useInvitations } from "@/features/coach/hooks/use-invitations";
import { INVITATION_STATUS_META, type InvitationStatus } from "@/features/coach/lib/coach-data";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

const SUMMARY: { status: InvitationStatus; label: string; tone: string }[] = [
  { status: "PENDING", label: "در انتظار", tone: "text-warning" },
  { status: "CONFIRMED", label: "پذیرفته", tone: "text-success" },
  { status: "REJECTED", label: "رد شده", tone: "text-danger" },
];

export function InvitationsList() {
  const { data, error, isLoading, mutate } = useInvitations();
  const invitations = data?.invitations ?? [];

  return (
    <div className="mt-4 flex flex-col gap-2.5">
      <div className="grid grid-cols-3 gap-2.5">
        {SUMMARY.map((item) => (
          <Card key={item.status} className="items-center gap-1 rounded-2xl p-3 text-center">
            <b className={cn("text-[19px] font-extrabold leading-none tabular-nums", item.tone)}>
              {data ? toPersianDigits(String(invitations.filter((invitation) => invitation.status === item.status).length)) : "—"}
            </b>
            <span className="text-[10px] font-bold text-ink-subtle">{item.label}</span>
          </Card>
        ))}
      </div>

      {error ? (
        <ErrorState title="خواندن دعوت نامه ها انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
      ) : isLoading && !data ? (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-[82px] rounded-2xl" />
          ))}
        </div>
      ) : invitations.length === 0 ? (
        <Card className="rounded-2xl px-4 py-6 text-center text-[12px] font-semibold text-ink-muted">
          هنوز دعوت نامه ای ارسال نکرده اید.
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {invitations.map((invitation) => {
            const meta = INVITATION_STATUS_META[invitation.status];
            const Icon = meta.icon;

            return (
              <Card key={invitation.id} className="flex-row items-center gap-3 rounded-2xl px-3.5 py-3.5">
                <PersonAvatar name={invitation.student?.fullName ?? invitation.nationalCode} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <b className="truncate text-[13px] font-extrabold text-ink">{invitation.student?.fullName ?? "هنرجوی بدون حساب"}</b>
                    <StatusBadge tone={meta.tone} className="shrink-0">
                      <Icon aria-hidden="true" />
                      {meta.label}
                    </StatusBadge>
                  </div>

                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-subtle">
                    <IdCard className="size-3 shrink-0" aria-hidden="true" />
                    کد ملی <span dir="ltr">{toPersianDigits(invitation.nationalCode)}</span>
                  </p>

                  <p className="mt-0.5 text-[11px] text-ink-subtle">
                    ارسال: {toJalaliDate(invitation.createdAt)}
                    {invitation.respondedAt ? ` · پاسخ: ${toJalaliDate(invitation.respondedAt)}` : null}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Button
        variant="outline"
        className="mt-2 h-12 w-full rounded-xl border-dashed text-[12px] font-extrabold text-ink-muted"
        render={<Link href="/coach/students/invite" />}
        nativeButton={false}
      >
        <UserPlus data-icon="inline-start" aria-hidden="true" />
        دعوت نامه جدید
      </Button>

      <p className="text-center text-[10px] font-medium leading-5 text-ink-subtle">
        برای دعوت مجدد هنرجویی که دعوت نامه اش رد شده، همان کد ملی را دوباره ثبت کنید.
      </p>
    </div>
  );
}
