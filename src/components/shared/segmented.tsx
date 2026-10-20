"use client";

import type { LucideIcon } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type SegmentedProps = {
  label: string;
  value: string | null;
  options: readonly { value: string; label: string; icon?: LucideIcon }[];
  onChange: (value: string) => void;
  hint?: string;
  columns?: 2 | 3;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function Segmented({
  label,
  value,
  options,
  onChange,
  hint,
  columns = 2,
  required = true,
  disabled = false,
  className,
}: SegmentedProps) {
  return (
    <Field>
      <FieldLabel className="text-[13px] font-semibold text-ink-body">
        {label}
        {required ? <span className="text-accent-ink"> *</span> : null}
      </FieldLabel>
      <ToggleGroup
        aria-label={label}
        value={value ? [value] : []}
        onValueChange={(next) => {
          const selected = next[0];
          if (selected) onChange(selected);
        }}
        variant="segmented"
        spacing={1}
        disabled={disabled}
        className={cn("flex w-full flex-wrap rounded-xl bg-muted p-1", disabled && "opacity-60", className)}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className={cn("h-10 gap-1.5 rounded-lg text-sm font-semibold", columns === 3 ? "flex-1 basis-28" : "flex-1")}
          >
            {option.icon ? <option.icon aria-hidden="true" /> : null}
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {hint ? <FieldDescription className="text-start text-[11px] font-medium leading-5 text-ink-muted">{hint}</FieldDescription> : null}
    </Field>
  );
}
