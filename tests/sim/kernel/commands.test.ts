import { describe, expect, it } from 'vitest';
import { applyCommand } from '../../../src/sim/kernel/engine';
import { DAWN_PRIORITY } from '../../../src/sim/kernel/priorities';
import { createKernelRegistry } from '../../../src/sim/kernel/registry';
import { scheduleItem } from '../../../src/sim/kernel/scheduler';
import {
  createFakeState,
  type FakeExtensions,
  fakeDomainModule,
} from '../../../src/sim/testing/fake-domain';

const registry = createKernelRegistry<FakeExtensions>([fakeDomainModule]);

describe('kernel commands', () => {
  it('starts and cancels a registered initiative through the typed protocol', () => {
    const state = createFakeState();
    const started = applyCommand(
      state,
      {
        initiativeType: 'fake.increment',
        payload: { amount: 5, delayHours: 12 },
        type: 'START_INITIATIVE',
      },
      registry,
    );
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    expect(started.state.scheduledEvents).toHaveLength(1);

    const cancelled = applyCommand(
      started.state,
      { sequenceId: 1, type: 'CANCEL_INITIATIVE' },
      registry,
    );
    expect(cancelled.ok).toBe(true);
    if (!cancelled.ok) return;
    expect(cancelled.state.scheduledEvents).toEqual([]);
  });

  it('stops at a mandatory decision and resumes the exact timestamp after choice', () => {
    let state = createFakeState();
    state = scheduleItem(state, {
      dueTimeHours: 5,
      kind: 'fake.decision',
      payload: { decisionId: 'answer-letter' },
      priority: DAWN_PRIORITY.PLAYER_ORDERS_AND_AI_INTENTS,
    }).state;
    state = scheduleItem(state, {
      dueTimeHours: 5,
      kind: 'fake.increment',
      payload: { amount: 4, label: 'after-decision' },
      priority: DAWN_PRIORITY.BATTLES_OCCUPATIONS_AND_PUBLIC_FALLOUT,
    }).state;

    const stopped = applyCommand(
      state,
      { hours: 10, mode: 'instant', type: 'ADVANCE_TIME' },
      registry,
    );
    expect(stopped.ok).toBe(true);
    if (!stopped.ok) return;
    expect(stopped.state.timeHours).toBe(5);
    expect(stopped.state.speed).toBe(0);
    expect(stopped.state.fake.counter).toBe(0);
    expect(stopped.state.pendingDecisions[0]?.id).toBe('answer-letter');
    expect(stopped.diagnostics?.resolved.map((item) => item.kind)).toEqual(['fake.decision']);

    const cannotResumeEarly = applyCommand(
      stopped.state,
      { speed: 1, type: 'SET_REQUESTED_SPEED' },
      registry,
    );
    expect(cannotResumeEarly.ok).toBe(false);
    expect(cannotResumeEarly.state).toBe(stopped.state);

    const chosen = applyCommand(
      stopped.state,
      {
        choiceId: 'accept',
        decisionId: 'answer-letter',
        payload: null,
        type: 'CHOOSE_DECISION',
      },
      registry,
    );
    expect(chosen.ok).toBe(true);
    if (!chosen.ok) return;
    expect(chosen.state.timeHours).toBe(5);
    expect(chosen.state.fake.choices).toEqual(['accept']);

    const resumedSpeed = applyCommand(
      chosen.state,
      { speed: 1, type: 'SET_REQUESTED_SPEED' },
      registry,
    );
    expect(resumedSpeed.ok).toBe(true);
    if (!resumedSpeed.ok) return;
    const resumed = applyCommand(
      resumedSpeed.state,
      { hours: 5, mode: 'instant', type: 'ADVANCE_TIME' },
      registry,
    );
    expect(resumed.ok).toBe(true);
    if (!resumed.ok) return;
    expect(resumed.state.timeHours).toBe(10);
    expect(resumed.state.fake.counter).toBe(4);
  });

  it('keeps paced time frozen while paused and treats 1x/2x as external pacing requests', () => {
    const state = createFakeState();
    const paused = applyCommand(state, { speed: 0, type: 'SET_REQUESTED_SPEED' }, registry);
    expect(paused.ok).toBe(true);
    if (!paused.ok) return;
    const noAdvance = applyCommand(
      paused.state,
      { hours: 12, mode: 'paced', type: 'ADVANCE_TIME' },
      registry,
    );
    expect(noAdvance.ok).toBe(true);
    if (!noAdvance.ok) return;
    expect(noAdvance.state.timeHours).toBe(0);
    const noInstantBypass = applyCommand(
      paused.state,
      { hours: 12, mode: 'instant', type: 'ADVANCE_TIME' },
      registry,
    );
    expect(noInstantBypass.ok).toBe(true);
    if (!noInstantBypass.ok) return;
    expect(noInstantBypass.state.timeHours).toBe(0);

    const one = applyCommand(state, { speed: 1, type: 'SET_REQUESTED_SPEED' }, registry);
    const two = applyCommand(state, { speed: 2, type: 'SET_REQUESTED_SPEED' }, registry);
    expect(one.ok && two.ok).toBe(true);
    if (!one.ok || !two.ok) return;
    const advancedOne = applyCommand(
      one.state,
      { hours: 12, mode: 'paced', type: 'ADVANCE_TIME' },
      registry,
    );
    const advancedTwo = applyCommand(
      two.state,
      { hours: 12, mode: 'paced', type: 'ADVANCE_TIME' },
      registry,
    );
    expect(advancedOne.ok && advancedTwo.ok).toBe(true);
    if (!advancedOne.ok || !advancedTwo.ok) return;
    expect(advancedOne.state.timeHours).toBe(advancedTwo.state.timeHours);
  });

  it('rejects invalid runtime command enums without corrupting state', () => {
    const state = createFakeState();
    const invalidSpeed = applyCommand(
      state,
      { speed: 3, type: 'SET_REQUESTED_SPEED' } as never,
      registry,
    );
    expect(invalidSpeed.ok).toBe(false);
    expect(invalidSpeed.state).toBe(state);
    const invalidMode = applyCommand(
      state,
      { hours: 1, mode: 'warp', type: 'ADVANCE_TIME' } as never,
      registry,
    );
    expect(invalidMode.ok).toBe(false);
    expect(invalidMode.state).toBe(state);
    const invalidPrecision = applyCommand(
      state,
      { hours: 0.0000004, mode: 'paced', type: 'ADVANCE_TIME' },
      registry,
    );
    expect(invalidPrecision.ok).toBe(false);
    expect(invalidPrecision.state).toBe(state);
    const invalidPayload = applyCommand(
      state,
      {
        initiativeType: 'fake.increment',
        payload: { impossible: Number.NaN },
        type: 'START_INITIATIVE',
      } as never,
      registry,
    );
    expect(invalidPayload.ok).toBe(false);
    expect(invalidPayload.state).toBe(state);
  });

  it('stops immediately on terminal status and locks later initiatives', () => {
    let state = createFakeState();
    state = scheduleItem(state, {
      dueTimeHours: 1,
      kind: 'fake.terminal',
      payload: { status: 'won' },
      priority: 100,
    }).state;
    state = scheduleItem(state, {
      dueTimeHours: 2,
      kind: 'fake.increment',
      payload: { amount: 10 },
      priority: 100,
    }).state;
    const advanced = applyCommand(
      state,
      { hours: 10, mode: 'instant', type: 'ADVANCE_TIME' },
      registry,
    );
    expect(advanced.ok).toBe(true);
    if (!advanced.ok) return;
    expect(advanced.state.status).toBe('won');
    expect(advanced.state.timeHours).toBe(1);
    expect(advanced.state.fake.counter).toBe(0);
    expect(advanced.state.scheduledEvents.map((item) => item.kind)).toEqual(['fake.increment']);
    expect(advanced.diagnostics?.stoppedForStatus).toBe('won');

    const start = applyCommand(
      advanced.state,
      { initiativeType: 'fake.increment', payload: {}, type: 'START_INITIATIVE' },
      registry,
    );
    expect(start.ok).toBe(false);
    expect(start.state).toBe(advanced.state);
  });

  it('gates debug-only deterministic commands', () => {
    const state = createFakeState();
    const blocked = applyCommand(
      state,
      { name: 'fake.set-counter', payload: { counter: 8 }, type: 'DEBUG' },
      registry,
    );
    expect(blocked.ok).toBe(false);
    const allowed = applyCommand(
      state,
      { name: 'fake.set-counter', payload: { counter: 8 }, type: 'DEBUG' },
      registry,
      { allowDebug: true },
    );
    expect(allowed.ok).toBe(true);
    if (!allowed.ok) return;
    expect(allowed.state.fake.counter).toBe(8);
  });
});
