"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";

const World = dynamic(() => import("./ui/globe").then((module) => module.World), {
  ssr: false,
});
const MIN_VISIBLE_FRACTION = 0.2;

const colors = ["#06b6d4", "#3b82f6", "#6366f1"];
const sampleArcs = [
  {
    order: 1,
    startLat: -19.885592,
    startLng: -43.951191,
    endLat: -22.9068,
    endLng: -43.1729,
    arcAlt: 0.1,
  },
  {
    order: 1,
    startLat: 28.6139,
    startLng: 77.209,
    endLat: 3.139,
    endLng: 101.6869,
    arcAlt: 0.2,
  },
  {
    order: 1,
    startLat: -19.885592,
    startLng: -43.951191,
    endLat: -1.303396,
    endLng: 36.852443,
    arcAlt: 0.5,
  },
  {
    order: 2,
    startLat: 1.3521,
    startLng: 103.8198,
    endLat: 35.6762,
    endLng: 139.6503,
    arcAlt: 0.2,
  },
  {
    order: 2,
    startLat: 51.5072,
    startLng: -0.1276,
    endLat: 3.139,
    endLng: 101.6869,
    arcAlt: 0.3,
  },
  {
    order: 2,
    startLat: -15.785493,
    startLng: -47.909029,
    endLat: 36.162809,
    endLng: -115.119411,
    arcAlt: 0.3,
  },
  {
    order: 3,
    startLat: -33.8688,
    startLng: 151.2093,
    endLat: 22.3193,
    endLng: 114.1694,
    arcAlt: 0.3,
  },
  {
    order: 3,
    startLat: 21.3099,
    startLng: -157.8581,
    endLat: 40.7128,
    endLng: -74.006,
    arcAlt: 0.3,
  },
  {
    order: 3,
    startLat: -6.2088,
    startLng: 106.8456,
    endLat: 51.5072,
    endLng: -0.1276,
    arcAlt: 0.3,
  },
  {
    order: 4,
    startLat: 11.986597,
    startLng: 8.571831,
    endLat: -15.595412,
    endLng: -56.05918,
    arcAlt: 0.5,
  },
  {
    order: 4,
    startLat: -34.6037,
    startLng: -58.3816,
    endLat: 22.3193,
    endLng: 114.1694,
    arcAlt: 0.7,
  },
  {
    order: 4,
    startLat: 51.5072,
    startLng: -0.1276,
    endLat: 48.8566,
    endLng: -2.3522,
    arcAlt: 0.1,
  },
  {
    order: 5,
    startLat: 14.5995,
    startLng: 120.9842,
    endLat: 51.5072,
    endLng: -0.1276,
    arcAlt: 0.3,
  },
  {
    order: 5,
    startLat: 1.3521,
    startLng: 103.8198,
    endLat: -33.8688,
    endLng: 151.2093,
    arcAlt: 0.2,
  },
  {
    order: 5,
    startLat: 34.0522,
    startLng: -118.2437,
    endLat: 48.8566,
    endLng: -2.3522,
    arcAlt: 0.2,
  },
  {
    order: 6,
    startLat: -15.432563,
    startLng: 28.315853,
    endLat: 1.094136,
    endLng: -63.34546,
    arcAlt: 0.7,
  },
  {
    order: 6,
    startLat: 37.5665,
    startLng: 126.978,
    endLat: 35.6762,
    endLng: 139.6503,
    arcAlt: 0.1,
  },
  {
    order: 6,
    startLat: 22.3193,
    startLng: 114.1694,
    endLat: 51.5072,
    endLng: -0.1276,
    arcAlt: 0.3,
  },
  {
    order: 7,
    startLat: -19.885592,
    startLng: -43.951191,
    endLat: -15.595412,
    endLng: -56.05918,
    arcAlt: 0.1,
  },
  {
    order: 7,
    startLat: 48.8566,
    startLng: -2.3522,
    endLat: 52.52,
    endLng: 13.405,
    arcAlt: 0.1,
  },
  {
    order: 7,
    startLat: 52.52,
    startLng: 13.405,
    endLat: 34.0522,
    endLng: -118.2437,
    arcAlt: 0.2,
  },
  {
    order: 8,
    startLat: -8.833221,
    startLng: 13.264837,
    endLat: -33.936138,
    endLng: 18.436529,
    arcAlt: 0.2,
  },
  {
    order: 8,
    startLat: 49.2827,
    startLng: -123.1207,
    endLat: 52.3676,
    endLng: 4.9041,
    arcAlt: 0.2,
  },
  {
    order: 8,
    startLat: 1.3521,
    startLng: 103.8198,
    endLat: 40.7128,
    endLng: -74.006,
    arcAlt: 0.5,
  },
  {
    order: 9,
    startLat: 51.5072,
    startLng: -0.1276,
    endLat: 34.0522,
    endLng: -118.2437,
    arcAlt: 0.2,
  },
  {
    order: 9,
    startLat: 22.3193,
    startLng: 114.1694,
    endLat: -22.9068,
    endLng: -43.1729,
    arcAlt: 0.7,
  },
  {
    order: 9,
    startLat: 1.3521,
    startLng: 103.8198,
    endLat: -34.6037,
    endLng: -58.3816,
    arcAlt: 0.5,
  },
  {
    order: 10,
    startLat: -22.9068,
    startLng: -43.1729,
    endLat: 28.6139,
    endLng: 77.209,
    arcAlt: 0.7,
  },
  {
    order: 10,
    startLat: 34.0522,
    startLng: -118.2437,
    endLat: 31.2304,
    endLng: 121.4737,
    arcAlt: 0.3,
  },
  {
    order: 10,
    startLat: -6.2088,
    startLng: 106.8456,
    endLat: 52.3676,
    endLng: 4.9041,
    arcAlt: 0.3,
  },
  {
    order: 11,
    startLat: 41.9028,
    startLng: 12.4964,
    endLat: 34.0522,
    endLng: -118.2437,
    arcAlt: 0.2,
  },
  {
    order: 11,
    startLat: -6.2088,
    startLng: 106.8456,
    endLat: 31.2304,
    endLng: 121.4737,
    arcAlt: 0.2,
  },
  {
    order: 11,
    startLat: 22.3193,
    startLng: 114.1694,
    endLat: 1.3521,
    endLng: 103.8198,
    arcAlt: 0.2,
  },
  {
    order: 12,
    startLat: 34.0522,
    startLng: -118.2437,
    endLat: 37.7749,
    endLng: -122.4194,
    arcAlt: 0.1,
  },
  {
    order: 12,
    startLat: 35.6762,
    startLng: 139.6503,
    endLat: 22.3193,
    endLng: 114.1694,
    arcAlt: 0.2,
  },
  {
    order: 12,
    startLat: 22.3193,
    startLng: 114.1694,
    endLat: 34.0522,
    endLng: -118.2437,
    arcAlt: 0.3,
  },
  {
    order: 13,
    startLat: 52.52,
    startLng: 13.405,
    endLat: 22.3193,
    endLng: 114.1694,
    arcAlt: 0.3,
  },
  {
    order: 13,
    startLat: 11.986597,
    startLng: 8.571831,
    endLat: 35.6762,
    endLng: 139.6503,
    arcAlt: 0.3,
  },
  {
    order: 13,
    startLat: -22.9068,
    startLng: -43.1729,
    endLat: -34.6037,
    endLng: -58.3816,
    arcAlt: 0.1,
  },
  {
    order: 14,
    startLat: -33.936138,
    startLng: 18.436529,
    endLat: 21.395643,
    endLng: 39.883798,
    arcAlt: 0.3,
  },
].map((arc, index) => ({ ...arc, color: colors[index % colors.length] }));

export const GridGlobe = () => {
  const { resolvedTheme } = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!container.current) return;

    const media = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    let inViewport = false;

    const update = () => {
      const shouldRender = media.matches && inViewport && !document.hidden;
      setEnabled(media.matches);
      setVisible(shouldRender);
      if (shouldRender) setStarted(true);
    };

    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry.intersectionRatio >= MIN_VISIBLE_FRACTION;
      update();
    }, { threshold: MIN_VISIBLE_FRACTION });

    observer.observe(container.current);
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const globeConfig = useMemo(() => {
    const isDark = resolvedTheme !== "light";
    return {
      globeColor: isDark ? "#062056" : "#c7d2fe",
      atmosphereColor: isDark ? "#ffffff" : "#6366f1",
      emissive: isDark ? "#062056" : "#a5b4fc",
      emissiveIntensity: isDark ? 0.1 : 0.4,
      polygonColor: isDark ? "rgba(255,255,255,0.7)" : "rgba(99,102,241,0.6)",
      ambientLight: isDark ? "#38bdf8" : "#818cf8",
    };
  }, [resolvedTheme]);

  return (
    <div aria-hidden="true" className="absolute inset-x-0 -bottom-12 flex h-full w-full items-end justify-center md:-left-5 md:top-40 md:items-center">
      <div ref={container} className="relative mx-auto h-80 w-full max-w-7xl overflow-hidden px-4 md:h-96">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 w-full select-none md:h-40" style={{ background: "linear-gradient(to bottom, transparent, var(--surface-card))" }} />
        <div className="absolute inset-x-0 h-72 w-full opacity-90 md:h-full md:opacity-100">
          {(!enabled || !rendered) && <GlobePoster />}
          {enabled && started && <World data={sampleArcs} globeConfig={globeConfig} active={visible} onReady={() => setRendered(true)} />}
        </div>
      </div>
    </div>
  );
};

const GlobePoster = () => (
  <div className="pointer-events-none absolute left-1/2 top-[7%] aspect-square w-[72%] max-w-72 -translate-x-1/2 rounded-full border border-indigo-300/60 bg-[radial-gradient(circle_at_35%_25%,#f1f5ff,#a5b4fc_64%,#6366f1)] shadow-[0_0_24px_#818cf859] dark:border-sky-200/50 dark:bg-[radial-gradient(circle_at_35%_25%,#155e91,#062056_64%,#020617)]">
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-indigo-700/40 dark:text-sky-200/50" fill="none">
      <path d="M50 1v98M1 50h98M10 25c18 9 62 9 80 0M10 75c18 -9 62 -9 80 0" stroke="currentColor" strokeWidth="0.4" />
      <ellipse cx="50" cy="50" rx="25" ry="49" stroke="currentColor" strokeWidth="0.4" />
      <path d="M15 62Q45 5 82 33M28 35Q48 24 73 54M31 72Q55 30 86 61" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 2" />
      <g fill="currentColor">
        <circle cx="15" cy="62" r="1.35" />
        <circle cx="28" cy="35" r="1.35" />
        <circle cx="73" cy="54" r="1.35" />
        <circle cx="82" cy="33" r="1.35" />
        <circle cx="86" cy="61" r="1.35" />
      </g>
    </svg>
  </div>
);
