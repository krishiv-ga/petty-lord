import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scheduleItem } from '../../../src/sim/kernel/scheduler';
import { exportState } from '../../../src/sim/serialization/serialization';
import { createFakeState } from '../../../src/sim/testing/fake-domain';
import {
  assertKernelInvariants,
  assertSaveRoundTrip,
  collectInvariantFailures,
} from '../../../src/sim/testing/invariants';

describe('kernel invariants', () => {
  it('accepts a valid state and exact save round trip', () => {
    const state = scheduleItem(createFakeState(), {
      dueTimeHours: 1,
      kind: 'fake.increment',
      priority: 100,
    }).state;
    expect(() => assertKernelInvariants(state)).not.toThrow();
    expect(() => assertSaveRoundTrip(state)).not.toThrow();
  });

  it('reports sequence, ordering, time, decision and serialization failures with context', () => {
    const valid = scheduleItem(createFakeState(), {
      dueTimeHours: 2,
      kind: 'fake.increment',
      priority: 100,
    }).state;
    const invalid = {
      ...valid,
      nextSequenceId: 1,
      pendingDecisions: [
        {
          choiceIds: ['yes'],
          id: 'decision',
          kind: 'fake.choice',
          openedAtTimeHours: 0,
          openedBySequenceId: null,
          payload: null,
        },
      ],
      speed: 1 as const,
      timeHours: Number.NaN,
    };
    const codes = collectInvariantFailures(invalid).map((failure) => failure.code);
    expect(codes).toContain('INVALID_TIME');
    expect(codes).toContain('NON_MONOTONIC_SEQUENCE_ID');
    expect(codes).toContain('DECISION_NOT_PAUSED');
    expect(codes).toContain('UNSERIALIZABLE_STATE');
    expect(() => exportState(invalid)).toThrow(/finite/);
  });

  it('contains no gameplay Math.random call in the simulation source', () => {
    const files = [
      'src/sim/random/random.ts',
      'src/sim/kernel/engine.ts',
      'src/sim/kernel/scheduler.ts',
      'src/sim/testing/fake-domain.ts',
    ];
    const source = files.map((file) => readFileSync(resolve(file), 'utf8')).join('\n');
    expect(source).not.toContain(['Math', 'random()'].join('.'));
  });
});
