import { SectionHeading } from "@/components/coach/coach-ui";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BELT_META, studentBeltDotStyle } from "@/lib/coach/coach-data";
import type { StudentProfile } from "@/lib/coach/student-profile-data";
import { toPersianDigits } from "@/lib/digits";

function InfoRow({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--line-1)] py-2.5 last:border-b-0">
      <dt className="shrink-0 text-[11.5px] font-medium text-ink-subtle">{label}</dt>
      <dd className="min-w-0 truncate text-[12px] font-extrabold text-ink" dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}

export function StudentInfoPanel({ profile }: { profile: StudentProfile }) {
  const dimensions =
    profile.height && profile.weight
      ? `${toPersianDigits(profile.height)} سانتی متر · ${toPersianDigits(profile.weight)} کیلوگرم`
      : "ثبت نشده";

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 p-0">
        <div className="px-4 pt-4">
          <SectionHeading title="مشخصات هنرجو" className="mb-0" />
        </div>

        <dl className="mt-2 px-4 pb-2">
          <InfoRow label="کد ملی" value={toPersianDigits(profile.nationalCode)} ltr />
          <InfoRow label="تاریخ تولد" value={toPersianDigits(profile.birthDate)} />
          <InfoRow label="نام پدر" value={profile.fatherName || "ثبت نشده"} />
          <InfoRow label="شماره تماس" value={profile.phone ? toPersianDigits(profile.phone) : "ثبت نشده"} ltr />
          <InfoRow label="قد / وزن" value={dimensions} />
          <InfoRow label="سال عضویت" value={profile.membershipYear ? toPersianDigits(profile.membershipYear) : "ثبت نشده"} />
          <InfoRow label="بیمه ورزشی" value={profile.insuranceDate ? `معتبر تا ${toPersianDigits(profile.insuranceDate)}` : "ثبت نشده"} />
          <InfoRow label="تاریخ ثبت پرونده" value={toPersianDigits(profile.registeredAt)} />
        </dl>
      </Card>

      <Card className="gap-0 p-4">
        <SectionHeading title="سابقه کمربندها" className="mb-4" />

        <ol className="relative flex flex-col gap-4 before:absolute before:inset-y-2 before:start-[7px] before:w-px before:bg-[var(--line-2)]">
          {profile.beltHistory.map((entry) => {
            const belt = BELT_META[entry.belt];
            const label = entry.poom
              ? `کمربند پوم ${toPersianDigits(String(entry.poom))}`
              : entry.dan
                ? `کمربند دان ${toPersianDigits(String(entry.dan))}`
                : `کمربند ${belt.label}`;

            return (
              <li key={`${entry.belt}-${entry.date}`} className="relative flex gap-3">
                <span className="relative z-10 mt-1 grid size-4 shrink-0 place-items-center rounded-full bg-card ring-2 ring-[var(--line-2)]">
                  <span className="size-2 rounded-full" style={studentBeltDotStyle(entry)} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <b className="flex min-w-0 items-center gap-1.5 truncate text-[13px] font-extrabold text-ink">
                      {label}
                      {entry.current ? (
                        <Badge variant="secondary" className="h-4 shrink-0 bg-success-soft px-1.5 text-[8.5px] font-bold text-success">
                          فعلی
                        </Badge>
                      ) : null}
                    </b>
                    <span className="shrink-0 text-[11px] font-bold text-ink-subtle">{toPersianDigits(entry.date)}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium leading-5 text-ink-subtle">{entry.note}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
