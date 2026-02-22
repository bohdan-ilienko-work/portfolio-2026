"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { IoCopyOutline } from "react-icons/io5";
import dynamic from "next/dynamic";

import { links } from "@/config";
import { techStack } from "@/data";
import { cn } from "@/lib/utils";

import { BackgroundGradientAnimation } from "./background-gradient-animation";
import { MagicButton } from "./magic-button";

import { GridGlobe } from "../grid-globe";

const BentoGridLottie = dynamic(() => import("./bento-grid-lottie"), {
  ssr: false,
});

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-5",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  id,
  className,
  title,
  description,
  img,
  imgClassName,
  titleClassName,
  spareImg,
}: {
  id?: number;
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  img?: string;
  imgClassName?: string;
  titleClassName?: string;
  spareImg?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const skillCategoryMap: Record<string, string> = {
    TypeScript: "Language",
    JavaScript: "Language",
    "Node.js": "Backend",
    NestJS: "Backend",
    "Express.js": "Backend",
    React: "Frontend",
    "Next.js": "Frontend",
    "React Native": "Mobile",
    "Redux Toolkit": "State",
    "Tailwind CSS": "Styling",
    PostgreSQL: "Data",
    MongoDB: "Data",
    Redis: "Caching",
    Docker: "DevOps",
    Kubernetes: "DevOps",
    "GitHub Actions": "CI/CD",
    RabbitMQ: "Messaging",
    Kafka: "Messaging",
    GraphQL: "API",
    WebSockets: "Realtime",
  };

  const techItems = useMemo(
    () => [
      ...techStack.stack1,
      ...techStack.stack2,
      ...techStack.stack3,
      ...techStack.stack4,
    ],
    []
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(links.ownerEmail);
    setCopied(true);
  };

  useEffect(() => {
    if (!copied) return;

    const copyTimeout = setTimeout(() => {
      setCopied(false);
    }, 3500);

    return () => clearTimeout(copyTimeout);
  }, [copied]);

  return (
    <div
      className={cn(
        "group/bento relative row-span-1 flex flex-col justify-between space-y-4 overflow-hidden rounded-3xl border border-white/[0.1] shadow-input transition duration-200 hover:shadow-xl dark:shadow-none",
        className
      )}
      style={{
        background: "rgb(4,7,29)",
        backgroundColor:
          "linear-gradient(90deg, rgba(4,7,29,1) 0%, rgba(12,14,35,1) 100%)",
      }}
    >
      <div className={cn("h-full", id === 6 && "flex justify-center")}>
        <div className="absolute h-full w-full">
          {img && (
            <Image
              width={689}
              height={541}
              src={img}
              alt={img}
              className={cn(
                "object-cover object-center",
                id === 5 &&
                  "brightness-[0.5] saturate-[0.75] contrast-[0.94] transition duration-300",
                imgClassName
              )}
            />
          )}
        </div>

        {id === 5 && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#04071d]/88 via-[#04071d]/62 to-[#04071d]/28" />
        )}

        <div
          className={cn(
            "absolute right-0 -mb-5",
            id === 5 && "w-full opacity-80"
          )}
        >
          {spareImg && (
            <Image
              width={208}
              height={96}
              src={spareImg}
              alt={spareImg}
              className="h-full w-full object-cover object-center"
            />
          )}
        </div>

        {id === 6 && <BackgroundGradientAnimation />}

        <div
          className={cn(
            "relative flex min-h-40 flex-col p-5 px-5 transition duration-200 group-hover/bento:translate-x-2 md:h-full lg:p-10",
            titleClassName
          )}
        >
          <div className="z-10 font-sans text-sm font-extralight text-[#c1c2d3] md:text-xs lg:text-base">
            {description}
          </div>

          <div className="z-10 max-w-96 font-sans text-lg font-bold lg:text-3xl">
            {title}
          </div>

          {id === 2 && <GridGlobe />}

          {id === 3 && (
            <div className="relative mt-7 w-full">
              <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent blur-xl" />

              <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                {techItems.map((item) => (
                  <div
                    key={item.name}
                    className="group/skill relative overflow-hidden rounded-2xl border border-white/[0.10] bg-gradient-to-b from-[#0f1433]/95 to-[#0b102b]/95 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 hover:-translate-y-1 hover:border-white/[0.22] hover:shadow-[0_14px_36px_rgba(0,0,0,0.45)] lg:px-5 lg:py-4"
                  >
                    <div className="pointer-events-none absolute -inset-24 opacity-0 blur-2xl transition duration-300 group-hover/skill:opacity-100">
                      <div className="h-40 w-40 rounded-full bg-white/[0.10]" />
                    </div>

                    <div className="flex items-center gap-3 lg:gap-3.5">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/25 ring-1 ring-white/[0.10] lg:h-12 lg:w-12">
                        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.10] to-transparent opacity-60" />
                        <Image
                          src={item.icon}
                          alt={`${item.name} icon`}
                          width={26}
                          height={26}
                          unoptimized
                          className="h-6 w-6 lg:h-7 lg:w-7"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate font-sans text-sm font-semibold text-white/95 lg:text-base">
                          {item.name}
                        </div>
                        <div className="mt-0.5 text-xs text-white/55">
                          {skillCategoryMap[item.name] || "Engineering"}
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.18] to-transparent opacity-0 transition duration-300 group-hover/skill:opacity-100" />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/[0.06]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {id === 6 && (
            <div className="group relative mt-5">
              <BentoGridLottie copied={copied} />

              <MagicButton
                title={copied ? "Email copied!" : "Copy my email"}
                icon={<IoCopyOutline />}
                otherClasses="!bg-[#161a31]"
                handleClick={handleCopy}
                asChild
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
