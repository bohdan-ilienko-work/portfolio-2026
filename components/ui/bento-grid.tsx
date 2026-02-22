"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { IoCopyOutline } from "react-icons/io5";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

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
  const [copyTrigger, setCopyTrigger] = useState(0);
  const { resolvedTheme } = useTheme();
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
    setCopyTrigger((current) => current + 1);
  };

  useEffect(() => {
    if (!copied) return;

    const copyTimeout = setTimeout(() => {
      setCopied(false);
    }, 3500);

    return () => clearTimeout(copyTimeout);
  }, [copied]);

  const descriptionColor =
    id === 1 || id === 6
      ? "#c1c2d3"
      : id === 5
      ? resolvedTheme === "light"
        ? "#6b7280"
        : "#c1c2d3"
      : "var(--text-secondary)";

  const titleColor =
    id === 1 || id === 6
      ? "#ffffff"
      : id === 5
      ? resolvedTheme === "light"
        ? "#111827"
        : "#ffffff"
      : "var(--text-primary)";

  return (
    <div
      className={cn(
        "group/bento relative row-span-1 flex flex-col justify-between space-y-4 overflow-hidden rounded-3xl border transition duration-200 hover:shadow-xl",
        className
      )}
      style={{
        borderColor: "var(--border-medium)",
        background: "var(--surface-card)",
        backgroundImage: "var(--surface-card-gradient)",
        boxShadow: "var(--shadow-card)",
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
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(to right, var(--bento-overlay), var(--bento-overlay-mid), var(--bento-overlay-end))",
            }}
          />
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
              className={cn(
                "h-full w-full object-cover object-center",
                id === 4 && "invert opacity-60 dark:invert-0 dark:opacity-100"
              )}
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
          <div
            className="relative z-20 font-sans text-sm font-extralight md:text-xs lg:text-base"
            style={{ color: descriptionColor }}
          >
            {description}
          </div>

          <div
            className="relative z-20 max-w-96 font-sans text-lg font-bold lg:text-3xl"
            style={{ color: titleColor }}
          >
            {title}
          </div>

          {id === 2 && <GridGlobe />}

          {id === 3 && (
            <div className="relative mt-7 w-full">
              <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl blur-xl" style={{ background: "linear-gradient(to bottom, var(--overlay-subtle), transparent)" }} />

              <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                {techItems.map((item) => (
                  <div
                    key={item.name}
                    className="group/skill relative overflow-hidden rounded-2xl border px-4 py-3 transition duration-300 hover:-translate-y-1 lg:px-5 lg:py-4"
                    style={{
                      borderColor: "var(--border-medium)",
                      background: "linear-gradient(to bottom, var(--skill-from), var(--skill-to))",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <div className="pointer-events-none absolute -inset-24 opacity-0 blur-2xl transition duration-300 group-hover/skill:opacity-100">
                      <div className="h-40 w-40 rounded-full" style={{ backgroundColor: "var(--overlay-subtle)" }} />
                    </div>

                    <div className="flex items-center gap-3 lg:gap-3.5">
                      <div
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 lg:h-12 lg:w-12"
                        style={{
                          backgroundColor: "var(--skill-icon-bg)",
                          "--tw-ring-color": "var(--border-medium)",
                        } as React.CSSProperties}
                      >
                        <div className="pointer-events-none absolute inset-0 rounded-xl opacity-60" style={{ background: "linear-gradient(to bottom, var(--overlay-subtle), transparent)" }} />
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
                        <div className="truncate font-sans text-sm font-semibold lg:text-base" style={{ color: "var(--text-primary)" }}>
                          {item.name}
                        </div>
                        <div className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                          {skillCategoryMap[item.name] || "Engineering"}
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition duration-300 group-hover/skill:opacity-100" style={{ background: "linear-gradient(to right, transparent, var(--border-strong), transparent)" }} />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1" style={{ "--tw-ring-color": "var(--border-subtle)" } as React.CSSProperties} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {id === 6 && (
            <div className="group relative mt-5">
              <BentoGridLottie trigger={copyTrigger} />

              <MagicButton
                title={copied ? "Email copied!" : "Copy my email"}
                icon={<IoCopyOutline />}
                otherClasses="!bg-[--magic-btn-bg]"
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
