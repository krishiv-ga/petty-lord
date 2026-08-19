import { unchangedTransition, type Wave2DomainModule } from '@contracts/domains';
import type { FoundationDomainExtensions } from '@contracts/state';

export const knowledgeModule: Wave2DomainModule<'knowledge', FoundationDomainExtensions> = {
  id: 'knowledge',
  scheduledResolvers: { 'knowledge.observe': ({ state }) => unchangedTransition(state) },
};
