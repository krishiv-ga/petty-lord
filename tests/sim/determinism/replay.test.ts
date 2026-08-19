import { describe, expect, it } from 'vitest';
import { applyCommand } from '../../../src/sim/kernel/engine';
import { createKernelRegistry } from '../../../src/sim/kernel/registry';
import { scheduleItem } from '../../../src/sim/kernel/scheduler';
import { exportState } from '../../../src/sim/serialization/serialization';
import {
  createFakeState,
  type FakeExtensions,
  fakeDomainModule,
} from '../../../src/sim/testing/fake-domain';
import { normalizedStateHash } from '../../../src/sim/testing/invariants';

const registry = createKernelRegistry<FakeExtensions>([fakeDomainModule]);

function fixture(seed = 'replay-seed') {
  let state = createFakeState({ seed });
  state = scheduleItem(state, {
    dueTimeHours: 1,
    kind: 'fake.increment',
    payload: { amount: 1, intervalHours: 1, label: 'hourly', remaining: 71 },
    priority: 100,
  }).state;
  for (let hour = 3; hour <= 72; hour += 3) {
    state = scheduleItem(state, {
      dueTimeHours: hour,
      kind: 'fake.random',
      payload: { label: `fortune-${hour}`, maximum: 20, minimum: 0 },
      priority: 200,
    }).state;
  }
  return state;
}

function advanceInChunks(hoursPerCommand: number) {
  let state = fixture();
  for (let elapsed = 0; elapsed < 72; elapsed += hoursPerCommand) {
    const result = applyCommand(
      state,
      {
        hours: Math.min(hoursPerCommand, 72 - elapsed),
        mode: 'instant',
        type: 'ADVANCE_TIME',
      },
      registry,
    );
    if (!result.ok) throw new Error(result.error.message);
    state = result.state;
  }
  return state;
}

describe('replay determinism', () => {
  it('produces byte-identical state for repeated seed and command streams', () => {
    const first = advanceInChunks(24);
    const second = advanceInChunks(24);
    expect(exportState(first)).toBe(exportState(second));
    expect(normalizedStateHash(first)).toBe(normalizedStateHash(second));
  });

  it('matches 72 one-hour advances, three daily advances and instant advancement', () => {
    const hourly = advanceInChunks(1);
    const daily = advanceInChunks(24);
    const instant = advanceInChunks(72);
    expect(exportState(hourly)).toBe(exportState(daily));
    expect(exportState(daily)).toBe(exportState(instant));
    expect(hourly.fake.counter).toBe(72);
    expect(hourly.fake.randomResults).toHaveLength(24);
  });

  it('changes the random stream for a different seed', () => {
    const first = fixture('first-seed');
    const second = fixture('second-seed');
    const run = (state: ReturnType<typeof fixture>) => {
      const result = applyCommand(
        state,
        { hours: 72, mode: 'instant', type: 'ADVANCE_TIME' },
        registry,
      );
      if (!result.ok) throw new Error(result.error.message);
      return result.state.fake.randomResults;
    };
    expect(run(first)).not.toEqual(run(second));
  });
});
