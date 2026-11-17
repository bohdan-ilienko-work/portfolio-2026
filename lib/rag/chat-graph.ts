import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { ChatRequest, ChatStreamEvent } from '@/lib/chat/protocol';

import { createMetaSplitter, parseChatMeta } from './chat-meta';
import { buildChatMessages } from './chat-prompt';
import { createChatModel } from './chat-model';

type ChatHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatScenarioContext = {
  categoryId: string;
  categoryLabel: string;
  topicId: string | null;
  topicLabel: string | null;
};

type Source = {
  source: string;
  chunk: number;
};

const knowledgeBaseDir = path.join(process.cwd(), 'data', 'rag');

const ChatState = Annotation.Root({
  question: Annotation<string>(),
  scenario: Annotation<ChatScenarioContext | null>({
    reducer: (_, value) => value,
    default: () => null
  }),
  history: Annotation<ChatHistoryMessage[]>({
    reducer: (_, value) => value,
    default: () => []
  }),
  contextDocs: Annotation<Document[]>({
    reducer: (_, value) => value,
    default: () => []
  }),
  answer: Annotation<string>({
    reducer: (_, value) => value,
    default: () => ''
  }),
  sources: Annotation<Source[]>({
    reducer: (_, value) => value,
    default: () => []
  })
});

let retrieverCache:
  | {
    signature: string;
    promise: Promise<ReturnType<MemoryVectorStore['asRetriever']>>;
  }
  | null = null;

const getKnowledgeSignature = async () => {
  const files = await fs.readdir(knowledgeBaseDir);
  const supportedFiles = files
    .filter((file) => ['.md', '.txt', '.json'].includes(path.extname(file).toLowerCase()))
    .sort();

  const stats = await Promise.all(
    supportedFiles.map(async (fileName) => {
      const fullPath = path.join(knowledgeBaseDir, fileName);
      const stat = await fs.stat(fullPath);
      return `${fileName}:${stat.mtimeMs}`;
    })
  );

  return stats.join('|');
};

const readKnowledgeFiles = async () => {
  const files = await fs.readdir(knowledgeBaseDir);
  const supportedFiles = files.filter((file) =>
    ['.md', '.txt', '.json'].includes(path.extname(file).toLowerCase())
  );

  const docs: Document[] = [];

  for (const fileName of supportedFiles) {
    const fullPath = path.join(knowledgeBaseDir, fileName);
    const raw = await fs.readFile(fullPath, 'utf8');

    let content = raw;

    if (path.extname(fileName).toLowerCase() === '.json') {
      try {
        content = JSON.stringify(JSON.parse(raw), null, 2);
      } catch {
        content = raw;
      }
    }

    docs.push(
      new Document({
        pageContent: content,
        metadata: { source: path.join('data', 'rag', fileName) }
      })
    );
  }

  return docs;
};

const buildRetriever = async () => {
  const docs = await readKnowledgeFiles();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 900,
    chunkOverlap: 120
  });

  const splitDocs = await splitter.splitDocuments(docs);
  const docsWithChunk = splitDocs.map((doc: Document, index: number) => {
    doc.metadata = {
      ...doc.metadata,
      chunk: index
    };

    return doc;
  });

  const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
  const store = await MemoryVectorStore.fromDocuments(docsWithChunk, embeddings);

  return store.asRetriever(6);
};

const getRetriever = async () => {
  const signature = await getKnowledgeSignature();

  if (!retrieverCache || retrieverCache.signature !== signature) {
    retrieverCache = {
      signature,
      promise: buildRetriever()
    };
  }

  return retrieverCache.promise;
};

const retrieveNode = async (state: typeof ChatState.State) => {
  const retriever = await getRetriever();
  const retrievalQuery = [state.scenario?.categoryLabel, state.scenario?.topicLabel, state.question]
    .filter(Boolean)
    .join('\n');

  const docsFromQuestion = await retriever.invoke(state.question);

  const docsFromScenarioQuery =
    retrievalQuery && retrievalQuery !== state.question
      ? await retriever.invoke(retrievalQuery)
      : [];

  const mergedDocs = [...docsFromQuestion, ...docsFromScenarioQuery];
  const uniqueDocs = mergedDocs.filter((doc, index, self) => {
    const key = `${doc.metadata.source ?? 'unknown'}:${doc.metadata.chunk ?? -1}`;
    return (
      self.findIndex(
        (candidate) =>
          `${candidate.metadata.source ?? 'unknown'}:${candidate.metadata.chunk ?? -1}` === key
      ) === index
    );
  });

  const contextDocs = uniqueDocs.slice(0, 8);

  const sources = contextDocs.map((doc: Document) => ({
    source: String(doc.metadata.source ?? 'unknown'),
    chunk: Number(doc.metadata.chunk ?? -1)
  }));

  return { contextDocs, sources };
};

const generateNode = async (state: typeof ChatState.State) => {
  const model = createChatModel();

  const context = state.contextDocs
    .map((doc, index) => `Source ${index + 1}:\n${doc.pageContent}`)
    .join('\n\n');

  const historyText = state.history
    .slice(-6)
    .map((message) => `${message.role}: ${message.content}`)
    .join('\n');

  const scenarioText = state.scenario
    ? `Category: ${state.scenario.categoryLabel}\nTopic: ${state.scenario.topicLabel || 'not selected yet'}`
    : 'No scenario selected.';

  const prompt = [
    'You are a personal assistant for Bohdan Ilienko.',
    'Name spelling rules are strict: English -> "Bohdan Ilienko", Russian -> "Богдан Ильенко", Ukrainian -> "Богдан Ільєнко".',
    'Never use these misspellings: "Иленко", "Илиенко".',
    'Answer only using the provided context.',
    'If information is missing, clearly say that the data is not in the knowledge base yet.',
    'Keep answers concise and factual.',
    '',
    'Conversation history:',
    historyText || 'No previous history.',
    '',
    'Selected scenario:',
    scenarioText,
    '',
    'Context:',
    context || 'No context found.',
    '',
    `User question: ${state.question}`
  ].join('\n');

  const response = await model.invoke(prompt);
  const answer = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

  return { answer };
};

const graph = new StateGraph(ChatState)
  .addNode('retrieve', retrieveNode)
  .addNode('generate', generateNode)
  .addEdge(START, 'retrieve')
  .addEdge('retrieve', 'generate')
  .addEdge('generate', END)
  .compile();

export const runBohdanRag = async ({
  question,
  history,
  scenario
}: {
  question: string;
  history: ChatHistoryMessage[];
  scenario?: ChatScenarioContext | null;
}) => {
  const result = await graph.invoke({
    question,
    history,
    scenario: scenario ?? null
  });

  return {
    answer: result.answer,
    sources: result.sources
  };
};

export type { ChatHistoryMessage };
export type { ChatScenarioContext };

// ---------------------------------------------------------------------------------------------------------------
// Streaming chat behind POST /api/chat. It keeps its own index, so everything above (and /api/rag-chat) is unchanged.
// ---------------------------------------------------------------------------------------------------------------

type KnowledgeSection = {
  source: string;
  label: string;
  body: string;
  pinned?: boolean;
};

const SITE_MESSAGES_DIR = path.join(process.cwd(), 'messages', 'en');
const SITE_MESSAGE_FILES = ['projects.json', 'experience.json', 'testimonials.json', 'common.json', 'cv.json'];

const CHUNK_CHARS = 900;
const CONTEXT_DOCS = 8;
// Reciprocal rank fusion constant: how much a first place beats a fifth when several queries are merged.
const RRF_K = 60;
// A short question after another one ("and where?") cannot be embedded on its own.
const FOLLOW_UP_MAX_CHARS = 80;
// Stays under the route's maxDuration (30 s) so a stuck provider ends in an error frame, not a killed connection.
const CHAT_DEADLINE_MS = 24_000;
// An answer and its META line come to about 1.5 KB. The splitter rescans the text it holds back on every chunk, so
// output far beyond that (a runaway or hostile completion) is cut off instead of being read to the end.
const MAX_RAW_CHARS = 6000;
// One embeddings call that stalls must not pin the cached index build for minutes: 8 s, one retry, stays inside the
// 24 s deadline. A failed build clears the cache, so the next request starts a fresh one.
const EMBEDDINGS_TIMEOUT_MS = 8_000;
const EMBEDDINGS_MAX_RETRIES = 1;

// Always part of the context: the short bio holds the facts most questions touch (role, years of experience, focus),
// and a question like "how much experience" would otherwise rank every single job above it.
const PINNED_HEADINGS = new Set(['short bio']);

// File notes, and the name spelling rules the system prompt owns: noise, or a way to echo the misspellings.
const SKIPPED_HEADINGS = new Set(['name spelling by language', 'source note', 'notes']);
const SKIPPED_JSON_KEYS = new Set(['source', 'nameVariants']);

// Every chunk is about him, so his name in a question only pulls the generic bio chunks to the top.
const OWNER_NAME = /\b(?:bohdan|ilienko)(?:['’]s)?\b|(?:богдан|ильенк|ільєнк)[а-яіїєґё]*/gi;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const textOf = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const at = (value: unknown, ...keys: string[]) =>
  keys.reduce<unknown>((current, key) => (isRecord(current) ? current[key] : undefined), value);

const recordsOf = (value: unknown) => (isRecord(value) ? Object.values(value).filter(isRecord) : []);

const humanize = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();

// Sections keep their heading path, so a bullet list is never separated from the company or project it belongs to.
const markdownSections = (raw: string, source: string, rootLabel: string): KnowledgeSection[] => {
  const sections: KnowledgeSection[] = [];
  const trail: string[] = [];
  let lines: string[] = [];

  const flush = () => {
    const body = lines.join('\n').trim();

    lines = [];

    if (!body || trail.some((heading) => SKIPPED_HEADINGS.has(heading.toLowerCase()))) return;

    sections.push({
      source,
      label: [rootLabel, ...trail].join(' › '),
      body,
      pinned: trail.some((heading) => PINNED_HEADINGS.has(heading.toLowerCase()))
    });
  };

  for (const line of raw.split('\n')) {
    const heading = /^(#{1,6})\s+(.*\S)\s*$/.exec(line);

    if (!heading) {
      lines.push(line);
      continue;
    }

    flush();

    // The H1 is the document title; H2 and deeper form the trail.
    if (heading[1].length === 1) {
      trail.length = 0;
    } else {
      trail.length = heading[1].length - 2;
      trail[heading[1].length - 2] = heading[2];
    }
  }

  flush();

  return sections;
};

const describeJson = (value: unknown, prefix = ''): string[] => {
  const line = (text: string) => (prefix ? `${prefix}: ${text}` : text);

  if (Array.isArray(value)) {
    return value.every((item) => !isRecord(item) && !Array.isArray(item))
      ? [line(value.join('; '))]
      : value.flatMap((item) => describeJson(item, prefix));
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .filter(([key]) => !SKIPPED_JSON_KEYS.has(key))
      .flatMap(([key, child]) => describeJson(child, prefix ? `${prefix} / ${humanize(key)}` : humanize(key)));
  }

  return [line(String(value))];
};

const jsonSections = (raw: string, source: string, rootLabel: string): KnowledgeSection[] => {
  let data: unknown;

  try {
    data = JSON.parse(raw);
  } catch {
    return [{ source, label: rootLabel, body: raw.trim() }];
  }

  if (!isRecord(data)) return [{ source, label: rootLabel, body: JSON.stringify(data) }];

  return Object.entries(data)
    .filter(([key]) => !SKIPPED_JSON_KEYS.has(key))
    .flatMap(([key, value]) => {
      const label = `${rootLabel} › ${humanize(key)}`;
      // A list of records (jobs, projects) becomes one section per record, named after it.
      const entries = Array.isArray(value) && value.some(isRecord) ? value : [value];

      return entries.map((entry) => {
        const name = isRecord(entry) ? textOf(entry.company) || textOf(entry.name) || textOf(entry.institution) : '';

        return { source, label: name ? `${label} › ${name}` : label, body: describeJson(entry).join('\n') };
      });
    });
};

const readRagSections = async () => {
  const files = (await fs.readdir(knowledgeBaseDir))
    .filter((file) => ['.md', '.txt', '.json'].includes(path.extname(file).toLowerCase()))
    .sort();

  const perFile = await Promise.all(
    files.map(async (fileName) => {
      const raw = await fs.readFile(path.join(knowledgeBaseDir, fileName), 'utf8');
      const source = path.join('data', 'rag', fileName);

      return path.extname(fileName).toLowerCase() === '.json'
        ? jsonSections(raw, source, 'CV data')
        : markdownSections(raw, source, 'CV profile');
    })
  );

  return perFile.flat();
};

// What the page itself says, so the assistant and the site never disagree about wording, dates or project names.
const readSiteSections = async () => {
  const [projects, experience, testimonials, common, cv] = await Promise.all(
    SITE_MESSAGE_FILES.map(async (file) => {
      try {
        return JSON.parse(await fs.readFile(path.join(SITE_MESSAGES_DIR, file), 'utf8')) as unknown;
      } catch {
        console.warn(`[chat] site content skipped, cannot read messages/en/${file}`);
        return null;
      }
    })
  );

  // One section per area of the page, not per item: the CV files already describe every job and project on their
  // own, and near-identical entries would crowd the few context slots.
  const sections: KnowledgeSection[] = [];
  const add = (area: string, lines: string[]) => {
    if (lines.length) sections.push({ source: `site:${area.toLowerCase()}`, label: `Site › ${area}`, body: lines.join('\n') });
  };

  add(
    'Projects',
    recordsOf(at(projects, 'projects', 'items'))
      .filter((item) => textOf(item.title))
      .map((item) => `Project: ${textOf(item.title)}. ${textOf(item.description)}`)
  );

  add(
    'Experience',
    recordsOf(at(experience, 'experience', 'items'))
      .filter((item) => textOf(item.title))
      .map((item) => `Work experience: ${textOf(item.title)}. ${textOf(item.description).replace(' · ', '. ')}`)
  );

  add(
    'Highlights',
    recordsOf(at(testimonials, 'testimonials', 'items'))
      .filter((item) => textOf(item.quote))
      .map((item) => `Engineering highlight, ${textOf(item.name)} (${textOf(item.title)}): ${textOf(item.quote)}`)
  );

  const approach = at(common, 'common', 'approach');

  add(
    'Approach',
    [1, 2, 3]
      .filter((phase) => textOf(at(approach, `phase${phase}Title`)))
      .map((phase) => `Approach, phase ${phase} of 3: ${textOf(at(approach, `phase${phase}Title`))}. ${textOf(at(approach, `phase${phase}Description`))}`)
  );

  add(
    'Education',
    recordsOf(at(cv, 'cv', 'education', 'items'))
      .filter((item) => textOf(item.title))
      .map((item) => {
        const details = [item.institution, item.degree, item.period].map(textOf).filter(Boolean).join(', ');

        return `Education: ${textOf(item.title)}. ${details}. ${textOf(item.description)}`;
      })
  );

  return sections;
};

const packLines = (lines: string[]) => {
  const pieces: string[] = [];
  let current = '';

  for (const line of lines) {
    if (current && current.length + line.length + 1 > CHUNK_CHARS) {
      pieces.push(current);
      current = '';
    }

    current += current ? `\n${line}` : line;
  }

  if (current) pieces.push(current);

  return pieces;
};

type ChatIndex = { store: MemoryVectorStore; pinned: Document[] };

let chatIndexCache: { signature: string; promise: Promise<ChatIndex> } | null = null;

const getChatKnowledgeSignature = async () => {
  const siteStamps = await Promise.all(
    SITE_MESSAGE_FILES.map(async (file) => {
      try {
        return `${file}:${(await fs.stat(path.join(SITE_MESSAGES_DIR, file))).mtimeMs}`;
      } catch {
        return `${file}:missing`;
      }
    })
  );

  return [await getKnowledgeSignature(), ...siteStamps].join('|');
};

// Embeds every chunk, so it runs once per server start (and again only when a knowledge file changes), never per request.
const buildChatIndex = async (): Promise<ChatIndex> => {
  const startedAt = Date.now();
  const sections = [...(await readRagSections()), ...(await readSiteSections())];

  const docs = sections
    .flatMap(({ source, label, body, pinned }) => packLines(body.split('\n')).map((piece) => ({ source, label, piece, pinned: Boolean(pinned) })))
    .map(({ source, label, piece, pinned }, chunk) => new Document({ pageContent: `${label}\n${piece}`, metadata: { source, label, chunk, pinned } }));

  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    timeout: EMBEDDINGS_TIMEOUT_MS,
    maxRetries: EMBEDDINGS_MAX_RETRIES
  });
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);

  console.info(`[chat] knowledge index built: ${docs.length} chunks in ${Date.now() - startedAt}ms`);

  return { store, pinned: docs.filter((doc) => doc.metadata.pinned) };
};

const getChatIndex = async () => {
  const signature = await getChatKnowledgeSignature();

  if (!chatIndexCache || chatIndexCache.signature !== signature) {
    const promise: Promise<ChatIndex> = buildChatIndex().catch((error: unknown) => {
      // A failed build (network, quota) must not stay cached: the next request tries again.
      if (chatIndexCache?.promise === promise) chatIndexCache = null;

      throw error;
    });

    chatIndexCache = { signature, promise };
  }

  return chatIndexCache.promise;
};

const withoutOwnerName = (query: string) => {
  const stripped = query.replace(OWNER_NAME, ' ').replace(/[ \t]+/g, ' ').trim();

  // "Who is Bohdan?" leaves nothing to search with, so the original wording stays.
  return stripped.length >= 12 ? stripped : query;
};

const retrieveChatContext = async ({
  question,
  scenario,
  history
}: {
  question: string;
  scenario: ChatScenarioContext | null;
  history: ChatHistoryMessage[];
}) => {
  const { store, pinned } = await getChatIndex();

  const queries = [question];
  const scenarioQuery = [scenario?.categoryLabel, scenario?.topicLabel, question].filter(Boolean).join('\n');
  const previousQuestion = [...history].reverse().find((entry) => entry.role === 'user')?.content.trim();

  if (scenarioQuery !== question) queries.push(scenarioQuery);
  if (previousQuestion && question.length <= FOLLOW_UP_MAX_CHARS) queries.push(`${previousQuestion.slice(0, 300)}\n${question}`);

  const rankings = await Promise.all(queries.map((query) => store.similaritySearch(withoutOwnerName(query), CONTEXT_DOCS)));

  const fused = new Map<number, { doc: Document; score: number }>();

  for (const ranking of rankings) {
    ranking.forEach((doc, rank) => {
      const key = Number(doc.metadata.chunk);
      const entry = fused.get(key) ?? { doc, score: 0 };

      entry.score += 1 / (RRF_K + rank);
      fused.set(key, entry);
    });
  }

  const top = [...fused.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, CONTEXT_DOCS)
    .map((entry) => entry.doc);

  // Pinned passages take the last slots when the search did not bring them in on its own.
  const missing = pinned.filter((doc) => !top.some((candidate) => candidate.metadata.chunk === doc.metadata.chunk));

  return [...top.slice(0, CONTEXT_DOCS - missing.length), ...missing];
};

const ChatRetrievalState = Annotation.Root({
  question: Annotation<string>(),
  scenario: Annotation<ChatScenarioContext | null>({
    reducer: (_, value) => value,
    default: () => null
  }),
  history: Annotation<ChatHistoryMessage[]>({
    reducer: (_, value) => value,
    default: () => []
  }),
  contextDocs: Annotation<Document[]>({
    reducer: (_, value) => value,
    default: () => []
  })
});

// Retrieval only. Generation is streamed outside the graph (see streamBohdanChat) so that status frames, abort handling
// and the META splitter work directly on the raw model chunks.
const chatRetrievalGraph = new StateGraph(ChatRetrievalState)
  .addNode('retrieve', async (state: typeof ChatRetrievalState.State) => ({ contextDocs: await retrieveChatContext(state) }))
  .addEdge(START, 'retrieve')
  .addEdge('retrieve', END)
  .compile();

const abortable = <T>(promise: Promise<T>, signal: AbortSignal): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason ?? new Error('aborted'));

    // Subscribed first and always: the wrapped promise rejects on abort too, and nobody else would handle that.
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));

    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort, { once: true });
  });

const chunkText = (content: unknown) => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return content.map((part) => (isRecord(part) && part.type === 'text' && typeof part.text === 'string' ? part.text : '')).join('');
};

type TokenUsage = {
  input_tokens?: number;
  output_tokens?: number;
  input_token_details?: { cache_read?: number };
  output_token_details?: { reasoning?: number };
};

// Input and output tokens, how much of the input came from the provider's prompt cache, and how much of the output
// was reasoning: the reasoning share is what the wait for the first visible character is spent on.
const describeUsage = (usage: TokenUsage | undefined) =>
  usage
    ? ` tokens=in:${usage.input_tokens ?? '?'}(cached ${usage.input_token_details?.cache_read ?? 0}) out:${usage.output_tokens ?? '?'}(reasoning ${usage.output_token_details?.reasoning ?? 0})`
    : '';

// Server log only: provider messages can carry request details, so keys are masked and the length is capped.
const describeError = (error: unknown) => {
  const status = isRecord(error) && typeof error.status === 'number' ? ` (status ${error.status})` : '';
  const text = error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  return `${text.replace(/sk-[A-Za-z0-9_-]{6,}/g, 'sk-***').slice(0, 400)}${status}`;
};

/**
 * One chat turn as protocol events: status(retrieve), status(write), delta*, meta, done, or error. The first event is
 * yielded before any async work. Aborting `signal` ends the generator silently; nothing provider-specific is yielded.
 */
export async function* streamBohdanChat(
  input: ChatRequest,
  signal?: AbortSignal
): AsyncGenerator<ChatStreamEvent, void, undefined> {
  yield { t: 'status', step: 'retrieve' };

  const startedAt = Date.now();
  const deadline = AbortSignal.timeout(CHAT_DEADLINE_MS);
  const combined = signal ? AbortSignal.any([signal, deadline]) : deadline;

  try {
    const { contextDocs } = await abortable(
      chatRetrievalGraph.invoke(
        { question: input.question, history: input.history, scenario: input.scenario ?? null },
        { signal: combined }
      ),
      combined
    );
    const retrievedAt = Date.now();

    if (process.env.NODE_ENV !== 'production') {
      console.info(`[chat] context: ${contextDocs.map((doc) => String(doc.metadata.label)).join(' | ')}`);
    }

    yield { t: 'status', step: 'write' };

    const stream = await createChatModel().stream(buildChatMessages({ ...input, contextDocs }), { signal: combined });
    const splitter = createMetaSplitter();
    let firstDeltaAt = 0;
    let chars = 0;
    let rawChars = 0;
    let usage: TokenUsage | undefined;

    for await (const chunk of stream) {
      usage = chunk.usage_metadata ?? usage;

      const text = chunkText(chunk.content);

      rawChars += text.length;

      if (rawChars > MAX_RAW_CHARS) throw new Error('the model output is over the size cap');

      const { visible } = splitter.push(text);

      if (!visible) continue;

      firstDeltaAt ||= Date.now();
      chars += visible.length;

      yield { t: 'delta', text: visible };
    }

    const tail = splitter.end();

    if (tail.visible) {
      firstDeltaAt ||= Date.now();
      chars += tail.visible.length;

      yield { t: 'delta', text: tail.visible };
    }

    if (chars === 0) throw new Error('the model returned no visible text');

    const meta = parseChatMeta(tail.meta);

    // Cards, chips and sources all come from the META line, and every answer is supposed to carry follow-ups: an
    // entirely empty meta means the model forgot the line or wrote it broken, a rate worth watching in the logs. The
    // raw text shows which of the two it was ("" = no line after the delimiter, or no delimiter at all).
    if (!meta.cards.length && !meta.followUps.length && !meta.sources.length && !meta.intent) {
      console.warn(
        `[chat] ${input.locale} answer came without usable META (cards, follow-ups and sources are all empty), raw: ${JSON.stringify(tail.meta.slice(0, 200))}`
      );
    }

    yield { t: 'meta', meta };
    yield { t: 'done' };

    console.info(
      `[chat] ${input.locale} ok retrieve=${retrievedAt - startedAt}ms first-delta=${firstDeltaAt - startedAt}ms total=${Date.now() - startedAt}ms chars=${chars}${describeUsage(usage)}`
    );
  } catch (error) {
    if (signal?.aborted) {
      console.info(`[chat] aborted by the client after ${Date.now() - startedAt}ms`);
      return;
    }

    console.error(`[chat] failed after ${Date.now() - startedAt}ms: ${describeError(error)}`);

    yield { t: 'error', code: 'unavailable' };
  }
}
