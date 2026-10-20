import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TaekyarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-7", className)} fill="currentColor" aria-hidden="true">
      <path d="M12 2a3.2 3.2 0 1 1 0 6.4A3.2 3.2 0 0 1 12 2Zm-4.2 7.6c.4-.5 1-.6 1.6-.4l2.6 1 2.6-1c.6-.2 1.2 0 1.6.4l3.4 4a1 1 0 0 1-1.5 1.4l-2.6-2.9-.7 2.9 2.3 6.2a1 1 0 0 1-1.9.7l-2.2-6h-2l-2.2 6a1 1 0 0 1-1.9-.7l2.3-6.2-.7-2.9-2.6 2.9a1 1 0 0 1-1.5-1.4l3.4-4Z" />
    </svg>
  );
}

export function LogoMark({ className, children }: { className?: string; children?: ReactNode }) {
  return <span className={cn("logo-mark", className)}>{children ?? <TaekyarMark />}</span>;
}

export function BeltMotif({ className }: { className?: string }) {
  return <span className={cn("belt-motif", className)} aria-hidden="true" />;
}

type BeltStripProps = {
  color: string;
  stripes?: number;
  outline?: string;
  knotColor?: string;
  stretch?: boolean;
  className?: string;
};

export function BeltStrip({ color, stripes = 0, outline, knotColor, stretch, className }: BeltStripProps) {
  return (
    <svg
      viewBox="0 0 88 26"
      preserveAspectRatio={stretch ? "none" : "xMidYMid meet"}
      className={cn(stretch ? "size-auto" : null, "w-full", className)}
      aria-hidden="true"
    >
      <rect x="1" y="5" width="87" height="9" rx="3" fill={color} stroke={outline} />
      {Array.from({ length: stripes }, (_, index) => 7.5 + index * 6).map((x) => (
        <rect key={x} x={x} y="8" width="3.1" height="3" rx="0.7" fill="#FBBF24" />
      ))}
      <rect x="69.5" y="13" width="4.6" height="11.5" rx="2.2" fill={knotColor ?? color} transform="rotate(12 71.8 13)" />
      <rect x="64" y="2.5" width="12" height="12" rx="3" fill={knotColor ?? color} />
    </svg>
  );
}

export function BeltGlyph({ className }: { className?: string }) {
  return <BeltStrip color="#1F2937" knotColor="#111827" stripes={2} className={cn("w-7 shrink-0", className)} />;
}

export function BeltWatermark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 44"
      className={cn("pointer-events-none absolute -bottom-3 -start-3 w-24 -rotate-12 opacity-15", className)}
      aria-hidden="true"
    >
      <rect x="66" y="12" width="12" height="26" rx="4" fill="#fff" />
      <rect x="2" y="12" width="92" height="18" rx="9" fill="#fff" />
      <rect x="62" y="8" width="14" height="26" rx="5" fill="#fff" />
    </svg>
  );
}

export function TaekyarWordmark({ subtitle }: { subtitle: string }) {
  return (
    <span className="block">
      <span className="block text-[15px] font-extrabold leading-5 text-ink">تک یار</span>
      <span className="block text-[10px] font-medium text-ink-subtle">{subtitle}</span>
    </span>
  );
}
