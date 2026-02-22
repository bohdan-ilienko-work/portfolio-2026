import type { Metadata } from "next";

const startDate = new Date(2022, 4);

const now = new Date();

const totalMonths =
  (now.getFullYear() - startDate.getFullYear()) * 12 +
  (now.getMonth() - startDate.getMonth());

const fullYears = Math.floor(totalMonths / 12);
const remainingMonths = totalMonths % 12;

const yearWord = (value: number) => (value === 1 ? "year" : "years");

let yearsWithMonthsOfExperience = "";

if (remainingMonths === 0) {
  yearsWithMonthsOfExperience = `${fullYears} ${yearWord(fullYears)}`;
} else if (remainingMonths < 6) {
  yearsWithMonthsOfExperience = `${fullYears}+ ${yearWord(fullYears)}`;
} else if (remainingMonths === 6) {
  yearsWithMonthsOfExperience = `${fullYears}.5 ${yearWord(fullYears + 0.5)}`;
} else {
  yearsWithMonthsOfExperience = `${fullYears}.5+ ${yearWord(fullYears + 0.5)}`;
}

export const links = {
  sourceCode: "https://github.com/bohdan-ilienko-work/portfolio-2026",
  ownerCvFile: "/Bohdan-Ilienko-CV-FullStack-Developer_02.2026.pdf",
  ownerCvGoogle:
    "https://drive.google.com/file/d/1GxQb8ly5DRVi_AxjQ-1tPmRhCiCdc1II/view?usp=sharing",
  ownerName: "Bohdan Ilienko",
  ownerEmail: "bohdan.ilienko.work@gmail.com",
  ownerPhone: "+380954755708",
  ownerRole: "Full Stack Engineer",
  ownerLocation: "Remote worldwide",
  ownerTelegram: "https://t.me/b0urgeois",
  ownerInsta: "https://www.instagram.com/b0urgeo1s/",
  ownerGithub: "https://github.com/NureBohdanIlienko",
  ownerLinkedin: "https://www.linkedin.com/in/bohdan-ilienko-692b232a5/",
  yearsWithMonthsOfExperience,
} as const;

export const siteConfig: Metadata = {
  title: `${links.ownerName}'s Portfolio`,
  description:
    "Full Stack Engineer portfolio: TypeScript, NestJS, React, React Native, system design, and production delivery.",
  keywords: [
    "reactjs",
    "nextjs",
    "vercel",
    "react",
    "aceternity",
    "aceternity-ui",
    "shadcn",
    "shadcn-ui",
    "radix-ui",
    "cn",
    "clsx",
    "modern-portfolio",
    "portfolio",
    "3d-portfolio",
    "animated-portfolio",
    "nextjs-portfolio",
    "react-portfolio",
    "react-three-fiber",
    "three.js",
    "animated-website",
    "framer",
    "framer-motion",
    "three",
    "react-icons",
    "lucide-react",
    "next-themes",
    "postcss",
    "prettier",
    "react-dom",
    "tailwindcss",
    "tailwindcss-animate",
    "ui/ux",
    "js",
    "javascript",
    "typescript",
    "eslint",
    "html",
    "css",
  ] as Array<string>,
  authors: {
    name: links.ownerName,
    url: links.ownerGithub,
  },
} as const;
