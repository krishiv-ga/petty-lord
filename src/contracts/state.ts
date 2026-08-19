import type { ImportResult, ValidationFailure } from '../sim/serialization';
import { importState } from '../sim/serialization';
import type { DomainExtensions, GameState } from '../sim/state';
import { CURRENT_KERNEL_SCHEMA_VERSION, createGameState } from '../sim/state';
import type { GameContent } from './content';
import { requireGameContent } from './content';

export const FOUNDATION_BUILD_VERSION = '0.1.0-alpha.1';
export const FOUNDATION_SAVE_SCHEMA_VERSION = CURRENT_KERNEL_SCHEMA_VERSION;

export interface FoundationCompatibility {
  readonly buildVersion: string;
  readonly contentHash: string;
  readonly contentSchemaVersion: number;
  readonly saveSchemaVersion: number;
}

export interface FoundationDomainExtensions extends DomainExtensions {
  compatibility: FoundationCompatibility;
}

export type FoundationGameState = GameState<FoundationDomainExtensions>;

export interface CreateFoundationStateOptions {
  readonly buildVersion?: string;
  readonly content: GameContent;
  readonly diagnostics?: boolean;
  readonly seed: string;
}

export function createFoundationGameState(
  options: CreateFoundationStateOptions,
): FoundationGameState {
  const content = requireGameContent(options.content);
  const buildVersion = options.buildVersion ?? FOUNDATION_BUILD_VERSION;
  const base = createGameState({
    buildVersion,
    ...(options.diagnostics === undefined ? {} : { diagnostics: options.diagnostics }),
    seed: options.seed,
  });

  return {
    ...base,
    compatibility: {
      buildVersion,
      contentHash: content.contentHash,
      contentSchemaVersion: content.schemaVersion,
      saveSchemaVersion: FOUNDATION_SAVE_SCHEMA_VERSION,
    },
    metadata: {
      createdBy: 'petty-lord-foundation',
      values: {
        contentHash: content.contentHash,
        contentSchemaVersion: content.schemaVersion,
      },
    },
    playerId: 'greyfen',
  };
}

function compatibilityIssues(
  value: unknown,
  content: GameContent,
  buildVersion: string,
): ValidationFailure[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [{ message: 'must be an object', path: '$' }];
  }
  const state = value as Record<string, unknown>;
  const compatibility = state.compatibility;
  if (compatibility === null || typeof compatibility !== 'object' || Array.isArray(compatibility)) {
    return [{ message: 'compatibility metadata is required', path: '$.compatibility' }];
  }
  const metadata = compatibility as Record<string, unknown>;
  const expected = {
    buildVersion,
    contentHash: content.contentHash,
    contentSchemaVersion: content.schemaVersion,
    saveSchemaVersion: FOUNDATION_SAVE_SCHEMA_VERSION,
  } as const;

  return Object.entries(expected).flatMap(([key, expectedValue]) =>
    metadata[key] === expectedValue
      ? []
      : [
          {
            message: `must equal ${String(expectedValue)}`,
            path: `$.compatibility.${key}`,
          },
        ],
  );
}

export function importFoundationGameState(
  serialized: string,
  options: { readonly buildVersion?: string; readonly content: GameContent },
): ImportResult<FoundationGameState> {
  const content = requireGameContent(options.content);
  const buildVersion = options.buildVersion ?? FOUNDATION_BUILD_VERSION;
  return importState<FoundationGameState>(serialized, {
    expectedBuildVersion: buildVersion,
    expectedSchemaVersion: FOUNDATION_SAVE_SCHEMA_VERSION,
    validator: {
      validate(value) {
        const issues = compatibilityIssues(value, content, buildVersion);
        return issues.length === 0
          ? { data: value as FoundationGameState, ok: true }
          : { issues, ok: false };
      },
    },
  });
}
