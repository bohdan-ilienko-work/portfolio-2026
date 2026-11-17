import type { ReactNode } from 'react';

import { actionClass } from '@/components/chat/ui';
import { cn } from '@/lib/utils';

// Shared look of every card. Text blocks break anywhere (long Russian/German/Polish words, URLs), flex children
// carry min-w-0 so a long string can never widen the card, and no card contains media that loads at its own size.

export const CardShell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <article
    className={cn(
      'min-w-0 rounded-[10px] border border-[--border-subtle] bg-[--surface-2] p-3 transition-colors hover:border-[--border-medium]',
      className,
    )}
  >
    {children}
  </article>
);

export const cardTitleClass =
  'text-[13px] font-semibold leading-[1.35] text-[--text-primary] [overflow-wrap:anywhere]';

export const cardBodyClass = 'text-[12px] leading-[1.5] text-[--text-secondary] [overflow-wrap:anywhere]';

/** Label inside an action: `actionClass` is leading-none, which would clip descenders under `truncate` (overflow hidden). */
export const actionLabelClass = 'truncate leading-4';

/** `actionClass` with a 32px target on touch widths (the primitive is 28px). */
export const cardAction = (variant: 'primary' | 'secondary' = 'secondary', className?: string) =>
  cn(actionClass(variant), 'h-8 max-w-full sm:h-7', className);

type ChipListProps = { items: readonly string[]; size?: 'sm' | 'md'; className?: string };

/** Plain-text chips (names only): no icons, several of the source icons are white-on-dark and vanish on the light theme. */
export const ChipList = ({ items, size = 'md', className }: ChipListProps) => (
  <ul className={cn('flex min-w-0 flex-wrap gap-1.5', className)}>
    {items.map((item) => (
      <li
        key={item}
        className={cn(
          'max-w-full truncate bg-[--surface-3] text-[--text-secondary]',
          size === 'md'
            ? 'h-6 rounded-[6px] px-2 text-[12px] leading-6'
            : 'h-5 rounded-[4px] px-1.5 text-[11px] leading-5',
        )}
      >
        {item}
      </li>
    ))}
  </ul>
);
