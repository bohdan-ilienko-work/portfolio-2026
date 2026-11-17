'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

import { ContactCard } from '@/components/chat/cards/contact-card';
import { CvCard } from '@/components/chat/cards/cv-card';
import { ExperienceCard } from '@/components/chat/cards/experience-card';
import { ProjectCard } from '@/components/chat/cards/project-card';
import { StackCard } from '@/components/chat/cards/stack-card';
import { resolveCards } from '@/lib/chat/card-registry';
import type { ResolvedCard } from '@/lib/chat/card-registry';
import type { CardRef, SectionId } from '@/lib/chat/protocol';

export type ChatCardsProps = {
  cards: CardRef[];
  /** Left out while a request is being written: the contact card then shows only the direct channels. */
  onStartRequest?: () => void;
  onNavigate: (section: SectionId) => void;
};

const CARD_ENTER_SECONDS = 0.14;
const CARD_STAGGER_SECONDS = 0.04;

const renderCard = (card: ResolvedCard, { onStartRequest, onNavigate }: Omit<ChatCardsProps, 'cards'>) => {
  switch (card.kind) {
    case 'project':
      return <ProjectCard data={card.data} />;
    case 'experience':
      return <ExperienceCard data={card.data} onNavigate={onNavigate} />;
    case 'stack':
      return <StackCard data={card.data} />;
    case 'contact':
      return <ContactCard onStartRequest={onStartRequest} />;
    case 'cv':
      return <CvCard />;
  }
};

export const ChatCards = ({ cards, onStartRequest, onNavigate }: ChatCardsProps) => {
  const reduceMotion = useReducedMotion();
  const resolved = useMemo(() => resolveCards(cards), [cards]);

  if (resolved.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {resolved.map((card, index) => (
        <motion.div
          key={card.key}
          className="min-w-0"
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: CARD_ENTER_SECONDS, delay: index * CARD_STAGGER_SECONDS, ease: 'easeOut' }
          }
        >
          {renderCard(card, { onStartRequest, onNavigate })}
        </motion.div>
      ))}
    </div>
  );
};
