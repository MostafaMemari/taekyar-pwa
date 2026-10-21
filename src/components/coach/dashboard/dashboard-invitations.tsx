import Link from "next/link";
import { PersonAvatar, SectionHeading, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INVITATIONS } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardInvitations() {
  const pending = INVITATIONS.filter((invitation) => invitation.status === "PENDING");

  return (
    <section>
      <SectionHeading
        title="دعوت نامه های در انتظار"
        action={
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-[10.5px] font-extrabold text-accent-ink"
            render={<Link href="/coach/invitations" />}
            nativeButton={false}
          >
            مشاهده همه
          </Button>
        }
      />
      <Card className="gap-0 p-0">
        {pending.length > 0 ? (
          pending.map((invitation, index) => (
            <div key={invitation.id} className={cn("flex items-center gap-3 p-4", index > 0 && "border-t border-[var(--line-2)]")}>
              <PersonAvatar name={invitation.studentName ?? invitation.nationalCode} className="size-9" fallbackClassName="text-[12px]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-extrabold text-ink">{invitation.studentName ?? "هنرجوی بدون حساب"}</p>
                <p className="mt-1 truncate text-[10.5px] font-medium text-ink-subtle">
                  کد ملی {toPersianDigits(invitation.nationalCode)} · ارسال: {invitation.sentAt}
                </p>
              </div>
              <StatusBadge tone="warning" className="shrink-0">
                در انتظار پاسخ
              </StatusBadge>
            </div>
          ))
        ) : (
          <p className="p-4 text-center text-[11px] font-semibold text-ink-subtle">دعوت نامه در انتظاری وجود ندارد.</p>
        )}
      </Card>
    </section>
  );
}
