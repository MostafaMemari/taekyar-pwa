"use client";

import { Check, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";
import { Button } from "@/components/ui/button";
import { ACCENTS, type AccentId } from "@/lib/theme";
import { cn } from "@/lib/utils";

const SWATCH: Record<AccentId, string> = {
  crimson: "linear-gradient(135deg, #f66595, #ce004f)",
  orange: "linear-gradient(135deg, #fb923c, #ea580c)",
  gold: "linear-gradient(135deg, #fbbf24, #d97706)",
  emerald: "linear-gradient(135deg, #34d399, #059669)",
  blue: "linear-gradient(135deg, #60a5fa, #2563eb)",
};

export function ThemeSwitch({ className }: { className?: string }) {
  const { mode, accent, toggleMode, setAccent } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleMode}
        className="size-10 rounded-full"
        aria-label={isDark ? "فعال سازی حالت روشن" : "فعال سازی حالت تاریک"}
        aria-pressed={isDark}
      >
        {isDark ? <Sun data-icon="inline-start" aria-hidden="true" /> : <Moon data-icon="inline-start" aria-hidden="true" />}
      </Button>
      <Palette className="size-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
      <div className="flex items-center gap-1.5">
        {ACCENTS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={accent === option.id}
            aria-label={option.label}
            title={option.label}
            onClick={() => setAccent(option.id)}
            className="grid size-[18px] place-items-center rounded-full transition-transform hover:scale-110"
            style={{ background: SWATCH[option.id] }}
          >
            {accent === option.id ? <Check className="size-3 text-white" aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
