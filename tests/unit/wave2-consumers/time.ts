import { unchangedTransition, type Wave2DomainModule } from '@contracts/domains';
import type { FoundationDomainExtensions } from '@contracts/state';

export const timeModule: Wave2DomainModule<'time', FoundationDomainExtensions> = {
  id: 'time',
  scheduledResolvers: { 'time.dawn': ({ state }) => unchangedTransition(state) },
};
