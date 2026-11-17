import {
  CHAT_LIMITS,
  isSectionId,
  parseCardToken,
  type CardRef,
  type ChatIntent,
  type ChatMeta,
  type SectionId
} from '@/lib/chat/protocol';

// The model writes the visible answer, then META_DELIMITER and one line of JSON. This file turns that raw text stream
// into (a) visible text that is safe to show while it streams and (b) a validated ChatMeta.

export const emptyChatMeta = (): ChatMeta => ({ cards: [], followUps: [], sources: [], intent: null });

// The em dash is the best-known tell of machine-written text and the voice guide bans it, but models still write it,
// Russian and Ukrainian "X — Y" definitions above all. A comma keeps the sentence readable. A dash can only reach a
// delta together with the whitespace before it (the splitter holds whitespace back), so a per-delta replace is safe.
// The en dash turns up in ranges ("Sept–Nov", "2021–2025"), where a hyphen reads the same, and rarely spaced like an em dash.
const softenDashes = (text: string) =>
  text
    .replace(/\s*—(?=\S)/g, ', ')
    .replace(/\s*—/g, ',')
    .replace(/\s+–\s+/g, ', ')
    .replace(/–/g, '-');

// <<<META>>> as the prompt spells it, plus the sloppy forms models produce: other bracket counts and kinds, spaces, any
// case. Two openers or two closers are required, so a lone <meta> or «quote» stays text. The lookbehind lets a match
// start only at the head of a run of openers: without it a long run of "<" is rescanned from every position (cubic
// over a stream).
const DELIMITER = /(?<![<[«])(?:[<[«]{2,}\s*META\s*[>\]»]+|[<[«]+\s*META\s*[>\]»]{2,})/i;
// A tail of the text that may still grow into the delimiter, so it must not be shown yet ("<<<ME").
const DELIMITER_PREFIX = /(?<![<[«])[<[«]+\s*(?:M(?:E(?:T(?:A\s*[>\]»]*)?)?)?)?$/i;
const DELIMITER_PREFIX_ONLY = new RegExp(`^${DELIMITER_PREFIX.source}`, 'i');
const NAKED_META_KEYS = ['cards', 'followups', 'sources', 'intent'];

/**
 * True while `region` (which starts at a line start) is, or can still grow into, the meta JSON written without the
 * delimiter, or the delimiter itself behind a code fence. Optionally fenced. Decided on the first few characters,
 * so ordinary text is released fast.
 */
const mayBeNakedMeta = (region: string) => {
  const text = region.trimStart().replace(/^`{1,3}[a-z]*\s*/i, '');

  if (!text || DELIMITER_PREFIX_ONLY.test(text)) return true;
  if (text[0] !== '{') return false;

  const rest = text.slice(1).trimStart();

  if (!rest) return true;
  if (rest[0] !== '"') return false;

  const key = rest.slice(1).toLowerCase().replace(/[_-]/g, '');

  return NAKED_META_KEYS.some((name) => `${name}"`.startsWith(key) || key.startsWith(`${name}"`));
};

const nakedMetaStart = (buffer: string, emitted: number) => {
  let offset = 0;

  for (const line of buffer.split('\n')) {
    // Trailing whitespace is always held back, so the first line of a non-empty buffer continues emitted text.
    const atLineStart = offset > 0 || emitted === 0;
    const first = line.trimStart()[0];

    if (atLineStart && (first === '{' || first === '`') && mayBeNakedMeta(buffer.slice(offset))) return offset;

    offset += line.length + 1;
  }

  return -1;
};

/** Index up to which the buffered text can be shown now. */
const safeCut = (buffer: string, emitted: number) => {
  let cut = buffer.length;

  const partial = DELIMITER_PREFIX.exec(buffer);

  if (partial) cut = partial.index;

  const naked = nakedMetaStart(buffer, emitted);

  if (naked !== -1) cut = Math.min(cut, naked);

  // Whitespace stays in the buffer until text follows it, so an answer never streams out with a trailing blank line.
  while (cut > 0 && /\s/.test(buffer[cut - 1])) cut -= 1;

  // A dash at the end waits for the next character, so softenDashes can tell "— word" from "—word" and "a – b" from "1–2".
  if (buffer[cut - 1] === '—' || buffer[cut - 1] === '–') {
    cut -= 1;

    while (cut > 0 && /\s/.test(buffer[cut - 1])) cut -= 1;
  }

  return cut;
};

const stripTrailingFence = (text: string) => text.replace(/\n?[ \t]*`{3}[a-z]*[ \t]*\s*$/i, '');

export type MetaSplitter = {
  /** Feed one raw model chunk. `visible` is what can be shown right now ('' while text is held back). */
  push: (chunk: string) => { visible: string };
  /** Call once when the model stream ends: the held-back visible tail and the raw meta text ('' when there was none). */
  end: () => { visible: string; meta: string };
};

/**
 * Splits the streamed model text at the META delimiter. Handles a delimiter cut across chunks, never lets a partial
 * delimiter or the JSON line into the visible text, and when the model forgot the delimiter treats a trailing
 * meta-shaped JSON line (also fenced) as meta. Anything else stays visible.
 */
export const createMetaSplitter = (): MetaSplitter => {
  let buffer = '';
  let emitted = 0;
  let meta: string | null = null;

  return {
    push(chunk) {
      if (meta !== null) {
        meta += chunk;
        return { visible: '' };
      }

      buffer += chunk;

      if (emitted === 0) buffer = buffer.trimStart();

      const found = DELIMITER.exec(buffer);

      if (found) {
        meta = buffer.slice(found.index + found[0].length);

        const visible = stripTrailingFence(buffer.slice(0, found.index)).trimEnd();

        buffer = '';
        emitted += visible.length;

        return { visible: softenDashes(visible) };
      }

      const cut = safeCut(buffer, emitted);
      const visible = buffer.slice(0, cut);

      buffer = buffer.slice(cut);
      emitted += visible.length;

      return { visible: softenDashes(visible) };
    },

    end() {
      if (meta !== null) return { visible: '', meta };

      let visible = buffer;
      let rest = '';
      const naked = nakedMetaStart(buffer, emitted);

      if (naked !== -1) {
        visible = buffer.slice(0, naked);
        rest = buffer.slice(naked);
      }

      // A cut-off "<<<ME" at the very end is never part of the answer.
      const partial = DELIMITER_PREFIX.exec(visible);

      if (partial && partial[0].trim().length >= 2) visible = visible.slice(0, partial.index);

      buffer = '';

      return { visible: softenDashes(visible.trimEnd()), meta: rest };
    }
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** First balanced {...} in the text, string-aware, so fences, labels and trailing chatter around it are ignored. */
const extractJsonObject = (raw: string) => {
  const start = raw.indexOf('{');

  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < raw.length; index += 1) {
    const char = raw[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;

      if (depth === 0) return raw.slice(start, index + 1);
    }
  }

  return null;
};

const parseJsonLoose = (json: string): unknown => {
  try {
    return JSON.parse(json);
  } catch {
    try {
      return JSON.parse(json.replace(/,\s*([}\]])/g, '$1'));
    } catch {
      return null;
    }
  }
};

// Straight and curly quotes and guillemets: what a model puts around a string when it breaks the JSON.
const QUOTE_CHARS = '"\'“”‘’«»';
const QUOTE = `[${QUOTE_CHARS}]`;
// A meta line is about 300 characters; the salvage regexes below are not linear, so a rambling tail is cut short.
const SALVAGE_MAX_CHARS = 2000;

const salvageList = (raw: string, key: string): string[] | null => {
  const head = new RegExp(`${QUOTE}?${key}${QUOTE}?\\s*:\\s*(\\[|${QUOTE})`, 'i').exec(raw);

  if (!head) return null;

  const rest = raw.slice(head.index + head[0].length);

  // "key": "one string" instead of a list.
  if (head[1] !== '[') return [rest.split(new RegExp(QUOTE))[0]];

  const end = rest.search(/\]\s*(?:,|\}|$)/);
  const body = end === -1 ? rest : rest.slice(0, end);
  const item = new RegExp(`${QUOTE}([\\s\\S]*?)${QUOTE}(?=\\s*(?:,|$))`, 'g');
  const items: string[] = [];

  for (let match = item.exec(body); match; match = item.exec(body)) items.push(match[1]);

  return items;
};

/**
 * The last resort for a meta line that is not valid JSON (cut off, unescaped quotes inside a follow-up, single or
 * curly quotes, a missing comma): each known field is lifted out on its own and goes through the same normalizers as
 * parsed JSON, so the id lists and caps still apply.
 */
const salvageMeta = (raw: string): Record<string, unknown> | null => {
  const text = raw.slice(0, SALVAGE_MAX_CHARS);
  const intent = new RegExp(`intent${QUOTE}?\\s*:\\s*${QUOTE}([^${QUOTE_CHARS}]*)${QUOTE}`, 'i').exec(text)?.[1] ?? null;
  const found = {
    cards: salvageList(text, 'cards'),
    followUps: salvageList(text, 'follow_?ups'),
    sources: salvageList(text, 'sources'),
    intent
  };

  return found.cards || found.followUps || found.sources || found.intent ? found : null;
};

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : value == null ? [] : [value]);

const toCard = (item: unknown): CardRef | null => {
  let token: string | null = null;

  if (typeof item === 'string') {
    token = item;
  } else if (isRecord(item) && typeof item.kind === 'string') {
    token = typeof item.id === 'string' && item.id ? `${item.kind}:${item.id}` : item.kind;
  }

  if (!token) return null;

  return parseCardToken(token.trim().toLowerCase().replace(/\s*:\s*/g, ':').replace(/[\s_]+/g, '-'));
};

const normalizeCards = (value: unknown): CardRef[] => {
  const cards: CardRef[] = [];

  for (const item of toArray(value)) {
    const card = toCard(item);

    if (!card) continue;

    const duplicate = cards.some(
      (existing) => existing.kind === card.kind && ('id' in existing ? 'id' in card && existing.id === card.id : true)
    );

    if (!duplicate) cards.push(card);
    if (cards.length === CHAT_LIMITS.maxCards) break;
  }

  return cards;
};

const SOURCE_ALIASES: Record<string, SectionId> = {
  testimonials: 'highlights',
  resume: 'cv',
  work: 'experience',
  skills: 'about',
  stack: 'about'
};

const normalizeSources = (value: unknown): SectionId[] => {
  const sources: SectionId[] = [];

  for (const item of toArray(value)) {
    if (typeof item !== 'string') continue;

    const key = item.trim().toLowerCase().replace(/^#/, '');
    const id = isSectionId(key) ? key : SOURCE_ALIASES[key];

    if (id && !sources.includes(id)) sources.push(id);
    if (sources.length === CHAT_LIMITS.maxSources) break;
  }

  return sources;
};

// Control characters, zero-width and line/paragraph separators, written as code points on purpose: literal ones in a
// regex are invisible in review and U+2028 breaks the literal.
const stripInvisible = (text: string) =>
  Array.from(text, (char) => {
    const code = char.charCodeAt(0);
    const invisible =
      code < 32 || code === 127 || (code >= 0x200b && code <= 0x200f) || code === 0x2028 || code === 0x2029 || code === 0xfeff;

    return invisible ? ' ' : char;
  }).join('');

const cleanFollowUp = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;

  let text = stripInvisible(value)
    .replace(/\s*—\s*/g, ', ')
    .replace(/(?<=\S)\s*–\s*(?=\S)/g, ', ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(^|\s)[*_~`#>]+|[*_~`]+(?=\s|$)/g, '$1')
    .replace(/^\s*(?:[-•–]|\d+[.)])\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["'“”«»„]+|["'“”«»„]+$/g, '')
    .trim();

  if (text.length < 3 || /https?:\/\/|www\./i.test(text)) return null;

  if (text.length > CHAT_LIMITS.followUpMaxChars) {
    const cut = text.slice(0, CHAT_LIMITS.followUpMaxChars);
    const lastSpace = cut.lastIndexOf(' ');

    text = (lastSpace > CHAT_LIMITS.followUpMaxChars / 2 ? cut.slice(0, lastSpace) : cut).trim();
  }

  return text;
};

// The voice guide caps a chip at 7 words and models count words badly, so the cap is enforced here: a longer one is
// kept only when dropping it would leave fewer than two chips.
const FOLLOW_UP_MAX_WORDS = 7;

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const normalizeFollowUps = (value: unknown): string[] => {
  const short: string[] = [];
  const long: string[] = [];

  for (const item of toArray(value).slice(0, 8)) {
    const text = cleanFollowUp(item);

    if (!text || [...short, ...long].some((existing) => existing.toLowerCase() === text.toLowerCase())) continue;

    (wordCount(text) <= FOLLOW_UP_MAX_WORDS ? short : long).push(text);
  }

  return [...short, ...long.slice(0, Math.max(0, 2 - short.length))].slice(0, CHAT_LIMITS.maxFollowUps);
};

const normalizeIntent = (value: unknown): ChatIntent | null => {
  if (typeof value !== 'string') return null;

  const intent = value.trim().toLowerCase();

  if (intent === 'contact') return 'contact';
  if (intent === 'resume' || intent === 'cv') return 'resume';

  return null;
};

/**
 * Raw text after the delimiter -> validated ChatMeta. Tolerates code fences, labels and trailing text around the
 * JSON, trailing commas, a {"meta": {...}} wrapper and key spelling (followUps / follow_ups); JSON that does not parse
 * is read field by field. Text with nothing usable gives the empty meta; unknown ids are dropped and caps from
 * CHAT_LIMITS apply.
 */
export const parseChatMeta = (raw: string): ChatMeta => {
  const json = extractJsonObject(raw);
  const parsed = json ? parseJsonLoose(json) : null;
  const data = isRecord(parsed) && isRecord(parsed.meta) ? parsed.meta : (parsed ?? salvageMeta(raw));

  if (!isRecord(data)) return emptyChatMeta();

  const fields = Object.fromEntries(Object.entries(data).map(([key, value]) => [key.toLowerCase().replace(/[^a-z]/g, ''), value]));

  return {
    cards: normalizeCards(fields.cards),
    followUps: normalizeFollowUps(fields.followups),
    sources: normalizeSources(fields.sources),
    intent: normalizeIntent(fields.intent)
  };
};
