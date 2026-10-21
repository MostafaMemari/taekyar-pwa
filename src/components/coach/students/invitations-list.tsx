import { IdCard, UserPlus } from "lucide-react";
import Link from "next/link";
import { PersonAvatar, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INVITATION_STATUS_META, INVITATIONS, type InvitationStatus } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

const SUMMARY: { status: InvitationStatus; label: string; tone: string }[] = [
  { status: "PENDING", label: "در انتظار", tone: "text-warning" },
  { status: "CONFIRMED", label: "پذیرفته", tone: "text-success" },
  { status: "REJECTED", label: "رد شده", tone: "text-danger" },
];

export function InvitationsList() {
  return (
    <div className="mt-4 flex flex-col gap-2.5">
      <div className="grid grid-cols-3 gap-2.5">
        {SUMMARY.map((item) => (
          <Card key={item.status} className="items-center gap-1 rounded-2xl p-3 text-center">
            <b className={cn("text-[19px] font-extrabold leading-none tabular-nums", item.tone)}>
              {toPersianDigits(String(INVITATIONS.filter((invitation) => invitation.status === item.status).length))}
            </b>
            <span className="text-[10px] font-bold text-ink-subtle">{item.label}</span>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {INVITATIONS.map((invitation) => {
          const meta = INVITATION_STATUS_META[invitation.status];
          const Icon = meta.icon;

          return (
            <Card key={invitation.id} className="flex-row items-center gap-3 rounded-2xl px-3.5 py-3.5">
              <PersonAvatar name={invitation.studentName ?? invitation.nationalCode} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <b className="truncate text-[13px] font-extrabold text-ink">{invitation.studentName ?? "هنرجوی بدون حساب"}</b>
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
                  ارسال: {invitation.sentAt}
                  {invitation.respondedAt ? ` · پاسخ: ${invitation.respondedAt}` : null}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="mt-2 h-12 w-full rounded-xl border-dashed text-[12px] font-extrabold text-ink-muted"
        render={<Link href="/coach/students/invite" />}
        nativeButton={false}
      >
        <UserPlus data-icon="inline-start" aria-hidden="true" />
        دعوت نامه جدید
      </Button>

      <p className="text-center text-[10.5px] font-medium leading-5 text-ink-subtle">
        برای دعوت مجدد هنرجویی که دعوت نامه اش رد شده، همان کد ملی را دوباره ثبت کنید.
      </p>
    </div>
  );
}
