import { INVITATIONS } from "@/components/coach/coach-data";
import { PersonAvatar, SectionHeading, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardInvitations() {
  return (
    <section>
      <SectionHeading
        title="دعوت نامه های در انتظار"
        action={
          <Button variant="link" size="sm" className="h-auto p-0 text-[10.5px] font-extrabold text-accent-ink">
            مشاهده همه
          </Button>
        }
      />
      <Card className="gap-0 p-0">
        {INVITATIONS.map((invitation, index) => (
          <div key={invitation.id} className={cn("flex items-center gap-3 p-4", index > 0 && "border-t border-[var(--line-2)]")}>
            <PersonAvatar name={invitation.name} className="size-9" fallbackClassName="text-[12px]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-extrabold text-ink">{invitation.name}</p>
              <p className="mt-1 text-[10.5px] font-medium text-ink-subtle">ارسال: {toPersianDigits(invitation.sentAt)}</p>
            </div>
            <StatusBadge tone="warning" className="shrink-0">
              در انتظار پاسخ
            </StatusBadge>
          </div>
        ))}
      </Card>
    </section>
  );
}
