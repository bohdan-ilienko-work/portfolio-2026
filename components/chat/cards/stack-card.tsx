import { useTranslations } from 'next-intl';

import { CardShell, ChipList } from '@/components/chat/cards/card-shell';
import { MicroLabel } from '@/components/chat/ui';
import type { StackCardData } from '@/lib/chat/card-registry';

type StackCardProps = { data: StackCardData };

export const StackCard = ({ data }: StackCardProps) => {
  const t = useTranslations('chat.cards');

  return (
    <CardShell>
      <MicroLabel className="block [overflow-wrap:anywhere]">{t(`stack.${data.id}`)}</MicroLabel>
      <ChipList items={data.names} className="mt-2.5" />
    </CardShell>
  );
};
