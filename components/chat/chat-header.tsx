'use client';

import { useTranslations } from 'next-intl';
import { LuSquarePen, LuX } from 'react-icons/lu';

import { IconButton, Monogram } from '@/components/chat/ui';

type ChatHeaderProps = {
  hasMessages: boolean;
  onNewChat: () => void;
  onClose: () => void;
};

export const ChatHeader = ({ hasMessages, onNewChat, onClose }: ChatHeaderProps) => {
  const t = useTranslations('common.askBohdan');
  const tChat = useTranslations('chat');

  return (
    <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-[--border-subtle] px-4">
      <Monogram size={28} />

      <div className="min-w-0 flex-1">
        {/* The title keeps its width; a long translation of the status chip is what gives way (ellipsis, then gone). */}
        <div className="flex items-center gap-2 overflow-hidden">
          <h2 className="shrink-0 text-[14px] font-semibold leading-5 text-[--text-primary]">{t('title')}</h2>
          <span className="hidden h-5 min-w-0 items-center gap-1.5 overflow-hidden rounded-full bg-[--chat-accent-soft] px-2 text-[11px] font-medium leading-none text-[--chat-accent] min-[480px]:inline-flex">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[--chat-accent]" />
            <span className="truncate leading-4">{tChat('header.status')}</span>
          </span>
        </div>
        <p className="truncate text-[12px] leading-4 text-[--text-secondary]">{tChat('header.subtitle')}</p>
      </div>

      <div className="flex shrink-0 items-center">
        {hasMessages && (
          <IconButton label={tChat('header.newChat')} onClick={onNewChat}>
            <LuSquarePen aria-hidden className="size-4" />
          </IconButton>
        )}
        <IconButton label={t('aria.closeChat')} onClick={onClose}>
          <LuX aria-hidden className="size-4" />
        </IconButton>
      </div>
    </header>
  );
};
