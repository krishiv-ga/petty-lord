import type { GameContent } from '../../../../contracts/content';
import type { LordId } from '../../../../contracts/ids';
import {
  activeConditions,
  adjustBoundedRating,
  adjustInfluence,
  applyGoldMillionths,
  availableGold,
  grossRaiseTaxesDailyMillionths,
  isTerritoryOccupied,
  putCondition,
  removeCondition,
} from '../../economy/economy';
import type { ActionRuntimeHandler } from '../../orders/engine';
import { timeEffect } from '../../time/effects';
import type { ActionPreview, OrderPayload, Wp020GameState } from '../../time/types';
import { getWp020, setWp020 } from '../../time/types';
import { matchingUses, recordActionUse } from '../core/antiSpam';
import { buildActionPreview, semanticActionIntent } from '../core/preview';

type ActionDefinition = GameContent['actions'][number];

function definition(content: GameContent, actionId: string): ActionDefinition {
  const action = content.actions.find((candidate) => candidate.id === actionId);
  if (!action) throw new Error(`Missing action definition ${actionId}`);
  return action;
}

function giftOption(content: GameContent, action: ActionDefinition, optionId: string | undefined) {
  const option = action.costOptions.find((candidate) => candidate.id === optionId);
  if (!option) return undefined;
  const relationship = content.constants.politics.relationshipChanges[`gift-${option.gold}`];
  if (relationship === undefined)
    throw new Error(`Missing relationship value for Gift ${option.gold}`);
  return { gold: option.gold, relationship };
}

function canonicalResult(action: ActionDefinition, effectId: string): number {
  const result = action.canonicalResults?.find(
    (candidate) => candidate.effectId === effectId,
  )?.value;
  if (result === undefined) throw new Error(`Missing ${effectId} result for ${action.id}`);
  return result;
}

function taxAdvanceDays(action: ActionDefinition, branchId: string): number {
  const effect = action.resultBranches
    ?.find((branch) => branch.id === branchId)
    ?.effects.find((candidate) => candidate.effectId === 'adjust-gold');
  if (effect?.value === undefined) throw new Error(`Missing tax advance for ${branchId}`);
  return effect.value;
}

function durationHours(state: Wp020GameState, action: ActionDefinition): number {
  return (
    (getWp020(state).king.phase === 'deathbed'
      ? action.duration.deathbedDays
      : action.duration.days) * 24
  );
}

function targetIsValid(state: Wp020GameState, targetId: string | undefined): targetId is LordId {
  return (
    targetId !== undefined &&
    targetId !== 'greyfen' &&
    Object.hasOwn(getWp020(state).lords, targetId) &&
    !getWp020(state).invalidTargets.includes(targetId)
  );
}

function giftPreview(
  content: GameContent,
  state: Wp020GameState,
  payload: OrderPayload,
): ActionPreview {
  const action = definition(content, 'send-gift');
  const option = giftOption(content, action, payload.optionId);
  const uses = matchingUses(state, {
    actionId: 'send-gift',
    nowHours: state.timeHours,
    targetId: payload.targetId ?? null,
    windowDays: 14,
  }).length;
  const reasons: string[] = [];
  if (!targetIsValid(state, payload.targetId)) reasons.push('gift-target-unavailable');
  if (!option) reasons.push('gift-size-required');
  if (uses >= 2) reasons.push('third-gift-refused-within-14-days');
  if (option && availableGold(getWp020(state).lords.greyfen) < option.gold)
    reasons.push('insufficient-gold');
  const multiplier = uses === 0 ? 1 : uses === 1 ? 0.5 : 0;
  return buildActionPreview({
    action,
    available: reasons.length === 0,
    cancellationLoss: option ? [`${option.gold} Gold paid at start`] : [],
    disabledReasons: reasons,
    durationHours: durationHours(state, action),
    fallback: 'If the target becomes unavailable, the gift fails and the paid Gold is lost.',
    intent: semanticActionIntent(false, 'commit'),
    intentionalUnknowns: ['Other domains decide the target relationship context at resolution.'],
    knownConsequences: option
      ? [`Relationship intent +${Math.trunc(option.relationship * multiplier)}`]
      : [],
    name: 'Send Gift',
    startCost: { gold: option?.gold ?? 0, influence: 0, logisticsGold: 0 },
  });
}

function holdCourtPreview(
  content: GameContent,
  state: Wp020GameState,
  payload: OrderPayload,
): ActionPreview {
  const action = definition(content, 'hold-court');
  const invitees = payload.inviteeIds ?? [];
  const uses = matchingUses(state, {
    actionId: 'hold-court',
    nowHours: state.timeHours,
    windowDays: 21,
  }).length;
  const reasons: string[] = [];
  if (invitees.length > 2 || new Set(invitees).size !== invitees.length) {
    reasons.push('court-allows-up-to-two-distinct-invitees');
  }
  if (invitees.some((invitee) => !targetIsValid(state, invitee)))
    reasons.push('invalid-court-invitee');
  if (uses >= 2) reasons.push('third-court-locked-within-21-days');
  if (availableGold(getWp020(state).lords.greyfen) < action.startCost.gold) {
    reasons.push('insufficient-gold');
  }
  const multiplier = uses === 0 ? 1 : uses === 1 ? 0.5 : 0;
  const prestige = content.constants.prestigeChanges['hold-court'];
  const influence = canonicalResult(action, 'adjust-influence');
  const relationship = content.constants.politics.relationshipChanges['first-court-invitee'];
  if (prestige === undefined || relationship === undefined) {
    throw new Error('Hold Court canonical values are incomplete');
  }
  return buildActionPreview({
    action,
    available: reasons.length === 0,
    cancellationLoss: [`${action.startCost.gold} Gold paid at start`],
    disabledReasons: reasons,
    durationHours: durationHours(state, action),
    fallback: 'Unavailable invitees are removed; the Court still resolves for remaining guests.',
    intent: semanticActionIntent(false, 'confirm'),
    knownConsequences: [
      `Prestige +${Math.trunc(prestige * multiplier)}`,
      `Influence +${Math.trunc(influence * multiplier)}`,
      `Invitee relationship intent +${Math.trunc(relationship * multiplier)}`,
    ],
    name: getWp020(state).king.phase === 'deathbed' ? 'Emergency Council' : 'Hold Court',
    startCost: action.startCost,
  });
}

function raiseTaxesPreview(content: GameContent, state: Wp020GameState): ActionPreview {
  const action = definition(content, 'raise-taxes');
  const territory = getWp020(state).territories.greyfen;
  const conditions = activeConditions(territory.conditions, state.timeHours);
  const strained = conditions.some((condition) => condition.id === 'tax-strain');
  const unrest = conditions.some((condition) => condition.id === 'unrest');
  const reasons: string[] = [];
  if (isTerritoryOccupied(territory)) reasons.push('greyfen-occupied');
  if (unrest) reasons.push('unrest-active');
  const days = taxAdvanceDays(action, strained ? 'strained-repeat' : 'first-unstrained-collection');
  const proceeds = (grossRaiseTaxesDailyMillionths(state, content) * days) / 1_000_000;
  return buildActionPreview({
    action,
    available: reasons.length === 0,
    disabledReasons: reasons,
    durationHours: durationHours(state, action),
    fallback: 'If Greyfen is occupied before resolution, no advance or condition is applied.',
    intent: semanticActionIntent(false, 'confirm'),
    knownConsequences: [
      `Immediate tax advance ${proceeds} Gold`,
      strained ? 'Tax Strain escalates to 21 days of Unrest' : 'Tax Strain applies for 21 days',
    ],
    name: 'Raise Taxes',
    severity: 'warning',
    startCost: action.startCost,
    warnings: ['Tax conditions reduce income and levy recovery.'],
  });
}

export function createCommonActionHandlers(content: GameContent): readonly ActionRuntimeHandler[] {
  const gift: ActionRuntimeHandler = {
    actionId: 'send-gift',
    preview: (state, payload) => giftPreview(content, state, payload),
    onStarted(state, payload) {
      const preview = giftPreview(content, state, payload);
      const consequence = preview.knownConsequences[0] ?? '';
      const relationshipDelta = Number(consequence.match(/\+(\d+)/)?.[1] ?? 0);
      return {
        payload: { ...payload, resolutionData: { relationshipDelta } },
        state: recordActionUse(state, 'send-gift', payload.targetId ?? null),
      };
    },
    resolve(state, payload) {
      if (!targetIsValid(state, payload.targetId)) {
        return {
          chronicleMessage: 'The gift could not be delivered; its cost was lost.',
          effects: [],
          state,
          status: 'failed',
        };
      }
      const relationshipDelta = Number(payload.resolutionData?.relationshipDelta ?? 0);
      return {
        chronicleMessage: `The gift reached ${payload.targetId}.`,
        effects: [
          timeEffect('time.relationship-effect-intent', {
            actionId: 'send-gift',
            delta: relationshipDelta,
            targetId: payload.targetId,
            visibility: 'private-to-parties',
          }),
        ],
        state,
        status: 'resolved',
      };
    },
  };

  const raiseTaxes: ActionRuntimeHandler = {
    actionId: 'raise-taxes',
    preview: (state) => raiseTaxesPreview(content, state),
    onStarted(state, payload) {
      return { payload, state: recordActionUse(state, 'raise-taxes', null) };
    },
    resolve(state) {
      const territory = getWp020(state).territories.greyfen;
      const conditions = activeConditions(territory.conditions, state.timeHours);
      if (
        isTerritoryOccupied(territory) ||
        conditions.some((condition) => condition.id === 'unrest')
      ) {
        return {
          chronicleMessage:
            'The tax collection failed because Greyfen could not be lawfully collected.',
          effects: [],
          state,
          status: 'failed',
        };
      }
      const strained = conditions.some((condition) => condition.id === 'tax-strain');
      const action = definition(content, 'raise-taxes');
      const days = taxAdvanceDays(
        action,
        strained ? 'strained-repeat' : 'first-unstrained-collection',
      );
      let next = applyGoldMillionths(
        state,
        'greyfen',
        grossRaiseTaxesDailyMillionths(state, content) * days,
        strained ? 'raise-taxes-strained-advance' : 'raise-taxes-first-advance',
        'greyfen',
      );
      const current = getWp020(next).territories.greyfen;
      const nextConditions = strained
        ? putCondition(
            removeCondition(current.conditions, 'tax-strain'),
            'unrest',
            state.timeHours,
            state.timeHours + 21 * 24,
          )
        : putCondition(
            current.conditions,
            'tax-strain',
            state.timeHours,
            state.timeHours + 21 * 24,
          );
      next = setWp020(next, {
        ...getWp020(next),
        territories: {
          ...getWp020(next).territories,
          greyfen: { ...current, conditions: nextConditions },
        },
      });
      return {
        chronicleMessage: strained
          ? 'Repeated collection replaced Tax Strain with Unrest.'
          : 'Greyfen paid an advance and entered Tax Strain.',
        effects: [
          timeEffect('time.condition-changed', {
            conditionId: strained ? 'unrest' : 'tax-strain',
            territoryId: 'greyfen',
          }),
        ],
        state: next,
        status: 'resolved',
      };
    },
  };

  const holdCourt: ActionRuntimeHandler = {
    actionId: 'hold-court',
    preview: (state, payload) => holdCourtPreview(content, state, payload),
    onStarted(state, payload) {
      const preview = holdCourtPreview(content, state, payload);
      const numeric = (index: number) =>
        Number(preview.knownConsequences[index]?.match(/\+(\d+)/)?.[1] ?? 0);
      return {
        payload: {
          ...payload,
          resolutionData: {
            influenceDelta: numeric(1),
            prestigeDelta: numeric(0),
            relationshipDelta: numeric(2),
          },
        },
        state: recordActionUse(state, 'hold-court', null),
      };
    },
    resolve(state, payload) {
      const validInvitees = (payload.inviteeIds ?? []).filter((invitee) =>
        targetIsValid(state, invitee),
      );
      const prestigeDelta = Number(payload.resolutionData?.prestigeDelta ?? 0);
      const influenceDelta = Number(payload.resolutionData?.influenceDelta ?? 0);
      const relationshipDelta = Number(payload.resolutionData?.relationshipDelta ?? 0);
      let next = adjustBoundedRating(state, 'greyfen', 'prestige', prestigeDelta, 'hold-court');
      next = adjustInfluence(next, 'greyfen', influenceDelta, 'hold-court');
      return {
        chronicleMessage:
          getWp020(state).king.phase === 'deathbed'
            ? 'The Emergency Council concluded.'
            : 'The Court concluded.',
        effects: validInvitees.map((targetId) =>
          timeEffect('time.relationship-effect-intent', {
            actionId: 'hold-court',
            delta: relationshipDelta,
            targetId,
            visibility: 'public',
          }),
        ),
        state: next,
        status: 'resolved',
      };
    },
  };

  return [gift, raiseTaxes, holdCourt];
}

export function previewCommonAction(
  content: GameContent,
  state: Wp020GameState,
  payload: OrderPayload,
): ActionPreview {
  const handler = createCommonActionHandlers(content).find(
    (candidate) => candidate.actionId === payload.actionId,
  );
  if (!handler) throw new Error(`WP-020 does not own action ${payload.actionId}`);
  return handler.preview(state, payload);
}
