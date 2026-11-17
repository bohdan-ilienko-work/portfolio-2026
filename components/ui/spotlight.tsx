import { cn } from "@/lib/utils";
import { useId } from "react";

type SpotlightProps = {
  className?: string;
  fill?: string;
};

export const Spotlight = ({ className, fill }: SpotlightProps) => {
  const gradientId = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-[1] h-[169%] w-[138%] -translate-x-1/2 -translate-y-[40%] opacity-[--spotlight-opacity] lg:w-[84%]",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <defs>
        <radialGradient id={gradientId}>
          <stop offset="0" stopColor={fill ?? "white"} stopOpacity="0.21" />
          <stop offset="0.45" stopColor={fill ?? "white"} stopOpacity="0.14" />
          <stop offset="1" stopColor={fill ?? "white"} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="1893.5" cy="1421" rx="2100" ry="570" transform="rotate(34.7 1893.5 1421)" fill={`url(#${gradientId})`} />
    </svg>
  );
};
