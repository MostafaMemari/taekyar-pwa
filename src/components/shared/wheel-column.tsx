"use client";

import { type KeyboardEvent, type UIEvent, useEffect, useId, useRef, useState } from "react";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const WHEEL_PADDING = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

type WheelColumnProps = {
  ariaLabel: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  onSelect?: (value: number) => void;
  formatValue?: (value: number) => string;
  scrollKey?: unknown;
  showBand?: boolean;
  className?: string;
};

export function WheelColumn({
  ariaLabel,
  min,
  max,
  value,
  onChange,
  onSelect,
  formatValue,
  scrollKey,
  showBand = true,
  className,
}: WheelColumnProps) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const listboxId = useId();
  const lastScroll = useRef<{ element: HTMLDivElement | null; key: unknown }>({ element: null, key: undefined });

  const items = Array.from({ length: Math.max(0, max - min + 1) }, (_, index) => min + index);
  const label = formatValue ?? ((item: number) => toPersianDigits(String(item)));

  useEffect(() => {
    if (!element) return;
    const changed = lastScroll.current.element !== element || lastScroll.current.key !== scrollKey;
    lastScroll.current = { element, key: scrollKey };
    if (!changed) return;
    const clamped = Math.min(max, Math.max(min, value));
    element.scrollTop = (clamped - min) * ITEM_HEIGHT;
  }, [element, scrollKey, value, min, max]);

  const select = (next: number) => {
    onChange(next);
    element?.scrollTo({ top: (next - min) * ITEM_HEIGHT, behavior: "smooth" });
    onSelect?.(next);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const next = Math.min(max, Math.max(min, Math.round(event.currentTarget.scrollTop / ITEM_HEIGHT) + min));
    if (next !== value) onChange(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const jump = event.key === "PageUp" || event.key === "PageDown" ? 5 : 1;
    let next: number | null = null;

    if (event.key === "ArrowUp" || event.key === "PageUp") next = Math.max(min, value - jump);
    else if (event.key === "ArrowDown" || event.key === "PageDown") next = Math.min(max, value + jump);
    else if (event.key === "Home") next = min;
    else if (event.key === "End") next = max;

    if (next === null) return;
    event.preventDefault();
    select(next);
  };

  return (
    <div className={cn("relative", className)}>
      {showBand ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-2 top-1/2 z-0 h-11 -translate-y-1/2 rounded-xl border border-primary/25 bg-background shadow-[0_2px_10px_-2px_rgba(17,24,39,0.14)]"
        />
      ) : null}

      <div
        ref={setElement}
        role="listbox"
        aria-label={ariaLabel}
        aria-orientation="vertical"
        aria-activedescendant={`${listboxId}-${value}`}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="relative z-10 snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)] focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-scrollbar]:hidden"
        style={{ height: WHEEL_HEIGHT, paddingBlock: WHEEL_PADDING }}
      >
        {items.map((item) => {
          const distance = Math.abs(item - value);

          return (
            <div
              key={item}
              id={`${listboxId}-${item}`}
              role="option"
              aria-selected={item === value}
              tabIndex={-1}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                select(item);
              }}
              className={cn(
                "flex h-11 cursor-pointer snap-center items-center justify-center whitespace-nowrap tabular-nums transition-colors",
                distance === 0
                  ? "text-2xl font-extrabold text-ink"
                  : distance === 1
                    ? "text-base font-semibold text-ink-subtle"
                    : "text-sm font-medium text-ink-faint",
              )}
              onClick={() => select(item)}
            >
              {label(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
