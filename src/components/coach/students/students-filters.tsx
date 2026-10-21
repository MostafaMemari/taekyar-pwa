import { ListFilter, SlidersHorizontal, X } from "lucide-react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BELT_ORDER, normalizeMulti } from "@/lib/coach/students-options";
import { toPersianDigits } from "@/lib/digits";
import { type ColorBeltKey, getStudentBeltMeta } from "@/lib/student-belts";

export function StudentsFilters({
  belts,
  filterCount,
  isDirty,
  onBeltsChange,
  onClear,
}: {
  belts: ColorBeltKey[];
  filterCount: number;
  isDirty: boolean;
  onBeltsChange: (value: ColorBeltKey[]) => void;
  onClear: () => void;
}) {
  return (
    <div className="mt-3 flex flex-col gap-2.5">
      <div className="flex h-6 items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-ink-muted">
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
          فیلترها
          {filterCount > 0 ? (
            <span className="grid min-w-[15px] place-items-center rounded-full bg-brand-500 px-1 text-center text-[8.5px] leading-[15px] font-extrabold text-white tabular-nums">
              {toPersianDigits(String(filterCount))}
            </span>
          ) : null}
        </span>

        {isDirty ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-6 shrink-0 gap-1 px-2 text-[10.5px] font-extrabold text-destructive has-data-[icon=inline-start]:pl-2"
            onClick={onClear}
          >
            <X data-icon="inline-start" aria-hidden="true" />
            پاک کردن همه
          </Button>
        ) : (
          <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-muted px-2 text-[8.5px] font-bold text-ink-subtle">
            <ListFilter className="size-2.5" aria-hidden="true" />
            انتخاب چندگانه
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="w-12 shrink-0 text-[10px] font-bold text-ink-subtle">کمربند</span>
        <ToggleGroup
          aria-label="فیلتر کمربند"
          multiple
          value={belts.length > 0 ? belts : ["all"]}
          onValueChange={(next) => onBeltsChange(normalizeMulti(next, belts))}
          variant="outline"
          spacing={1.5}
          className="no-scrollbar min-w-0 flex-1 overflow-x-auto pb-0.5"
        >
          <ToggleGroupItem value="all" className="h-7 rounded-full px-3 text-[10px] font-bold">
            همه
          </ToggleGroupItem>
          {BELT_ORDER.map((belt) => {
            const meta = getStudentBeltMeta(belt);

            return (
              <ToggleGroupItem
                key={belt}
                value={belt}
                aria-label={`کمربند ${meta.label}`}
                className="h-7 gap-1.5 rounded-full px-2.5 text-[10px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
              >
                <BeltStrip color={meta.color} outline={meta.outline} className="size-auto w-[26px]" />
                <span>{meta.label}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
    </div>
  );
}
