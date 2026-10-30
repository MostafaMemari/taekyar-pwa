import type { ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

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
        {optional ? <span className="text-[9px] font-bold text-ink-subtle"> (اختیاری)</span> : null}
      </FieldLabel>
      {children}
      {error ? <FieldError className="text-start text-[11px] font-semibold">{error}</FieldError> : null}
      {hint ? <FieldDescription className="text-start text-[11px] font-medium leading-5 text-ink-muted">{hint}</FieldDescription> : null}
    </Field>
  );
}
