import { links } from '@/config';
import { projects, techStack, workExperience } from '@/data';
import { cardToken } from '@/lib/chat/protocol';
import type { CardRef, ExperienceId, ProjectId, StackId } from '@/lib/chat/protocol';

// Maps the card ids the model may name to the site's own content (data/index.ts, config/index.ts) and derives the
// display values the cards need. Pure functions only: every string the visitor reads is either i18n (looked up by
// key in the component) or taken verbatim from the site data. Card ids resolve through the i18n title key, so
// reordering the arrays in data/index.ts cannot attach a card to the wrong project.

/* Projects */

export type ProjectCardData = {
  id: ProjectId;
  /** Keys of the `projects` namespace. */
  titleKey: string;
  descriptionKey: string;
  image: string;
  imagePosition: 'top' | 'center';
  tech: string[];
  /** Live link. `labelKey` (a `projects` key) is set when the project has its own wording, e.g. "Open Bot". */
  live: { href: string; labelKey: string | null } | null;
  source: { href: string } | null;
};

const PROJECT_TITLE_KEYS: Record<ProjectId, string> = {
  'book-portfolio': 'items.bookPortfolio.title',
  'rix-logger': 'items.rixLogger.title',
  ticketing: 'items.ticketing.title',
  'pharmacy-api': 'items.pharmacyApi.title'
};

const ICON_SLUG_PATTERNS = [/\/devicon\/icons\/([^/?#]+)\//i, /simpleicons\.org\/([^/?#]+)/i];

// Slugs that techStack does not list, so there is no name to borrow from the data.
const EXTRA_TECH_NAMES: Record<string, string> = {
  vitejs: 'Vite',
  html5: 'HTML5',
  jsonwebtokens: 'JWT',
  microsoftsqlserver: 'MS SQL',
  swagger: 'Swagger'
};

export const iconSlug = (iconUrl: string): string | null => {
  for (const pattern of ICON_SLUG_PATTERNS) {
    const match = pattern.exec(iconUrl);
    if (match) return match[1].toLowerCase();
  }

  return null;
};

// techStack names win (first entry per icon, so "React" and not "React Native" for the shared React icon).
const TECH_NAMES_BY_SLUG: ReadonlyMap<string, string> = (() => {
  const names = new Map<string, string>();

  for (const group of Object.values(techStack)) {
    for (const item of group) {
      const slug = iconSlug(item.icon);
      if (slug && !names.has(slug)) names.set(slug, item.name);
    }
  }

  return names;
})();

/** ".../icons/nestjs/nestjs-original.svg" -> "NestJS". Null when the URL is not a known icon URL. */
export const deriveTechName = (iconUrl: string): string | null => {
  const slug = iconSlug(iconUrl);
  if (!slug) return null;

  return (
    TECH_NAMES_BY_SLUG.get(slug) ?? EXTRA_TECH_NAMES[slug] ?? `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`
  );
};

const uniqueTechNames = (iconUrls: readonly string[]): string[] => {
  const names: string[] = [];

  for (const url of iconUrls) {
    const name = deriveTechName(url);
    if (name && !names.includes(name)) names.push(name);
  }

  return names;
};

export const resolveProject = (id: ProjectId): ProjectCardData | null => {
  const project = projects.find((item) => item.titleKey === PROJECT_TITLE_KEYS[id]);
  if (!project) return null;

  const visitLinks: ReadonlyArray<{ labelKey: string; href: string }> = project.visitLinks;
  const visit = visitLinks.length > 0 ? visitLinks[0] : null;
  const liveHref = visit?.href ?? project.link;
  const sourceHref = project.sourceCode;

  return {
    id,
    titleKey: project.titleKey,
    descriptionKey: project.desKey,
    image: project.img,
    imagePosition: 'imgPosition' in project && project.imgPosition === 'top' ? 'top' : 'center',
    tech: uniqueTechNames(project.iconLists),
    // Two of the projects only have a repository: it is their "link" too, so it is offered once, as the source.
    live: liveHref && liveHref !== sourceHref ? { href: liveHref, labelKey: visit?.labelKey ?? null } : null,
    source: sourceHref ? { href: sourceHref } : null
  };
};

/* Experience */

export type ExperienceCardData = {
  id: ExperienceId;
  /** Keys of the `experience` namespace. */
  titleKey: string;
  descriptionKey: string;
};

const EXPERIENCE_TITLE_KEYS: Record<ExperienceId, string> = {
  artadian: 'items.artadian.title',
  silinexx: 'items.silinexx.title',
  wnet: 'items.wnet.title'
};

export const resolveExperience = (id: ExperienceId): ExperienceCardData | null => {
  const item = workExperience.find((entry) => entry.titleKey === EXPERIENCE_TITLE_KEYS[id]);
  if (!item) return null;

  return { id, titleKey: item.titleKey, descriptionKey: item.descKey };
};

/** "Full Stack Developer, ARTADIAN GAMING LLP, Full Time" -> company first, role and type as the second line. */
export const parseExperienceTitle = (title: string): { company: string; details: string } => {
  const parts = title
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) return { company: title.trim(), details: '' };

  const [role, company, ...rest] = parts;

  return { company, details: [role, ...rest].join(' \u00b7 ') };
};

export const companyInitial = (company: string): string => {
  const [first] = Array.from(company.trim());

  return first ? first.toLocaleUpperCase() : '';
};

/** "Feb 2025 - Present (middle dot) TypeScript/Node.js services..." -> { period, scope }. Without the separator all of it is scope. */
export const splitExperienceDescription = (description: string): { period: string; scope: string } => {
  const separator = description.indexOf('\u00b7');
  if (separator < 0) return { period: '', scope: description.trim() };

  return {
    period: description.slice(0, separator).trim(),
    scope: description.slice(separator + 1).trim()
  };
};

const MONTH_PREFIXES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const monthFormatters = new Map<string, Intl.DateTimeFormat>();

const monthFormatter = (locale: string, width: 'short' | 'long'): Intl.DateTimeFormat => {
  const key = `${locale}|${width}`;
  let formatter = monthFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { month: width, year: 'numeric', timeZone: 'UTC' });
    monthFormatters.set(key, formatter);
  }

  return formatter;
};

// The month is read out of a "month + year" pattern, and a numeric result is skipped (CLDR has "02" for a short
// Bulgarian month), so the name is the short one where it is a word, the long one otherwise, or null.
const monthName = (locale: string, monthIndex: number): string | null => {
  try {
    const date = new Date(Date.UTC(2000, monthIndex, 1));

    for (const width of ['short', 'long'] as const) {
      const month = monthFormatter(locale, width)
        .formatToParts(date)
        .find((part) => part.type === 'month');

      if (month && !/^[\d.\s]*$/.test(month.value)) return month.value;
    }
  } catch {
    // An unknown locale tag: fall back to the month as written in the data.
  }

  return null;
};

const formatPeriodPart = (part: string, locale: string, presentLabel: string): string => {
  if (/^present$/i.test(part)) return presentLabel;

  const match = /^([A-Za-z]{3,9})\.?\s+(\d{4})$/.exec(part);
  if (!match) return part;

  const monthIndex = MONTH_PREFIXES.indexOf(match[1].slice(0, 3).toLowerCase());
  const name = monthIndex < 0 ? null : monthName(locale, monthIndex);

  return name ? `${name} ${match[2]}` : part;
};

/**
 * "Feb 2025 - Present" -> the locale's short month names, an en dash and the locale's "present". The site data keeps English month names and "Present" in every
 * locale; the card localizes both. Anything that does not look like "<Mon YYYY> - <Mon YYYY | Present>" is returned as is.
 */
export const formatExperiencePeriod = (period: string, locale: string, presentLabel: string): string => {
  const parts = period.split(/\s+[-\u2013\u2014]\s+/);
  if (parts.length !== 2) return period.replace(/\bpresent\b/i, presentLabel);

  return parts.map((part) => formatPeriodPart(part.trim(), locale, presentLabel)).join(' \u2013 ');
};

/* Stack */

export type StackCardData = { id: StackId; names: string[] };

const STACK_GROUPS = {
  core: 'stack1',
  frontend: 'stack2',
  data: 'stack3',
  delivery: 'stack4'
} as const satisfies Record<StackId, keyof typeof techStack>;

export const resolveStack = (id: StackId): StackCardData => ({
  id,
  names: techStack[STACK_GROUPS[id]].map((item) => item.name)
});

/* Contact and CV */

export type ContactChannelId = 'email' | 'telegram' | 'linkedin' | 'github';

export type ContactChannel = {
  id: ContactChannelId;
  href: string;
  /** What the row shows next to the label: the address or the handle, never the full URL. */
  value: string;
  external: boolean;
  /** Set for the channel that has a Copy button. */
  copyValue: string | null;
};

const lastPathSegment = (url: string): string => {
  try {
    const parsed = new URL(url);
    const segment = parsed.pathname.split('/').filter(Boolean).pop();

    return segment ? decodeURIComponent(segment) : parsed.host;
  } catch {
    return url;
  }
};

export const getContactChannels = (): ContactChannel[] => [
  {
    id: 'email',
    href: `mailto:${links.ownerEmail}`,
    value: links.ownerEmail,
    external: false,
    copyValue: links.ownerEmail
  },
  {
    id: 'telegram',
    href: links.ownerTelegram,
    value: `@${lastPathSegment(links.ownerTelegram)}`,
    external: true,
    copyValue: null
  },
  {
    id: 'linkedin',
    href: links.ownerLinkedin,
    value: lastPathSegment(links.ownerLinkedin),
    external: true,
    copyValue: null
  },
  {
    id: 'github',
    href: links.ownerGithub,
    value: lastPathSegment(links.ownerGithub),
    external: true,
    copyValue: null
  }
];

export type CvCardData = { fileHref: string; fileName: string; driveHref: string };

export const getCvCardData = (): CvCardData => {
  const rawName = links.ownerCvFile.split('/').filter(Boolean).pop() ?? links.ownerCvFile;
  let fileName = rawName;

  try {
    fileName = decodeURIComponent(rawName);
  } catch {
    // A malformed percent sequence: show the name as written.
  }

  return { fileHref: links.ownerCvFile, fileName, driveHref: links.ownerCvGoogle };
};

/* Resolution */

export type ResolvedCard =
  | { kind: 'project'; key: string; data: ProjectCardData }
  | { kind: 'experience'; key: string; data: ExperienceCardData }
  | { kind: 'stack'; key: string; data: StackCardData }
  | { kind: 'contact'; key: string }
  | { kind: 'cv'; key: string };

const resolveCard = (card: CardRef): ResolvedCard | null => {
  const key = cardToken(card);

  switch (card.kind) {
    case 'project': {
      const data = resolveProject(card.id);
      return data ? { kind: 'project', key, data } : null;
    }
    case 'experience': {
      const data = resolveExperience(card.id);
      return data ? { kind: 'experience', key, data } : null;
    }
    case 'stack':
      return { kind: 'stack', key, data: resolveStack(card.id) };
    case 'contact':
      return { kind: 'contact', key };
    case 'cv':
      return { kind: 'cv', key };
    default:
      return null;
  }
};

/**
 * Cards to render for a message: duplicates dropped, ids the site data does not know skipped (a conversation restored
 * from sessionStorage can outlive a data change), anything that is not a card ignored.
 */
export const resolveCards = (cards: readonly CardRef[] | null | undefined): ResolvedCard[] => {
  if (!Array.isArray(cards)) return [];

  const resolved: ResolvedCard[] = [];

  for (const card of cards) {
    if (!card || typeof card !== 'object') continue;

    const item = resolveCard(card);
    if (item && !resolved.some((entry) => entry.key === item.key)) resolved.push(item);
  }

  return resolved;
};
