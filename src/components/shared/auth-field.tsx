"use client";

import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type AuthFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function AuthField({ label, htmlFor, required, optional, hint, error, children, className }: AuthFieldProps) {
  return (
    <Field className={className}>
      <FieldLabel htmlFor={htmlFor} className="text-[13px] font-semibold text-ink-body">
        {label}
        {required ? <span className="text-accent-ink"> *</span> : null}
        {optional ? <span className="text-[9.5px] font-bold text-ink-subtle"> (اختیاری)</span> : null}
      </FieldLabel>
      {children}
      {error ? <FieldError className="text-start text-[11px] font-semibold">{error}</FieldError> : null}
      {hint ? <FieldDescription className="text-start text-[11px] font-medium leading-5 text-ink-muted">{hint}</FieldDescription> : null}
    </Field>
  );
}

export function AuthFormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-[11.5px] font-semibold text-destructive">
      {message}
    </p>
  );
}

type AuthInputProps = ComponentProps<"input"> & { icon?: LucideIcon };

export function AuthInput({ icon: Icon, className, ...props }: AuthInputProps) {
  if (!Icon) {
    return <Input className={cn("h-12 rounded-xl px-4 text-center text-sm", className)} {...props} />;
  }

  return (
    <InputGroup className="h-12 rounded-xl">
      <InputGroupAddon className="ps-3.5 pe-0 text-ink-subtle transition-colors group-focus-within/input-group:text-ring">
        <Icon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput className={cn("h-full px-3 text-center text-sm", className)} {...props} />
    </InputGroup>
  );
}

type AuthSelectProps = {
  id?: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  icon?: LucideIcon;
};

export function AuthSelect({ id, value, onValueChange, placeholder, options, icon: Icon }: AuthSelectProps) {
  const items = [{ label: placeholder, value: null }, ...options];

  return (
    <Select items={items} value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className="relative h-12 w-full rounded-xl ps-11 pe-3.5 text-sm">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute start-4 text-ink-subtle transition-colors group-focus-visible/select:text-ring"
            aria-hidden="true"
          />
        ) : null}
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value ?? "placeholder"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
