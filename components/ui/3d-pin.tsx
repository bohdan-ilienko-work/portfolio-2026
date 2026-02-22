"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";

import { cn } from "@/lib/utils";

export const PinContainer = ({
  children,
  title,
  href,
  ctaLinks,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  title?: string;
  href?: string;
  ctaLinks?: Array<{ label: string; href: string }>;
  className?: string;
  containerClassName?: string;
}) => {
  const [transform, setTransform] = useState(
    "translate(-50%,-50%) rotateX(0deg)"
  );

  const onMouseEnter = () => {
    setTransform("translate(-50%,-50%) rotateX(40deg) scale(0.8)");
  };
  const onMouseLeave = () => {
    setTransform("translate(-50%,-50%) rotateX(0deg) scale(1)");
  };

  return (
    <div
      className={cn(
        "group/pin relative z-50  cursor-pointer",
        containerClassName
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
            transform: transform,
            borderColor: "var(--border-medium)",
            boxShadow: "var(--shadow-card)",
          }}
          className="absolute left-1/2 top-1/2 flex items-start justify-start overflow-hidden rounded-2xl border p-4 transition duration-700"
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
    <motion.div className="z-[60] flex h-80 w-full items-center justify-center opacity-0 transition duration-500 group-hover/pin:opacity-100">
      <div className="inset-0 -mt-2 h-full w-full flex-none">
        <div className="absolute bottom-1/2 left-1/2 flex -translate-x-1/2 -translate-y-[120px] gap-2">
          {links.map((linkItem) => (
            <Link
              key={linkItem.label}
              href={linkItem.href}
              target="_blank"
              className="relative z-10 flex items-center space-x-2 rounded-full px-4 py-0.5 ring-1"
              style={{ backgroundColor: "var(--magic-btn-bg)", "--tw-ring-color": "var(--border-medium)" } as React.CSSProperties}
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
          <>
            <motion.div
              initial={{
                opacity: 0,
                scale: 0,
                x: "-50%",
                y: "-50%",
              }}
              animate={{
                opacity: [0, 1, 0.5, 0],
                scale: 1,

                z: 0,
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: 0,
              }}
              className="absolute left-1/2 top-1/2  h-[11.25rem] w-[11.25rem] rounded-[50%] bg-sky-500/[0.08] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
              aria-hidden
            />
            <motion.div
              initial={{
                opacity: 0,
                scale: 0,
                x: "-50%",
                y: "-50%",
              }}
              animate={{
                opacity: [0, 1, 0.5, 0],
                scale: 1,

                z: 0,
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: 2,
              }}
              className="absolute left-1/2 top-1/2  h-[11.25rem] w-[11.25rem] rounded-[50%] bg-sky-500/[0.08] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
              aria-hidden
            />
            <motion.div
              initial={{
                opacity: 0,
                scale: 0,
                x: "-50%",
                y: "-50%",
              }}
              animate={{
                opacity: [0, 1, 0.5, 0],
                scale: 1,

                z: 0,
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: 4,
              }}
              className="absolute left-1/2 top-1/2  h-[11.25rem] w-[11.25rem] rounded-[50%] bg-sky-500/[0.08] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
              aria-hidden
            />
          </>
        </div>

        <>
          <motion.div
            aria-hidden
            className="absolute bottom-1/2 right-1/2 h-20 w-px translate-y-[14px] bg-gradient-to-b from-transparent to-cyan-500 blur-[2px] group-hover/pin:h-40"
          />
          <motion.div
            aria-hidden
            className="absolute bottom-1/2 right-1/2 h-20 w-px translate-y-[14px] bg-gradient-to-b from-transparent to-cyan-500 group-hover/pin:h-40  "
          />
          <motion.div
            aria-hidden
            className="absolute bottom-1/2 right-1/2 z-40 h-[4px] w-[4px] translate-x-[1.5px] translate-y-[14px] rounded-full bg-cyan-600 blur-[3px]"
          />
          <motion.div
            aria-hidden
            className="absolute bottom-1/2 right-1/2 z-40 h-[2px] w-[2px] translate-x-[0.5px] translate-y-[14px] rounded-full bg-cyan-300 "
          />
        </>
      </div>
    </motion.div>
  );
};
