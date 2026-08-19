import { RandomSession } from '../random/random';
import { cloneJson, inspectJsonValue } from '../state/json';
import type {
  DomainExtensions,
  GameState,
  PendingDecision,
  RandomDrawTrace,
  ResolutionTrace,
  ScheduledItem,
} from '../state/types';
import { normalizeSimulationHours } from './time';
import type {
  DecisionInput,
  DomainTransition,
  KernelErrorDetail,
  KernelRegistry,
  ScheduleInput,
  SchedulerTrace,
  SimulationEffect,
} from './types';

const DEFAULT_MAX_RESOLUTIONS = 10_000;

export function compareScheduledItems(left: ScheduledItem, right: ScheduledItem): number {
  return (
    left.dueTimeHours - right.dueTimeHours ||
    left.priority - right.priority ||
    left.sequenceId - right.sequenceId
  );
}

function sorted(items: readonly ScheduledItem[]): ScheduledItem[] {
  return [...items].sort(compareScheduledItems);
}

function validateScheduleInput<E extends DomainExtensions>(
  state: GameState<E>,
  input: ScheduleInput,
  dueTimeHours: number,
): void {
  if (!Number.isFinite(dueTimeHours) || dueTimeHours < state.timeHours) {
    throw new RangeError('scheduled due time must be finite and no earlier than current time');
  }
  if (!Number.isSafeInteger(input.priority)) {
    throw new RangeError('scheduled priority must be a safe integer');
  }
  if (input.kind.length === 0) {
    throw new RangeError('scheduled kind must not be empty');
  }
  if (inspectJsonValue(input.payload ?? null).length > 0) {
    throw new TypeError('scheduled payload must be JSON-compatible');
  }
  if (inspectJsonValue(input.storedDraws ?? {}).length > 0) {
    throw new TypeError('scheduled stored draws must be JSON-compatible');
  }
}

export function scheduleItem<E extends DomainExtensions>(
  state: GameState<E>,
  input: ScheduleInput,
): { item: ScheduledItem; state: GameState<E> } {
  const dueTimeHours = normalizeSimulationHours(input.dueTimeHours);
  validateScheduleInput(state, input, dueTimeHours);
  const item: ScheduledItem = {
    dueTimeHours,
    kind: input.kind,
    payload: cloneJson(input.payload ?? null),
    priority: input.priority,
    sequenceId: state.nextSequenceId,
    storedDraws: cloneJson(input.storedDraws ?? {}),
  };
  return {
    item: cloneJson(item),
    state: {
      ...state,
      nextSequenceId: state.nextSequenceId + 1,
      scheduledEvents: sorted([...state.scheduledEvents, item]),
    },
  };
}

export function cancelScheduledItem<E extends DomainExtensions>(
  state: GameState<E>,
  sequenceId: number,
): { cancelled: ScheduledItem | null; state: GameState<E> } {
  const cancelled = state.scheduledEvents.find((item) => item.sequenceId === sequenceId) ?? null;
  return {
    cancelled: cancelled ? cloneJson(cancelled) : null,
    state: cancelled
      ? {
          ...state,
          scheduledEvents: state.scheduledEvents.filter((item) => item.sequenceId !== sequenceId),
        }
      : state,
  };
}

export function replaceScheduledItem<E extends DomainExtensions>(
  state: GameState<E>,
  sequenceId: number,
  replacement: ScheduleInput,
): { item: ScheduledItem | null; state: GameState<E> } {
  const cancelled = cancelScheduledItem(state, sequenceId);
  if (cancelled.cancelled === null) {
    return { item: null, state };
  }
  return scheduleItem(cancelled.state, replacement);
}

function appendBounded<T>(existing: readonly T[], additions: readonly T[], limit: number): T[] {
  if (limit === 0) {
    return [];
  }
  return [...existing, ...additions].slice(-limit);
}

function openDecision<E extends DomainExtensions>(
  state: GameState<E>,
  input: DecisionInput,
  openedBySequenceId: number | null,
): GameState<E> {
  if (state.pendingDecisions.some((decision) => decision.id === input.id)) {
    throw new Error(`Decision id ${input.id} is already pending`);
  }
  const decision: PendingDecision = {
    choiceIds: [...input.choiceIds],
    id: input.id,
    kind: input.kind,
    openedAtTimeHours: state.timeHours,
    openedBySequenceId,
    payload: cloneJson(input.payload ?? null),
  };
  return { ...state, pendingDecisions: [...state.pendingDecisions, decision], speed: 0 };
}

export function applyDomainTransition<E extends DomainExtensions>(
  baseState: GameState<E>,
  transition: DomainTransition<E>,
  random: RandomSession,
  sourceSequenceId: number | null,
): { effects: SimulationEffect[]; state: GameState<E> } {
  let state = cloneJson(transition.state);

  state = {
    ...state,
    buildVersion: baseState.buildVersion,
    chronicle: baseState.chronicle,
    diagnostics: baseState.diagnostics,
    metadata: baseState.metadata,
    nextSequenceId: baseState.nextSequenceId,
    pendingDecisions: baseState.pendingDecisions,
    rngState: random.exportState(),
    scheduledEvents: baseState.scheduledEvents,
    schemaVersion: baseState.schemaVersion,
    seed: baseState.seed,
    speed: baseState.speed,
    timeHours: baseState.timeHours,
  };

  for (const sequenceId of transition.cancelSequenceIds ?? []) {
    state = cancelScheduledItem(state, sequenceId).state;
  }
  for (const input of transition.schedule ?? []) {
    state = scheduleItem(state, input).state;
  }
  for (const entry of transition.chronicle ?? []) {
    state = {
      ...state,
      chronicle: [
        ...state.chronicle,
        {
          data: cloneJson(entry.data ?? {}),
          id: entry.id,
          kind: entry.kind,
          message: entry.message,
          timeHours: state.timeHours,
        },
      ],
    };
  }
  if (transition.decision) {
    state = openDecision(state, transition.decision, sourceSequenceId);
  }

  const jsonIssues = inspectJsonValue(state);
  if (jsonIssues.length > 0) {
    throw new TypeError(
      `domain transition returned non-serializable state at ${jsonIssues[0]?.path ?? '$'}`,
    );
  }
  if (!['playing', 'succession', 'won', 'lost'].includes(state.status)) {
    throw new TypeError(`domain transition returned unsupported status ${String(state.status)}`);
  }

  if (state.diagnostics.enabled) {
    const randomDraws: RandomDrawTrace[] = random.trace();
    state = {
      ...state,
      diagnostics: {
        ...state.diagnostics,
        randomDraws: appendBounded(
          state.diagnostics.randomDraws,
          randomDraws,
          state.diagnostics.limit,
        ),
      },
    };
  }
  return { effects: cloneJson(transition.effects ?? []), state };
}

function failure(code: string, message: string, context = {}): KernelErrorDetail {
  return { code, context, message };
}

export type SchedulerResult<E extends DomainExtensions> =
  | { effects: SimulationEffect[]; ok: true; state: GameState<E>; trace: SchedulerTrace }
  | { error: KernelErrorDetail; ok: false; state: GameState<E>; trace: SchedulerTrace };

export function advanceScheduler<E extends DomainExtensions>(
  originalState: GameState<E>,
  targetTimeHours: number,
  registry: KernelRegistry<E>,
  options: { maxResolutions?: number } = {},
): SchedulerResult<E> {
  const trace: SchedulerTrace = {
    nextScheduled: cloneJson(sorted(originalState.scheduledEvents)[0] ?? null),
    resolved: [],
    stoppedForDecision: originalState.pendingDecisions[0]?.id ?? null,
    stoppedForStatus: originalState.status === 'playing' ? null : originalState.status,
    targetTimeHours: normalizeSimulationHours(targetTimeHours),
  };
  const normalizedTargetTime = normalizeSimulationHours(targetTimeHours);
  if (!Number.isFinite(normalizedTargetTime) || normalizedTargetTime < originalState.timeHours) {
    return {
      error: failure('INVALID_ADVANCEMENT', 'target time must be finite and monotonic', {
        currentTimeHours: originalState.timeHours,
        targetTimeHours: normalizedTargetTime,
      }),
      ok: false,
      state: originalState,
      trace,
    };
  }
  if (originalState.pendingDecisions.length > 0) {
    return { effects: [], ok: true, state: originalState, trace };
  }
  if (originalState.status !== 'playing') {
    return { effects: [], ok: true, state: originalState, trace };
  }

  let state = cloneJson(originalState);
  const effects: SimulationEffect[] = [];
  const maxResolutions = options.maxResolutions ?? DEFAULT_MAX_RESOLUTIONS;

  try {
    while (state.pendingDecisions.length === 0) {
      const next = sorted(state.scheduledEvents)[0];
      if (!next || next.dueTimeHours > normalizedTargetTime) {
        state = { ...state, timeHours: normalizedTargetTime };
        break;
      }
      if (trace.resolved.length >= maxResolutions) {
        return {
          error: failure(
            'RESOLUTION_LIMIT',
            'same-time or recursive scheduling exceeded the deterministic resolution limit',
            { maxResolutions, targetTimeHours: normalizedTargetTime },
          ),
          ok: false,
          state: originalState,
          trace,
        };
      }
      const resolver = registry.scheduledResolvers.get(next.kind);
      if (!resolver) {
        return {
          error: failure(
            'MISSING_RESOLVER',
            `No scheduled resolver is registered for ${next.kind}`,
            {
              kind: next.kind,
              sequenceId: next.sequenceId,
            },
          ),
          ok: false,
          state: originalState,
          trace,
        };
      }

      state = {
        ...state,
        scheduledEvents: state.scheduledEvents.filter(
          (item) => item.sequenceId !== next.sequenceId,
        ),
        timeHours: Math.max(state.timeHours, next.dueTimeHours),
      };
      const random = new RandomSession(state.rngState);
      const transition = resolver({ item: cloneJson(next), random, state: cloneJson(state) });
      const applied = applyDomainTransition(state, transition, random, next.sequenceId);
      state = applied.state;
      effects.push(...applied.effects);
      trace.resolved.push(cloneJson(next));

      if (state.diagnostics.enabled) {
        const resolution: ResolutionTrace = {
          dueTimeHours: next.dueTimeHours,
          kind: next.kind,
          priority: next.priority,
          sequenceId: next.sequenceId,
        };
        state = {
          ...state,
          diagnostics: {
            ...state.diagnostics,
            lastResolved: appendBounded(
              state.diagnostics.lastResolved,
              [resolution],
              state.diagnostics.limit,
            ),
          },
        };
      }
      if (state.status !== 'playing') {
        break;
      }
    }
  } catch (error) {
    return {
      error: failure(
        'RESOLVER_FAILURE',
        error instanceof Error ? error.message : 'resolver failed',
      ),
      ok: false,
      state: originalState,
      trace,
    };
  }

  trace.nextScheduled = cloneJson(sorted(state.scheduledEvents)[0] ?? null);
  trace.stoppedForDecision = state.pendingDecisions[0]?.id ?? null;
  trace.stoppedForStatus = state.status === 'playing' ? null : state.status;
  return { effects, ok: true, state, trace };
}

export function inspectScheduler<E extends DomainExtensions>(
  state: GameState<E>,
): {
  currentDue: ScheduledItem[];
  lastResolved: ResolutionTrace[];
  nextScheduled: ScheduledItem[];
  timeHours: number;
} {
  const scheduled = sorted(state.scheduledEvents);
  return {
    currentDue: cloneJson(scheduled.filter((item) => item.dueTimeHours <= state.timeHours)),
    lastResolved: cloneJson(state.diagnostics.lastResolved),
    nextScheduled: cloneJson(scheduled.slice(0, 10)),
    timeHours: state.timeHours,
  };
}
