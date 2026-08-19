import { unchangedTransition, type Wave2DomainModule } from '@contracts/domains';
import type { FoundationDomainExtensions } from '@contracts/state';

export const warModule: Wave2DomainModule<'war', FoundationDomainExtensions> = {
  id: 'war',
  scheduledResolvers: { 'war.battle': ({ state }) => unchangedTransition(state) },
};
