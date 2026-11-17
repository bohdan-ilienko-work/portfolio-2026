'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState, type KeyboardEvent } from 'react';

import { Keycap, PillButton, focusRing } from '@/components/chat/ui';
import {
  STARTERS,
  STARTER_TABS,
  isStarterCategory,
  type Starter,
  type StarterTab,
} from '@/components/chat/starters';
import type { SendOptions } from '@/lib/chat/types';
import { cn } from '@/lib/utils';

type ChatEmptyProps = {
  onPick: (question: string, options: SendOptions) => void;
};

const tabId = (tab: StarterTab) => `ask-bohdan-tab-${tab}`;

/** Left-aligned greeting and a command-palette list of questions to start from. */
export const ChatEmpty = ({ onPick }: ChatEmptyProps) => {
  const t = useTranslations('common.askBohdan');
  const tChat = useTranslations('chat');
  const [tab, setTab] = useState<StarterTab>('popular');
  const listRef = useRef<HTMLUListElement | null>(null);

  const tabLabel = (value: StarterTab) => (value === 'popular' ? tChat('empty.tabPopular') : t(`categories.${value}`));

  const pick = (starter: Starter) => {
    const question = t(`starters.${starter.labelKey}`);

    onPick(question, {
      scenario: isStarterCategory(tab)
        ? { categoryId: tab, categoryLabel: tabLabel(tab), topicId: starter.id, topicLabel: question }
        : null,
    });
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const count = STARTER_TABS.length;
    const current = STARTER_TABS.indexOf(tab);
    const next =
      event.key === 'ArrowRight'
        ? (current + 1) % count
        : event.key === 'ArrowLeft'
          ? (current - 1 + count) % count
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? count - 1
              : null;
    if (next === null) return;

    event.preventDefault();
    setTab(STARTER_TABS[next]);
    document.getElementById(tabId(STARTER_TABS[next]))?.focus();
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    const rows = Array.from(listRef.current?.querySelectorAll('button') ?? []);
    const index = rows.findIndex((row) => row === document.activeElement);
    if (index === -1) return;

    event.preventDefault();
    rows[(index + (event.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length].focus();
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 [scrollbar-width:thin]">
      <p className="text-[15px] font-semibold leading-snug text-[--text-primary]">{tChat('empty.greeting')}</p>
      <p className="mt-1.5 text-[13px] leading-[1.55] text-[--text-secondary]">{tChat('empty.intro')}</p>

      <div
        role="tablist"
        aria-label={t('scenario.pickCategory')}
        onKeyDown={handleTabKeyDown}
        className="-mx-4 mt-5 flex gap-1.5 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {STARTER_TABS.map((value) => (
          <PillButton
            key={value}
            role="tab"
            id={tabId(value)}
            aria-selected={tab === value}
            aria-controls="ask-bohdan-starters"
            tabIndex={tab === value ? 0 : -1}
            active={tab === value}
            onClick={() => setTab(value)}
          >
            {tabLabel(value)}
          </PillButton>
        ))}
      </div>

      <div id="ask-bohdan-starters" role="tabpanel" aria-labelledby={tabId(tab)} className="mt-3">
        <ul
          ref={listRef}
          aria-label={tChat('a11y.starters')}
          onKeyDown={handleListKeyDown}
          className="flex flex-col gap-0.5"
        >
          {STARTERS[tab].map((starter) => (
            <li key={starter.id}>
              <button
                type="button"
                onClick={() => pick(starter)}
                className={cn(
                  'group flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] leading-[1.4] text-[--text-primary] transition-colors hover:bg-[--surface-2] focus-visible:bg-[--surface-2]',
                  focusRing,
                )}
              >
                <starter.icon aria-hidden className="size-4 shrink-0 text-[--text-muted]" />
                <span className="min-w-0 flex-1">{t(`starters.${starter.labelKey}`)}</span>
                <Keycap
                  aria-hidden
                  className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:hidden"
                >
                  ↵
                </Keycap>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
