'use client';

import { useTranslations } from 'next-intl';
import { useLayoutEffect, type FormEvent, type KeyboardEvent, type RefObject } from 'react';
import { LuArrowUp, LuSquare } from 'react-icons/lu';

import { ChatFlowStrip } from '@/components/chat/chat-flow-strip';
import { Keycap, filledFocusGap, focusRing } from '@/components/chat/ui';
import { CHAT_LIMITS } from '@/lib/chat/protocol';
import type { ContactFlowProgress } from '@/lib/chat/types';
import { cn } from '@/lib/utils';

const FLOW_PLACEHOLDER_KEYS = {
  name: 'placeholderName',
  contact: 'placeholderContact',
  proposal: 'placeholderProposal',
  callTime: 'placeholderCallTime',
} as const;

const buttonClass =
  'mb-1 mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] transition-colors max-sm:mb-0.5 max-sm:mr-0.5 max-sm:h-10 max-sm:w-10';

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  /** An answer is being produced: Enter does not send and the send button becomes Stop. */
  busy: boolean;
  flow: ContactFlowProgress | null;
  onCancelFlow: () => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

export const ChatComposer = ({
  value,
  onChange,
  onSubmit,
  onStop,
  busy,
  flow,
  onCancelFlow,
  textareaRef,
}: ChatComposerProps) => {
  const t = useTranslations('chat');
  const tCommon = useTranslations('common.askBohdan');
  const canSend = value.trim().length > 0;
  const placeholder = flow ? t(`flow.${FLOW_PLACEHOLDER_KEYS[flow.step]}`) : t('composer.placeholder');

  // Grow with the text; the CSS max-height caps it at four lines and the textarea scrolls past that.
  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [value, textareaRef]);

  const submit = () => {
    if (busy || !canSend) return;

    onSubmit();

    // Clicking the send button moves focus to it; give it back so the visitor can keep typing. Not on touch, where it
    // would bring the keyboard up over the answer.
    const element = textareaRef.current;
    if (element && document.activeElement !== element && window.matchMedia('(pointer: fine)').matches) {
      element.focus({ preventScroll: true });
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter that confirms an IME candidate must not send (keyCode 229 covers Safari, which reports it after compositionend).
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing || event.keyCode === 229) return;

    event.preventDefault();
    submit();
  };

  return (
    <div className="shrink-0 border-t border-[--border-subtle] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {flow && <ChatFlowStrip flow={flow} onCancel={onCancelFlow} />}

      <form
        onSubmit={handleSubmit}
        className="flex items-end rounded-[10px] border border-[--border-medium] bg-[--surface-2] transition-colors focus-within:border-[--chat-accent] focus-within:ring-2 focus-within:ring-[--chat-ring]"
      >
        <div className="relative min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            maxLength={CHAT_LIMITS.questionMaxChars}
            placeholder={placeholder}
            aria-label={placeholder}
            enterKeyHint="send"
            autoComplete="off"
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            // 16px on touch, whatever the width (a phone in landscape gets the popover): iOS Safari zooms the page into
            // any smaller field when it gets focus. The native placeholder is zero-sized because a textarea wraps it:
            // a long translation then shows as a clipped second line with a scrollbar. The overlay below draws the same
            // text on a single line.
            className="block max-h-[100px] w-full resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-[14px] leading-5 text-[--text-primary] outline-none [scrollbar-width:thin] placeholder:text-[0px] placeholder:leading-[0] max-sm:max-h-[120px] max-sm:py-3 max-sm:text-[16px] max-sm:leading-6 [@media(pointer:coarse)]:text-[16px]"
          />

          {value.length === 0 && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-3 top-2.5 select-none truncate text-[14px] leading-5 text-[--text-muted] max-sm:top-3 max-sm:text-[16px] max-sm:leading-6 [@media(pointer:coarse)]:text-[16px]"
            >
              {placeholder}
            </span>
          )}
        </div>

        {busy ? (
          <button
            key="stop"
            type="button"
            onClick={onStop}
            aria-label={t('composer.stop')}
            title={t('composer.stop')}
            className={cn(buttonClass, 'bg-[--surface-3] text-[--text-primary] hover:bg-[--border-medium]', focusRing)}
          >
            <LuSquare aria-hidden className="size-3.5 fill-current" />
          </button>
        ) : (
          <button
            key="send"
            type="submit"
            disabled={!canSend}
            aria-label={tCommon('send')}
            className={cn(
              buttonClass,
              canSend
                ? 'bg-[--chat-accent] text-[--chat-accent-fg] hover:bg-[--chat-accent-hover]'
                : 'cursor-not-allowed bg-[--surface-3] text-[--text-muted]',
              focusRing,
              canSend && filledFocusGap,
            )}
          >
            <LuArrowUp aria-hidden className="size-4" />
          </button>
        )}
      </form>

      <div className="mt-2 hidden items-center gap-3 text-[11px] leading-none text-[--text-muted] sm:flex">
        <span className="flex items-center gap-1.5">
          <Keycap>↵</Keycap>
          {t('composer.hintSend')}
        </span>
        <span className="flex items-center gap-1.5">
          <Keycap>⇧↵</Keycap>
          {t('composer.hintNewLine')}
        </span>
        <span className="flex items-center gap-1.5">
          <Keycap>Esc</Keycap>
          {t('composer.hintClose')}
        </span>
      </div>
    </div>
  );
};
