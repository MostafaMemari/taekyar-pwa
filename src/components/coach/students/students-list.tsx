import { ChevronLeft, Users } from "lucide-react";
import Link from "next/link";
import { PersonAvatar, StatusBadge } from "@/components/coach/coach-ui";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { type CoachStudent, INSURANCE_META, studentBeltLabel, studentSessionSummary } from "@/lib/coach/coach-data";
import { INSURANCE_ICONS } from "@/lib/coach/students-options";
import { toPersianDigits } from "@/lib/digits";
import { getStudentBeltMeta } from "@/lib/student-belts";

function InsuranceBadge({ student }: { student: CoachStudent }) {
  const meta = INSURANCE_META[student.insurance];
  const Icon = INSURANCE_ICONS[student.insurance];

  return (
    <StatusBadge tone={meta.tone} className="shrink-0 px-1.5 py-[3px] text-[8.5px]">
      <Icon aria-hidden="true" />
      {student.insurance === "none" ? "بدون بیمه" : `بیمه تا ${toPersianDigits(student.insuranceDate ?? "")}`}
    </StatusBadge>
  );
}

function StudentCard({ student }: { student: CoachStudent }) {
  const belt = getStudentBeltMeta(student.belt);

  return (
    <Link href={`/coach/students/${student.id}`} className="block transition duration-150 active:scale-[0.995]">
      <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
        <PersonAvatar name={student.name} />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <b className="truncate text-[13.5px] font-extrabold text-ink">{student.name}</b>
            <StatusBadge tone={student.hasAccount ? "brand" : "neutral"} className="shrink-0 px-1.5 py-0.5 text-[8.5px]">
              {student.hasAccount ? "دارای حساب" : "بدون حساب"}
            </StatusBadge>
          </span>
          <span className="mt-1.5 flex items-center gap-1.5">
            <InsuranceBadge student={student} />
            <span className="truncate text-[10.5px] text-ink-subtle">{studentSessionSummary(student.id)}</span>
          </span>
        </span>

        <span className="flex w-14 shrink-0 flex-col items-center gap-1">
          <BeltStrip
            color={belt.color}
            bottomColor={belt.bottomColor}
            outline={belt.outline}
            stripes={belt.stripeCount}
            className="size-auto w-12"
          />
          <span className="text-[8.5px] font-extrabold leading-none text-ink-muted">{studentBeltLabel(student)}</span>
        </span>

        <ChevronLeft className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
      </Card>
    </Link>
  );
}

export function StudentsList({ students, onClear }: { students: CoachStudent[]; onClear: () => void }) {
  if (students.length === 0) {
    return (
      <Empty className="mt-4 border-none bg-transparent p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-brand-50 text-accent-ink">
            <Users aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="text-[13px] font-extrabold text-ink">هنرجویی یافت نشد</EmptyTitle>
          <EmptyDescription className="text-[11.5px] leading-5 text-ink-subtle">
            ترکیب فیلترها یا عبارت جستجو را تغییر دهید.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={onClear}>
            پاک کردن فیلترها
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2.5">
      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
}
