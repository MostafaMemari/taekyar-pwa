"use client";

import { Check } from "lucide-react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type BeltOption = {
  value: string;
  label: string;
  color: string;
  outline?: string;
  knotColor?: string;
  stripes?: number;
  wide?: boolean;
};

type BeltPickerProps = {
  label: string;
  value: string | null;
  options: readonly BeltOption[];
  onChange: (value: string | null) => void;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  columns?: 2 | 3;
};

export function BeltPicker({ label, value, options, onChange, hint, required = true, optional, columns = 3 }: BeltPickerProps) {
  return (
    <Field>
      <FieldLabel className="text-[13px] font-semibold text-ink-body">
        {label}
        {required ? <span className="text-accent-ink"> *</span> : null}
        {optional ? <span className="text-[9.5px] font-bold text-ink-subtle"> (اختیاری)</span> : null}
      </FieldLabel>
      <ToggleGroup
        aria-label={label}
        value={value ? [value] : []}
        onValueChange={(next) => onChange(next[0] ?? null)}
        variant="outline"
        spacing={2}
        className={cn("grid w-full gap-2", columns === 3 ? "grid-cols-3" : "grid-cols-2")}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className={cn(
              "relative h-auto min-w-0 flex-col gap-1.5 rounded-xl border-border bg-field px-3 pt-7 pb-3 text-[11.5px] font-bold whitespace-normal aria-pressed:border-primary aria-pressed:bg-primary/5 aria-pressed:text-primary",
              option.wide && columns === 2 ? "col-span-2" : null,
            )}
          >
            <span className="absolute start-2 top-2 grid size-4 place-items-center rounded-full border border-border text-transparent group-aria-pressed/toggle:border-primary group-aria-pressed/toggle:bg-primary group-aria-pressed/toggle:text-primary-foreground">
              <Check className="size-3" aria-hidden="true" />
            </span>
            <BeltStrip
              color={option.color}
              outline={option.outline}
              knotColor={option.knotColor}
              stripes={option.stripes}
              stretch
              className={cn("w-full", columns === 3 ? "h-10" : "h-12")}
            />
            <span className="w-full truncate">{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {hint ? <FieldDescription className="text-start text-[11px] font-medium leading-5 text-ink-muted">{hint}</FieldDescription> : null}
    </Field>
  );
}
