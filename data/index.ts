import { links } from "@/config";

export const navItems = [
  { name: "About", link: "#about" },
  { name: "Experience", link: "#experience" },
  { name: "Education", link: "#education" },
  { name: "My CV", link: "#cv" },
  { name: "Projects", link: "#projects" },
  { name: "Highlights", link: "#testimonials" },
  { name: "Approach", link: "#approach" },
  { name: "Contact", link: "#contact" },
] as const;
export const gridItems = [
  {
    id: 1,
    title:
      "Full Stack Engineer with 3.5 years of experience, delivering end-to-end web and mobile applications.",
    description: "Professional Summary",
    // was md:row-span-4 → делаем обычную высоту
    className: "lg:col-span-3 md:col-span-3 md:row-span-2 lg:min-h-[30vh]",
    imgClassName: "w-full h-full",
    titleClassName: "justify-end",
    img: "/b1.svg",
    spareImg: "",
  },
  {
    id: 2,
    title:
      "Remote-first engineer, effective with distributed teams across time zones.",
    description: "Collaboration",
    className: "lg:col-span-2 md:col-span-2 md:row-span-2",
    imgClassName: "",
    titleClassName: "justify-start",
    img: "",
    spareImg: "",
  },
  {
    id: 3,
    title: "Core tech stack",
    description: "Systems engineering tools",
    className: "lg:col-span-5 md:col-span-5 md:row-span-3 lg:min-h-[30rem]",
    imgClassName: "",
    titleClassName: "justify-between",
    img: "",
    spareImg: "",
  },
  {
    id: 4,
    title: "English and Ukrainian.",
    description: "Languages",
    className: "lg:col-span-2 md:col-span-2 md:row-span-1",
    imgClassName: "",
    titleClassName: "justify-start",
    img: "/grid.svg",
    spareImg: "/b4.svg",
  },
  {
    id: 5,
    title:
      "Known for ownership of features, solving complex problems, and reliable production delivery.",
    description: "Engineering Focus",
    className: "lg:col-span-3 md:col-span-3 md:row-span-2",
    imgClassName: "absolute right-0 bottom-0 md:w-96 w-60",
    titleClassName:
      "justify-center md:justify-start lg:justify-center",
    img: "/undraw_code-review_jdgp.svg",
    spareImg: "/grid.svg",
  },
  {
    id: 6,
    title:
      "Open to full stack opportunities and product development.",
    description: "Contact",
    className: "lg:col-span-2 md:col-span-2 md:row-span-1",
    imgClassName: "",
    titleClassName:
      "justify-center md:max-w-full max-w-60 text-center",
    img: "",
    spareImg: "",
  },
] as const;

export const projects = [
  {
    id: 1,
    title: "Book Portfolio",
    des: "React portfolio template in book format with mobile support and i18n.",
    img: "/p1.jpg",
    iconLists: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    ],
    link: "https://neon-crostata-31e281.netlify.app/",
    visitLinks: [],
    sourceCode: "https://github.com/NureBohdanIlienko/vl-vite-book-portfolio",
    sourceOptions: [],
  },

  {
    id: 2,
    title: "SkillHub",
    des: "Full-stack platform: React/Redux client + NestJS API for auth, roles, posts, and discussions.",
    img: "/p3.svg",
    iconLists: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    ],
    link: "https://github.com/NureBohdanIlienko/skillhub-client",
    visitLinks: [
      {
        label: "Visit Client",
        href: "https://github.com/NureBohdanIlienko/avpz-client",
      },
      {
        label: "Visit Backend",
        href: "https://github.com/NureBohdanIlienko/avpz-mono-api",
      },
    ],
    sourceCode: "https://github.com/NureBohdanIlienko/avpz-client",
    sourceOptions: [
      {
        label: "Client Repository",
        href: "https://github.com/NureBohdanIlienko/avpz-client",
      },
      {
        label: "API Repository",
        href: "https://github.com/NureBohdanIlienko/avpz-mono-api",
      },
    ],
  },
  {
    id: 3,
    title: "Ticketing",
    des: "Microservice ticketing app with JWT auth and card payment flow.",
    img: "/p2.jpg",
    iconLists: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
      "https://cdn.simpleicons.org/express/ffffff",
      "https://cdn.simpleicons.org/jsonwebtokens/ffffff",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    ],
    link: "https://github.com/NureBohdanIlienko/ticketing/tree/master",
    visitLinks: [],
    sourceCode: "https://github.com/NureBohdanIlienko/ticketing/tree/master",
    sourceOptions: [],
  },
  {
    id: 4,
    title: "Pharmacy API",
    des: "NestJS API with MS SQL, JWT auth, and Swagger docs for pharmacy reporting.",
    img: "/p4.jpg",
    iconLists: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg",
      "https://cdn.simpleicons.org/jsonwebtokens/ffffff",
      "https://cdn.simpleicons.org/swagger/85ea2d",
    ],
    link: "https://github.com/NureBohdanIlienko/apteka-api",
    visitLinks: [],
    sourceCode: "https://github.com/NureBohdanIlienko/apteka-api",
    sourceOptions: [],
  },
] as const;

export const testimonials = [
  {
    quote:
      "Develop and maintain internal services and tooling using TypeScript / Node.js / NestJS, including API contracts and integrations.",
    name: "ARTADIAN GAMING LLP",
    title: "Full Stack Developer, Full Time · Feb 2025 - Present",
  },
  {
    quote:
      "Built and evolved REST APIs, background jobs, and asynchronous workflows using RabbitMQ, Kafka, MQTT, and WebSockets.",
    name: "Backend Delivery",
    title: "Messaging, API Design, Integrations",
  },
  {
    quote:
      "Worked with Redis sessions/caching and PostgreSQL/MongoDB optimization to improve reliability and solve production regressions.",
    name: "Performance & Reliability",
    title: "Redis, PostgreSQL, MongoDB",
  },
  {
    quote:
      "Contributed to code reviews, refactoring, and CI/CD-driven delivery with Docker and GitHub Actions.",
    name: "Engineering Process",
    title: "Quality, Refactoring, CI/CD",
  },
] as const;

export const companies = [
  {
    id: 1,
    name: "cloudinary",
    img: "/cloud.svg",
    nameImg: "/cloudName.svg",
  },
  {
    id: 2,
    name: "appwrite",
    img: "/app.svg",
    nameImg: "/appName.svg",
  },
  {
    id: 3,
    name: "HOSTINGER",
    img: "/host.svg",
    nameImg: "/hostName.svg",
  },
  {
    id: 4,
    name: "stream",
    img: "/s.svg",
    nameImg: "/streamName.svg",
  },
  {
    id: 5,
    name: "docker.",
    img: "/dock.svg",
    nameImg: "/dockerName.svg",
  },
] as const;

export const workExperience = [
  {
    id: 1,
    title: "Full Stack Developer, ARTADIAN GAMING LLP, Full Time",
    desc: "Feb 2025 - Present · TypeScript/Node.js/NestJS services, REST APIs, background jobs, messaging workflows, and CI/CD delivery.",
    className: "md:col-span-2",
    thumbnail: "/exp1.svg",
  },
  {
    id: 2,
    title: "Full Stack Developer, Silinexx, Full Time",
    desc: "Mar 2024 - Sept 2025 · Internal web systems across backend/frontend, auth flows, test coverage, and DB query optimization.",
    className: "md:col-span-2",
    thumbnail: "/exp2.svg",
  },
  {
    id: 3,
    title: "Full Stack Developer, Wnet, Full Time",
    desc: "May 2022 - Nov 2023 · Built and supported internal apps, implemented REST endpoints, improved performance, and reduced technical debt.",
    className: "md:col-span-2",
    thumbnail: "/exp3.svg",
  },
  // {
  //   id: 4,
  //   title: "Education: Bachelor of Science, Computer Science",
  //   desc: "Kharkiv National University of Radio Electronics · Sept 2021 - Jun 2025",
  //   className: "md:col-span-2",
  //   thumbnail: "/exp4.svg",
  // },
] as const;

export const educationItems = [
  {
    id: 1,
    title: "Bachelor's Diploma",
    institution: "Kharkiv National University of Radioelectronics",
    degree: "Software Engineering, Bachelor's degree",
    period: "2021 - 2025",
    description:
      "University diploma in Software Engineering with a full bachelor program.",
    image: "/diploma.jpg",
    link: "/diploma.jpg",
    ctaLabel: "View diploma",
  },
  {
    id: 2,
    title: "Udemy Course Certificate",
    institution: "Udemy",
    degree: "Professional software engineering course",
    period: "Completed",
    description:
      "Course completion certificate confirming practical engineering training.",
    image: "/udemy-certificate.jpg",
    link: "/udemy-certificate.jpg",
    ctaLabel: "View certificate",
  },
] as const;

export const socialMedia = [
  {
    name: "Telegram",
    img: "/tg.svg",
    link: links.ownerTelegram,
  },
  {
    name: "GitHub",
    img: "/git.svg",
    link: links.ownerGithub,
  },
  {
    name: "Instagram",
    img: "/insta.svg",
    link: links.ownerInsta,
  },
  {
    name: "LinkedIn",
    img: "/link.svg",
    link: links.ownerLinkedin,
  },
] as const;

export const techStack = {
  stack1: [
    {
      name: "TypeScript",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    },
    {
      name: "JavaScript",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    },
    {
      name: "Node.js",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    },
    {
      name: "NestJS",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg",
    },
    {
      name: "Express.js",
      icon: "https://cdn.simpleicons.org/express/ffffff",
    },
  ],
  stack2: [
    {
      name: "React",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    },
    {
      name: "Next.js",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
    },
    {
      name: "React Native",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    },
    {
      name: "Redux Toolkit",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg",
    },
    {
      name: "Tailwind CSS",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
    },
  ],
  stack3: [
    {
      name: "PostgreSQL",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    },
    {
      name: "MongoDB",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
    },
    {
      name: "Redis",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
    },
    {
      name: "Docker",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    },
    {
      name: "Kubernetes",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
    },
  ],
  stack4: [
    {
      name: "GitHub Actions",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-original.svg",
    },
    {
      name: "RabbitMQ",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rabbitmq/rabbitmq-original.svg",
    },
    {
      name: "Kafka",
      icon: "https://cdn.simpleicons.org/apachekafka/ffffff",
    },
    {
      name: "GraphQL",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg",
    },
    {
      name: "WebSockets",
      icon: "https://cdn.simpleicons.org/socketdotio/ffffff",
    },
  ],
} as const;
