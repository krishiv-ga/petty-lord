import { compareScheduledItems } from '../kernel/scheduler';
import { isCanonicalSimulationHours } from '../kernel/time';
import { exportState, importState } from '../serialization/serialization';
import { inspectJsonValue, stableJson } from '../state/json';
import type { DomainExtensions, GameState } from '../state/types';

export interface InvariantFailure {
  code: string;
  context: Record<string, unknown>;
  message: string;
}

export function collectInvariantFailures<E extends DomainExtensions>(
  state: GameState<E>,
): InvariantFailure[] {
  const failures: InvariantFailure[] = [];
  if (
    !Number.isFinite(state.timeHours) ||
    state.timeHours < 0 ||
    !isCanonicalSimulationHours(state.timeHours)
  ) {
    failures.push({
      code: 'INVALID_TIME',
      context: { timeHours: state.timeHours },
      message: 'simulation time must be finite and non-negative',
    });
  }
  const sequenceIds = state.scheduledEvents.map((item) => item.sequenceId);
  if (new Set(sequenceIds).size !== sequenceIds.length) {
    failures.push({
      code: 'DUPLICATE_SEQUENCE_ID',
      context: { sequenceIds },
      message: 'scheduled sequence ids must be unique',
    });
  }
  const highestSequenceId = Math.max(0, ...sequenceIds);
  if (!Number.isSafeInteger(state.nextSequenceId) || state.nextSequenceId <= highestSequenceId) {
    failures.push({
      code: 'NON_MONOTONIC_SEQUENCE_ID',
      context: { highestSequenceId, nextSequenceId: state.nextSequenceId },
      message: 'next sequence id must be a safe integer above every scheduled id',
    });
  }
  for (const [index, item] of state.scheduledEvents.entries()) {
    if (
      index > 0 &&
      compareScheduledItems(state.scheduledEvents[index - 1] as typeof item, item) > 0
    ) {
      failures.push({
        code: 'UNSORTED_SCHEDULER',
        context: { index },
        message: 'scheduled events must remain in canonical order',
      });
      break;
    }
    if (
      !Number.isFinite(item.dueTimeHours) ||
      !isCanonicalSimulationHours(item.dueTimeHours) ||
      item.dueTimeHours < state.timeHours
    ) {
      failures.push({
        code: 'UNRESOLVABLE_SCHEDULE',
        context: { dueTimeHours: item.dueTimeHours, sequenceId: item.sequenceId },
        message: 'scheduled event is in the past or has a non-finite due time',
      });
    }
  }
  if (state.pendingDecisions.length > 0 && state.speed !== 0) {
    failures.push({
      code: 'DECISION_NOT_PAUSED',
      context: { decisionId: state.pendingDecisions[0]?.id, speed: state.speed },
      message: 'a mandatory decision must force requested speed to pause',
    });
  }
  for (const issue of inspectJsonValue(state)) {
    failures.push({
      code: 'UNSERIALIZABLE_STATE',
      context: { path: issue.path },
      message: issue.message,
    });
  }
  return failures;
}

export function assertKernelInvariants<E extends DomainExtensions>(state: GameState<E>): void {
  const failures = collectInvariantFailures(state);
  if (failures.length > 0) {
    throw new Error(
      `Kernel invariant failure: ${failures
        .map((failure) => `${failure.code}: ${failure.message} ${stableJson(failure.context)}`)
        .join('; ')}`,
    );
  }
}

export function assertSaveRoundTrip<E extends DomainExtensions>(state: GameState<E>): void {
  const serialized = exportState(state);
  const imported = importState<GameState<E>>(serialized, {
    expectedBuildVersion: state.buildVersion,
    expectedSchemaVersion: state.schemaVersion,
  });
  if (!imported.ok) {
    throw new Error(`Save round trip failed: ${imported.error.message}`);
  }
  if (exportState(imported.state) !== serialized) {
    throw new Error('Save round trip changed normalized state bytes');
  }
}

export function normalizedStateHash<E extends DomainExtensions>(state: GameState<E>): string {
  const serialized = exportState(state);
  let high = 0x811c9dc5;
  let low = 0x9e3779b9;
  for (let index = 0; index < serialized.length; index += 1) {
    const code = serialized.charCodeAt(index);
    high = Math.imul(high ^ code, 0x01000193);
    low = Math.imul(low ^ code, 0x85ebca6b);
  }
  return `${(high >>> 0).toString(16).padStart(8, '0')}${(low >>> 0)
    .toString(16)
    .padStart(8, '0')}`;
}
