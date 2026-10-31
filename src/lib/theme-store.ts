"use client";

import { create } from "zustand";
import { type AccentId, applyAccent, applyRadius, applyTheme, RADII, type RadiusId, type ThemeMode } from "@/lib/theme";

type ThemeState = {
  mode: ThemeMode;
  accent: AccentId;
  radius: RadiusId;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (accent: AccentId) => void;
  setRadius: (radius: RadiusId) => void;
  sync: () => void;
};

function readMode(): ThemeMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function readAccent(): AccentId {
  return (document.documentElement.getAttribute("data-accent") as AccentId | null) ?? "crimson";
}

function readRadius(): RadiusId {
  const value = document.documentElement.style.getPropertyValue("--radius").trim();
  return RADII.find((option) => option.value === value)?.id ?? "default";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "light",
  accent: "crimson",
  radius: "default",
  setMode: (mode) => {
    applyTheme(mode);
    set({ mode });
  },
  toggleMode: () => get().setMode(readMode() === "dark" ? "light" : "dark"),
  setAccent: (accent) => {
    applyAccent(accent);
    set({ accent });
  },
  setRadius: (radius) => {
    applyRadius(radius);
    set({ radius });
  },
  sync: () => set({ mode: readMode(), accent: readAccent(), radius: readRadius() }),
}));
