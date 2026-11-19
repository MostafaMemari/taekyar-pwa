import { CalendarDays, Users } from "lucide-react";
import { useState } from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { SessionCard } from "@/features/coach/components/sessions/session-card";
import { SessionSaveSheet } from "@/features/coach/components/sessions/session-save-sheet";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";
import { toPersianDigits } from "@/lib/digits";

export function ClubClasses({
  clubId,
  clubName,
  sessions,
  memberCounts,
  clubActive,
}: {
  clubId: string;
  clubName: string;
  sessions: ClassSessionRecord[];
  memberCounts?: Record<string, number>;
  clubActive: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");
  const [sheetOpen, setSheetOpen] = useState(false);
  const visible = sessions.filter((session) => (filter === "all" ? true : filter === "active" ? session.isActive : !session.isActive));

  return (
    <section>
      <SectionHeading
        title="کلاس های باشگاه"
        action={
          <StatusBadge>
            <Users aria-hidden="true" />
            {toPersianDigits(String(visible.length))} کلاس
          </StatusBadge>
        }
      />

      {sessions.length > 0 ? (
        <>
          <ToggleGroup
            aria-label="فیلتر کلاس ها"
            value={[filter]}
            onValueChange={(next) => {
              const selected = next[0];
              if (selected) setFilter(selected as "all" | "active" | "inactive");
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
                className="h-9 flex-1 rounded-full text-[12px] font-bold aria-pressed:bg-background aria-pressed:text-accent-ink"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="mt-3 flex flex-col gap-2.5">
            {visible.length === 0 ? (
              <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
                {filter === "active" ? "کلاس فعالی وجود ندارد" : "کلاس غیرفعالی وجود ندارد"}
              </p>
            ) : (
              visible.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  clubName={clubName}
                  memberCount={memberCounts?.[session.id]}
                  canAttend={session.isActive && clubActive}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <Empty className="min-h-[45dvh] border-none bg-transparent p-4">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-14 rounded-2xl bg-brand-50 text-accent-ink">
              <CalendarDays aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="text-[14px] font-extrabold text-ink">هنوز کلاسی ثبت نشده</EmptyTitle>
            <EmptyDescription className="text-[12px] leading-5 text-ink-subtle">
              اولین کلاس این باشگاه را بسازید تا حضور و غیاب شروع شود
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <SessionSaveSheet open={sheetOpen} onOpenChange={setSheetOpen} clubId={clubId} />
    </section>
  );
}
