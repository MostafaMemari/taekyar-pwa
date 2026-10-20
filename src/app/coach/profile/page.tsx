import { Award, Bell, ChevronLeft, History, LogOut, type LucideIcon, Palette, Pencil, Settings, ShieldCheck } from "lucide-react";
import { Fragment } from "react";
import { CoachBand, CoachSheet } from "@/components/coach/coach-band";
import { COACH } from "@/components/coach/coach-data";
import { CoachBell, SectionHeading, StatusBadge } from "@/components/coach/coach-ui";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toPersianDigits } from "@/lib/digits";

export const metadata = { title: "پروفایل مربی" };

const MENU_ITEMS: { icon: LucideIcon; label: string; badge?: string }[] = [
  { icon: Pencil, label: "ویرایش پروفایل" },
  { icon: Bell, label: "اعلان ها", badge: "۲ خوانده نشده" },
  { icon: ShieldCheck, label: "نشست ها و امنیت" },
  { icon: Palette, label: "نمایش و رنگ" },
  { icon: Settings, label: "تنظیمات" },
];

function MenuRow({ icon: Icon, label, badge }: { icon: LucideIcon; label: string; badge?: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="h-12 w-full justify-start gap-3 rounded-none px-4 text-[12.5px] font-extrabold text-ink-body hover:bg-muted/50"
    >
      <Icon className="text-ink-muted" aria-hidden="true" />
      <span className="flex-1 text-start">{label}</span>
      {badge ? (
        <StatusBadge tone="brand" className="shrink-0">
          {badge}
        </StatusBadge>
      ) : null}
      <ChevronLeft className="text-ink-faint" aria-hidden="true" />
    </Button>
  );
}

export default function CoachProfilePage() {
  const infoRows = [
    { label: "نام و نام خانوادگی", value: COACH.name },
    { label: "کد ملی", value: toPersianDigits(COACH.nationalCode), ltr: true },
    { label: "جنسیت", value: COACH.gender },
    { label: "استان", value: COACH.province },
    { label: "تاریخ تولد", value: toPersianDigits(COACH.birthDate), ltr: true },
    { label: "شماره تماس", value: toPersianDigits(COACH.phone), ltr: true },
    { label: "کمربند", value: "", belt: true },
    { label: "سال شروع مربیگری", value: toPersianDigits(COACH.startYear) },
  ];

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachBand>
        <div className="flex items-center justify-between gap-3">
          <span className="hero-chip border-white/20 bg-white/10 text-white backdrop-blur-sm">پروفایل مربی</span>
          <CoachBell />
        </div>

        <div className="mt-3 flex items-center gap-3.5">
          <Avatar className="size-16 shrink-0 ring-2 ring-white/25">
            <AvatarFallback className="bg-white/15 text-xl font-extrabold text-white">{COACH.name.slice(0, 1)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[20px] font-extrabold leading-7">{COACH.name}</h1>
            <p className="mt-0.5 text-[11px] font-semibold text-white/65" dir="ltr">
              {toPersianDigits(COACH.phone)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="meta-glass">
                <span className="size-2.5 rounded-full bg-ink ring-2 ring-white/30" aria-hidden="true" />
                دان {toPersianDigits(String(COACH.beltDan))}
              </span>
              <span className="meta-glass">
                <Award className="size-3" aria-hidden="true" />
                {COACH.certificate}
              </span>
              <span className="meta-glass">
                <History className="size-3" aria-hidden="true" />
                سابقه {toPersianDigits(String(COACH.experienceYears))} سال
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 rounded-xl bg-white px-3 text-[11px] font-extrabold text-accent-ink hover:bg-white/90"
          >
            <Pencil data-icon="inline-start" aria-hidden="true" />
            ویرایش
          </Button>
        </div>
      </CoachBand>

      <CoachSheet className="flex flex-col gap-5">
        <Card className="gap-0 p-0">
          <div className="px-4 pt-4">
            <SectionHeading title="اطلاعات مربی" className="mb-0" />
          </div>

          <dl className="mt-2 px-4 pb-2">
            {infoRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 border-b border-[var(--line-1)] py-2.5 last:border-b-0"
              >
                <dt className="text-[11.5px] font-medium text-ink-subtle">{row.label}</dt>
                <dd className="flex items-center gap-1.5 text-[12px] font-extrabold text-ink" dir={row.ltr ? "ltr" : undefined}>
                  {row.belt ? (
                    <>
                      <BeltStrip color="#1f2937" knotColor="#111827" stripes={COACH.beltDan} className="size-auto w-9" />
                      <span>دان {toPersianDigits(String(COACH.beltDan))}</span>
                    </>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="border-t border-[var(--line-2)] px-4 py-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full gap-1.5 rounded-xl text-[12px] font-extrabold text-accent-ink hover:bg-brand-50"
            >
              <Pencil data-icon="inline-start" aria-hidden="true" />
              ویرایش پروفایل
            </Button>
          </div>
        </Card>

        <section>
          <SectionHeading title="تنظیمات" />
          <Card className="gap-0 p-0">
            {MENU_ITEMS.map((item, index) => (
              <Fragment key={item.label}>
                {index > 0 ? <Separator /> : null}
                <MenuRow icon={item.icon} label={item.label} badge={item.badge} />
              </Fragment>
            ))}
          </Card>

          <Card className="mt-3 gap-0 p-0">
            <Button
              type="button"
              variant="ghost"
              className="h-12 w-full justify-start gap-3 rounded-none px-4 text-[12.5px] font-extrabold text-destructive hover:bg-danger-soft hover:text-danger"
            >
              <LogOut aria-hidden="true" />
              خروج از حساب
            </Button>
          </Card>
        </section>
      </CoachSheet>
    </main>
  );
}
