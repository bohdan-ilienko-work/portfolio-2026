'use client';

import { useTranslations } from 'next-intl';
import type { Ref } from 'react';

import { Keycap, Monogram, focusRing } from '@/components/chat/ui';
import { cn } from '@/lib/utils';

type ChatTriggerProps = {
  onClick: () => void;
  isMac: boolean;
  pending?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

export const ChatTrigger = ({ onClick, isMac, pending = false, ref }: ChatTriggerProps) => {
  const t = useTranslations('common.askBohdan');
  const tChat = useTranslations('chat');

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={t('aria.openChat')}
      aria-haspopup="dialog"
      aria-busy={pending || undefined}
      disabled={pending}
      aria-keyshortcuts="Meta+K Control+K"
      title={tChat('trigger.hint')}
      className={cn(
        'flex h-11 items-center gap-2.5 rounded-full border border-[--border-medium] bg-[--surface-1] pl-2.5 pr-3 text-[--text-primary] [box-shadow:var(--shadow-card)] transition-[transform,border-color] duration-150 hover:-translate-y-px hover:border-[--border-strong] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        'max-sm:h-12 max-sm:w-12 max-sm:justify-center max-sm:gap-0 max-sm:p-0',
        pending && 'cursor-progress',
        focusRing,
      )}
    >
      <Monogram
        size={24}
        className={cn('max-sm:!h-7 max-sm:!w-7 max-sm:!text-[12px]', pending && 'motion-safe:animate-pulse')}
      />
      <span className="text-[13px] font-medium leading-none max-sm:hidden">{t('title')}</span>
      <Keycap className="max-sm:hidden">{isMac ? '⌘K' : 'Ctrl K'}</Keycap>
    </button>
  );
};
