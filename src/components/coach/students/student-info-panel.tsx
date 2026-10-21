import { SectionHeading } from "@/components/coach/coach-ui";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Card } from "@/components/ui/card";
import { GENDER_META } from "@/lib/coach/coach-data";
import type { StudentProfile } from "@/lib/coach/student-profile-data";
import { toPersianDigits } from "@/lib/digits";
import { PROVINCES } from "@/lib/provinces";
import { getStudentBeltMeta, studentBeltLabel } from "@/lib/student-belts";

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
  const belt = getStudentBeltMeta(profile.belt);
  const dimensions =
    profile.height && profile.weight
      ? `${toPersianDigits(profile.height)} سانتی متر · ${toPersianDigits(profile.weight)} کیلوگرم`
      : "ثبت نشده";
  const province = PROVINCES.find((option) => option.value === profile.province)?.label ?? profile.province;

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 p-0">
        <div className="px-4 pt-4">
          <SectionHeading title="مشخصات هنرجو" className="mb-0" />
        </div>

        <dl className="mt-2 px-4 pb-2">
          <InfoRow label="کد ملی" value={toPersianDigits(profile.nationalCode)} ltr />
          <InfoRow label="جنسیت" value={GENDER_META[profile.gender].label} />
          <InfoRow label="تاریخ تولد" value={toPersianDigits(profile.birthDate)} />
          <InfoRow label="نام پدر" value={profile.fatherName || "ثبت نشده"} />
          <InfoRow label="شماره تماس" value={profile.phone ? toPersianDigits(profile.phone) : "ثبت نشده"} ltr />
          <InfoRow label="تلفن ثابت" value={profile.landline ? toPersianDigits(profile.landline) : "ثبت نشده"} ltr />
          <InfoRow label="استان" value={province || "ثبت نشده"} />
          <InfoRow label="قد / وزن" value={dimensions} />
          <InfoRow label="سال عضویت" value={profile.membershipYear ? toPersianDigits(profile.membershipYear) : "ثبت نشده"} />
          <InfoRow label="بیمه ورزشی" value={profile.insuranceDate ? `معتبر تا ${toPersianDigits(profile.insuranceDate)}` : "ثبت نشده"} />
          <InfoRow label="انقضای عکس پرونده" value={profile.expireImageDate ? toPersianDigits(profile.expireImageDate) : "ثبت نشده"} />
          <InfoRow label="تاریخ ثبت پرونده" value={toPersianDigits(profile.registeredAt)} />
        </dl>
      </Card>

      <Card className="gap-0 p-4">
        <SectionHeading title="کمربند فعلی" className="mb-4" />

        <div className="flex items-center gap-4">
          <BeltStrip
            color={belt.color}
            bottomColor={belt.bottomColor}
            outline={belt.outline}
            stripes={belt.stripeCount}
            className="size-auto w-24 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <b className="block text-[14px] font-extrabold text-ink">{studentBeltLabel(profile.belt)}</b>
            <p className="mt-1 text-[11px] font-medium text-ink-subtle">تاریخ دریافت: {toPersianDigits(profile.beltDate)}</p>
          </div>
        </div>

        <p className="mt-3 border-t border-[var(--line-1)] pt-2.5 text-[11px] leading-5 text-ink-muted">
          برای تغییر کمربند از گزینه «تخصیص کمربند» در پرونده هنرجو استفاده کنید.
        </p>
      </Card>
    </div>
  );
}
