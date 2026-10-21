"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type BeltOption = {
  value: string;
  label: string;
  color: string;
  bottomColor?: string;
  outline?: string;
  knotColor?: string;
  stripes?: number;
  wide?: boolean;
};

export type BeltOptionGroup = {
  value: string;
  label: string;
  options: readonly BeltOption[];
  columns?: 2 | 3;
};

type BeltPickerProps = {
  label: string;
  value: string | null;
  options?: readonly BeltOption[];
  groups?: readonly BeltOptionGroup[];
  onChange: (value: string | null) => void;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  columns?: 2 | 3;
};

export function BeltPicker({
  label,
  value,
  options = [],
  groups,
  onChange,
  hint,
  required = true,
  optional,
  columns = 3,
}: BeltPickerProps) {
  const [group, setGroup] = useState(() => {
    const match = groups?.find((item) => item.options.some((option) => option.value === value));
    return match?.value ?? groups?.[0]?.value ?? "";
  });

  const activeGroup = groups ? (groups.find((item) => item.value === group) ?? groups[0]) : undefined;
  const visibleOptions = activeGroup?.options ?? options;
  const gridColumns = activeGroup?.columns ?? columns;

  return (
    <Field>
      <FieldLabel className="text-[13px] font-semibold text-ink-body">
        {label}
        {required ? <span className="text-accent-ink"> *</span> : null}
        {optional ? <span className="text-[9.5px] font-bold text-ink-subtle"> (اختیاری)</span> : null}
      </FieldLabel>
      {groups ? (
        <ToggleGroup
          aria-label="دسته کمربند"
          value={activeGroup ? [activeGroup.value] : []}
          onValueChange={(next) => {
            if (next[0]) setGroup(next[0]);
          }}
          variant="segmented"
          spacing={1}
          className="flex w-full rounded-xl bg-muted p-1"
        >
          {groups.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value} className="h-10 flex-1 rounded-lg text-[13px] font-bold">
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : null}
      <ToggleGroup
        aria-label={label}
        value={value ? [value] : []}
        onValueChange={(next) => onChange(next[0] ?? null)}
        variant="outline"
        spacing={2}
        className={cn("grid w-full gap-2", gridColumns === 3 ? "grid-cols-3 [&>*:last-child:nth-child(3n+1)]:col-start-2" : "grid-cols-2")}
      >
        {visibleOptions.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className={cn(
              "relative h-auto min-w-0 flex-col gap-1.5 rounded-xl border-border bg-field px-3 pt-7 pb-3 text-[11.5px] font-bold whitespace-normal aria-pressed:border-primary aria-pressed:bg-primary/5 aria-pressed:text-primary",
              option.wide && gridColumns === 2 ? "col-span-2" : null,
            )}
          >
            <span className="absolute start-2 top-2 grid size-4 place-items-center rounded-full border border-border text-transparent group-aria-pressed/toggle:border-primary group-aria-pressed/toggle:bg-primary group-aria-pressed/toggle:text-primary-foreground">
              <Check className="size-3" aria-hidden="true" />
            </span>
            <BeltStrip
              color={option.color}
              bottomColor={option.bottomColor}
              outline={option.outline}
              knotColor={option.knotColor}
              stripes={option.stripes}
              stretch
              className={cn("w-full", gridColumns === 3 ? "h-10" : "h-12")}
            />
            <span className="w-full truncate">{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {hint ? <FieldDescription className="text-start text-[11px] font-medium leading-5 text-ink-muted">{hint}</FieldDescription> : null}
    </Field>
  );
}
