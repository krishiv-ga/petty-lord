import type { GameContent } from '../../../contracts/content';
import type { Wave2DomainModule } from '../../../contracts/domains';
import type { FoundationDomainExtensions } from '../../../contracts/state';
import { createCommonActionHandlers } from '../actions/common/commonActions';
import { createOrderLifecycleRegistrations } from '../orders/engine';
import { createReactionRegistrations } from '../orders/reactions';
import { createTimeResolvers } from './resolvers';

export function createWp020DomainModule(
  content: GameContent,
): Wave2DomainModule<'time', FoundationDomainExtensions> {
  const order = createOrderLifecycleRegistrations(content, createCommonActionHandlers(content));
  const reactions = createReactionRegistrations();
  return {
    decisionResolvers: reactions.decisionResolvers,
    id: 'time',
    initiativeCancellers: order.initiativeCancellers,
    initiativeStarters: order.initiativeStarters,
    scheduledResolvers: {
      ...createTimeResolvers(content),
      ...order.scheduledResolvers,
      ...reactions.scheduledResolvers,
    },
  };
}
