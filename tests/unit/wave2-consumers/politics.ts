import { unchangedTransition, type Wave2DomainModule } from '@contracts/domains';
import type { FoundationDomainExtensions } from '@contracts/state';

export const politicsModule: Wave2DomainModule<'politics', FoundationDomainExtensions> = {
  id: 'politics',
  scheduledResolvers: { 'politics.support': ({ state }) => unchangedTransition(state) },
};
