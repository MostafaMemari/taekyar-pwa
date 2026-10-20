import { MessageSquareText, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/coach/coach-ui";
import { Card } from "@/components/ui/card";

export function DashboardTools() {
  return (
    <section>
      <SectionHeading title="ابزارهای مربی" />
      <div className="grid grid-cols-2 gap-3">
        <Card className="items-start gap-2.5 rounded-2xl p-3.5">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-accent-ink">
            <MessageSquareText className="size-[18px]" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <b className="block text-[12.5px] font-extrabold text-ink">گفتگو با هنرجویان</b>
            <span className="mt-0.5 block text-[10.5px] font-semibold text-ink-subtle">۳ پیام خوانده نشده</span>
          </span>
        </Card>
        <Card className="items-start gap-2.5 rounded-2xl p-3.5">
          <span className="grid size-9 place-items-center rounded-xl bg-muted text-ink-subtle">
            <TrendingUp className="size-[18px]" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <b className="block text-[12.5px] font-extrabold text-ink">تحلیل کلاس ها</b>
            <span className="mt-0.5 block text-[10.5px] font-semibold text-ink-subtle">به زودی</span>
          </span>
        </Card>
      </div>
    </section>
  );
}
