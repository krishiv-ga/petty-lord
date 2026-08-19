import { validateRandomState } from '../random/random';
import { cloneJson, inspectJsonValue, stableJson } from '../state/json';
import type { DomainExtensions, GameState } from '../state/types';

export interface ValidationFailure {
  message: string;
  path: string;
}

export type ValidationResult<S> =
  | { data: S; ok: true }
  | { issues: ValidationFailure[]; ok: false };

export interface ExternalStateValidator<S> {
  validate(value: unknown): ValidationResult<S>;
}

export interface StateMigration {
  fromSchemaVersion: number;
  migrate(value: unknown): unknown;
  toSchemaVersion: number;
}

export interface ImportOptions<S> {
  expectedBuildVersion?: string;
  expectedSchemaVersion: number;
  migrations?: StateMigration[];
  validator?: ExternalStateValidator<S>;
}

export interface ImportFailure {
  code: 'BUILD_MISMATCH' | 'INVALID_JSON' | 'INVALID_STATE' | 'MIGRATION_MISSING';
  issues: ValidationFailure[];
  message: string;
}

export type ImportResult<S> = { ok: true; state: S } | { error: ImportFailure; ok: false };

export interface SerializedCheckpoint {
  schemaVersion: number;
  simulationTimeHours: number;
  stateJson: string;
}

export interface SaveCheckpointPair {
  current: SerializedCheckpoint;
  previous: SerializedCheckpoint | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function structuralValidation(value: unknown): ValidationFailure[] {
  if (!isRecord(value)) {
    return [{ message: 'state must be an object', path: '$' }];
  }
  const issues: ValidationFailure[] = inspectJsonValue(value);
  const numberFields = ['schemaVersion', 'nextSequenceId', 'timeHours'];
  for (const field of numberFields) {
    if (typeof value[field] !== 'number' || !Number.isFinite(value[field])) {
      issues.push({ message: 'must be a finite number', path: `$.${field}` });
    }
  }
  const stringFields = ['buildVersion', 'seed', 'rngState', 'status'];
  for (const field of stringFields) {
    if (typeof value[field] !== 'string') {
      issues.push({ message: 'must be a string', path: `$.${field}` });
    }
  }
  if (![0, 1, 2].includes(value.speed as number)) {
    issues.push({ message: 'must be 0, 1 or 2', path: '$.speed' });
  }
  if (!['playing', 'succession', 'won', 'lost'].includes(value.status as string)) {
    issues.push({ message: 'has an unsupported game status', path: '$.status' });
  }
  if (!Number.isSafeInteger(value.schemaVersion) || (value.schemaVersion as number) < 0) {
    issues.push({ message: 'must be a non-negative safe integer', path: '$.schemaVersion' });
  }
  if (!Number.isSafeInteger(value.nextSequenceId) || (value.nextSequenceId as number) < 1) {
    issues.push({ message: 'must be a positive safe integer', path: '$.nextSequenceId' });
  }
  if (typeof value.timeHours === 'number' && value.timeHours < 0) {
    issues.push({ message: 'must not be negative', path: '$.timeHours' });
  }
  for (const field of ['scheduledEvents', 'pendingDecisions', 'chronicle']) {
    if (!Array.isArray(value[field])) {
      issues.push({ message: 'must be an array', path: `$.${field}` });
    }
  }
  if (Array.isArray(value.scheduledEvents)) {
    const sequenceIds = new Set<number>();
    let previousOrder: [number, number, number] | null = null;
    let highestSequenceId = 0;
    for (const [index, item] of value.scheduledEvents.entries()) {
      const path = `$.scheduledEvents[${index}]`;
      if (!isRecord(item)) {
        issues.push({ message: 'must be an object', path });
        continue;
      }
      if (
        typeof item.dueTimeHours !== 'number' ||
        !Number.isFinite(item.dueTimeHours) ||
        (typeof value.timeHours === 'number' && item.dueTimeHours < value.timeHours)
      ) {
        issues.push({
          message: 'must be finite and no earlier than current time',
          path: `${path}.dueTimeHours`,
        });
      }
      if (!Number.isSafeInteger(item.priority)) {
        issues.push({ message: 'must be a safe integer', path: `${path}.priority` });
      }
      if (!Number.isSafeInteger(item.sequenceId) || (item.sequenceId as number) < 1) {
        issues.push({ message: 'must be a positive safe integer', path: `${path}.sequenceId` });
      } else {
        const sequenceId = item.sequenceId as number;
        if (sequenceIds.has(sequenceId)) {
          issues.push({ message: 'must be unique', path: `${path}.sequenceId` });
        }
        sequenceIds.add(sequenceId);
        highestSequenceId = Math.max(highestSequenceId, sequenceId);
      }
      if (typeof item.kind !== 'string' || item.kind.length === 0) {
        issues.push({ message: 'must be a non-empty string', path: `${path}.kind` });
      }
      if (!('payload' in item)) {
        issues.push({ message: 'is required', path: `${path}.payload` });
      }
      if (!isRecord(item.storedDraws)) {
        issues.push({ message: 'must be an object', path: `${path}.storedDraws` });
      }
      if (
        typeof item.dueTimeHours === 'number' &&
        typeof item.priority === 'number' &&
        typeof item.sequenceId === 'number'
      ) {
        const order: [number, number, number] = [item.dueTimeHours, item.priority, item.sequenceId];
        if (
          previousOrder &&
          (order[0] < previousOrder[0] ||
            (order[0] === previousOrder[0] && order[1] < previousOrder[1]) ||
            (order[0] === previousOrder[0] &&
              order[1] === previousOrder[1] &&
              order[2] < previousOrder[2]))
        ) {
          issues.push({ message: 'must follow canonical scheduler order', path });
        }
        previousOrder = order;
      }
    }
    if (typeof value.nextSequenceId === 'number' && value.nextSequenceId <= highestSequenceId) {
      issues.push({
        message: 'must be greater than every scheduled sequence id',
        path: '$.nextSequenceId',
      });
    }
  }
  if (Array.isArray(value.pendingDecisions)) {
    const decisionIds = new Set<string>();
    for (const [index, decision] of value.pendingDecisions.entries()) {
      const path = `$.pendingDecisions[${index}]`;
      if (!isRecord(decision)) {
        issues.push({ message: 'must be an object', path });
        continue;
      }
      if (typeof decision.id !== 'string' || decision.id.length === 0) {
        issues.push({ message: 'must be a non-empty string', path: `${path}.id` });
      } else if (decisionIds.has(decision.id)) {
        issues.push({ message: 'must be unique', path: `${path}.id` });
      } else {
        decisionIds.add(decision.id);
      }
      if (typeof decision.kind !== 'string' || decision.kind.length === 0) {
        issues.push({ message: 'must be a non-empty string', path: `${path}.kind` });
      }
      if (
        !Array.isArray(decision.choiceIds) ||
        decision.choiceIds.length === 0 ||
        !decision.choiceIds.every((choice) => typeof choice === 'string')
      ) {
        issues.push({ message: 'must contain choice ids', path: `${path}.choiceIds` });
      }
    }
    if (value.pendingDecisions.length > 0 && value.speed !== 0) {
      issues.push({ message: 'must be paused while a decision is pending', path: '$.speed' });
    }
  }
  for (const field of [
    'king',
    'playerId',
    'lords',
    'territories',
    'relationships',
    'supports',
    'church',
    'agreements',
    'orders',
    'aiIntents',
    'secrets',
    'knowledge',
    'flags',
    'metadata',
    'diagnostics',
  ]) {
    if (!(field in value)) {
      issues.push({ message: 'is required', path: `$.${field}` });
    }
  }
  if (typeof value.rngState === 'string') {
    try {
      validateRandomState(value.rngState);
    } catch (error) {
      issues.push({
        message: error instanceof Error ? error.message : 'invalid PRNG state',
        path: '$.rngState',
      });
    }
  }
  return issues;
}

function migrateToVersion(
  value: unknown,
  expectedVersion: number,
  migrations: readonly StateMigration[],
): { error?: ImportFailure; value: unknown } {
  let current = value;
  const visited = new Set<number>();
  while (isRecord(current) && current.schemaVersion !== expectedVersion) {
    const version = current.schemaVersion;
    if (!Number.isInteger(version) || visited.has(version as number)) {
      break;
    }
    visited.add(version as number);
    const migration = migrations.find((candidate) => candidate.fromSchemaVersion === version);
    if (!migration) {
      return {
        error: {
          code: 'MIGRATION_MISSING',
          issues: [
            { message: `no migration from schema ${String(version)}`, path: '$.schemaVersion' },
          ],
          message: 'Save schema is unsupported',
        },
        value: current,
      };
    }
    current = migration.migrate(cloneJson(current));
  }
  return { value: current };
}

export function exportState<E extends DomainExtensions>(state: GameState<E>): string {
  return stableJson(state);
}

export function importState<S>(serialized: string, options: ImportOptions<S>): ImportResult<S> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    return {
      error: {
        code: 'INVALID_JSON',
        issues: [{ message: error instanceof Error ? error.message : 'invalid JSON', path: '$' }],
        message: 'Save data is not valid JSON',
      },
      ok: false,
    };
  }

  const migrated = migrateToVersion(
    parsed,
    options.expectedSchemaVersion,
    options.migrations ?? [],
  );
  if (migrated.error) {
    return { error: migrated.error, ok: false };
  }
  const issues = structuralValidation(migrated.value);
  if (isRecord(migrated.value) && migrated.value.schemaVersion !== options.expectedSchemaVersion) {
    issues.push({ message: 'does not match the current schema', path: '$.schemaVersion' });
  }
  if (
    options.expectedBuildVersion !== undefined &&
    isRecord(migrated.value) &&
    migrated.value.buildVersion !== options.expectedBuildVersion
  ) {
    return {
      error: {
        code: 'BUILD_MISMATCH',
        issues: [{ message: 'does not match the expected build', path: '$.buildVersion' }],
        message: 'Save build is incompatible',
      },
      ok: false,
    };
  }
  if (issues.length > 0) {
    return {
      error: { code: 'INVALID_STATE', issues, message: 'Save state failed structural validation' },
      ok: false,
    };
  }

  if (options.validator) {
    const validated = options.validator.validate(cloneJson(migrated.value));
    if (!validated.ok) {
      return {
        error: {
          code: 'INVALID_STATE',
          issues: validated.issues,
          message: 'Save state failed domain validation',
        },
        ok: false,
      };
    }
    return { ok: true, state: cloneJson(validated.data) };
  }
  return { ok: true, state: cloneJson(migrated.value as S) };
}

export function checkpointState<E extends DomainExtensions>(
  state: GameState<E>,
  previous: SerializedCheckpoint | null = null,
): SaveCheckpointPair {
  return {
    current: {
      schemaVersion: state.schemaVersion,
      simulationTimeHours: state.timeHours,
      stateJson: exportState(state),
    },
    previous,
  };
}
