"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaLocationArrow } from "react-icons/fa6";

import { projects } from "@/data";

import { PinContainer } from "./ui/3d-pin";

export const RecentProjects = () => {
  const [activeSourcePopup, setActiveSourcePopup] = useState<
    null | {
      projectId: number;
      projectTitle: string;
      options: Array<{ label: string; href: string }>;
    }
  >(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!activeSourcePopup) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      const isPopupClick = popupRef.current?.contains(target);
      const isTriggerClick = Boolean(target.closest("[data-source-trigger]"));
      if (!isPopupClick && !isTriggerClick) {
        setActiveSourcePopup(null);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [activeSourcePopup]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSourcePopup(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section id="projects" className="py-20">
      <h1 className="heading">
        A small selection of{" "}
        <span className="text-purple">recent projects</span>
      </h1>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-24 gap-y-24 p-4">
        {projects.map(
          ({
            id,
            des,
            iconLists,
            img,
            link,
            sourceCode,
            sourceOptions,
            title,
            visitLinks,
          }) => (
            <div
              key={id}
              className="flex h-[31rem] w-[90vw] items-center justify-center sm:h-[35rem] sm:w-[570px] lg:min-h-[31rem]"
            >
              <PinContainer
                title="Visit"
                href={link}
                ctaLinks={[...visitLinks]}
                containerClassName="h-full w-full"
              >
                <div className="relative mb-8 flex aspect-[16/10] w-[80vw] items-center justify-center overflow-hidden sm:w-[570px]">
                  <div className="relative h-full w-full overflow-hidden bg-[#13162d] lg:rounded-3xl">
                    <Image
                      height={330}
                      width={552}
                      src="/bg.png"
                      alt="bg-img"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <Image
                    height={300}
                    width={464}
                    src={img}
                    alt={title}
                    className="absolute bottom-0 z-10 h-auto w-[86%]"
                  />
                </div>

                <h1 className="line-clamp-1 text-base font-bold md:text-xl lg:text-2xl">
                  {title}
                </h1>

                <p className="line-clamp-2 text-sm font-light lg:text-xl lg:font-normal">
                  {des}
                </p>

                <div className="mb-3 mt-7 flex items-center justify-between">
                  <div className="flex items-center">
                    {iconLists.map((icon, i) => (
                      <div
                        key={icon}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.2] bg-black lg:h-10 lg:w-10"
                        style={{
                          transform: `translateX(-${5 * i * 2}px)`,
                        }}
                      >
                        <Image
                          height={40}
                          width={40}
                          src={icon}
                          alt={icon}
                          unoptimized
                          className="p-2"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="relative flex items-center justify-center">
                    {sourceOptions && sourceOptions.length > 0 ? (
                      <div className="relative">
                        <button
                          type="button"
                          data-source-trigger
                          onClick={() =>
                            setActiveSourcePopup((prev) =>
                              prev?.projectId === id
                                ? null
                                : {
                                  projectId: id,
                                  projectTitle: title,
                                  options: [...sourceOptions],
                                }
                            )
                          }
                          className="flex text-sm text-purple transition-opacity hover:opacity-80 md:text-xs lg:text-xl"
                        >
                          <span>Source Code</span>
                          <FaLocationArrow
                            className="ms-3 mt-[2px] h-3 w-3 md:h-2.5 md:w-2.5 lg:h-4 lg:w-4"
                            color="#cbacf9"
                          />
                        </button>

                        {activeSourcePopup?.projectId === id && (
                          <div
                            ref={popupRef}
                            className="absolute bottom-full right-0 z-[220] mb-3 w-72 rounded-2xl border border-white/[0.14] bg-gradient-to-b from-[#12193f] to-[#0a0f28] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur-sm"
                          >
                            <div className="absolute -bottom-2 right-7 h-4 w-4 rotate-45 border-b border-r border-white/[0.14] bg-[#0d1332]" />
                            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
                              Source Selection
                            </p>
                            <p className="mb-3 truncate text-sm font-semibold text-white">
                              {activeSourcePopup.projectTitle}
                            </p>

                            <div className="space-y-2">
                              {activeSourcePopup.options.map((option) => (
                                <Link
                                  key={option.label}
                                  href={option.href}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  onClick={() => setActiveSourcePopup(null)}
                                  className="flex items-center justify-between rounded-xl border border-white/[0.12] bg-[#12183a] px-3 py-2.5 text-xs text-white/90 transition hover:border-purple/70 hover:bg-[#171f4a] hover:text-purple"
                                >
                                  <span>{option.label}</span>
                                  <FaLocationArrow className="h-3 w-3" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={sourceCode}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center text-sm text-purple md:text-xs lg:text-xl"
                      >
                        <span>Source Code</span>
                        <FaLocationArrow
                          className="ms-3 mt-[2px] h-3 w-3 md:h-2.5 md:w-2.5 lg:h-4 lg:w-4"
                          color="#cbacf9"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              </PinContainer>
            </div>
          )
        )}
      </div>
    </section>
  );
};
