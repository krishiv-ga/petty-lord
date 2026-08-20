import { describe, expect, it } from 'vitest';
import { canonicalGameContent } from '../../../src/contracts/content';
import { createRandomState } from '../../../src/sim/random/random';
import {
  EMPTY_EVENT_ENGINE_STATE,
  projectEventDecision,
  queueFollowUpDecision,
  queueMandatoryEvent,
  resolveEventChoice,
  resolveFollowUpChoice,
  selectAmbientEventAtDawn,
} from '../../../src/sim/systems/events/events';
import {
  classifyNotification,
  type NotificationKind,
  notificationVolumeSample,
} from '../../../src/sim/systems/events/notifications';

const allRequirements = new Set(
  canonicalGameContent.events.flatMap((event) => [
    ...event.requirementIds,
    ...event.choices.flatMap((choice) => choice.requirementIds),
  ]),
);

describe('authored event engine', () => {
  it('loads the complete validated authored set and queues phase-mandatory decisions', () => {
    expect(canonicalGameContent.events).toHaveLength(16);
    expect(canonicalGameContent.events.filter((event) => event.kind === 'mandatory')).toHaveLength(
      4,
    );
    const queued = queueMandatoryEvent({
      atHours: 0,
      content: canonicalGameContent,
      eventId: 'e01-prognosis',
      phase: 'stable',
      state: EMPTY_EVENT_ENGINE_STATE,
    });
    expect(projectEventDecision(queued.event, 0)).toEqual({
      choiceIds: ['e01-understand'],
      dueAtHours: 0,
      eventId: 'e01-prognosis',
      mandatory: true,
      openedAtHours: 0,
    });
  });

  it('stores weighted window selection so refresh cannot reroll it', () => {
    const first = selectAmbientEventAtDawn({
      atHours: 192,
      content: canonicalGameContent,
      deathCheckPassedAlive: true,
      elapsedDay: 8,
      majorDecisionOrBattleThisDawn: false,
      phase: 'stable',
      randomState: createRandomState('events-reload'),
      satisfiedRequirementIds: allRequirements,
      state: EMPTY_EVENT_ENGINE_STATE,
    });
    expect(first.event).not.toBeNull();
    const reload = selectAmbientEventAtDawn({
      atHours: 192,
      content: canonicalGameContent,
      deathCheckPassedAlive: true,
      elapsedDay: 8,
      majorDecisionOrBattleThisDawn: false,
      phase: 'stable',
      randomState: createRandomState('different-refresh-state'),
      satisfiedRequirementIds: allRequirements,
      state: { ...first.state, pendingEventId: null },
    });
    expect(reload.event?.id).toBe(first.event?.id);
    expect(reload.wasStored).toBe(true);

    const resolved = resolveEventChoice({
      atHours: 192,
      choiceId: 'invalid',
      content: canonicalGameContent,
      randomState: first.randomStateAfter,
      resources: { gold: 0, influence: 0 },
      satisfiedRequirementIds: new Set(),
      state: first.state,
    });
    const cannotRepeat = selectAmbientEventAtDawn({
      atHours: 216,
      content: canonicalGameContent,
      deathCheckPassedAlive: true,
      elapsedDay: 9,
      majorDecisionOrBattleThisDawn: false,
      phase: 'stable',
      randomState: resolved.randomStateAfter,
      satisfiedRequirementIds: allRequirements,
      state: resolved.state,
    });
    expect(cannotRepeat.suppressedReason).toBe('event-slot-already-resolved');
  });

  it('suppresses an ambient event after the same-dawn death check', () => {
    const result = selectAmbientEventAtDawn({
      atHours: 1_200,
      content: canonicalGameContent,
      deathCheckPassedAlive: false,
      elapsedDay: 50,
      majorDecisionOrBattleThisDawn: false,
      phase: 'deathbed',
      randomState: createRandomState('death-first'),
      satisfiedRequirementIds: allRequirements,
      state: EMPTY_EVENT_ENGINE_STATE,
    });
    expect(result.event).toBeNull();
    expect(result.suppressedReason).toBe('king-died-this-dawn');
  });

  it('derives canonical ambient slots and rejects gap days', () => {
    const result = selectAmbientEventAtDawn({
      atHours: 264,
      content: canonicalGameContent,
      deathCheckPassedAlive: true,
      elapsedDay: 11,
      majorDecisionOrBattleThisDawn: false,
      phase: 'stable',
      randomState: createRandomState('critic-gap-day'),
      satisfiedRequirementIds: allRequirements,
      state: EMPTY_EVENT_ENGINE_STATE,
    });
    expect(result.event).toBeNull();
    expect(result.suppressedReason).toBe('outside-ambient-slot');
  });

  it('uses a legal zero-cost fallback if the chosen response becomes impossible', () => {
    const state = { ...EMPTY_EVENT_ENGINE_STATE, pendingEventId: 'e05-failed-harvest' as const };
    const result = resolveEventChoice({
      atHours: 240,
      choiceId: 'e05-buy-grain',
      content: canonicalGameContent,
      randomState: createRandomState('fallback'),
      resources: { gold: 0, influence: 0 },
      satisfiedRequirementIds: new Set(),
      state,
    });
    expect(result.fallbackUsed).toBe(true);
    expect(result.appliedChoiceId).toBe('e05-open-granaries');
    expect(result.resources).toEqual({ gold: 0, influence: 0 });
  });

  it('stores a choice outcome so save/load cannot reroll casualties', () => {
    const pending = {
      ...EMPTY_EVENT_ENGINE_STATE,
      pendingEventId: 'e06-northern-raiders' as const,
    };
    const first = resolveEventChoice({
      atHours: 192,
      choiceId: 'e06-send-levies',
      content: canonicalGameContent,
      randomState: createRandomState('raider-casualties'),
      resources: { gold: 70, influence: 35 },
      satisfiedRequirementIds: allRequirements,
      state: pending,
    });
    const reload = resolveEventChoice({
      atHours: 192,
      choiceId: 'e06-send-levies',
      content: canonicalGameContent,
      randomState: createRandomState('different-raider-state'),
      resources: { gold: 70, influence: 35 },
      satisfiedRequirementIds: allRequirements,
      state: { ...pending, storedChoiceDraws: first.state.storedChoiceDraws },
    });
    expect(first.outcomeValue).toBeGreaterThanOrEqual(0);
    expect(first.outcomeValue).toBeLessThanOrEqual(20);
    expect(reload.outcomeValue).toBe(first.outcomeValue);
    expect(first.effects.find((effect) => effect.effectId === 'adjust-levies')?.value).toBe(
      -(first.outcomeValue ?? 0),
    );
    expect(reload.wasStored).toBe(true);
  });

  it('queues and safely resolves mandatory repayment follow-ups', () => {
    expect(() =>
      queueFollowUpDecision({
        atHours: 504,
        content: canonicalGameContent,
        decisionId: 'merchant-loan-repayment',
        state: EMPTY_EVENT_ENGINE_STATE,
      }),
    ).toThrow(/no resolved parent/);
    const parentResolvedState = {
      ...EMPTY_EVENT_ENGINE_STATE,
      resolvedEventAtHours: { 'e13-merchant-syndicate-loan': 168 },
      resolvedEventIds: ['e13-merchant-syndicate-loan' as const],
    };
    const queued = queueFollowUpDecision({
      atHours: 504,
      content: canonicalGameContent,
      decisionId: 'merchant-loan-repayment',
      state: parentResolvedState,
    });
    expect(queued.decision).toMatchObject({
      choiceIds: ['merchant-loan-repay', 'merchant-loan-default'],
      dueAtHours: 504,
      eventId: 'e13-merchant-syndicate-loan',
      mandatory: true,
    });
    const resolved = resolveFollowUpChoice({
      atHours: 504,
      choiceId: 'merchant-loan-repay',
      content: canonicalGameContent,
      randomState: createRandomState('loan-fallback'),
      resources: { gold: 20, influence: 0 },
      satisfiedRequirementIds: new Set(),
      state: queued.state,
    });
    expect(resolved.fallbackUsed).toBe(true);
    expect(resolved.appliedChoiceId).toBe('merchant-loan-default');
    expect(resolved.state.pendingFollowUpId).toBeNull();
    expect(() =>
      queueFollowUpDecision({
        atHours: 505,
        content: canonicalGameContent,
        decisionId: 'merchant-loan-repayment',
        state: resolved.state,
      }),
    ).toThrow(/already resolved/);
  });

  it('materializes stored conditional outcomes into exact typed effects', () => {
    const cases = [
      {
        choiceId: 'e09-ignore',
        eventId: 'e09-unpaid-capital-guard' as const,
        outcome: 0,
      },
      { choiceId: 'e12-sponsor', eventId: 'e12-hawks-tournament' as const, outcome: 2 },
      {
        choiceId: 'e14-blame-renard',
        eventId: 'e14-rumor-of-false-blood' as const,
        outcome: 0,
      },
    ];
    const [guard, tournament, rumor] = cases.map(({ choiceId, eventId, outcome }) =>
      resolveEventChoice({
        atHours: 400,
        choiceId,
        content: canonicalGameContent,
        randomState: createRandomState(`conditional-${choiceId}`),
        resources: { gold: 100, influence: 100 },
        satisfiedRequirementIds: allRequirements,
        state: {
          ...EMPTY_EVENT_ENGINE_STATE,
          pendingEventId: eventId,
          storedChoiceDraws: { [`${eventId}:${choiceId}`]: outcome },
        },
      }),
    );
    expect(guard?.effects).toEqual([
      expect.objectContaining({ effectId: 'set-capital-garrison-modifier', value: 0 }),
    ]);
    expect(tournament?.effects).toEqual([
      expect.objectContaining({ effectId: 'adjust-prestige', value: 2 }),
    ]);
    expect(rumor?.effects.map((effect) => effect.effectId)).toEqual([
      'adjust-prestige',
      'set-bargain-progress',
    ]);
  });
});

describe('notification classification', () => {
  it('interrupts only canonical direct/major cases and keeps routine AI activity in feed', () => {
    expect(classifyNotification('direct-attack')).toBe('interrupt');
    expect(classifyNotification('mandatory-choice')).toBe('interrupt');
    expect(classifyNotification('routine-ai-gift')).toBe('feed');
    expect(classifyNotification('routine-tax')).toBe('feed');
    const sample: NotificationKind[] = [
      'routine-ai-gift',
      'routine-ai-gift',
      'routine-tax',
      'harmless-court',
      'direct-attack',
      'phase-change',
    ];
    expect(notificationVolumeSample(sample)).toEqual({ feed: 4, interrupts: 2, total: 6 });
  });
});
