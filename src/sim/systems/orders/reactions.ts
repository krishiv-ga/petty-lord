import type { DomainMessageKind, FoundationScheduledResolver } from '../../../contracts/domains';
import type { FoundationDomainExtensions } from '../../../contracts/state';
import { scheduleItem } from '../../kernel';
import type { DecisionResolver } from '../../kernel/types';
import type { JsonValue } from '../../state';
import { timeEffect } from '../time/effects';
import { TIME_EVENT_KINDS } from '../time/state';
import type { ReactionRecord, Wp020GameState } from '../time/types';
import { getWp020, setWp020 } from '../time/types';

export interface QueueReactionInput {
  readonly choiceIds: readonly string[];
  readonly deadlineHours: number | null;
  readonly dueTimeHours?: number;
  readonly id: string;
  readonly kind: string;
  readonly payload?: JsonValue;
  readonly priority: number;
}

export function queueReaction(state: Wp020GameState, input: QueueReactionInput): Wp020GameState {
  if (
    !input.id ||
    !input.kind ||
    input.choiceIds.length === 0 ||
    new Set(input.choiceIds).size !== input.choiceIds.length
  ) {
    throw new TypeError('Reaction requires unique choices and non-empty ids');
  }
  if (getWp020(state).reactions.some((reaction) => reaction.id === input.id)) {
    throw new Error(`Reaction id ${input.id} is already registered`);
  }
  if (!Number.isSafeInteger(input.priority))
    throw new TypeError('Reaction priority must be an integer');
  if (
    input.deadlineHours !== null &&
    (!Number.isFinite(input.deadlineHours) || input.deadlineHours < state.timeHours)
  ) {
    throw new RangeError('Reaction deadline must be finite and cannot be historical');
  }
  const scheduled = scheduleItem(state, {
    dueTimeHours: input.dueTimeHours ?? state.timeHours,
    kind: TIME_EVENT_KINDS.reaction,
    payload: { reactionId: input.id },
    priority: input.priority,
  });
  const record: ReactionRecord = {
    choiceIds: [...input.choiceIds],
    deadlineHours: input.deadlineHours,
    id: input.id,
    kind: input.kind,
    openedAtHours: null,
    outcome: null,
    payload: input.payload ?? null,
    priority: input.priority,
    resumeSpeed: state.speed,
    scheduledSequenceId: scheduled.item.sequenceId,
    status: 'queued',
  };
  const scheduledState = scheduled.state as Wp020GameState;
  return setWp020(scheduledState, {
    ...getWp020(scheduledState),
    reactions: [...getWp020(scheduledState).reactions, record],
  });
}

export function createReactionRegistrations(): {
  decisionResolvers: Record<string, DecisionResolver<FoundationDomainExtensions>>;
  scheduledResolvers: Record<
    DomainMessageKind<'time'>,
    FoundationScheduledResolver<'time', FoundationDomainExtensions>
  >;
} {
  const open: FoundationScheduledResolver<'time', FoundationDomainExtensions> = ({
    item,
    state,
  }) => {
    const wpState = state as unknown as Wp020GameState;
    const reactionId =
      item.payload && typeof item.payload === 'object' && 'reactionId' in item.payload
        ? item.payload.reactionId
        : null;
    if (typeof reactionId !== 'string') throw new TypeError('Reaction event requires reactionId');
    const reaction = getWp020(wpState).reactions.find((candidate) => candidate.id === reactionId);
    if (reaction?.status !== 'queued') throw new Error('Queued reaction not found');
    const expired = reaction.deadlineHours !== null && reaction.deadlineHours < state.timeHours;
    const resumeSpeed = state.speed;
    const next = setWp020(wpState, {
      ...getWp020(wpState),
      reactions: getWp020(wpState).reactions.map((candidate) =>
        candidate.id === reactionId
          ? {
              ...candidate,
              openedAtHours: expired ? null : state.timeHours,
              resumeSpeed,
              status: expired ? 'expired' : 'opened',
            }
          : candidate,
      ),
    });
    if (expired) {
      return {
        effects: [timeEffect('time.reaction-expired', { reactionId })],
        state: next,
      };
    }
    return {
      decision: {
        choiceIds: [...reaction.choiceIds],
        id: reaction.id,
        kind: 'time.reaction-choice',
        payload: {
          deadlineHours: reaction.deadlineHours,
          kind: reaction.kind,
          payload: reaction.payload,
        },
      },
      effects: [timeEffect('time.reaction-opened', { reactionId })],
      state: next,
    };
  };

  const choose: DecisionResolver<FoundationDomainExtensions> = ({ command, decision, state }) => {
    const wpState = state as unknown as Wp020GameState;
    const reaction = getWp020(wpState).reactions.find((candidate) => candidate.id === decision.id);
    if (reaction?.status !== 'opened') throw new Error('Opened reaction not found');
    const next = setWp020(wpState, {
      ...getWp020(wpState),
      reactions: getWp020(wpState).reactions.map((candidate) =>
        candidate.id === reaction.id
          ? {
              ...candidate,
              outcome: { choiceId: command.choiceId, payload: command.payload },
              status: 'resolved',
            }
          : candidate,
      ),
    });
    return {
      effects: [
        timeEffect('time.reaction-selected', {
          choiceId: command.choiceId,
          reactionId: reaction.id,
          resumeSpeed: reaction.resumeSpeed,
        }),
      ],
      state: next,
    };
  };

  return {
    decisionResolvers: { 'time.reaction-choice': choose },
    scheduledResolvers: { [TIME_EVENT_KINDS.reaction]: open },
  };
}
