import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cx } from "./ui";

// Light / dark theme for the SCIO app. The class lives on <html> so drawers,
// dialogs and toasts follow it too; the public site's own theme classes are
// set aside while the app is mounted and restored when leaving.

type Theme = "light" | "dark";
const KEY = "scio_theme_v3"; // v3: light is the default for everyone

function initial(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    if (t === "light" || t === "dark") return t;
  } catch {
    /* ignore */
  }
  return "light";
}

const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initial);

  // Neutralise the marketing site's html.light / html.dark overrides while inside the app.
  useLayoutEffect(() => {
    const html = document.documentElement;
    const had = { light: html.classList.contains("light"), dark: html.classList.contains("dark"), attr: html.getAttribute("data-theme") };
    html.classList.remove("light", "dark");
    html.removeAttribute("data-theme");
    html.classList.add("scio-app");
    return () => {
      html.classList.remove("scio-dark", "scio-theming", "scio-app");
      if (had.light) html.classList.add("light");
      if (had.dark) html.classList.add("dark");
      if (had.attr) html.setAttribute("data-theme", had.attr);
    };
  }, []);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("scio-dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    const html = document.documentElement;
    html.classList.add("scio-theming");
    setTheme((t) => (t === "dark" ? "light" : "dark"));
    window.setTimeout(() => html.classList.remove("scio-theming"), 450);
  }, []);

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cx("relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900", className)}
    >
      <Sun className={cx("absolute h-[18px] w-[18px] transition-all duration-500", dark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} />
      <Moon className={cx("absolute h-[18px] w-[18px] transition-all duration-500", dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0")} />
    </button>
  );
}
