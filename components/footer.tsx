"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { FaLocationArrow } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";

import { MagicButton } from "@/components/ui/magic-button";
import { links } from "@/config";
import { socialMedia } from "@/data";

export const Footer = () => {
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!isContactPopupOpen) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      const isPopupClick = popupRef.current?.contains(target);
      const isTriggerClick = Boolean(target.closest("[data-contact-trigger]"));

      if (!isPopupClick && !isTriggerClick) {
        setIsContactPopupOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsContactPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isContactPopupOpen]);

  return (
    <footer id="contact" className="mb-[100px] w-full pb-10 md:mb-auto">
      <div className="absolute -bottom-72 left-0 min-h-96 w-full">
        <Image
          src="/footer-grid.svg"
          alt="grid"
          className="h-full w-full opacity-50"
          width={1260}
          height={863}
        />
      </div>

      <div className="flex flex-col items-center">
        <h1 className="heading lg:max-w-[45vw]">
          Open to new <span className="text-purple">full stack</span>{" "}
          opportunities.
        </h1>

        <p className="mb-4 mt-5 text-center text-white-200 md:mb-3 md:mt-6">
          Contact me to discuss product engineering, backend architecture, or
          mobile delivery.
        </p>

        <div className="relative mt-2 md:mt-4">
          <MagicButton
            title="Let's get in touch"
            icon={<FaLocationArrow />}
            position="right"
            otherClasses="relative"
          />

          <button
            type="button"
            aria-label="Open contact options"
            data-contact-trigger
            onClick={() => setIsContactPopupOpen((prev) => !prev)}
            className="absolute inset-0"
          />

          {isContactPopupOpen && (
            <div
              ref={popupRef}
              className="absolute bottom-full left-1/2 z-[300] mb-0 w-[min(92vw,22rem)] -translate-x-1/2 rounded-2xl border border-white/[0.14] bg-gradient-to-b from-[#12193f] to-[#0a0f28] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur-sm"
            >
              <div className="absolute -bottom-[8px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/[0.14] bg-[#0a0f28]" />
              <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
                Contact Method
              </p>

              <div className="space-y-2">
                <Link
                  href={links.ownerTelegram}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => setIsContactPopupOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-white/[0.12] bg-[#12183a] px-3 py-2.5 text-sm text-white/90 transition hover:border-purple/70 hover:bg-[#171f4a] hover:text-purple"
                >
                  <span className="flex items-center gap-2">
                    <FaTelegramPlane className="h-4 w-4" />
                    Telegram
                  </span>
                  <FaLocationArrow className="h-3 w-3" />
                </Link>

                <Link
                  href={`mailto:${links.ownerEmail}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => setIsContactPopupOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-white/[0.12] bg-[#12183a] px-3 py-2.5 text-sm text-white/90 transition hover:border-purple/70 hover:bg-[#171f4a] hover:text-purple"
                >
                  <span className="flex items-center gap-2">
                    <MdOutlineEmail className="h-4 w-4" />
                    Email
                  </span>
                  <FaLocationArrow className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-[999] mt-16 flex flex-col items-center justify-between md:flex-row">
        <p className="text-sm font-light md:text-base md:font-normal">
          Copyright &copy; {new Date().getFullYear()}{" "}
          <Link
            href={links.ownerInsta}
            target="_blank"
            rel="noreferrer noopener"
            className="text-purple"
          >
            {links.ownerName}
          </Link>{" "}
          |{" "}
          <Link href={links.sourceCode} className="underline">
            Source Code
          </Link>
        </p>

        <div className="flex items-center gap-6 md:gap-3">
          {socialMedia.map((profile) => (
            <Link
              key={profile.name}
              href={profile.link}
              target="_blank"
              rel="noreferrer noopener"
              className="saturate-180 flex size-10 items-center justify-center rounded-lg border border-black-300 bg-black-200 bg-opacity-75 backdrop-blur-lg backdrop-filter"
              title={profile.name}
            >
              <Image
                src={profile.img}
                alt={`profile-${profile.name}`}
                width={20}
                height={20}
              />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};
