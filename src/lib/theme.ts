export const ACCENTS = [
  { id: "crimson", label: "زنبق" },
  { id: "orange", label: "نارنجی" },
  { id: "gold", label: "طلایی" },
  { id: "emerald", label: "زمرد" },
  { id: "blue", label: "آبی" },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];

export type ThemeMode = "light" | "dark";

export const STORAGE_KEYS = {
  theme: "ty-theme",
  accent: "ty-accent",
} as const;

export const META_THEME_COLORS = { dark: "#11151d", light: "#ce004f" } as const;

export const THEME_INIT_SOURCE = `!function(){try{var d=document.documentElement,t=localStorage.getItem("${STORAGE_KEYS.theme}"),m=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(!t&&m))d.classList.add("dark");var a=localStorage.getItem("${STORAGE_KEYS.accent}");if(a)d.setAttribute("data-accent",a)}catch(e){}}();`;

export function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");

  try {
    localStorage.setItem(STORAGE_KEYS.theme, mode);
  } catch {}
}

export function applyAccent(accent: AccentId) {
  if (accent === "crimson") {
    document.documentElement.removeAttribute("data-accent");
  } else {
    document.documentElement.setAttribute("data-accent", accent);
  }

  try {
    if (accent === "crimson") localStorage.removeItem(STORAGE_KEYS.accent);
    else localStorage.setItem(STORAGE_KEYS.accent, accent);
  } catch {}
}
