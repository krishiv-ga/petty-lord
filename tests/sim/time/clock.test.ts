import { describe, expect, it } from 'vitest';
import { exportState } from '../../../src/sim/serialization';
import { getWp020, importWp020GameState, type Wp020GameState } from '../../../src/sim/systems/time';
import { content, run, setup } from './helpers';

function advance(
  state: Wp020GameState,
  hours: number,
  registry: ReturnType<typeof setup>['registry'],
) {
  return run(state, registry, { hours, mode: 'instant', type: 'ADVANCE_TIME' }).state;
}

describe('WP-020 crisis clock and royal health', () => {
  it('is chunk- and save-stable for phases, prognosis and seeded death', () => {
    const once = setup('death-stability');
    const deathDay = getWp020(once.state).king.deathDawnElapsedDay;
    const advancedOnce = advance(once.state, deathDay * 24, once.registry);

    const chunks = setup('death-stability');
    let chunked = chunks.state;
    for (let day = 0; day < deathDay; day += 1) chunked = advance(chunked, 24, chunks.registry);

    const saved = setup('death-stability');
    let resumed = advance(saved.state, 27 * 24, saved.registry);
    const imported = importWp020GameState(exportState(resumed), { content });
    expect(imported.ok).toBe(true);
    if (!imported.ok) return;
    resumed = advance(imported.state, (deathDay - 27) * 24, saved.registry);

    expect(exportState(chunked)).toBe(exportState(advancedOnce));
    expect(exportState(resumed)).toBe(exportState(advancedOnce));
    expect(getWp020(advancedOnce).king.phaseTrace).toEqual([
      { elapsedDay: 0, phase: 'stable', timeHours: 0 },
      { elapsedDay: 14, phase: 'ailing', timeHours: 336 },
      { elapsedDay: 28, phase: 'gravely-ill', timeHours: 672 },
      { elapsedDay: 42, phase: 'deathbed', timeHours: 1008 },
    ]);
    expect(getWp020(advancedOnce).king.diedAtHours).toBe(deathDay * 24);
    expect(advancedOnce.status).toBe('succession');
  });

  it('resolves an Order due on death dawn before the death hook', () => {
    const fixture = setup('same-dawn-order-before-death');
    const deathDay = getWp020(fixture.state).king.deathDawnElapsedDay;
    let state = advance(fixture.state, (deathDay - 1) * 24, fixture.registry);
    const started = run(state, fixture.registry, {
      initiativeType: 'time.action.send-gift',
      payload: { actionId: 'send-gift', optionId: 'gift-small', targetId: 'edric' },
      type: 'START_INITIATIVE',
    });
    state = started.state;
    const resolved = run(state, fixture.registry, {
      hours: 24,
      mode: 'instant',
      type: 'ADVANCE_TIME',
    });
    const order = getWp020(resolved.state).orders.at(-1);
    expect(order?.status).toBe('resolved');
    expect(resolved.state.status).toBe('succession');
    expect(resolved.effects.map((effect) => effect.kind)).toContain(
      'time.relationship-effect-intent',
    );
    const orderIndex = resolved.effects.findIndex(
      (effect) => effect.kind === 'time.order-resolved',
    );
    const deathIndex = resolved.effects.findIndex((effect) => effect.kind === 'time.king-died');
    expect(orderIndex).toBeGreaterThanOrEqual(0);
    expect(deathIndex).toBeGreaterThan(orderIndex);
    expect(resolved.effects[orderIndex]).toMatchObject({ domain: 'time', type: 'effect' });
  });

  it('rejects corrupted WP-020 resource state during import', () => {
    const fixture = setup('corrupt-resource-import');
    const parsed = JSON.parse(exportState(fixture.state)) as {
      systems: { time: { lords: { greyfen: { gold: number } } } };
    };
    parsed.systems.time.lords.greyfen.gold = -1;
    const imported = importWp020GameState(JSON.stringify(parsed), { content });
    expect(imported.ok).toBe(false);
    if (imported.ok) return;
    expect(imported.error.issues).toContainEqual({
      message: 'must be a non-negative integer',
      path: '$.systems.time.lords.greyfen.gold',
    });
  });

  it('rejects missing required state and a cross-field death-dawn mismatch', () => {
    const fixture = setup('corrupt-domain-import');
    const missingRequired = JSON.parse(exportState(fixture.state)) as {
      systems: { time: { invalidTargets?: string[] } };
    };
    delete missingRequired.systems.time.invalidTargets;
    const missingImport = importWp020GameState(JSON.stringify(missingRequired), { content });
    expect(missingImport.ok).toBe(false);
    if (missingImport.ok) return;
    expect(missingImport.error.issues).toContainEqual({
      message: 'must be an array',
      path: '$.systems.time.invalidTargets',
    });

    const mismatchedDeath = JSON.parse(exportState(fixture.state)) as {
      systems: { time: { king: { deathDawnElapsedDay: number } } };
    };
    const original = mismatchedDeath.systems.time.king.deathDawnElapsedDay;
    mismatchedDeath.systems.time.king.deathDawnElapsedDay = original === 49 ? 50 : 49;
    const deathImport = importWp020GameState(JSON.stringify(mismatchedDeath), { content });
    expect(deathImport.ok).toBe(false);
    if (deathImport.ok) return;
    expect(deathImport.error.issues).toContainEqual({
      message: 'living King must retain the exact stored death-dawn event',
      path: '$.systems.time.king.deathDawnElapsedDay',
    });
  });

  it('rejects a missing dawn, forged phase trace and future-started condition', () => {
    const fixture = setup('corrupt-backbone-import');
    const missingDawn = JSON.parse(exportState(fixture.state)) as {
      scheduledEvents: { kind: string; payload: { elapsedDay?: number } }[];
    };
    missingDawn.scheduledEvents = missingDawn.scheduledEvents.filter(
      (event) => event.kind !== 'time.dawn-economy' || event.payload.elapsedDay !== 1,
    );
    const dawnImport = importWp020GameState(JSON.stringify(missingDawn), { content });
    expect(dawnImport.ok).toBe(false);
    if (dawnImport.ok) return;
    expect(dawnImport.error.issues).toContainEqual({
      message: 'canonical future backbone item is required exactly once',
      path: '$.scheduledEvents[time.dawn-economy:1]',
    });

    const forgedPhase = JSON.parse(exportState(fixture.state)) as {
      systems: {
        time: {
          king: {
            phase: string;
            phaseTrace: { elapsedDay: number; phase: string; timeHours: number }[];
          };
        };
      };
    };
    forgedPhase.systems.time.king.phase = 'deathbed';
    forgedPhase.systems.time.king.phaseTrace = [{ elapsedDay: 0, phase: 'deathbed', timeHours: 0 }];
    const phaseImport = importWp020GameState(JSON.stringify(forgedPhase), { content });
    expect(phaseImport.ok).toBe(false);
    if (phaseImport.ok) return;
    expect(phaseImport.error.issues).toContainEqual({
      message: 'must match resolved canonical health-phase events',
      path: '$.systems.time.king.phaseTrace',
    });

    const futureCondition = JSON.parse(exportState(fixture.state)) as {
      systems: {
        time: {
          lords: {
            greyfen: {
              conditions: { expiresAtHours: number; id: string; startedAtHours: number }[];
            };
          };
        };
      };
    };
    futureCondition.systems.time.lords.greyfen.conditions = [
      { expiresAtHours: 48, id: 'disgraced', startedAtHours: 24 },
    ];
    const conditionImport = importWp020GameState(JSON.stringify(futureCondition), { content });
    expect(conditionImport.ok).toBe(false);
    if (conditionImport.ok) return;
    expect(conditionImport.error.issues).toContainEqual({
      message: 'cannot be later than current simulation time',
      path: '$.systems.time.lords.greyfen.conditions[0].startedAtHours',
    });
  });
});
