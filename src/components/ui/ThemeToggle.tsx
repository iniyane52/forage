"use client";

import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { Sun, Moon } from "@/components/ui/icons";

/**
 * Reads/writes the resolved theme via next-themes ("system" resolves to light/dark
 * on first client paint). Gated on useMounted() -- resolvedTheme is undefined on the
 * server, so rendering an icon before mount would be a real hydration mismatch (same
 * pattern as every other client-only-value branch in this codebase, see CLAUDE.md's
 * "Architecture decisions"). Reserves the button's footprint at every size so nothing
 * shifts once it mounts.
 */
export function ThemeToggle() {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return <span className="w-7 h-7 shrink-0" aria-hidden="true" />;
  }

  const isLight = resolvedTheme === "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="w-7 h-7 shrink-0 grid place-items-center rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[rgb(var(--surface-rgb)/0.06)] transition-colors"
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
