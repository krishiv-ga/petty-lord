import { describe, expect, it } from 'vitest';
import { exportState } from '../../../../src/sim/serialization';
import { previewCommonAction } from '../../../../src/sim/systems/actions/common';
import {
  conditionEscalation,
  diminishingMultiplier,
  expiredConditionIds,
  oncePerRunAvailable,
  phaseLimitAvailable,
  recordActionUse,
  semanticActionIntent,
  targetCooldownAvailable,
} from '../../../../src/sim/systems/actions/core';
import { adjustGold } from '../../../../src/sim/systems/economy';
import { getWp020, importWp020GameState, setWp020 } from '../../../../src/sim/systems/time';
import { content, run, setup, tryRun } from '../../time/helpers';

describe('WP-020 common actions and anti-spam', () => {
  it('applies Gift full/half/refusal timestamps without charging the refused third use', () => {
    const fixture = setup('gift-anti-spam');
    let state = adjustGold(fixture.state, 'greyfen', 200, 'test-fixture');
    const deltas: number[] = [];
    for (const optionId of ['gift-small', 'gift-small'] as const) {
      state = run(state, fixture.registry, {
        initiativeType: 'time.action.send-gift',
        payload: { actionId: 'send-gift', optionId, targetId: 'edric' },
        type: 'START_INITIATIVE',
      }).state;
      const resolved = run(state, fixture.registry, {
        hours: 24,
        mode: 'instant',
        type: 'ADVANCE_TIME',
      });
      state = resolved.state;
      const effect = resolved.effects.find(
        (candidate) => candidate.kind === 'time.relationship-effect-intent',
      );
      if (effect?.payload && typeof effect.payload === 'object' && 'delta' in effect.payload) {
        deltas.push(effect.payload.delta as number);
      }
    }
    expect(deltas).toEqual([4, 2]);
    const before = getWp020(state).lords.greyfen.gold;
    const refused = tryRun(state, fixture.registry, {
      initiativeType: 'time.action.send-gift',
      payload: { actionId: 'send-gift', optionId: 'gift-large', targetId: 'edric' },
      type: 'START_INITIATIVE',
    });
    expect(refused.ok).toBe(false);
    expect(getWp020(refused.state as unknown as typeof state).lords.greyfen.gold).toBe(before);
  });

  it('escalates Raise Taxes through save/load and applies exact advance reasons', () => {
    const fixture = setup('tax-escalation');
    let state = run(fixture.state, fixture.registry, {
      initiativeType: 'time.action.raise-taxes',
      payload: { actionId: 'raise-taxes' },
      type: 'START_INITIATIVE',
    }).state;
    state = run(state, fixture.registry, {
      hours: 24,
      mode: 'instant',
      type: 'ADVANCE_TIME',
    }).state;
    expect(
      getWp020(state).territories.greyfen.conditions.map((condition) => condition.id),
    ).toContain('tax-strain');
    expect(
      getWp020(state).resourceLedger.find(
        (entry) => entry.reasonId === 'raise-taxes-first-advance',
      ),
    ).toMatchObject({ amount: 28, fractionMillionths: 28_000_000 });

    const imported = importWp020GameState(exportState(state), { content });
    expect(imported.ok).toBe(true);
    if (!imported.ok) return;
    state = run(imported.state, fixture.registry, {
      initiativeType: 'time.action.raise-taxes',
      payload: { actionId: 'raise-taxes' },
      type: 'START_INITIATIVE',
    }).state;
    state = run(state, fixture.registry, {
      hours: 24,
      mode: 'instant',
      type: 'ADVANCE_TIME',
    }).state;
    expect(getWp020(state).territories.greyfen.conditions.map((condition) => condition.id)).toEqual(
      ['unrest'],
    );
    expect(
      getWp020(state).resourceLedger.find(
        (entry) => entry.reasonId === 'raise-taxes-strained-advance',
      ),
    ).toMatchObject({ amount: 14, fractionMillionths: 14_000_000 });
    const third = tryRun(state, fixture.registry, {
      initiativeType: 'time.action.raise-taxes',
      payload: { actionId: 'raise-taxes' },
      type: 'START_INITIATIVE',
    });
    expect(third.ok).toBe(false);
  });

  it('diminishes Court inside 21 days and snapshots invitee effects', () => {
    const fixture = setup('court-diminishing');
    let state = adjustGold(fixture.state, 'greyfen', 200, 'test-fixture');
    for (let use = 0; use < 2; use += 1) {
      state = run(state, fixture.registry, {
        initiativeType: 'time.action.hold-court',
        payload: { actionId: 'hold-court', inviteeIds: ['mara', 'oswin'] },
        type: 'START_INITIATIVE',
      }).state;
      state = run(state, fixture.registry, {
        hours: 72,
        mode: 'instant',
        type: 'ADVANCE_TIME',
      }).state;
    }
    const courtDeltas = getWp020(state).resourceLedger.filter(
      (entry) => entry.reasonId === 'hold-court',
    );
    expect(
      courtDeltas.filter((entry) => entry.resource === 'prestige').map((entry) => entry.amount),
    ).toEqual([8, 4]);
    expect(
      courtDeltas.filter((entry) => entry.resource === 'influence').map((entry) => entry.amount),
    ).toEqual([10, 5]);
    const third = tryRun(state, fixture.registry, {
      initiativeType: 'time.action.hold-court',
      payload: { actionId: 'hold-court' },
      type: 'START_INITIATIVE',
    });
    expect(third.ok).toBe(false);
  });

  it('keeps normal sealed commitments semantically distinct from genuine danger', () => {
    const sealedOfferIntent = semanticActionIntent(false, 'commit');
    const abandonBindingAgreementIntent = semanticActionIntent(true, 'commit');
    expect(sealedOfferIntent).toBe('commit');
    expect(abandonBindingAgreementIntent).toBe('danger');
    expect(JSON.stringify({ sealedOfferIntent, abandonBindingAgreementIntent })).not.toMatch(
      /redButton|dangerColor|burgundyCTA/,
    );
  });

  it('projects every common commitment field and phase-aware Emergency Council naming', () => {
    const fixture = setup('preview-contract');
    const deathbed = setWp020(fixture.state, {
      ...getWp020(fixture.state),
      king: { ...getWp020(fixture.state).king, phase: 'deathbed' },
    });
    const preview = previewCommonAction(content, deathbed, {
      actionId: 'hold-court',
      inviteeIds: ['mara'],
    });
    expect(preview).toMatchObject({
      acceptanceCollateral: [],
      available: true,
      durationHours: 48,
      intent: 'confirm',
      name: 'Emergency Council',
      severity: 'ordinary',
      startCost: { gold: 60, influence: 0, logisticsGold: 0 },
      troopsLocked: 0,
      visibility: 'public',
    });
    expect(preview.cancellationLoss).not.toHaveLength(0);
    expect(preview.fallback).not.toBe('');
    expect(preview.knownConsequences).not.toHaveLength(0);
    expect(preview.intentionalUnknowns).toEqual([]);
  });

  it('provides explicit timestamp, phase, once-run, escalation and expiry primitives', () => {
    const fixture = setup('anti-spam-primitives');
    const used = recordActionUse(fixture.state, 'send-gift', 'edric');
    const query = {
      actionId: 'send-gift' as const,
      nowHours: used.timeHours,
      targetId: 'edric',
      windowDays: 14,
    };
    expect(targetCooldownAvailable(used, query)).toBe(false);
    expect(phaseLimitAvailable(used, 'send-gift', 'edric', 'stable')).toBe(false);
    expect(oncePerRunAvailable(used, 'send-gift')).toBe(false);
    expect(diminishingMultiplier(used, query, [1, 0.5, 0])).toBe(0.5);
    const exactBoundary = { ...used, timeHours: 14 * 24 };
    expect(targetCooldownAvailable(exactBoundary, { ...query, nowHours: 14 * 24 })).toBe(true);
    expect(diminishingMultiplier(exactBoundary, { ...query, nowHours: 14 * 24 }, [1, 0.5, 0])).toBe(
      1,
    );
    expect(conditionEscalation([], ['tax-strain', 'unrest'])).toBe('tax-strain');
    expect(conditionEscalation(['tax-strain'], ['tax-strain', 'unrest'])).toBe('unrest');
    expect(conditionEscalation(['unrest'], ['tax-strain', 'unrest'])).toBeNull();
    expect(
      expiredConditionIds(
        [
          { expiresAtHours: 24, id: 'tax-strain' },
          { expiresAtHours: null, id: 'greyfen-charter' },
        ],
        24,
      ),
    ).toEqual(['tax-strain']);
  });
});
