import { RandomSession } from '../random/random';
import type { ImportOptions } from '../serialization/serialization';
import { exportState, importState } from '../serialization/serialization';
import { cloneJson } from '../state/json';
import type { CommandTrace, DomainExtensions, GameState } from '../state/types';
import { CURRENT_KERNEL_SCHEMA_VERSION } from '../state/types';
import {
  advanceScheduler,
  applyDomainTransition,
  cancelScheduledItem,
  compareScheduledItems,
} from './scheduler';
import type {
  KernelCommand,
  KernelErrorDetail,
  KernelRegistry,
  KernelResult,
  SimulationEffect,
} from './types';

export interface KernelOptions<E extends DomainExtensions> {
  allowDebug?: boolean;
  import?: Omit<ImportOptions<GameState<E>>, 'expectedSchemaVersion'>;
  maxResolutionsPerAdvance?: number;
}

function fail<E extends DomainExtensions>(
  state: GameState<E>,
  code: string,
  message: string,
  context = {},
): KernelResult<E> {
  const error: KernelErrorDetail = { code, context, message };
  return { diagnostics: null, error, ok: false, state };
}

function appendCommandTrace<E extends DomainExtensions>(
  state: GameState<E>,
  command: KernelCommand,
): GameState<E> {
  if (
    !state.diagnostics.enabled ||
    command.type === 'EXPORT_STATE' ||
    command.type === 'IMPORT_STATE'
  ) {
    return state;
  }
  const payload: Record<string, string | number | boolean | null> = {};
  if (command.type === 'ADVANCE_TIME') {
    payload.hours = command.hours;
    payload.mode = command.mode;
  } else if (command.type === 'SET_REQUESTED_SPEED') {
    payload.speed = command.speed;
  } else if (command.type === 'START_INITIATIVE') {
    payload.initiativeType = command.initiativeType;
  } else if (command.type === 'CANCEL_INITIATIVE') {
    payload.sequenceId = command.sequenceId;
  } else if (command.type === 'CHOOSE_DECISION') {
    payload.choiceId = command.choiceId;
    payload.decisionId = command.decisionId;
  } else if (command.type === 'DEBUG') {
    payload.name = command.name;
  }
  const entry: CommandTrace = { commandType: command.type, payload, timeHours: state.timeHours };
  return {
    ...state,
    diagnostics: {
      ...state.diagnostics,
      commandHistory:
        state.diagnostics.limit === 0
          ? []
          : [...state.diagnostics.commandHistory, entry].slice(-state.diagnostics.limit),
    },
  };
}

function success<E extends DomainExtensions>(
  state: GameState<E>,
  command: KernelCommand,
  effects: SimulationEffect[] = [],
): KernelResult<E> {
  return { diagnostics: null, effects, ok: true, state: appendCommandTrace(state, command) };
}

export function applyCommand<E extends DomainExtensions>(
  originalState: GameState<E>,
  command: KernelCommand,
  registry: KernelRegistry<E>,
  options: KernelOptions<E> = {},
): KernelResult<E> {
  try {
    if (command.type === 'EXPORT_STATE') {
      return success(originalState, command, [
        { kind: 'state.exported', payload: { serialized: exportState(originalState) } },
      ]);
    }

    if (command.type === 'IMPORT_STATE') {
      const imported = importState<GameState<E>>(command.serialized, {
        ...options.import,
        expectedSchemaVersion: CURRENT_KERNEL_SCHEMA_VERSION,
      });
      if (!imported.ok) {
        return fail(originalState, imported.error.code, imported.error.message, {
          issues: imported.error.issues,
        });
      }
      return success(imported.state, command, [{ kind: 'state.imported', payload: null }]);
    }

    if (command.type === 'SET_REQUESTED_SPEED') {
      if (originalState.pendingDecisions.length > 0 && command.speed !== 0) {
        return fail(
          originalState,
          'DECISION_BLOCKS_SPEED',
          'mandatory decisions must be resolved before time can resume',
          { decisionId: originalState.pendingDecisions[0]?.id ?? null },
        );
      }
      return success({ ...originalState, speed: command.speed }, command, [
        { kind: 'speed.requested', payload: { speed: command.speed } },
      ]);
    }

    if (command.type === 'ADVANCE_TIME') {
      if (!Number.isFinite(command.hours) || command.hours < 0) {
        return fail(originalState, 'INVALID_ADVANCEMENT', 'hours must be finite and non-negative', {
          hours: command.hours,
        });
      }
      if (originalState.speed === 0 && command.mode === 'paced') {
        return success(originalState, command, [{ kind: 'time.paused', payload: null }]);
      }
      if (originalState.status !== 'playing') {
        return success(originalState, command, [
          { kind: 'time.inactive', payload: { status: originalState.status } },
        ]);
      }
      const advanced = advanceScheduler(
        originalState,
        originalState.timeHours + command.hours,
        registry,
        options.maxResolutionsPerAdvance === undefined
          ? {}
          : { maxResolutions: options.maxResolutionsPerAdvance },
      );
      if (!advanced.ok) {
        return {
          diagnostics: advanced.trace,
          error: advanced.error,
          ok: false,
          state: originalState,
        };
      }
      return {
        diagnostics: advanced.trace,
        effects: advanced.effects,
        ok: true,
        state: appendCommandTrace(advanced.state, command),
      };
    }

    if (command.type === 'START_INITIATIVE') {
      const starter = registry.initiativeStarters.get(command.initiativeType);
      if (!starter) {
        return fail(
          originalState,
          'MISSING_INITIATIVE_STARTER',
          `No initiative starter is registered for ${command.initiativeType}`,
        );
      }
      const random = new RandomSession(originalState.rngState);
      const transition = starter({ command, random, state: cloneJson(originalState) });
      const applied = applyDomainTransition(originalState, transition, random, null);
      return success(applied.state, command, applied.effects);
    }

    if (command.type === 'CANCEL_INITIATIVE') {
      const item = [...originalState.scheduledEvents]
        .sort(compareScheduledItems)
        .find((candidate) => candidate.sequenceId === command.sequenceId);
      if (!item) {
        return fail(originalState, 'INITIATIVE_NOT_FOUND', 'scheduled initiative was not found', {
          sequenceId: command.sequenceId,
        });
      }
      if (
        !registry.initiativeStarters.has(item.kind) &&
        !registry.initiativeCancellers.has(item.kind)
      ) {
        return fail(
          originalState,
          'NOT_CANCELLABLE_INITIATIVE',
          'scheduled item is not registered as an initiative',
          { kind: item.kind, sequenceId: item.sequenceId },
        );
      }
      const canceller = registry.initiativeCancellers.get(item.kind);
      let state = cancelScheduledItem(originalState, item.sequenceId).state;
      let effects: SimulationEffect[] = [];
      if (canceller) {
        const random = new RandomSession(state.rngState);
        const transition = canceller({
          command,
          item: cloneJson(item),
          random,
          state: cloneJson(state),
        });
        const applied = applyDomainTransition(state, transition, random, item.sequenceId);
        state = applied.state;
        effects = applied.effects;
      }
      return success(state, command, effects);
    }

    if (command.type === 'CHOOSE_DECISION') {
      const decision = originalState.pendingDecisions[0];
      if (!decision || decision.id !== command.decisionId) {
        return fail(
          originalState,
          'DECISION_NOT_CURRENT',
          'only the first pending mandatory decision may be resolved',
          { decisionId: command.decisionId },
        );
      }
      if (!decision.choiceIds.includes(command.choiceId)) {
        return fail(originalState, 'INVALID_DECISION_CHOICE', 'choice is not available', {
          choiceId: command.choiceId,
          decisionId: command.decisionId,
        });
      }
      const resolver = registry.decisionResolvers.get(decision.kind);
      if (!resolver) {
        return fail(
          originalState,
          'MISSING_DECISION_RESOLVER',
          `No decision resolver is registered for ${decision.kind}`,
        );
      }
      const state = {
        ...originalState,
        pendingDecisions: originalState.pendingDecisions.slice(1),
      };
      const random = new RandomSession(state.rngState);
      const transition = resolver({
        command,
        decision: cloneJson(decision),
        random,
        state: cloneJson(state),
      });
      const applied = applyDomainTransition(state, transition, random, decision.openedBySequenceId);
      return success(applied.state, command, applied.effects);
    }

    if (command.type === 'DEBUG') {
      if (!options.allowDebug) {
        return fail(originalState, 'DEBUG_DISABLED', 'debug commands are disabled');
      }
      const handler = registry.debugHandlers.get(command.name);
      if (!handler) {
        return fail(originalState, 'MISSING_DEBUG_HANDLER', `No debug handler for ${command.name}`);
      }
      const random = new RandomSession(originalState.rngState);
      const transition = handler({ command, random, state: cloneJson(originalState) });
      const applied = applyDomainTransition(originalState, transition, random, null);
      return success(applied.state, command, applied.effects);
    }

    return fail(originalState, 'UNKNOWN_COMMAND', 'unsupported command');
  } catch (error) {
    return fail(
      originalState,
      'TRANSITION_FAILURE',
      error instanceof Error ? error.message : 'transition failed',
    );
  }
}
