import { links } from '@/config';

export const navItems = [
  { nameKey: 'nav.about', link: '#about' },
  { nameKey: 'nav.experience', link: '#experience' },
  { nameKey: 'nav.education', link: '#education' },
  { nameKey: 'nav.cv', link: '#cv' },
  { nameKey: 'nav.projects', link: '#projects' },
  { nameKey: 'nav.highlights', link: '#testimonials' },
  { nameKey: 'nav.approach', link: '#approach' },
  { nameKey: 'nav.contact', link: '#contact' }
] as const;

export const gridItems = [
  {
    id: 1,
    titleKey: 'items.summary.title',
    descriptionKey: 'items.summary.label',
    className: 'lg:col-span-3 md:col-span-3 md:row-span-2 lg:min-h-[30vh]',
    imgClassName: 'w-full h-full',
    titleClassName: 'justify-end',
    img: '/bento-summary-v1.webp',
    spareImg: ''
  },
  {
    id: 2,
    titleKey: 'items.collaboration.title',
    descriptionKey: 'items.collaboration.label',
    className: 'lg:col-span-2 md:col-span-2 md:row-span-2',
    imgClassName: '',
    titleClassName: 'justify-start',
    img: '',
    spareImg: ''
  },
  {
    id: 3,
    titleKey: 'items.stack.title',
    descriptionKey: 'items.stack.label',
    className: 'lg:col-span-5 md:col-span-5 md:row-span-3 lg:min-h-[30rem]',
    imgClassName: '',
    titleClassName: 'justify-between',
    img: '',
    spareImg: ''
  },
  {
    id: 4,
    titleKey: 'items.languages.title',
    descriptionKey: 'items.languages.label',
    className: 'lg:col-span-2 md:col-span-2 md:row-span-1',
    imgClassName: '',
    titleClassName: 'justify-start',
    img: '/bento-grid-v1.webp',
    spareImg: '/b4.svg'
  },
  {
    id: 5,
    titleKey: 'items.focus.title',
    descriptionKey: 'items.focus.label',
    className: 'lg:col-span-3 md:col-span-3 md:row-span-2',
    imgClassName: 'absolute right-0 bottom-0 md:w-96 w-60',
    titleClassName: 'justify-center md:justify-start lg:justify-center',
    img: '/undraw_code-review_jdgp.svg',
    spareImg: '/bento-grid-v1.webp'
  },
  {
    id: 6,
    titleKey: 'items.contact.title',
    descriptionKey: 'items.contact.label',
    className: 'lg:col-span-2 md:col-span-2 md:row-span-1',
    imgClassName: '',
    titleClassName: 'justify-center md:max-w-full max-w-60 text-center',
    img: '',
    spareImg: ''
  }
] as const;

export const projects = [
  {
    id: 1,
    titleKey: 'items.bookPortfolio.title',
    desKey: 'items.bookPortfolio.description',
    img: '/p1.jpg',
    iconLists: [
      '/tech-icons/react.svg',
      '/tech-icons/vitejs.svg',
      '/tech-icons/typescript.svg',
      '/tech-icons/javascript.svg',
      '/tech-icons/html5.svg'
    ],
    link: 'https://neon-crostata-31e281.netlify.app/',
    visitLinks: [],
    sourceCode: 'https://github.com/NureBohdanIlienko/vl-vite-book-portfolio',
    sourceOptions: []
  },
  {
    id: 2,
    titleKey: 'items.rixLogger.title',
    desKey: 'items.rixLogger.description',
    img: '/p3.jpg',
    imgPosition: 'top',
    iconLists: [
      '/tech-icons/react.svg',
      '/tech-icons/typescript.svg',
      '/tech-icons/nestjs.svg',
      '/tech-icons/postgresql.svg',
      '/tech-icons/docker.svg'
    ],
    link: 'https://t.me/rix_logger_bot',
    visitLinks: [
      {
        labelKey: 'labels.visitBot',
        href: 'https://t.me/rix_logger_bot'
      }
    ],
    sourceCode: 'https://github.com/bohdan-ilienko-work/rix-logger',
    sourceOptions: [
      {
        labelKey: 'labels.apiRepository',
        href: 'https://github.com/bohdan-ilienko-work/rix-logger'
      },
      {
        labelKey: 'labels.miniappRepository',
        href: 'https://github.com/bohdan-ilienko-work/rix-logger-miniapp'
      }
    ]
  },
  {
    id: 3,
    titleKey: 'items.ticketing.title',
    desKey: 'items.ticketing.description',
    img: '/p2.jpg',
    iconLists: [
      '/tech-icons/nodejs.svg',
      '/tech-icons/typescript.svg',
      '/tech-icons/express.svg',
      '/tech-icons/jsonwebtokens.svg',
      '/tech-icons/mongodb.svg',
      '/tech-icons/docker.svg'
    ],
    link: 'https://github.com/NureBohdanIlienko/ticketing/tree/master',
    visitLinks: [],
    sourceCode: 'https://github.com/NureBohdanIlienko/ticketing/tree/master',
    sourceOptions: []
  },
  {
    id: 4,
    titleKey: 'items.pharmacyApi.title',
    desKey: 'items.pharmacyApi.description',
    img: '/p4.jpg',
    iconLists: [
      '/tech-icons/nestjs.svg',
      '/tech-icons/nodejs.svg',
      '/tech-icons/microsoftsqlserver.svg',
      '/tech-icons/jsonwebtokens.svg',
      '/tech-icons/swagger.svg'
    ],
    link: 'https://github.com/NureBohdanIlienko/apteka-api',
    visitLinks: [],
    sourceCode: 'https://github.com/NureBohdanIlienko/apteka-api',
    sourceOptions: []
  }
] as const;

export const testimonials = [
  {
    quoteKey: 'items.artadian.quote',
    nameKey: 'items.artadian.name',
    titleKey: 'items.artadian.title'
  },
  {
    quoteKey: 'items.backendDelivery.quote',
    nameKey: 'items.backendDelivery.name',
    titleKey: 'items.backendDelivery.title'
  },
  {
    quoteKey: 'items.performance.quote',
    nameKey: 'items.performance.name',
    titleKey: 'items.performance.title'
  },
  {
    quoteKey: 'items.process.quote',
    nameKey: 'items.process.name',
    titleKey: 'items.process.title'
  }
] as const;

export const companies = [
  {
    id: 1,
    name: 'cloudinary',
    img: '/cloud.svg',
    nameImg: '/cloudName.svg'
  },
  {
    id: 2,
    name: 'appwrite',
    img: '/app.svg',
    nameImg: '/appName.svg'
  },
  {
    id: 3,
    name: 'HOSTINGER',
    img: '/host.svg',
    nameImg: '/hostName.svg'
  },
  {
    id: 4,
    name: 'stream',
    img: '/s.svg',
    nameImg: '/streamName.svg'
  },
  {
    id: 5,
    name: 'docker.',
    img: '/dock.svg',
    nameImg: '/dockerName.svg'
  }
] as const;

export const workExperience = [
  {
    id: 1,
    titleKey: 'items.artadian.title',
    descKey: 'items.artadian.description',
    className: 'md:col-span-2',
    thumbnail: '/exp1.svg'
  },
  {
    id: 2,
    titleKey: 'items.silinexx.title',
    descKey: 'items.silinexx.description',
    className: 'md:col-span-2',
    thumbnail: '/exp2.svg'
  },
  {
    id: 3,
    titleKey: 'items.wnet.title',
    descKey: 'items.wnet.description',
    className: 'md:col-span-2',
    thumbnail: '/experience-wnet-v1.webp'
  }
] as const;

export const educationItems = [
  {
    id: 1,
    titleKey: 'education.items.bachelor.title',
    institutionKey: 'education.items.bachelor.institution',
    degreeKey: 'education.items.bachelor.degree',
    periodKey: 'education.items.bachelor.period',
    descriptionKey: 'education.items.bachelor.description',
    image: '/diploma.jpg',
    link: '/diploma.jpg',
    ctaLabelKey: 'education.items.bachelor.cta'
  },
  {
    id: 2,
    titleKey: 'education.items.udemy.title',
    institutionKey: 'education.items.udemy.institution',
    degreeKey: 'education.items.udemy.degree',
    periodKey: 'education.items.udemy.period',
    descriptionKey: 'education.items.udemy.description',
    image: '/udemy-certificate.jpg',
    link: '/udemy-certificate.jpg',
    ctaLabelKey: 'education.items.udemy.cta'
  }
] as const;

export const socialMedia = [
  {
    nameKey: 'social.telegram',
    img: '/tg.svg',
    link: links.ownerTelegram
  },
  {
    nameKey: 'social.github',
    img: '/git.svg',
    link: links.ownerGithub
  },
  {
    nameKey: 'social.instagram',
    img: '/insta.svg',
    link: links.ownerInsta
  },
  {
    nameKey: 'social.linkedin',
    img: '/link.svg',
    link: links.ownerLinkedin
  }
] as const;

export const techStack = {
  stack1: [
    {
      name: 'TypeScript',
      icon: '/tech-icons/typescript.svg'
    },
    {
      name: 'JavaScript',
      icon: '/tech-icons/javascript.svg'
    },
    {
      name: 'Node.js',
      icon: '/tech-icons/nodejs.svg'
    },
    {
      name: 'NestJS',
      icon: '/tech-icons/nestjs.svg'
    },
    {
      name: 'Express.js',
      icon: '/tech-icons/express.svg'
    }
  ],
  stack2: [
    {
      name: 'React',
      icon: '/tech-icons/react.svg'
    },
    {
      name: 'Next.js',
      icon: '/tech-icons/nextjs.svg'
    },
    {
      name: 'React Native',
      icon: '/tech-icons/react.svg'
    },
    {
      name: 'Redux Toolkit',
      icon: '/tech-icons/redux.svg'
    },
    {
      name: 'Tailwind CSS',
      icon: '/tech-icons/tailwindcss.svg'
    }
  ],
  stack3: [
    {
      name: 'PostgreSQL',
      icon: '/tech-icons/postgresql.svg'
    },
    {
      name: 'MongoDB',
      icon: '/tech-icons/mongodb.svg'
    },
    {
      name: 'Redis',
      icon: '/tech-icons/redis.svg'
    },
    {
      name: 'Docker',
      icon: '/tech-icons/docker.svg'
    },
    {
      name: 'Kubernetes',
      icon: '/tech-icons/kubernetes.svg'
    }
  ],
  stack4: [
    {
      name: 'GitHub Actions',
      icon: '/tech-icons/githubactions.svg'
    },
    {
      name: 'RabbitMQ',
      icon: '/tech-icons/rabbitmq.svg'
    },
    {
      name: 'Kafka',
      icon: '/tech-icons/apachekafka.svg'
    },
    {
      name: 'GraphQL',
      icon: '/tech-icons/graphql.svg'
    },
    {
      name: 'WebSockets',
      icon: '/tech-icons/socketdotio.svg'
    }
  ]
} as const;
