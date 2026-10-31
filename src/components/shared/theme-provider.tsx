"use client";

import { type ReactNode, useEffect } from "react";
import { useThemeStore } from "@/lib/theme-store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const sync = useThemeStore((state) => state.sync);

  useEffect(() => {
    sync();
  }, [sync]);

  return <>{children}</>;
}
