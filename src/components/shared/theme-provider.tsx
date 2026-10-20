"use client";

import { createContext, type ReactNode, use, useCallback, useEffect, useState } from "react";
import { type AccentId, applyAccent, applyTheme, type ThemeMode } from "@/lib/theme";

type ThemeContextValue = {
  mode: ThemeMode;
  accent: AccentId;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (accent: AccentId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readMode(): ThemeMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function readAccent(): AccentId {
  return (document.documentElement.getAttribute("data-accent") as AccentId | null) ?? "crimson";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [accent, setAccentState] = useState<AccentId>("crimson");

  useEffect(() => {
    setModeState(readMode());
    setAccentState(readAccent());
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    applyTheme(next);
    setModeState(next);
  }, []);

  const setAccent = useCallback((next: AccentId) => {
    applyAccent(next);
    setAccentState(next);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(readMode() === "dark" ? "light" : "dark");
  }, [setMode]);

  return <ThemeContext value={{ mode, accent, setMode, toggleMode, setAccent }}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = use(ThemeContext);

  if (!context) throw new Error("useTheme must be used inside ThemeProvider");

  return context;
}
