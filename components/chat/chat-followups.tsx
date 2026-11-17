'use client';

import { useTranslations } from 'next-intl';

import { PillButton } from '@/components/chat/ui';

type ChatFollowUpsProps = {
  items: string[];
  onPick: (text: string) => void;
};

export const ChatFollowUps = ({ items, onPick }: ChatFollowUpsProps) => {
  const t = useTranslations('chat');

  if (!items.length) return null;

  return (
    <div role="group" aria-label={t('a11y.followUps')} className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <PillButton key={item} onClick={() => onPick(item)} className="min-w-0 max-w-full">
          {/* leading-4: the pill is leading-none, and `truncate` clips the tails of g, p, y at the line box */}
          <span className="truncate leading-4">{item}</span>
        </PillButton>
      ))}
    </div>
  );
};
