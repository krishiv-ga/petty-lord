import { describe, expect, it } from 'vitest';
import { applyCommand } from '../../../src/sim/kernel/engine';
import { createKernelRegistry } from '../../../src/sim/kernel/registry';
import { scheduleItem } from '../../../src/sim/kernel/scheduler';
import {
  checkpointState,
  exportState,
  importState,
} from '../../../src/sim/serialization/serialization';
import { CURRENT_KERNEL_SCHEMA_VERSION } from '../../../src/sim/state/types';
import {
  createFakeState,
  type FakeExtensions,
  fakeDomainModule,
} from '../../../src/sim/testing/fake-domain';

const registry = createKernelRegistry<FakeExtensions>([fakeDomainModule]);

function scheduledFixture() {
  let state = createFakeState({ seed: 'save-seed' });
  state = { ...state, flags: { fraction: 0.1 + 0.2 } };
  for (const hour of [6, 12, 18, 24]) {
    state = scheduleItem(state, {
      dueTimeHours: hour,
      kind: 'fake.random',
      payload: { label: `draw-${hour}`, maximum: 1_000, minimum: -1_000 },
      priority: 100,
      storedDraws: { preview: hour / 7 },
    }).state;
  }
  return state;
}

describe('state serialization', () => {
  it('continues identically after a midway save and reload', () => {
    const initial = scheduledFixture();
    const uninterrupted = applyCommand(
      initial,
      { hours: 24, mode: 'instant', type: 'ADVANCE_TIME' },
      registry,
    );
    expect(uninterrupted.ok).toBe(true);
    if (!uninterrupted.ok) return;

    const midway = applyCommand(
      initial,
      { hours: 12, mode: 'instant', type: 'ADVANCE_TIME' },
      registry,
    );
    expect(midway.ok).toBe(true);
    if (!midway.ok) return;
    const imported = importState<typeof midway.state>(exportState(midway.state), {
      expectedBuildVersion: midway.state.buildVersion,
      expectedSchemaVersion: CURRENT_KERNEL_SCHEMA_VERSION,
    });
    expect(imported.ok).toBe(true);
    if (!imported.ok) return;
    const continued = applyCommand(
      imported.state,
      { hours: 12, mode: 'instant', type: 'ADVANCE_TIME' },
      registry,
    );
    expect(continued.ok).toBe(true);
    if (!continued.ok) return;
    expect(exportState(continued.state)).toBe(exportState(uninterrupted.state));
  });

  it('round-trips sequence ids, PRNG state, stored draws and fractions exactly', () => {
    const state = scheduledFixture();
    const serialized = exportState(state);
    const imported = importState<typeof state>(serialized, {
      expectedBuildVersion: state.buildVersion,
      expectedSchemaVersion: state.schemaVersion,
    });
    expect(imported.ok).toBe(true);
    if (!imported.ok) return;
    expect(exportState(imported.state)).toBe(serialized);
    expect(imported.state.rngState).toBe(state.rngState);
    expect(imported.state.nextSequenceId).toBe(5);
    expect(imported.state.scheduledEvents[0]?.storedDraws.preview).toBe(6 / 7);
    expect(imported.state.flags.fraction).toBe(0.1 + 0.2);
  });

  it('returns structured import failure without mutating current state', () => {
    const state = scheduledFixture();
    const before = exportState(state);
    const result = applyCommand(
      state,
      { serialized: '{"schemaVersion":1,"rngState":"corrupt"}', type: 'IMPORT_STATE' },
      registry,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('INVALID_STATE');
    expect(result.state).toBe(state);
    expect(exportState(state)).toBe(before);
  });

  it('rejects corrupt scheduler order and an unpaused mandatory decision', () => {
    const state = scheduledFixture();
    const corrupt = {
      ...state,
      pendingDecisions: [
        {
          choiceIds: ['accept', 'accept'],
          id: 'corrupt-decision',
          kind: 'fake.choice',
          openedAtTimeHours: 99,
          openedBySequenceId: 999,
          payload: null,
        },
      ],
      diagnostics: {
        commandHistory: 'not-an-array',
        enabled: 'yes',
        lastResolved: [],
        limit: -1,
        randomDraws: [],
      },
      scheduledEvents: [...state.scheduledEvents].reverse(),
      speed: 1 as const,
    };
    const imported = importState<typeof state>(JSON.stringify(corrupt), {
      expectedBuildVersion: state.buildVersion,
      expectedSchemaVersion: state.schemaVersion,
    });
    expect(imported.ok).toBe(false);
    if (imported.ok) return;
    expect(imported.error.code).toBe('INVALID_STATE');
    expect(imported.error.issues.some((issue) => issue.path === '$.speed')).toBe(true);
    expect(imported.error.issues.some((issue) => issue.path === '$.diagnostics.enabled')).toBe(
      true,
    );
    expect(imported.error.issues.some((issue) => issue.path.endsWith('.openedAtTimeHours'))).toBe(
      true,
    );
    expect(
      imported.error.issues.some((issue) => issue.message.includes('canonical scheduler order')),
    ).toBe(true);
  });

  it('provides current and previous checkpoint data without persistence orchestration', () => {
    const state = scheduledFixture();
    const first = checkpointState(state);
    const next = checkpointState({ ...state, timeHours: 1 }, first.current);
    expect(next.previous).toEqual(first.current);
    expect(next.current.simulationTimeHours).toBe(1);
  });
});
