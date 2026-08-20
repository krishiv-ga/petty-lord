import { describe, expect, it } from 'vitest';
import { projectPlayerResources } from '../../../src/sim/projections/resources';
import { exportState } from '../../../src/sim/serialization';
import { queueReaction } from '../../../src/sim/systems/orders';
import { getWp020, importWp020GameState, setWp020 } from '../../../src/sim/systems/time';
import { content, run, setup, tryRun } from '../time/helpers';

describe('WP-020 Orders and reactions', () => {
  it('blocks a third initiative while reactions bypass both slots and pause exactly', () => {
    const fixture = setup('order-capacity');
    let state = run(fixture.state, fixture.registry, {
      initiativeType: 'time.action.send-gift',
      payload: { actionId: 'send-gift', optionId: 'gift-small', targetId: 'edric' },
      type: 'START_INITIATIVE',
    }).state;
    state = run(state, fixture.registry, {
      initiativeType: 'time.action.send-gift',
      payload: { actionId: 'send-gift', optionId: 'gift-small', targetId: 'ysabel' },
      type: 'START_INITIATIVE',
    }).state;
    const third = tryRun(state, fixture.registry, {
      initiativeType: 'time.action.raise-taxes',
      payload: { actionId: 'raise-taxes' },
      type: 'START_INITIATIVE',
    });
    expect(third.ok).toBe(false);

    state = queueReaction(state, {
      choiceIds: ['defend', 'yield'],
      deadlineHours: state.timeHours + 24,
      id: 'reaction-invasion-1',
      kind: 'defend-or-yield',
      priority: 50,
    });
    const opened = run(state, fixture.registry, {
      hours: 0,
      mode: 'instant',
      type: 'ADVANCE_TIME',
    });
    expect(opened.state.pendingDecisions[0]?.id).toBe('reaction-invasion-1');
    expect(opened.state.speed).toBe(0);
    expect(getWp020(opened.state).orders.filter((order) => order.status === 'active')).toHaveLength(
      2,
    );
    const frozen = run(opened.state, fixture.registry, {
      hours: 48,
      mode: 'instant',
      type: 'ADVANCE_TIME',
    });
    expect(frozen.state.timeHours).toBe(opened.state.timeHours);
    const chosen = run(frozen.state, fixture.registry, {
      choiceId: 'defend',
      decisionId: 'reaction-invasion-1',
      payload: { troops: 100 },
      type: 'CHOOSE_DECISION',
    });
    expect(getWp020(chosen.state).reactions.at(-1)?.outcome).toEqual({
      choiceId: 'defend',
      payload: { troops: 100 },
    });
    expect(chosen.state.timeHours).toBe(0);
  });

  it('captures the immediately pre-pause speed when a future reaction opens after save/load', () => {
    const fixture = setup('reaction-resume-speed');
    let state = queueReaction(fixture.state, {
      choiceIds: ['accept', 'refuse'],
      deadlineHours: 48,
      dueTimeHours: 24,
      id: 'reaction-future-speed',
      kind: 'future-offer',
      priority: 50,
    });
    state = run(state, fixture.registry, { speed: 2, type: 'SET_REQUESTED_SPEED' }).state;
    const imported = importWp020GameState(exportState(state), { content });
    expect(imported.ok).toBe(true);
    if (!imported.ok) return;
    const opened = run(imported.state, fixture.registry, {
      hours: 24,
      mode: 'instant',
      type: 'ADVANCE_TIME',
    });
    expect(opened.state.speed).toBe(0);
    expect(getWp020(opened.state).reactions.at(-1)?.resumeSpeed).toBe(2);
    const selected = run(opened.state, fixture.registry, {
      choiceId: 'accept',
      decisionId: 'reaction-future-speed',
      payload: null,
      type: 'CHOOSE_DECISION',
    });
    expect(selected.effects).toContainEqual({
      domain: 'time',
      kind: 'time.reaction-selected',
      payload: { choiceId: 'accept', reactionId: 'reaction-future-speed', resumeSpeed: 2 },
      type: 'effect',
    });
  });

  it('serializes cancellation, invalidation fallback and exact timestamp progress', () => {
    const fixture = setup('order-lifecycle');
    let state = run(fixture.state, fixture.registry, {
      initiativeType: 'time.action.send-gift',
      payload: { actionId: 'send-gift', optionId: 'gift-medium', targetId: 'edric' },
      type: 'START_INITIATIVE',
    }).state;
    const sequenceId = getWp020(state).orders.at(-1)?.scheduledSequenceId;
    expect(sequenceId).toBeDefined();
    state = run(state, fixture.registry, {
      hours: 12,
      mode: 'instant',
      type: 'ADVANCE_TIME',
    }).state;
    expect(projectPlayerResources(state, content).orders.at(-1)?.progress).toBe(0.5);
    const imported = importWp020GameState(exportState(state), { content });
    expect(imported.ok).toBe(true);
    if (!imported.ok || sequenceId === undefined) return;
    expect(exportState(imported.state)).toBe(exportState(state));
    const cancelled = run(imported.state, fixture.registry, {
      sequenceId,
      type: 'CANCEL_INITIATIVE',
    }).state;
    expect(getWp020(cancelled).orders.at(-1)?.status).toBe('cancelled');
    expect(getWp020(cancelled).lords.greyfen.gold).toBe(30);

    let invalidated = run(fixture.state, fixture.registry, {
      initiativeType: 'time.action.send-gift',
      payload: { actionId: 'send-gift', optionId: 'gift-small', targetId: 'mara' },
      type: 'START_INITIATIVE',
    }).state;
    invalidated = setWp020(invalidated, {
      ...getWp020(invalidated),
      invalidTargets: ['mara'],
    });
    const result = run(invalidated, fixture.registry, {
      hours: 24,
      mode: 'instant',
      type: 'ADVANCE_TIME',
    });
    expect(getWp020(result.state).orders.at(-1)?.status).toBe('failed');
    expect(result.effects.some((effect) => effect.kind === 'time.relationship-effect-intent')).toBe(
      false,
    );
  });

  it('executes the documented common invalidation matrix without slot softlocks', () => {
    const fixture = setup('invalidation-matrix');
    let court = run(fixture.state, fixture.registry, {
      initiativeType: 'time.action.hold-court',
      payload: { actionId: 'hold-court', inviteeIds: ['mara', 'oswin'] },
      type: 'START_INITIATIVE',
    }).state;
    court = setWp020(court, { ...getWp020(court), invalidTargets: ['mara'] });
    const courtResult = run(court, fixture.registry, {
      hours: 72,
      mode: 'instant',
      type: 'ADVANCE_TIME',
    });
    expect(getWp020(courtResult.state).orders.at(-1)?.status).toBe('resolved');
    expect(
      courtResult.effects
        .filter((effect) => effect.kind === 'time.relationship-effect-intent')
        .map((effect) =>
          effect.payload && typeof effect.payload === 'object' && 'targetId' in effect.payload
            ? effect.payload.targetId
            : null,
        ),
    ).toEqual(['oswin']);

    let taxes = run(fixture.state, fixture.registry, {
      initiativeType: 'time.action.raise-taxes',
      payload: { actionId: 'raise-taxes' },
      type: 'START_INITIATIVE',
    }).state;
    taxes = setWp020(taxes, {
      ...getWp020(taxes),
      territories: {
        ...getWp020(taxes).territories,
        greyfen: { ...getWp020(taxes).territories.greyfen, physicalControllerId: 'edric' },
      },
    });
    const taxResult = run(taxes, fixture.registry, {
      hours: 24,
      mode: 'instant',
      type: 'ADVANCE_TIME',
    });
    expect(getWp020(taxResult.state).orders.at(-1)?.status).toBe('failed');
    expect(
      getWp020(taxResult.state).resourceLedger.some((entry) =>
        entry.reasonId.startsWith('raise-taxes'),
      ),
    ).toBe(false);
    expect(
      getWp020(taxResult.state).orders.filter((order) => order.status === 'active'),
    ).toHaveLength(0);
  });
});
