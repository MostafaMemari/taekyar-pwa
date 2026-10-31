"use client";

import { Check, Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCENT_SWATCH, ACCENTS } from "@/lib/theme";
import { useThemeStore } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

export function ThemeSwitch({ className }: { className?: string }) {
  const mode = useThemeStore((state) => state.mode);
  const accent = useThemeStore((state) => state.accent);
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const setAccent = useThemeStore((state) => state.setAccent);
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
            style={{ background: ACCENT_SWATCH[option.id] }}
          >
            {accent === option.id ? <Check className="size-3 text-white" aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
