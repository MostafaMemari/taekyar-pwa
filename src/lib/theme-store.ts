"use client";

import { create } from "zustand";
import { type AccentId, applyAccent, applyTheme, type ThemeMode } from "@/lib/theme";

type ThemeState = {
  mode: ThemeMode;
  accent: AccentId;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (accent: AccentId) => void;
  sync: () => void;
};

function readMode(): ThemeMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function readAccent(): AccentId {
  return (document.documentElement.getAttribute("data-accent") as AccentId | null) ?? "crimson";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "light",
  accent: "crimson",
  setMode: (mode) => {
    applyTheme(mode);
    set({ mode });
  },
  toggleMode: () => get().setMode(readMode() === "dark" ? "light" : "dark"),
  setAccent: (accent) => {
    applyAccent(accent);
    set({ accent });
  },
  sync: () => set({ mode: readMode(), accent: readAccent() }),
}));
