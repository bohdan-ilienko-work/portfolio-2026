import type { Metadata } from "next";

const startDate = new Date(2022, 7);

const now = new Date();

const totalMonths =
  (now.getFullYear() - startDate.getFullYear()) * 12 +
  (now.getMonth() - startDate.getMonth());

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-2026.vercel.app";

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
  totalExperienceMonths: totalMonths,
} as const;

export const siteConfig: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${links.ownerName} | ${links.ownerRole}`,
    template: `%s | ${links.ownerName}`,
  },
  description:
    "Portfolio of Bohdan Ilienko, Full Stack Engineer. Building production-ready web and mobile products with TypeScript, Node.js/NestJS, React/Next.js, React Native, and scalable backend architecture.",
  keywords: [
    "Bohdan Ilienko",
    "Full Stack Engineer",
    "Full Stack Developer",
    "Software Engineer",
    "Backend Engineer",
    "Backend Developer",
    "Frontend Engineer",
    "Frontend Developer",
    "Mobile Engineer",
    "Mobile Developer",
    "JavaScript Developer",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Express.js",
    "NestJS",
    "React",
    "Next.js",
    "React Native",
    "Redux Toolkit",
    "REST API",
    "API Design",
    "Microservices",
    "System Design",
    "Scalable Architecture",
    "Distributed Systems",
    "Asynchronous Processing",
    "WebSockets",
    "GraphQL",
    "RabbitMQ",
    "Kafka",
    "MQTT",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Docker",
    "Kubernetes",
    "GitHub Actions",
    "CI/CD",
    "Performance Optimization",
    "Code Review",
    "Refactoring",
    "Production Delivery",
    "Product Engineering",
    "Remote Engineer",
    "Remote Full Stack Engineer",
    "Web Application Development",
    "Mobile Application Development",
    "Web Development Portfolio",
    "Mobile Development Portfolio",
    "Backend Architecture",
    "API Development",
    "Remote Full Stack Developer",
  ] as Array<string>,
  category: "technology",
  creator: links.ownerName,
  publisher: links.ownerName,
  authors: {
    name: links.ownerName,
    url: links.ownerGithub,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: `${links.ownerName} Portfolio`,
    title: `${links.ownerName} | ${links.ownerRole}`,
    description:
      "Production-grade web and mobile engineering portfolio: TypeScript, Node.js/NestJS, React/Next.js, React Native, and backend systems delivery.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${links.ownerName} | ${links.ownerRole}`,
    description:
      "Full Stack Engineer portfolio focused on product delivery, backend systems, and scalable web/mobile development.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
} as const;
