import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/lib/utils';

// Shared visual primitives of the chat. Structure and density follow the Raycast reference (hairline borders,
// 6-10px radii, keycaps, compact 12-14px type); colors come only from the site's surface/border/text tokens
// plus the single --chat-accent. Shell (components/chat/*) and cards (components/chat/cards/*) both import from here.

// The solid accent, not the translucent --chat-ring (1.8-2.4:1 against the panel): a focus indicator needs 3:1.
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--chat-accent] focus-visible:ring-offset-0';

// Accent-filled controls: the ring is the fill's own colour, so it gets a gap (the card surface they sit on) to read
// as an outline and not as a bigger button. Merged after focusRing, which it overrides.
export const filledFocusGap = 'focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-2)]';

export const monoFont = 'font-[family-name:var(--chat-mono)]';

type TextProps = { children: ReactNode; className?: string };

/** `aria-hidden` for a keycap that only repeats what the screen reader already gets (an Enter hint on a button). */
export const Keycap = ({ children, className, 'aria-hidden': ariaHidden }: TextProps & { 'aria-hidden'?: boolean }) => (
  <kbd
    aria-hidden={ariaHidden}
    className={cn(
      'inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-[--border-medium] bg-[--surface-2] px-1 text-[11px] font-medium leading-none text-[--text-secondary]',
      monoFont,
      className,
    )}
  >
    {children}
  </kbd>
);

/** Small uppercase mono label: periods, group names, "On the site". */
export const MicroLabel = ({ children, className }: TextProps) => (
  <span
    className={cn(
      'text-[11px] font-medium uppercase leading-none tracking-[0.04em] text-[--text-muted]',
      monoFont,
      className,
    )}
  >
    {children}
  </span>
);

/** Class string for compact action links/buttons inside cards (<a> or <button>). */
export const actionClass = (variant: 'primary' | 'secondary' = 'secondary') =>
  cn(
    'inline-flex h-7 items-center justify-center gap-1.5 rounded-[6px] border px-2.5 text-[12px] font-medium leading-none transition-colors',
    focusRing,
    variant === 'primary'
      ? cn('border-transparent bg-[--chat-accent] text-[--chat-accent-fg] hover:bg-[--chat-accent-hover]', filledFocusGap)
      : 'border-[--border-medium] bg-transparent text-[--text-primary] hover:bg-[--surface-3]',
  );

type PillButtonProps = ComponentPropsWithoutRef<'button'> & { active?: boolean };

/** Pill used for follow-up suggestions and the topic tabs. */
export const PillButton = ({ active = false, className, type = 'button', ...props }: PillButtonProps) => (
  <button
    type={type}
    className={cn(
      'inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-[12px] leading-none transition-colors',
      focusRing,
      active
        ? 'border-[--border-medium] bg-[--surface-2] text-[--text-primary]'
        : 'border-[--border-subtle] text-[--text-secondary] hover:border-[--border-medium] hover:text-[--text-primary]',
      className,
    )}
    {...props}
  />
);

type IconButtonProps = ComponentPropsWithoutRef<'button'> & { label: string };

/** 32px square icon button. `label` becomes aria-label and title. */
export const IconButton = ({ label, className, type = 'button', children, ...props }: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[--text-secondary] transition-colors hover:bg-[--surface-2] hover:text-[--text-primary]',
      focusRing,
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

/** The "B" monogram used instead of a photo (public/profile.svg is the template's stock portrait, not Bohdan). */
export const Monogram = ({ size = 28, className }: { size?: number; className?: string }) => (
  <span
    aria-hidden
    style={{ width: size, height: size, fontSize: Math.round(size * 0.43) }}
    className={cn(
      'inline-flex shrink-0 select-none items-center justify-center rounded-full border border-[--border-medium] bg-[--surface-2] font-semibold leading-none text-[--text-primary]',
      className,
    )}
  >
    B
  </span>
);
