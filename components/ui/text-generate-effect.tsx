"use client";

import { LazyMotion, domAnimation, m, stagger, useAnimate } from "framer-motion";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");
  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
      },
      {
        duration: 2,
        delay: stagger(0.2),
      }
    );
  }, [animate]);

  const renderWords = () => {
    return (
      <m.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <m.span
              key={word + idx}
              className={cn("text-[--text-primary] opacity-0", idx > 3 && "text-purple")}
            >
              {word}{" "}
            </m.span>
          );
        })}
      </m.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <div className="my-4">
        <LazyMotion features={domAnimation}>
          <div className="leading-snug tracking-wide text-[--text-primary]">{renderWords()}</div>
        </LazyMotion>
      </div>
    </div>
  );
};
