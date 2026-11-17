"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BackgroundGradientProps = {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: CSSStyleMixBlendMode;
  children?: ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
};

type CSSStyleMixBlendMode = React.CSSProperties["mixBlendMode"];

export function BackgroundGradientAnimation({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: BackgroundGradientProps) {
  const highlight = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => () => {
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
  }, []);

  function moveHighlight(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !highlight.current) return;

    const { currentTarget, clientX, clientY } = event;
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);

    animationFrame.current = window.requestAnimationFrame(() => {
      animationFrame.current = null;
      if (!highlight.current) return;

      const bounds = currentTarget.getBoundingClientRect();
      highlight.current.style.transform = `translate3d(${clientX - bounds.left}px, ${clientY - bounds.top}px, 0)`;
    });
  }

  return (
    <div
      className={cn("group/gradient absolute inset-0 h-full overflow-hidden", containerClassName)}
      onPointerMove={interactive ? moveHighlight : undefined}
      style={{
        backgroundImage: [
          `radial-gradient(ellipse at 18% 38%, rgba(${firstColor}, 0.60), transparent ${size})`,
          `radial-gradient(ellipse at 82% 20%, rgba(${secondColor}, 0.50), transparent 63%)`,
          `radial-gradient(ellipse at 47% 88%, rgba(${thirdColor}, 0.30), transparent 54%)`,
          `radial-gradient(ellipse at 85% 85%, rgba(${fourthColor}, 0.26), transparent 54%)`,
          `radial-gradient(ellipse at 93% 34%, rgba(${fifthColor}, 0.14), transparent 58%)`,
          `linear-gradient(40deg, ${gradientBackgroundStart}, ${gradientBackgroundEnd})`,
        ].join(","),
      }}
    >
      {interactive && (
        <div
          aria-hidden="true"
          ref={highlight}
          className="pointer-events-none absolute -left-1/2 -top-1/2 h-full w-full opacity-0 group-hover/gradient:opacity-70 motion-reduce:hidden motion-safe:transition-opacity"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(${pointerColor}, 0.7), transparent 60%)`,
            mixBlendMode: blendingValue,
          }}
        />
      )}
      {children && <div className={className}>{children}</div>}
    </div>
  );
}
