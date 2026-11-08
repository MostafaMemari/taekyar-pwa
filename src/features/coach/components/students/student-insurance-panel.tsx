import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { INSURANCE_META, insuranceStatusOf, type StudentInsuranceStatus } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

const DAY_MS = 86_400_000;
const INSURING_DAYS = 30;
const VALIDITY_DAYS = 365;

const TONE_COLOR: Record<StudentInsuranceStatus, string> = {
  valid: "var(--st-green)",
  expiring: "var(--st-amber)",
  expired: "var(--st-red)",
  none: "var(--surface-3)",
};

function daysFromToday(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(date).getTime() - today.getTime()) / DAY_MS);
}

export function StudentInsurancePanel({ expiryDate, studentId }: { expiryDate: string | null; studentId: string }) {
  const status = insuranceStatusOf(expiryDate, INSURING_DAYS);
  const meta = INSURANCE_META[status];
  const Icon = meta.icon;
  const daysLeft = expiryDate ? daysFromToday(expiryDate) : null;
  const remaining = daysLeft === null ? 0 : Math.max(0, Math.min(VALIDITY_DAYS, daysLeft));
  const caption =
    daysLeft === null
      ? "برای این هنرجو تاریخ بیمه ثبت نشده است."
      : daysLeft < 0
        ? `${toPersianDigits(String(Math.abs(daysLeft)))} روز از انقضا گذشته است.`
        : `${toPersianDigits(String(daysLeft))} روز تا پایان اعتبار.`;

  return (
    <section>
      <SectionHeading title="بیمه ورزشی" action={<StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>} />

      <Card className="gap-0 p-4">
        <div className="flex items-center gap-3">
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", meta.tile)}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block text-[13px] font-extrabold text-ink">{expiryDate ? `اعتبار تا ${toJalaliDate(expiryDate)}` : "ثبت نشده"}</b>
            <p className="mt-0.5 text-[12px] font-medium leading-5 text-ink-subtle">{caption}</p>
          </div>
        </div>

        {expiryDate ? (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-surface-sunken" role="presentation">
              <span
                className="block h-full w-full origin-right rounded-full transition-transform duration-500"
                style={{ transform: `scaleX(${remaining / VALIDITY_DAYS})`, background: TONE_COLOR[status] }}
              />
            </div>
            <p className="mt-1.5 text-[12px] font-semibold text-ink-subtle">
              مانده از یک سال اعتبار بیمه، {toPersianDigits(String(remaining))} روز
            </p>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full rounded-xl text-[12px] font-bold"
            render={<Link href={`/coach/students/${studentId}/edit`} />}
            nativeButton={false}
          >
            ثبت بیمه در پرونده
          </Button>
        )}
      </Card>
    </section>
  );
}
