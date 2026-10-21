import { CalendarDays, Check, Landmark, MapPin, Minus } from "lucide-react";
import { StatusBadge } from "@/components/coach/coach-ui";
import { Card } from "@/components/ui/card";
import { type Club, GENDER_META } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";

export function ClubInfoCard({ club }: { club: Club }) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="grid h-24 place-items-center bg-gradient-to-l from-brand-600 to-brand-400 text-white/90">
        <Landmark className="size-8" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[16px] font-extrabold text-ink">{club.name}</h2>
          <StatusBadge tone={club.isActive ? "success" : "neutral"}>
            {club.isActive ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
            {club.isActive ? "فعال" : "غیرفعال"}
          </StatusBadge>
          <StatusBadge>{GENDER_META[club.gender].clubLabel}</StatusBadge>
        </div>

        <div className="flex items-start gap-2 text-[12px] leading-5 text-ink-muted">
          <MapPin className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
          <span>{club.address || "آدرس ثبت نشده"}</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-ink-subtle">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
          <span>تاریخ ثبت: {toPersianDigits(club.registeredAt)}</span>
        </div>
      </div>
    </Card>
  );
}
