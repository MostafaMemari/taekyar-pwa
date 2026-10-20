import { Check, Info, Landmark, LogIn, MapPin, Pencil, Plus, Star } from "lucide-react";
import Link from "next/link";
import { CoachBand, CoachSheet } from "@/components/coach/coach-band";
import { CoachBell, StatusBadge } from "@/components/coach/coach-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CLUB_ADMISSION_META, CLUBS } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export const metadata = { title: "باشگاه های من" };

function GlassStat({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex flex-1 flex-col items-center rounded-xl border border-white/15 bg-white/10 px-2 py-1.5 backdrop-blur-sm">
      <b className="text-[16px] font-extrabold leading-none tabular-nums">{value}</b>
      <span className="mt-1 text-[9px] font-semibold text-white/65">{label}</span>
    </span>
  );
}

export default function CoachClubsPage() {
  const totalClasses = CLUBS.reduce((sum, club) => sum + club.classesCount, 0);
  const totalStudents = CLUBS.reduce((sum, club) => sum + club.studentsCount, 0);

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachBand>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[21px] font-extrabold leading-7">باشگاه های من</h1>
            <p className="mt-1 text-[11px] font-semibold text-white/55">هر باشگاه، حضور و غیاب و کلاس بندی مستقل خودش را دارد</p>
          </div>
          <CoachBell />
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <GlassStat value={toPersianDigits(String(CLUBS.length))} label="باشگاه فعال" />
          <GlassStat value={toPersianDigits(String(totalClasses))} label="کلاس" />
          <GlassStat value={toPersianDigits(String(totalStudents))} label="هنرجو" />
        </div>
      </CoachBand>

      <CoachSheet>
        <h2 className="text-[17px] font-extrabold text-ink">وارد کدام باشگاه می شوید؟</h2>

        <div className="mt-4 flex flex-col gap-3.5">
          {CLUBS.map((club) => (
            <Card key={club.id} className="gap-0 p-0">
              <div className="flex items-center gap-3 p-4 pb-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-accent-ink">
                  <Landmark className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[14.5px] font-extrabold text-ink">{club.name}</b>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <StatusBadge tone="success">
                      <Check aria-hidden="true" />
                      فعال
                    </StatusBadge>
                    {club.workspace ? (
                      <StatusBadge tone="brand">
                        <Star aria-hidden="true" />
                        فضای کاری فعال
                      </StatusBadge>
                    ) : (
                      <StatusBadge>{CLUB_ADMISSION_META[club.admission].label}</StatusBadge>
                    )}
                  </div>
                </div>
                <span className="text-[44px] font-extrabold leading-none text-brand-600/10" aria-hidden="true">
                  {club.watermark}
                </span>
              </div>

              <div className="grid grid-cols-3 border-y border-[var(--line-2)] bg-[var(--surface-2)]">
                {[
                  { value: toPersianDigits(String(club.classesCount)), label: "کلاس فعال" },
                  { value: toPersianDigits(String(club.studentsCount)), label: "هنرجو" },
                  { value: `${toPersianDigits(club.attendance)}٪`, label: "حضور هفته" },
                ].map((stat, index) => (
                  <div key={stat.label} className={cn("flex flex-col items-center py-2.5", index > 0 && "border-s border-[var(--line-2)]")}>
                    <b className="text-[14px] font-extrabold tabular-nums text-ink">{stat.value}</b>
                    <span className="mt-1 text-[9px] font-bold text-ink-subtle">{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-1.5 px-4 pt-3 text-[11px] leading-5 text-ink-subtle">
                <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span className="line-clamp-2">{club.address}</span>
              </div>

              <div className="flex items-center gap-2 px-4 pb-4 pt-3">
                <Button
                  variant="brand"
                  size="sm"
                  className="h-9 flex-1 rounded-xl text-[11.5px] font-extrabold"
                  render={<Link href="/coach" />}
                  nativeButton={false}
                >
                  <LogIn data-icon="inline-start" aria-hidden="true" />
                  <span>ورود به باشگاه</span>
                </Button>
                <Button
                  type="button"
                  variant="field"
                  size="icon"
                  className="size-10 rounded-xl"
                  aria-label={`مشخصات ${club.name}`}
                  render={<Link href={`/coach/clubs/${club.id}`} />}
                  nativeButton={false}
                >
                  <Info aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="field"
                  size="icon"
                  className="size-10 rounded-xl"
                  aria-label={`ویرایش ${club.name}`}
                  render={<Link href={`/coach/clubs/${club.id}/edit`} />}
                  nativeButton={false}
                >
                  <Pencil aria-hidden="true" />
                </Button>
              </div>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="h-auto w-full flex-col gap-1.5 whitespace-normal rounded-2xl border-dashed py-5 text-center"
            render={<Link href="/coach/clubs/new" />}
            nativeButton={false}
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-ink">
              <Plus className="size-5" aria-hidden="true" />
            </span>
            <span className="text-[13px] font-extrabold text-ink">ثبت باشگاه جدید</span>
            <span className="text-[10.5px] font-medium leading-5 text-ink-subtle">هر تعداد باشگاه که داشته باشید، همین جا اضافه کنید</span>
          </Button>
        </div>

        <Alert className="mt-5 rounded-2xl border-[var(--ak-tint-line)] bg-accent p-3.5 text-start">
          <Info className="text-accent-ink" aria-hidden="true" />
          <AlertTitle className="text-[12.5px] font-extrabold text-accent-ink">اینجا چطور کار می کند؟</AlertTitle>
          <AlertDescription className="text-[11.5px] leading-5 text-ink-muted">
            اول باشگاه را انتخاب و وارد می شوید؛ حضور و غیاب، کلاس بندی و هنرجویان همان باشگاه را می بینید. با «تغییر باشگاه» هر لحظه می
            توانید فضای کاری را عوض کنید.
          </AlertDescription>
        </Alert>
      </CoachSheet>
    </main>
  );
}
