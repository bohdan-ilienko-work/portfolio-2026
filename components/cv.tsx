"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FaDownload, FaEye } from "react-icons/fa6";

import { links } from "@/config";

const CvPdfPreview = dynamic(
  () => import("./cv-pdf-preview").then((m) => m.CvPdfPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center text-sm text-white/70 sm:h-[360px] md:h-[420px]">
        Loading preview…
      </div>
    ),
  }
);

export const Cv = () => {
  return (
    <section id="cv" className="py-20">
      <h1 className="heading">
        My <span className="text-purple">CV</span>
      </h1>

      <p className="mx-auto mt-4 max-w-3xl text-center text-white-200">
        Preview my latest resume directly on this page or download the Google
        Drive version.
      </p>

      <div className="mt-10 w-full overflow-hidden rounded-3xl border border-white/[0.10] bg-gradient-to-b from-white/[0.06] to-transparent shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="relative border-b border-white/[0.08] bg-black-100/60 px-5 py-4">
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-transparent" />
          </div>

          <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div>
              <div className="text-sm font-semibold text-white/90 md:text-base">
                Resume preview
              </div>
              <div className="mt-0.5 text-xs text-white/55">
                Open the first page here or download the full CV from Google
                Drive.
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:w-auto md:flex md:items-center">
              <Link
                href={links.ownerCvFile}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full"
              >
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/[0.20] hover:bg-white/[0.10] md:w-auto">
                  <FaEye className="opacity-90" />
                  Open
                </button>
              </Link>

              <Link
                href={links.ownerCvGoogle}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full"
              >
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/[0.20] hover:bg-white/[0.10] md:w-auto">
                  <FaDownload className="opacity-90" />
                  Download
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative p-2 md:p-3">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.10] bg-black">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-b from-transparent to-black/70" />
            <CvPdfPreview fileUrl={links.ownerCvFile} />
          </div>
        </div>
      </div>
    </section>
  );
};
