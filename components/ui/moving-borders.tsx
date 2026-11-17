import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import styles from "./moving-borders.module.css";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  borderRadius?: string;
  children: ReactNode;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
};

export const Button = ({
  borderRadius = "1.75rem",
  children,
  containerClassName,
  borderClassName,
  duration = 2000,
  className,
  ...otherProps
}: ButtonProps) => (
  <button
    className={cn(
      "relative isolate overflow-hidden bg-transparent p-px text-xl md:col-span-2",
      styles.card,
      containerClassName
    )}
    style={{ borderRadius }}
    {...otherProps}
  >
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius: "inherit" }}>
      <div
        className={cn(
          styles.glow,
          "absolute h-20 w-20 bg-[radial-gradient(var(--sky-500)_40%,transparent_60%)] opacity-80",
          borderClassName
        )}
        style={{ "--border-duration": `${duration}ms` } as CSSProperties}
      />
    </div>
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center border border-[--moving-card-border] bg-[--moving-card-bg] text-sm text-[--text-primary] antialiased",
        className
      )}
      style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
    >
      {children}
    </div>
  </button>
);
