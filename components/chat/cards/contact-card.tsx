import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import { LuArrowUpRight, LuCheck, LuCopy, LuGithub, LuLinkedin, LuMail, LuSend } from 'react-icons/lu';

import { CardShell, actionLabelClass, cardAction, cardTitleClass } from '@/components/chat/cards/card-shell';
import { IconButton } from '@/components/chat/ui';
import { getContactChannels } from '@/lib/chat/card-registry';
import type { ContactChannel, ContactChannelId } from '@/lib/chat/card-registry';

const COPIED_FEEDBACK_MS = 1500;

const CHANNEL_ICONS: Record<ContactChannelId, IconType> = {
  email: LuMail,
  telegram: LuSend,
  linkedin: LuLinkedin,
  github: LuGithub
};

// navigator.clipboard exists only in secure contexts (a phone testing the dev server over http://192.168.x.x has none)
// and can reject without a user gesture or permission. Falls back to a hidden textarea, and reports failure instead of throwing.
const copyToClipboard = async (value: string, host: HTMLElement | null): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the textarea path.
  }

  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.setAttribute('aria-hidden', 'true');
  field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';

  try {
    // Inside the panel, so a focus trap around it does not pull focus away before the copy.
    (host ?? document.body).appendChild(field);
    field.focus({ preventScroll: true });
    field.select();
    field.setSelectionRange(0, value.length);

    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
    previous?.focus();
  }
};

const ContactRow = ({ channel }: { channel: ContactChannel }) => {
  const t = useTranslations('chat.cards.contact');
  const [copied, setCopied] = useState(false);
  const rowRef = useRef<HTMLLIElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const Icon = CHANNEL_ICONS[channel.id];
  const { copyValue } = channel;

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!copyValue) return;

    const ok = await copyToClipboard(copyValue, rowRef.current);
    if (!ok || !mounted.current) return;

    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  return (
    <li
      ref={rowRef}
      className="group/row relative flex h-9 items-center gap-2 rounded-[8px] px-2 text-[12px] leading-4 transition-colors hover:bg-[--surface-3]"
    >
      <Icon aria-hidden className="size-4 shrink-0 text-[--text-muted]" />

      {/* The link is stretched over the whole row; the Copy button sits above it (z-10). */}
      <a
        href={channel.href}
        title={channel.value}
        {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="flex min-w-0 flex-1 items-center gap-2 outline-none after:absolute after:inset-0 after:rounded-[8px] focus-visible:after:ring-2 focus-visible:after:ring-[--chat-accent]"
      >
        <span className="w-[3.75rem] shrink-0 truncate font-medium text-[--text-primary]">{t(channel.id)}</span>

        {copied ? (
          <span className="flex min-w-0 items-center gap-1 text-[--chat-accent]">
            <LuCheck aria-hidden className="size-3.5 shrink-0" />
            <span className={actionLabelClass}>{t('copied')}</span>
          </span>
        ) : (
          <span className="min-w-0 truncate text-[--text-secondary]">{channel.value}</span>
        )}
      </a>

      {copyValue ? (
        <IconButton label={copied ? t('copied') : t('copy')} onClick={handleCopy} className="relative z-10">
          {copied ? <LuCheck aria-hidden className="size-4 text-[--chat-accent]" /> : <LuCopy aria-hidden className="size-4" />}
        </IconButton>
      ) : null}

      <LuArrowUpRight
        aria-hidden
        className="size-3.5 shrink-0 text-[--text-muted] transition-colors group-hover/row:text-[--text-primary]"
      />

      <span role="status" className="sr-only">
        {copied ? t('copied') : ''}
      </span>
    </li>
  );
};

/** Without `onStartRequest` the card is only the direct channels: a request is already being written. */
type ContactCardProps = { onStartRequest?: () => void };

export const ContactCard = ({ onStartRequest }: ContactCardProps) => {
  const t = useTranslations('chat.cards.contact');
  const channels = getContactChannels();

  return (
    <CardShell>
      <p className={cardTitleClass}>{t('title')}</p>

      <p className="mt-1 flex items-start gap-2 text-[12px] leading-[1.5] text-[--text-secondary]">
        <span aria-hidden className="mt-[6px] size-1.5 shrink-0 rounded-full bg-[--chat-accent]" />
        <span className="min-w-0 [overflow-wrap:anywhere]">{t('availability')}</span>
      </p>

      <ul className="-mx-2 mt-2.5 flex flex-col">
        {channels.map((channel) => (
          <ContactRow key={channel.id} channel={channel} />
        ))}
      </ul>

      {onStartRequest ? (
        <>
          <button type="button" onClick={onStartRequest} className={cardAction('primary', 'mt-3 w-full sm:h-8')}>
            <span className={actionLabelClass}>{t('request')}</span>
          </button>

          <p className="mt-2 text-[12px] leading-[1.5] text-[--text-muted] [overflow-wrap:anywhere]">{t('requestHint')}</p>
        </>
      ) : null}
    </CardShell>
  );
};
