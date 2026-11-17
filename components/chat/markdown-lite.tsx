import { memo } from 'react';
import type { ReactNode } from 'react';

import { focusRing, monoFont } from '@/components/chat/ui';
import { cn } from '@/lib/utils';

// The subset of Markdown the assistant is allowed to write: paragraphs, `- ` bullets, **bold**, `code`, [label](url)
// and bare URLs. The text arrives token by token, so the parser has to give a sane tree for every prefix of an answer:
// a construct renders only once it is closed, until then its markers show literally. While an answer is streaming
// (`streaming: true`) a bold that is still open at the very end is shown as bold already, so the asterisks never flash.
// The tree is rendered with React elements, never as HTML, and only http(s), mailto and tel targets become links.

export type MdInline =
  | { type: 'text'; value: string }
  | { type: 'br' }
  | { type: 'bold'; children: MdInline[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; external: boolean; children: MdInline[] };

export type MdBlock =
  | { type: 'paragraph'; children: MdInline[] }
  | { type: 'list'; items: MdInline[][] };

/** `tail`: this text is the end of an answer that is still streaming. */
type InlineOptions = { bold: boolean; links: boolean; tail?: boolean };

// Bounds keep a hostile or runaway answer linear: an unfinished "[" costs at most this many characters to reject.
const MAX_LABEL_CHARS = 300;
const MAX_URL_CHARS = 2048;
// Label matched but the destination never closes: legitimate text does this a handful of times, a flood of "[a](" does not.
const MAX_FAILED_DESTINATIONS = 40;

const SAFE_PROTOCOLS: readonly string[] = ['http:', 'https:', 'mailto:', 'tel:'];
const BULLET_LINE = /^[ \t]*[-*\u2022][ \t]+(.*)$/;
const INDENTED_LINE = /^[ \t]{2,}\S/;
const URL_STOP = /[\s<>"`\\]/;
const URL_TRAILING = '.,;:!?\'*\u2026\u00bb\u201d\u2019';
const WORD_CHAR = /[A-Za-z0-9_]/;

const isSpace = (char: string | undefined): boolean => char === undefined || /\s/.test(char);

/** The href to use for a link target, or null when it is not one of the four allowed kinds. */
export const toSafeLink = (raw: string): { href: string; external: boolean } | null => {
  const value = raw.trim();
  if (!value || value.length > MAX_URL_CHARS || /[\u0000-\u001f\u007f]/.test(value)) return null;

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (!SAFE_PROTOCOLS.includes(url.protocol)) return null;

  if (url.protocol === 'http:' || url.protocol === 'https:') {
    return url.hostname ? { href: url.href, external: true } : null;
  }

  return url.pathname.length >= 3 ? { href: url.href, external: false } : null;
};

type LinkMatch = { label: string; url: string; end: number };

/** The "(url)" or `(url "title")` part of a link, `from` being the index right after "(". Null when it never closes. */
const matchDestination = (src: string, from: number): { url: string; end: number } | null => {
  let cursor = from;
  while (src[cursor] === ' ') cursor += 1;

  const urlStart = cursor;
  const urlLimit = Math.min(src.length, urlStart + MAX_URL_CHARS);
  let parens = 0;

  for (; cursor < urlLimit; cursor += 1) {
    const char = src[cursor];

    if (char === '(') parens += 1;
    else if (char === ')') {
      if (parens === 0) break;
      parens -= 1;
    } else if (/\s/.test(char)) break;
  }

  const url = src.slice(urlStart, cursor);
  if (!url) return null;

  while (src[cursor] === ' ') cursor += 1;

  if (src[cursor] === '"' || src[cursor] === "'") {
    const titleEnd = src.indexOf(src[cursor], cursor + 1);
    if (titleEnd < 0) return null;

    cursor = titleEnd + 1;
    while (src[cursor] === ' ') cursor += 1;
  }

  return src[cursor] === ')' ? { url, end: cursor + 1 } : null;
};

/** "[label](url)" or "[label](url "title")" starting at `start`, or null when it is not (yet) a complete link. */
const matchLink = (src: string, start: number, budget: { failures: number }): LinkMatch | null => {
  const labelLimit = Math.min(src.length, start + MAX_LABEL_CHARS + 2);
  let depth = 1;
  let close = start + 1;

  for (; close < labelLimit; close += 1) {
    const char = src[close];

    if (char === '[') depth += 1;
    else if (char === ']') {
      depth -= 1;
      if (depth === 0) break;
    }
  }

  if (depth !== 0 || src[close + 1] !== '(' || budget.failures >= MAX_FAILED_DESTINATIONS) return null;

  const label = src.slice(start + 1, close);
  if (!label.trim()) return null;

  const destination = matchDestination(src, close + 2);

  if (!destination) {
    budget.failures += 1;
    return null;
  }

  return { label, url: destination.url, end: destination.end };
};

type UrlMatch = { text: string; href: string };

/** The stretch of text the last bare-URL scan ran over without meeting a character that ends a URL: [from, to). */
type UrlRun = { from: number; to: number };

/** A bare http(s) URL starting at `start`, without the sentence punctuation or unbalanced bracket that trails it. */
const matchBareUrl = (src: string, start: number, run: UrlRun): UrlMatch | null => {
  const head = src.slice(start, start + 8).toLowerCase();
  if (!head.startsWith('http://') && !head.startsWith('https://')) return null;
  if (start > 0 && WORD_CHAR.test(src[start - 1])) return null;
  // "[label](https://exa" while streaming: the destination of a link that is not closed yet, not a bare URL.
  if (start >= 2 && src[start - 1] === '(' && src[start - 2] === ']') return null;

  // Every "http://" inside one long unbroken stretch ends in the same place, so that is found once. Scanning to it from
  // each head would cost heads x length, which a flood of "http://" or comma-separated links turns into seconds.
  if (start < run.from || start >= run.to) {
    let to = start;
    while (to < src.length && !URL_STOP.test(src[to])) to += 1;

    run.from = start;
    run.to = to;
  }

  if (run.to - start > MAX_URL_CHARS) return null;

  let end = start;
  let opens = 0;
  let closes = 0;

  while (end < run.to) {
    if (src[end] === '(') opens += 1;
    else if (src[end] === ')') closes += 1;
    end += 1;
  }

  while (end > start) {
    const char = src[end - 1];

    if (char === ')' && closes > opens) {
      closes -= 1;
      end -= 1;
    } else if (char === ']' || char === '}' || URL_TRAILING.includes(char)) {
      end -= 1;
    } else {
      break;
    }
  }

  const text = src.slice(start, end);
  const target = toSafeLink(text);

  return target ? { text, href: target.href } : null;
};

/** Index range of the "**" that closes a bold run whose content starts at `from`, or null. Skips over `code`. */
const findBoldClose = (src: string, from: number): { start: number; end: number } | null => {
  let cursor = from;

  while (cursor < src.length) {
    const char = src[cursor];

    if (char === '`') {
      const codeEnd = src.indexOf('`', cursor + 1);
      cursor = codeEnd > cursor + 1 ? codeEnd + 1 : cursor + 1;
    } else if (char === '*' && src[cursor + 1] === '*') {
      if (cursor > from && !isSpace(src[cursor - 1])) return { start: cursor, end: cursor + 2 };

      cursor += 2;
      while (src[cursor] === '*') cursor += 1;
    } else {
      cursor += 1;
    }
  }

  return null;
};

const parseInline = (src: string, options: InlineOptions): MdInline[] => {
  const out: MdInline[] = [];
  let buffer = '';
  // One failed search means every later "**" would fail too (it searches a subset), so stop trying: keeps this linear.
  let boldFailed = !options.bold;
  const linkBudget = { failures: 0 };
  const urlRun: UrlRun = { from: -1, to: -1 };
  let index = 0;

  const flush = () => {
    if (buffer) {
      out.push({ type: 'text', value: buffer });
      buffer = '';
    }
  };

  while (index < src.length) {
    const char = src[index];

    if (char === '\n') {
      flush();
      out.push({ type: 'br' });
      index += 1;
      continue;
    }

    if (char === '`') {
      const codeEnd = src.indexOf('`', index + 1);

      if (codeEnd > index + 1) {
        flush();
        out.push({ type: 'code', value: src.slice(index + 1, codeEnd) });
        index = codeEnd + 1;
        continue;
      }
    } else if (char === '*' && src[index + 1] === '*') {
      // The last two asterisks of a run open the bold, any extra ones stay literal ("***x***" -> *<b>x</b>*).
      let runEnd = index + 2;
      while (src[runEnd] === '*') runEnd += 1;

      if (!boldFailed && !isSpace(src[runEnd])) {
        const close = findBoldClose(src, runEnd);

        if (close) {
          buffer += '*'.repeat(runEnd - index - 2);
          flush();
          out.push({
            type: 'bold',
            children: parseInline(src.slice(runEnd, close.start), { bold: false, links: options.links })
          });
          index = close.end;
          continue;
        }

        if (options.tail) {
          // Still streaming and nothing closes it yet: bold already (minus a half-typed closing "*") instead of a flash of "**".
          buffer += '*'.repeat(runEnd - index - 2);
          flush();
          out.push({
            type: 'bold',
            children: parseInline(src.slice(runEnd).replace(/\*$/, ''), { bold: false, links: options.links })
          });
          index = src.length;
          continue;
        }

        boldFailed = true;
      }

      if (options.tail && runEnd >= src.length) {
        // A bare opener at the very end of a streaming answer: wait for the first word instead of showing "**".
        index = runEnd;
        continue;
      }

      buffer += src.slice(index, runEnd);
      index = runEnd;
      continue;
    } else if (char === '[' && options.links) {
      const link = matchLink(src, index, linkBudget);

      if (link) {
        flush();

        const children = parseInline(link.label, { bold: options.bold, links: false });
        const target = toSafeLink(link.url);

        if (target) out.push({ type: 'link', href: target.href, external: target.external, children });
        else out.push(...children);

        index = link.end;
        continue;
      }
    } else if ((char === 'h' || char === 'H') && options.links) {
      const url = matchBareUrl(src, index, urlRun);

      if (url) {
        flush();
        out.push({ type: 'link', href: url.href, external: true, children: [{ type: 'text', value: url.text }] });
        index += url.text.length;
        continue;
      }
    }

    buffer += char;
    index += 1;
  }

  flush();

  return out;
};

const hasContent = (nodes: MdInline[]): boolean =>
  nodes.some((node) => node.type !== 'text' || node.value.trim() !== '');

type RawBlock = { type: 'paragraph'; lines: string[] } | { type: 'list'; items: string[] };

const splitBlocks = (text: string): RawBlock[] => {
  const blocks: RawBlock[] = [];
  let paragraph: string[] = [];
  let items: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) blocks.push({ type: 'paragraph', lines: paragraph });
    paragraph = [];
  };

  const flushList = () => {
    if (items) blocks.push({ type: 'list', items });
    items = null;
  };

  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (line.trim() === '') {
      flushParagraph();
      flushList();
      continue;
    }

    const bullet = BULLET_LINE.exec(line);

    if (bullet) {
      flushParagraph();
      (items ??= []).push(bullet[1].trim());
    } else if (items && INDENTED_LINE.test(line)) {
      items[items.length - 1] += `\n${line.trim()}`;
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }

  flushParagraph();
  flushList();

  return blocks;
};

const parseBlocks = (text: string, streaming: boolean): MdBlock[] => {
  const raw = splitBlocks(text);
  const blocks: MdBlock[] = [];

  raw.forEach((block, blockIndex) => {
    // Only the end of the last block can still be growing.
    const isTail = streaming && blockIndex === raw.length - 1;

    if (block.type === 'paragraph') {
      blocks.push({
        type: 'paragraph',
        children: parseInline(block.lines.join('\n'), { bold: true, links: true, tail: isTail })
      });
      return;
    }

    const items = block.items
      .map((item, itemIndex) =>
        parseInline(item, { bold: true, links: true, tail: isTail && itemIndex === block.items.length - 1 })
      )
      .filter(hasContent);

    if (items.length > 0) blocks.push({ type: 'list', items });
  });

  return blocks;
};

/**
 * Text -> tree. Never throws and takes linear time; an unfinished construct stays literal text, except that with
 * `streaming` a bold still open at the very end of the text is already bold.
 */
export const parseMarkdownLite = (text: string, options: { streaming?: boolean } = {}): MdBlock[] => {
  const source = typeof text === 'string' ? text : '';

  try {
    return parseBlocks(source, options.streaming === true);
  } catch {
    // A parser bug must not take the conversation down: show the raw text.
    return source ? [{ type: 'paragraph', children: [{ type: 'text', value: source }] }] : [];
  }
};

const linkClass = cn(
  'rounded-[2px] text-[--chat-accent] underline decoration-[--border-strong] underline-offset-2 transition-colors hover:text-[--chat-accent-hover] hover:decoration-current',
  focusRing,
);

const renderInline = (nodes: MdInline[]): ReactNode[] =>
  nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return node.value;
      case 'br':
        return <br key={index} />;
      case 'bold':
        return (
          <strong key={index} className="font-semibold">
            {renderInline(node.children)}
          </strong>
        );
      case 'code':
        return (
          <code
            key={index}
            className={cn('rounded-[4px] bg-[--surface-3] px-1 py-px text-[0.9em]', monoFont)}
          >
            {node.value}
          </code>
        );
      case 'link':
        return (
          <a
            key={index}
            href={node.href}
            className={linkClass}
            {...(node.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {renderInline(node.children)}
          </a>
        );
    }
  });

const Caret = () => <span className="chat-caret" aria-hidden />;

export type MarkdownLiteProps = { text: string; streaming?: boolean; className?: string };

const MarkdownLiteView = ({ text, streaming = false, className }: MarkdownLiteProps) => {
  const blocks = parseMarkdownLite(text, { streaming });

  return (
    <div
      className={cn(
        'min-w-0 space-y-2 text-[14px] leading-[1.6] text-[--text-primary] [overflow-wrap:anywhere]',
        className,
      )}
    >
      {blocks.length === 0 && streaming ? (
        <p>
          <Caret />
        </p>
      ) : (
        blocks.map((block, blockIndex) => {
          const isLast = blockIndex === blocks.length - 1;

          if (block.type === 'paragraph') {
            return (
              <p key={blockIndex}>
                {renderInline(block.children)}
                {isLast && streaming ? <Caret /> : null}
              </p>
            );
          }

          return (
            <ul key={blockIndex} className="list-disc space-y-1 ps-5 marker:text-[--text-muted]">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  {renderInline(item)}
                  {isLast && streaming && itemIndex === block.items.length - 1 ? <Caret /> : null}
                </li>
              ))}
            </ul>
          );
        })
      )}
    </div>
  );
};

export const MarkdownLite = memo(MarkdownLiteView);
