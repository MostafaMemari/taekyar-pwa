export const ACCENTS = [
  { id: "crimson", label: "سرخابی" },
  { id: "orange", label: "نارنجی" },
  { id: "gold", label: "طلایی" },
  { id: "emerald", label: "زمردی" },
  { id: "blue", label: "آبی" },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];

export const ACCENT_SWATCH: Record<AccentId, string> = {
  crimson: "linear-gradient(135deg, #f66595, #ce004f)",
  orange: "linear-gradient(135deg, #fb923c, #ea580c)",
  gold: "linear-gradient(135deg, #fbbf24, #d97706)",
  emerald: "linear-gradient(135deg, #34d399, #059669)",
  blue: "linear-gradient(135deg, #60a5fa, #2563eb)",
};

export type ThemeMode = "light" | "dark";

export const RADII = [
  { id: "compact", label: "کم", value: "0.5rem" },
  { id: "default", label: "معمولی", value: "0.625rem" },
  { id: "round", label: "گرد", value: "0.875rem" },
] as const;

export type RadiusId = (typeof RADII)[number]["id"];

export const STORAGE_KEYS = {
  theme: "ty-theme",
  accent: "ty-accent",
  radius: "ty-radius",
} as const;

export const META_THEME_COLORS = { dark: "#11151d", light: "#ce004f" } as const;

export const THEME_INIT_SOURCE = `!function(){try{var d=document.documentElement,t=localStorage.getItem("${STORAGE_KEYS.theme}"),m=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(!t&&m))d.classList.add("dark");var a=localStorage.getItem("${STORAGE_KEYS.accent}");if(a)d.setAttribute("data-accent",a);var r=localStorage.getItem("${STORAGE_KEYS.radius}");if(r)d.style.setProperty("--radius",r)}catch(e){}}();`;

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

export function applyRadius(radius: RadiusId) {
  const option = RADII.find((item) => item.id === radius) ?? RADII[1];

  if (option.id === "default") document.documentElement.style.removeProperty("--radius");
  else document.documentElement.style.setProperty("--radius", option.value);

  try {
    if (option.id === "default") localStorage.removeItem(STORAGE_KEYS.radius);
    else localStorage.setItem(STORAGE_KEYS.radius, option.value);
  } catch {}
}
