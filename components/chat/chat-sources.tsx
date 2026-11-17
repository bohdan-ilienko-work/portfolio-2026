'use client';

import { useTranslations } from 'next-intl';
import { LuArrowUpRight } from 'react-icons/lu';

import { MicroLabel, PillButton } from '@/components/chat/ui';
import type { SectionId } from '@/lib/chat/protocol';

type ChatSourcesProps = {
  sources: SectionId[];
  onNavigate: (section: SectionId) => void;
};

/** The page sections the answer drew on; a click scrolls the real section into view. */
export const ChatSources = ({ sources, onNavigate }: ChatSourcesProps) => {
  const t = useTranslations('chat');
  const tNav = useTranslations('common.nav');

  if (!sources.length) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <MicroLabel>{t('sources.label')}</MicroLabel>
      {sources.map((section) => (
        <PillButton key={section} onClick={() => onNavigate(section)} className="gap-1 pr-2.5">
          {tNav(section)}
          <LuArrowUpRight aria-hidden className="size-3.5 text-[--text-muted]" />
        </PillButton>
      ))}
    </div>
  );
};
