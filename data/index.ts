import {links} from '@/config';

export const navItems = [
  {nameKey: 'nav.about', link: '#about'},
  {nameKey: 'nav.experience', link: '#experience'},
  {nameKey: 'nav.education', link: '#education'},
  {nameKey: 'nav.cv', link: '#cv'},
  {nameKey: 'nav.projects', link: '#projects'},
  {nameKey: 'nav.highlights', link: '#testimonials'},
  {nameKey: 'nav.approach', link: '#approach'},
  {nameKey: 'nav.contact', link: '#contact'}
] as const;

export const gridItems = [
  {
    id: 1,
    titleKey: 'items.summary.title',
    descriptionKey: 'items.summary.label',
    className: 'lg:col-span-3 md:col-span-3 md:row-span-2 lg:min-h-[30vh]',
    imgClassName: 'w-full h-full',
    titleClassName: 'justify-end',
    img: '/b1.svg',
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
    img: '/grid.svg',
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
    spareImg: '/grid.svg'
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
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'
    ],
    link: 'https://neon-crostata-31e281.netlify.app/',
    visitLinks: [],
    sourceCode: 'https://github.com/NureBohdanIlienko/vl-vite-book-portfolio',
    sourceOptions: []
  },
  {
    id: 2,
    titleKey: 'items.skillHub.title',
    desKey: 'items.skillHub.description',
    img: '/p3.svg',
    iconLists: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'
    ],
    link: 'https://github.com/NureBohdanIlienko/skillhub-client',
    visitLinks: [
      {
        labelKey: 'labels.visitClient',
        href: 'https://github.com/NureBohdanIlienko/avpz-client'
      },
      {
        labelKey: 'labels.visitBackend',
        href: 'https://github.com/NureBohdanIlienko/avpz-mono-api'
      }
    ],
    sourceCode: 'https://github.com/NureBohdanIlienko/avpz-client',
    sourceOptions: [
      {
        labelKey: 'labels.clientRepository',
        href: 'https://github.com/NureBohdanIlienko/avpz-client'
      },
      {
        labelKey: 'labels.apiRepository',
        href: 'https://github.com/NureBohdanIlienko/avpz-mono-api'
      }
    ]
  },
  {
    id: 3,
    titleKey: 'items.ticketing.title',
    desKey: 'items.ticketing.description',
    img: '/p2.jpg',
    iconLists: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      'https://cdn.simpleicons.org/express/ffffff',
      'https://cdn.simpleicons.org/jsonwebtokens/ffffff',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'
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
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg',
      'https://cdn.simpleicons.org/jsonwebtokens/ffffff',
      'https://cdn.simpleicons.org/swagger/85ea2d'
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
    thumbnail: '/exp3.svg'
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
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'
    },
    {
      name: 'JavaScript',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
    },
    {
      name: 'Node.js',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'
    },
    {
      name: 'NestJS',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg'
    },
    {
      name: 'Express.js',
      icon: 'https://cdn.simpleicons.org/express/ffffff'
    }
  ],
  stack2: [
    {
      name: 'React',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'
    },
    {
      name: 'Next.js',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg'
    },
    {
      name: 'React Native',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'
    },
    {
      name: 'Redux Toolkit',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg'
    },
    {
      name: 'Tailwind CSS',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg'
    }
  ],
  stack3: [
    {
      name: 'PostgreSQL',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'
    },
    {
      name: 'MongoDB',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg'
    },
    {
      name: 'Redis',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg'
    },
    {
      name: 'Docker',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'
    },
    {
      name: 'Kubernetes',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg'
    }
  ],
  stack4: [
    {
      name: 'GitHub Actions',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-original.svg'
    },
    {
      name: 'RabbitMQ',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rabbitmq/rabbitmq-original.svg'
    },
    {
      name: 'Kafka',
      icon: 'https://cdn.simpleicons.org/apachekafka/ffffff'
    },
    {
      name: 'GraphQL',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg'
    },
    {
      name: 'WebSockets',
      icon: 'https://cdn.simpleicons.org/socketdotio/ffffff'
    }
  ]
} as const;
