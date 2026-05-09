'use client';

import {AnimatePresence, motion} from 'framer-motion';
import {FormEvent, useEffect, useMemo, useRef, useState} from 'react';
import {HiXMark} from 'react-icons/hi2';
import {BsChatTextFill} from 'react-icons/bs';

type ChatMessage = {role: 'user' | 'assistant'; content: string};
type ApiSuccess = {ok: true; answer: string; sources: Array<{source: string; chunk: number}>};
type ApiError = {ok: false; error: string};

const STARTERS = [
  'What is Bohdan focused on as an engineer?',
  'Which technologies does Bohdan use most?',
  'How can I contact Bohdan?',
];

const SPIN_BG = 'conic-gradient(from 90deg at 50% 50%,#E2CBFF 0%,#393BB2 50%,#E2CBFF 100%)';

export const AskBohdanChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const canSend = input.trim().length > 0 && !isLoading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const next: ChatMessage[] = [...messages, {role: 'user', content: question}];
    setMessages(next);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/rag-chat', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({question, history: messages.slice(-10)}),
      });
      const data = (await res.json()) as ApiSuccess | ApiError;
      if (!res.ok || !data.ok) throw new Error(data.ok ? 'Unexpected response' : data.error);

      const sources = data.sources.length
        ? `\n\nSources: ${[...new Set(data.sources.map((s) => s.source))].join(', ')}`
        : '';

      setMessages((cur) => [...cur, {role: 'assistant', content: data.answer + sources}]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const chips = useMemo(
    () => STARTERS.filter((q) => !messages.some((m) => m.content === q)),
    [messages],
  );

  useEffect(() => {
    const h = () => setIsOpen(true);
    window.addEventListener('open-ask-bohdan', h);
    return () => window.removeEventListener('open-ask-bohdan', h);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
      }}
    >
      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            id="ask-bohdan-panel"
            aria-label="Ask Bohdan chat"
            initial={{opacity: 0, y: 20, scale: 0.95}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: 14, scale: 0.95}}
            transition={{duration: 0.2, ease: 'easeOut'}}
            style={{originX: 1, originY: 1}}
            className={[
              'flex flex-col overflow-hidden',
              'w-[calc(100vw-3rem)] max-w-[400px]',
              'rounded-3xl',
              'border border-[--border-medium]',
              'bg-[--surface-1]',
              'shadow-[0_24px_64px_rgba(0,0,0,0.5)]',
            ].join(' ')}
          >
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-[--border-subtle] px-4 py-3">
              {/* Spinning badge */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full p-[1.5px]">
                <span
                  className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite]"
                  style={{background: SPIN_BG}}
                />
                <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[--surface-1]">
                  <BsChatTextFill className="h-[14px] w-[14px] text-[#CBACF9]" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-[--text-secondary]">
                  AI Assistant
                </p>
                <h2 className="truncate text-sm font-semibold text-[--text-primary]">
                  Ask Bohdan
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[--border-subtle] text-[--text-secondary] transition-colors hover:border-[--border-medium] hover:text-[--text-primary]"
              >
                <HiXMark className="h-4 w-4" />
              </button>
            </header>

            {/* Chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-b border-[--border-subtle] px-4 py-2.5">
                {chips.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setInput(q)}
                    className="rounded-full border border-[--border-subtle] bg-[--surface-2] px-3 py-1 text-[11px] text-[--text-secondary] transition-colors hover:border-[--border-medium] hover:text-[--text-primary]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div
              ref={messagesRef}
              className="h-[42vh] max-h-[360px] min-h-[180px] overflow-y-auto p-4 sm:h-[320px]"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="relative h-12 w-12 overflow-hidden rounded-2xl p-[1.5px]">
                    <span
                      className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite]"
                      style={{background: SPIN_BG}}
                    />
                    <span className="relative flex h-full w-full items-center justify-center rounded-[10px] bg-[--surface-2]">
                      <BsChatTextFill className="h-5 w-5 text-[#CBACF9]" />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[--text-primary]">
                      Ask me anything about Bohdan
                    </p>
                    <p className="mt-1 text-xs text-[--text-secondary]">
                      Experience · Skills · Contact · Projects
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((msg, i) =>
                    msg.role === 'user' ? (
                      <div
                        key={`u-${i}`}
                        className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm leading-relaxed text-white"
                        style={{background: 'linear-gradient(135deg,#6d28d9 0%,#4f46e5 100%)'}}
                      >
                        {msg.content}
                      </div>
                    ) : (
                      <div
                        key={`a-${i}`}
                        className="max-w-[88%] rounded-2xl rounded-bl-sm border border-[--border-subtle] bg-[--surface-2] px-3.5 py-2.5 text-sm leading-relaxed text-[--text-primary]"
                      >
                        {msg.content}
                      </div>
                    ),
                  )}
                  {isLoading && (
                    <div className="flex items-center gap-1.5 px-1 pt-1">
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#CBACF9]"
                          style={{animationDelay: `${d}ms`}}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex gap-2 border-t border-[--border-subtle] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something about Bohdan…"
                disabled={isLoading}
                className="min-h-10 flex-1 rounded-xl border border-[--border-subtle] bg-[--surface-2] px-3.5 py-2 text-sm text-[--text-primary] outline-none placeholder:text-[--text-secondary] transition-colors focus:border-[#CBACF9]/50"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="relative min-h-10 overflow-hidden rounded-xl px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span
                  className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite]"
                  style={{background: SPIN_BG}}
                />
                <span className="relative inline-flex h-full items-center justify-center rounded-[0.65rem] bg-[--magic-btn-bg] px-3">
                  Send
                </span>
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Trigger */}
      <div className="group relative">
        {!isOpen && (
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-[--border-medium] bg-[--surface-1] px-3 py-1.5 text-xs font-medium text-[--text-primary] opacity-0 shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-opacity group-hover:opacity-100">
            Ask Bohdan
          </span>
        )}

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="ask-bohdan-panel"
          aria-label={isOpen ? 'Close chat' : 'Ask Bohdan'}
          onClick={() => setIsOpen((v) => !v)}
          className="relative h-14 w-14 overflow-hidden rounded-full p-[1.5px] transition-transform hover:scale-105 active:scale-95"
        >
          <span
            className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite]"
            style={{background: SPIN_BG}}
          />
          <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[--magic-btn-bg]">
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span
                  key="x"
                  initial={{rotate: -90, opacity: 0, scale: 0.5}}
                  animate={{rotate: 0, opacity: 1, scale: 1}}
                  exit={{rotate: 90, opacity: 0, scale: 0.5}}
                  transition={{duration: 0.18}}
                >
                  <HiXMark className="h-6 w-6 text-white" />
                </motion.span>
              ) : (
                <motion.span
                  key="chat"
                  initial={{rotate: 90, opacity: 0, scale: 0.5}}
                  animate={{rotate: 0, opacity: 1, scale: 1}}
                  exit={{rotate: -90, opacity: 0, scale: 0.5}}
                  transition={{duration: 0.18}}
                >
                  <BsChatTextFill className="h-5 w-5 text-[#CBACF9]" />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </button>
      </div>
    </div>
  );
};
