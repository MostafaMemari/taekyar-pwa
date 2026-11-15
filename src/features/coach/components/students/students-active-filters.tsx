import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AGE_CATEGORY_LABELS,
  type AgeCategoryName,
  beltKeyOf,
  FEE_META,
  INSURANCE_META,
  type StudentBeltApiName,
  type StudentFeeStatus,
  type StudentInsuranceStatus,
} from "@/features/coach/lib/students-options";
import { getStudentBeltMeta } from "@/lib/student-belts";

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      className="h-7 shrink-0 gap-1 rounded-full px-2 text-[12px] font-bold"
      aria-label={`حذف فیلتر ${label}`}
      onClick={onRemove}
    >
      <X data-icon="inline-start" aria-hidden="true" />
      {label}
    </Button>
  );
}

export function StudentsActiveFilters({
  belts,
  ages,
  insurances,
  fee,
  exam,
  clubs,
  onRemoveBelt,
  onRemoveAge,
  onRemoveInsurance,
  onRemoveFee,
  onRemoveExam,
  onRemoveClub,
  onClear,
}: {
  belts: StudentBeltApiName[];
  ages: AgeCategoryName[];
  insurances: StudentInsuranceStatus[];
  fee: StudentFeeStatus | null;
  exam: { label: string } | null;
  clubs: { id: string; label: string }[];
  onRemoveBelt: (value: StudentBeltApiName) => void;
  onRemoveAge: (value: AgeCategoryName) => void;
  onRemoveInsurance: (value: StudentInsuranceStatus) => void;
  onRemoveFee: () => void;
  onRemoveExam: () => void;
  onRemoveClub: (value: string) => void;
  onClear: () => void;
}) {
  if (belts.length + ages.length + insurances.length + clubs.length + (fee ? 1 : 0) + (exam ? 1 : 0) === 0) return null;

  return (
    <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5">
      {clubs.map((club) => (
        <FilterChip key={club.id} label={`باشگاه ${club.label}`} onRemove={() => onRemoveClub(club.id)} />
      ))}

      {belts.map((belt) => (
        <FilterChip key={belt} label={`کمربند ${getStudentBeltMeta(beltKeyOf(belt)).label}`} onRemove={() => onRemoveBelt(belt)} />
      ))}

      {ages.map((age) => (
        <FilterChip key={age} label={AGE_CATEGORY_LABELS[age]} onRemove={() => onRemoveAge(age)} />
      ))}

      {insurances.map((insurance) => (
        <FilterChip key={insurance} label={INSURANCE_META[insurance].shortLabel} onRemove={() => onRemoveInsurance(insurance)} />
      ))}

      {fee ? <FilterChip label={FEE_META[fee].shortLabel} onRemove={onRemoveFee} /> : null}

      {exam ? <FilterChip label={exam.label} onRemove={onRemoveExam} /> : null}

      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="h-7 shrink-0 gap-1 px-2 text-[12px] font-semibold text-destructive"
        onClick={onClear}
      >
        <X data-icon="inline-start" aria-hidden="true" />
        پاک کردن همه
      </Button>
    </div>
  );
}
