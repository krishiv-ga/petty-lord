import { describe, expect, it } from 'vitest';
import { DAWN_PRIORITY } from '../../../src/sim/kernel/priorities';
import { createKernelRegistry } from '../../../src/sim/kernel/registry';
import {
  advanceScheduler,
  cancelScheduledItem,
  replaceScheduledItem,
  scheduleItem,
} from '../../../src/sim/kernel/scheduler';
import {
  createFakeState,
  type FakeExtensions,
  fakeDomainModule,
} from '../../../src/sim/testing/fake-domain';

const registry = createKernelRegistry<FakeExtensions>([fakeDomainModule]);

describe('deterministic scheduler', () => {
  it('orders same-time items by explicit priority then stable sequence id', () => {
    let state = createFakeState({ diagnostics: true });
    state = scheduleItem(state, {
      dueTimeHours: 24,
      kind: 'fake.increment',
      payload: { label: 'second-priority' },
      priority: DAWN_PRIORITY.BATTLES_OCCUPATIONS_AND_PUBLIC_FALLOUT,
    }).state;
    state = scheduleItem(state, {
      dueTimeHours: 24,
      kind: 'fake.increment',
      payload: { label: 'first-created' },
      priority: DAWN_PRIORITY.PLAYER_ORDERS_AND_AI_INTENTS,
    }).state;
    state = scheduleItem(state, {
      dueTimeHours: 24,
      kind: 'fake.increment',
      payload: { label: 'second-created' },
      priority: DAWN_PRIORITY.PLAYER_ORDERS_AND_AI_INTENTS,
    }).state;

    const result = advanceScheduler(state, 24, registry);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.fake.resolutions).toEqual([
      'first-created',
      'second-created',
      'second-priority',
    ]);
    expect(result.trace.resolved.map((item) => item.sequenceId)).toEqual([2, 3, 1]);
  });

  it('resolves recursively scheduled same-time work deterministically', () => {
    let state = createFakeState();
    state = scheduleItem(state, {
      dueTimeHours: 1,
      kind: 'fake.increment',
      payload: { amount: 2, intervalHours: 0, label: 'recursive', remaining: 3 },
      priority: DAWN_PRIORITY.PLAYER_ORDERS_AND_AI_INTENTS,
    }).state;

    const result = advanceScheduler(state, 1, registry);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.fake.counter).toBe(8);
    expect(result.trace.resolved.map((item) => item.sequenceId)).toEqual([1, 2, 3, 4]);
    expect(result.state.nextSequenceId).toBe(5);
  });

  it('fails atomically when recursive work exceeds the resolution guard', () => {
    let state = createFakeState();
    state = scheduleItem(state, {
      dueTimeHours: 1,
      kind: 'fake.increment',
      payload: { intervalHours: 0, remaining: 20 },
      priority: DAWN_PRIORITY.PLAYER_ORDERS_AND_AI_INTENTS,
    }).state;

    const result = advanceScheduler(state, 1, registry, { maxResolutions: 5 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('RESOLUTION_LIMIT');
    expect(result.state).toBe(state);
    expect(result.state.fake.counter).toBe(0);
  });

  it('schedules, cancels and replaces without reusing sequence ids', () => {
    let state = createFakeState();
    const first = scheduleItem(state, {
      dueTimeHours: 2,
      kind: 'fake.increment',
      priority: 100,
    });
    state = first.state;
    const cancelled = cancelScheduledItem(state, first.item.sequenceId);
    expect(cancelled.cancelled).toEqual(first.item);
    const second = scheduleItem(cancelled.state, {
      dueTimeHours: 3,
      kind: 'fake.increment',
      priority: 100,
    });
    const replacement = replaceScheduledItem(second.state, second.item.sequenceId, {
      dueTimeHours: 4,
      kind: 'fake.increment',
      priority: 100,
    });
    expect(replacement.item?.sequenceId).toBe(3);
    expect(replacement.state.nextSequenceId).toBe(4);
  });

  it('does not expose scheduler state through mutable item or trace aliases', () => {
    const scheduled = scheduleItem(createFakeState(), {
      dueTimeHours: 2,
      kind: 'fake.increment',
      priority: 100,
    });
    scheduled.item.dueTimeHours = 99;
    expect(scheduled.state.scheduledEvents[0]?.dueTimeHours).toBe(2);

    const advanced = advanceScheduler(scheduled.state, 1, registry);
    expect(advanced.ok).toBe(true);
    if (!advanced.ok || !advanced.trace.nextScheduled) return;
    advanced.trace.nextScheduled.dueTimeHours = 88;
    expect(advanced.state.scheduledEvents[0]?.dueTimeHours).toBe(2);
  });
});
