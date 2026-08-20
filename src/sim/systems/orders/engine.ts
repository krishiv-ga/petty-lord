import type { GameContent } from '../../../contracts/content';
import type {
  DomainMessageKind,
  FoundationEffect,
  FoundationScheduledResolver,
} from '../../../contracts/domains';
import type { FoundationDomainExtensions } from '../../../contracts/state';
import { DAWN_PRIORITY } from '../../kernel';
import type { InitiativeCanceller, InitiativeStarter } from '../../kernel/types';
import type { JsonValue } from '../../state';
import { spendGold, spendInfluence } from '../economy/economy';
import { timeEffect } from '../time/effects';
import type { ActionPreview, OrderPayload, OrderRecord, Wp020GameState } from '../time/types';
import { getWp020, setWp020 } from '../time/types';

type ActionDefinition = GameContent['actions'][number];

export interface ActionResolution {
  readonly chronicleMessage: string;
  readonly effects: readonly FoundationEffect<'time'>[];
  readonly state: Wp020GameState;
  readonly status: 'failed' | 'resolved';
}

export interface ActionCancellation {
  readonly chronicleMessage?: string;
  readonly effects: readonly FoundationEffect<'time'>[];
  readonly state: Wp020GameState;
}

export interface ActionRuntimeHandler {
  readonly actionId: OrderPayload['actionId'];
  readonly onCancelled?: (
    state: Wp020GameState,
    payload: OrderPayload,
    order: OrderRecord,
  ) => ActionCancellation;
  readonly onStarted?: (
    state: Wp020GameState,
    payload: OrderPayload,
    preview: ActionPreview,
  ) => { readonly payload: OrderPayload; readonly state: Wp020GameState };
  readonly preview: (state: Wp020GameState, payload: OrderPayload) => ActionPreview;
  readonly resolve: (
    state: Wp020GameState,
    payload: OrderPayload,
    order: OrderRecord,
  ) => ActionResolution;
}

export function orderKind(actionId: OrderPayload['actionId']): DomainMessageKind<'time'> {
  return `time.action.${actionId}`;
}

function parsePayload(value: unknown): OrderPayload {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Order payload must be an object');
  }
  const payload = value as Record<string, unknown>;
  if (typeof payload.actionId !== 'string') throw new TypeError('Order actionId is required');
  if (payload.targetId !== undefined && typeof payload.targetId !== 'string') {
    throw new TypeError('Order targetId must be a string');
  }
  if (payload.optionId !== undefined && typeof payload.optionId !== 'string') {
    throw new TypeError('Order optionId must be a string');
  }
  if (
    payload.inviteeIds !== undefined &&
    (!Array.isArray(payload.inviteeIds) ||
      !payload.inviteeIds.every((invitee) => typeof invitee === 'string'))
  ) {
    throw new TypeError('Order inviteeIds must be strings');
  }
  return payload as unknown as OrderPayload;
}

function contentAction(content: GameContent, actionId: string): ActionDefinition {
  const action = content.actions.find((candidate) => candidate.id === actionId);
  if (!action) throw new Error(`Unknown action ${actionId}`);
  return action;
}

function replaceOrder(
  state: Wp020GameState,
  sequenceId: number,
  update: (order: OrderRecord) => OrderRecord,
): Wp020GameState {
  const system = getWp020(state);
  return setWp020(state, {
    ...system,
    orders: system.orders.map((order) =>
      order.scheduledSequenceId === sequenceId ? update(order) : order,
    ),
  });
}

export function createOrderLifecycleRegistrations(
  content: GameContent,
  handlers: readonly ActionRuntimeHandler[],
): {
  initiativeCancellers: Record<string, InitiativeCanceller<FoundationDomainExtensions>>;
  initiativeStarters: Record<string, InitiativeStarter<FoundationDomainExtensions>>;
  scheduledResolvers: Record<
    DomainMessageKind<'time'>,
    FoundationScheduledResolver<'time', FoundationDomainExtensions>
  >;
} {
  const initiativeStarters: Record<string, InitiativeStarter<FoundationDomainExtensions>> = {};
  const initiativeCancellers: Record<string, InitiativeCanceller<FoundationDomainExtensions>> = {};
  const scheduledResolvers: Record<
    DomainMessageKind<'time'>,
    FoundationScheduledResolver<'time', FoundationDomainExtensions>
  > = {};

  for (const handler of handlers) {
    const kind = orderKind(handler.actionId);
    initiativeStarters[kind] = ({ command, state }) => {
      let wpState = state as unknown as Wp020GameState;
      let payload = parsePayload(command.payload);
      if (payload.actionId !== handler.actionId) throw new Error('Initiative kind/action mismatch');
      const system = getWp020(wpState);
      const activeSlots = system.orders
        .filter((order) => order.status === 'active')
        .map((order) => order.slot);
      const slot = ([0, 1] as const).find((candidate) => !activeSlots.includes(candidate));
      if (slot === undefined) throw new Error('Both player Order slots are occupied');
      const preview = handler.preview(wpState, payload);
      if (!preview.available)
        throw new Error(`Action unavailable: ${preview.disabledReasons.join(', ')}`);
      wpState = spendGold(
        wpState,
        'greyfen',
        preview.startCost.gold + preview.startCost.logisticsGold,
        `action-start:${handler.actionId}`,
      );
      wpState = spendInfluence(
        wpState,
        'greyfen',
        preview.startCost.influence,
        `action-start:${handler.actionId}`,
      );
      if (handler.onStarted) {
        const started = handler.onStarted(wpState, payload, preview);
        wpState = started.state;
        payload = started.payload;
      }
      const sequenceId = state.nextSequenceId;
      const order: OrderRecord = {
        actionId: handler.actionId,
        cancellationLoss: preview.cancellationLoss,
        completedAtHours: state.timeHours + preview.durationHours,
        endedAtHours: null,
        fallback: preview.fallback,
        payload,
        scheduledSequenceId: sequenceId,
        slot,
        startedAtHours: state.timeHours,
        status: 'active',
      };
      wpState = setWp020(wpState, {
        ...getWp020(wpState),
        orders: [...getWp020(wpState).orders, order],
      });
      return {
        chronicle: [
          {
            data: { actionId: handler.actionId, sequenceId, slot },
            id: `order-start-${sequenceId}`,
            kind: 'time.order-started',
            message: `Order started: ${handler.actionId}.`,
          },
        ],
        effects: [
          timeEffect('time.order-started', { actionId: handler.actionId, sequenceId, slot }),
        ],
        schedule: [
          {
            dueTimeHours: order.completedAtHours,
            kind,
            payload: payload as unknown as JsonValue,
            priority: DAWN_PRIORITY.PLAYER_ORDERS_AND_AI_INTENTS,
          },
        ],
        state: wpState,
      };
    };

    initiativeCancellers[kind] = ({ item, state }) => {
      const wpState = state as unknown as Wp020GameState;
      const order = getWp020(wpState).orders.find(
        (candidate) => candidate.scheduledSequenceId === item.sequenceId,
      );
      if (order?.status !== 'active') throw new Error('Active Order record not found');
      const cancellation = handler.onCancelled?.(wpState, order.payload, order) ?? {
        effects: [],
        state: wpState,
      };
      const next = replaceOrder(cancellation.state, item.sequenceId, (candidate) => ({
        ...candidate,
        endedAtHours: state.timeHours,
        status: 'cancelled',
      }));
      return {
        chronicle: [
          {
            data: { actionId: order.actionId, sequenceId: item.sequenceId },
            id: `order-cancel-${item.sequenceId}`,
            kind: 'time.order-cancelled',
            message: cancellation.chronicleMessage ?? `Order cancelled: ${order.actionId}.`,
          },
        ],
        effects: [
          ...cancellation.effects,
          timeEffect('time.order-cancelled', {
            actionId: order.actionId,
            cancellationLoss: [...order.cancellationLoss],
          }),
        ],
        state: next,
      };
    };

    scheduledResolvers[kind] = ({ item, state }) => {
      const wpState = state as unknown as Wp020GameState;
      const order = getWp020(wpState).orders.find(
        (candidate) => candidate.scheduledSequenceId === item.sequenceId,
      );
      if (order?.status !== 'active') throw new Error('Active Order record not found');
      contentAction(content, order.actionId);
      const resolution = handler.resolve(wpState, order.payload, order);
      const next = replaceOrder(resolution.state, item.sequenceId, (candidate) => ({
        ...candidate,
        endedAtHours: state.timeHours,
        status: resolution.status,
      }));
      return {
        chronicle: [
          {
            data: {
              actionId: order.actionId,
              sequenceId: item.sequenceId,
              status: resolution.status,
            },
            id: `order-${resolution.status}-${item.sequenceId}`,
            kind: `time.order-${resolution.status}`,
            message: resolution.chronicleMessage,
          },
        ],
        effects: [
          ...resolution.effects,
          timeEffect(`time.order-${resolution.status}`, {
            actionId: order.actionId,
            sequenceId: item.sequenceId,
          }),
        ],
        state: next,
      };
    };
  }
  return { initiativeCancellers, initiativeStarters, scheduledResolvers };
}
