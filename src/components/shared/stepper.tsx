import { Check } from "lucide-react";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export type StepperState = "done" | "active" | "todo";

type StepperProps = {
  steps: { label: string }[];
  current: number;
  label: string;
  className?: string;
};

export function Stepper({ steps, current, label, className }: StepperProps) {
  return (
    <ol className={cn("stepper mt-3", className)} aria-label={label}>
      {steps.map((step, index) => {
        const state: StepperState = index < current ? "done" : index === current ? "active" : "todo";

        return (
          <li key={step.label} className="stp" data-state={state} aria-current={state === "active" ? "step" : undefined}>
            {index > 0 ? <span className="stp-line" aria-hidden="true" /> : null}
            <span className="stp-dot" aria-hidden="true">
              {state === "done" ? <Check className="size-3.5" /> : toPersianDigits(String(index + 1))}
            </span>
            <span className="stp-label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
