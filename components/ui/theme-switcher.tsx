"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HiOutlineSun, HiOutlineMoon, HiOutlineComputerDesktop } from "react-icons/hi2";

import { cn } from "@/lib/utils";

const themes = [
  { value: "light", icon: HiOutlineSun, label: "Light" },
  { value: "dark", icon: HiOutlineMoon, label: "Dark" },
  { value: "system", icon: HiOutlineComputerDesktop, label: "System" },
] as const;

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-[--border-medium] bg-[--surface-card] p-1">
        {themes.map(({ value }) => (
          <div key={value} className="h-7 w-7 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-[--border-medium] bg-[--surface-card] p-1 shadow-sm">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={`Switch to ${label} theme`}
          onClick={() => setTheme(value)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200",
            theme === value
              ? "bg-purple/20 text-purple shadow-sm"
              : "text-[--text-muted] hover:text-[--text-secondary]"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
};
