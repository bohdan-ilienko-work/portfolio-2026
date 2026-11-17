import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const PinContainer = ({
  children,
  title,
  href,
  ctaLinks,
  className,
  containerClassName,
}: {
  children: ReactNode;
  title?: string;
  href?: string;
  ctaLinks?: Array<{ label: string; href: string }>;
  className?: string;
  containerClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "group/pin relative z-50  cursor-pointer",
        containerClassName
      )}
    >
      <div
        style={{
          perspective: "1000px",
          transform: "rotateX(70deg) translateZ(0deg)",
        }}
        className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          style={{
            borderColor: "var(--border-medium)",
            boxShadow: "var(--shadow-card)",
          }}
          className="absolute left-1/2 top-1/2 flex items-start justify-start overflow-hidden rounded-2xl border p-4 -translate-x-1/2 -translate-y-1/2 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/pin:scale-[0.8] motion-safe:group-hover/pin:[rotate:x_40deg]"
        >
          <div className={cn(" relative z-50 ", className)}>{children}</div>
        </div>
      </div>
      <PinPerspective title={title} href={href} ctaLinks={ctaLinks} />
    </div>
  );
};

export const PinPerspective = ({
  title,
  href,
  ctaLinks,
}: {
  title?: string;
  href?: string;
  ctaLinks?: Array<{ label: string; href: string }>;
}) => {
  const links =
    ctaLinks && ctaLinks.length > 0
      ? ctaLinks
      : [{ label: title || "Visit", href: href || "" }];

  return (
    <div className="z-[60] flex h-80 w-full items-center justify-center opacity-0 motion-safe:transition-opacity motion-safe:duration-500 group-hover/pin:opacity-100 group-focus-within/pin:opacity-100">
      <div className="inset-0 -mt-2 h-full w-full flex-none">
        <div className="absolute bottom-1/2 left-1/2 flex -translate-x-1/2 -translate-y-[120px] gap-2">
          {links.map((linkItem) => (
            <Link
              key={linkItem.label}
              href={linkItem.href}
              target="_blank"
              className="relative z-10 flex items-center space-x-2 rounded-full px-4 py-0.5 ring-1"
              style={{ backgroundColor: "var(--magic-btn-bg)", "--tw-ring-color": "var(--border-medium)" } as CSSProperties}
            >
              <span className="relative z-20 inline-block py-0.5 text-xs font-bold text-white">
                {linkItem.label}
              </span>

              <span
                aria-hidden
                className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover/btn:opacity-40"
              />
            </Link>
          ))}
        </div>

        <div
          style={{
            perspective: "1000px",
            transform: "rotateX(70deg) translateZ(0)",
          }}
          className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
        >
          <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-500/20 bg-sky-500/[0.08]" />
          <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-500/20" />
          <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-500/20" />
        </div>

        <>
          <div
            aria-hidden
            className="absolute bottom-1/2 right-1/2 h-20 w-px translate-y-[14px] bg-gradient-to-b from-transparent to-cyan-500 blur-[2px] group-hover/pin:h-40 group-focus-within/pin:h-40"
          />
          <div
            aria-hidden
            className="absolute bottom-1/2 right-1/2 h-20 w-px translate-y-[14px] bg-gradient-to-b from-transparent to-cyan-500 group-hover/pin:h-40 group-focus-within/pin:h-40  "
          />
          <div
            aria-hidden
            className="absolute bottom-1/2 right-1/2 z-40 h-[4px] w-[4px] translate-x-[1.5px] translate-y-[14px] rounded-full bg-cyan-600 blur-[3px]"
          />
          <div
            aria-hidden
            className="absolute bottom-1/2 right-1/2 z-40 h-[2px] w-[2px] translate-x-[0.5px] translate-y-[14px] rounded-full bg-cyan-300 "
          />
        </>
      </div>
    </div>
  );
};
