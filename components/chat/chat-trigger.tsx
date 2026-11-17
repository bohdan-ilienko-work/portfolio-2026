'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Ref } from 'react';

import { Keycap, Monogram, focusRing } from '@/components/chat/ui';
import { cn } from '@/lib/utils';

type ChatTriggerProps = {
  onClick: () => void;
  isMac: boolean;
  reduceMotion: boolean;
  ref?: Ref<HTMLButtonElement>;
};

export const ChatTrigger = ({ onClick, isMac, reduceMotion, ref }: ChatTriggerProps) => {
  const t = useTranslations('common.askBohdan');
  const tChat = useTranslations('chat');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.12, delay: reduceMotion ? 0 : 0.06 }}
    >
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={t('aria.openChat')}
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        title={tChat('trigger.hint')}
        className={cn(
          'flex h-11 items-center gap-2.5 rounded-full border border-[--border-medium] bg-[--surface-1] pl-2.5 pr-3 text-[--text-primary] [box-shadow:var(--shadow-card)] transition-[transform,border-color] duration-150 hover:-translate-y-px hover:border-[--border-strong] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
          'max-sm:h-12 max-sm:w-12 max-sm:justify-center max-sm:gap-0 max-sm:p-0',
          focusRing,
        )}
      >
        <Monogram size={24} className="max-sm:!h-7 max-sm:!w-7 max-sm:!text-[12px]" />
        <span className="text-[13px] font-medium leading-none max-sm:hidden">{t('title')}</span>
        <Keycap className="max-sm:hidden">{isMac ? '⌘K' : 'Ctrl K'}</Keycap>
      </button>
    </motion.div>
  );
};
