"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/shared/providers/ThemeProvider";

export function ThemeToggle({ fullWidth = false }: { fullWidth?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Guardia nocturno"
      }
      className={`border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${fullWidth ? "w-full justify-between" : ""}`}
    >
      <span className="inline-flex items-center gap-2">
        {isDark ? (
          <Sun className="text-accent h-4 w-4" strokeWidth={1.75} />
        ) : (
          <Moon className="text-primary h-4 w-4" strokeWidth={1.75} />
        )}
        <span>{isDark ? "Modo Claro" : "Modo Guardia"}</span>
      </span>
      <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
        {isDark ? "Oscuro" : "Claro"}
      </span>
    </button>
  );
}
