// Wire contract between the streaming chat route (app/api/chat/route.ts) and the chat UI (components/chat).
// Types and id lists only, so both sides can import it. Everything the model may name (cards, sections)
// is an id from the lists below and is validated against them before it reaches the UI.

export const SECTION_IDS = [
  'about',
  'experience',
  'education',
  'cv',
  'projects',
  'highlights',
  'approach',
  'contact'
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Page anchors, the same ones navItems in data/index.ts links to. */
export const SECTION_ANCHORS: Record<SectionId, string> = {
  about: '#about',
  experience: '#experience',
  education: '#education',
  cv: '#cv',
  projects: '#projects',
  highlights: '#testimonials',
  approach: '#approach',
  contact: '#contact'
};

export const PROJECT_IDS = ['book-portfolio', 'rix-logger', 'ticketing', 'pharmacy-api'] as const;
export const EXPERIENCE_IDS = ['artadian', 'silinexx', 'wnet'] as const;
/** The four groups of `techStack` in data/index.ts: stack1 -> core, stack2 -> frontend, stack3 -> data, stack4 -> delivery. */
export const STACK_IDS = ['core', 'frontend', 'data', 'delivery'] as const;

export type ProjectId = (typeof PROJECT_IDS)[number];
export type ExperienceId = (typeof EXPERIENCE_IDS)[number];
export type StackId = (typeof STACK_IDS)[number];

/** A rich block the UI renders under an answer. Content comes from the site's own data, never from the model. */
export type CardRef =
  | { kind: 'project'; id: ProjectId }
  | { kind: 'experience'; id: ExperienceId }
  | { kind: 'stack'; id: StackId }
  | { kind: 'contact' }
  | { kind: 'cv' };

const includes = <T extends readonly string[]>(list: T, value: string): value is T[number] =>
  (list as readonly string[]).includes(value);

/** Token form the model writes in its META line: "project:rix-logger", "experience:artadian", "stack:core", "contact", "cv". */
export const parseCardToken = (token: string): CardRef | null => {
  const [kind, id] = token.trim().toLowerCase().split(':');

  if (kind === 'contact' && !id) return { kind: 'contact' };
  if (kind === 'cv' && !id) return { kind: 'cv' };
  if (kind === 'project' && id && includes(PROJECT_IDS, id)) return { kind: 'project', id };
  if (kind === 'experience' && id && includes(EXPERIENCE_IDS, id)) return { kind: 'experience', id };
  if (kind === 'stack' && id && includes(STACK_IDS, id)) return { kind: 'stack', id };

  return null;
};

export const cardToken = (card: CardRef): string =>
  card.kind === 'contact' || card.kind === 'cv' ? card.kind : `${card.kind}:${card.id}`;

export const isSectionId = (value: string): value is SectionId => includes(SECTION_IDS, value);

/** What the user was after, when the model can tell: drives the contact card with the "send a request" action. */
export type ChatIntent = 'contact' | 'resume';

export type ChatMeta = {
  /** 0-2 cards, validated against the id lists above. */
  cards: CardRef[];
  /** 0-3 short follow-up questions, in the user's language, phrased as the user would ask them. */
  followUps: string[];
  /** Page sections the answer drew on, in order of relevance (0-3). */
  sources: SectionId[];
  intent: ChatIntent | null;
};

export type ChatHistoryEntry = { role: 'user' | 'assistant'; content: string };

export type ChatScenario = {
  categoryId: string;
  categoryLabel: string;
  topicId: string | null;
  topicLabel: string | null;
};

/** POST /api/chat body. */
export type ChatRequest = {
  question: string;
  history: ChatHistoryEntry[];
  /** UI locale (en, uk, ru, pl, de, es, bg): the language to answer in when the question itself is ambiguous. */
  locale: string;
  scenario?: ChatScenario | null;
};

/** The client maps the code to a localized message. The server never sends provider error text. */
export type ChatErrorCode = 'bad_request' | 'rate_limited' | 'unavailable';

/**
 * POST /api/chat response: text/event-stream, one `data: <JSON of ChatStreamEvent>\n\n` frame per event.
 * Order: status(retrieve), status(write), delta*, meta, done. `error` can replace anything after the first frame
 * and is terminal. `meta` is always sent before `done` (empty when the model gave none).
 */
export type ChatStreamEvent =
  | { t: 'status'; step: 'retrieve' | 'write' }
  | { t: 'delta'; text: string }
  | { t: 'meta'; meta: ChatMeta }
  | { t: 'done' }
  | { t: 'error'; code: ChatErrorCode };

/** Delimiter between the visible answer and the machine-readable line the model appends. The server strips it. */
export const META_DELIMITER = '<<<META>>>';

export const CHAT_LIMITS = {
  questionMaxChars: 1000,
  historyMaxEntries: 10,
  historyEntryMaxChars: 1500,
  followUpMaxChars: 90,
  maxCards: 2,
  maxFollowUps: 3,
  maxSources: 3
} as const;
