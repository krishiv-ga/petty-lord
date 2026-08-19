import { createRandomState } from '../random/random';
import type { DomainExtensions, GameState } from './types';
import {
  CURRENT_KERNEL_SCHEMA_VERSION,
  DEFAULT_DIAGNOSTIC_LIMIT,
  MAX_DIAGNOSTIC_LIMIT,
} from './types';

export function createEmptyDomainExtensions(): DomainExtensions {
  return {
    agreements: [],
    aiIntents: {},
    church: null,
    king: null,
    knowledge: {},
    lords: {},
    orders: [],
    playerId: '',
    relationships: {},
    secrets: [],
    supports: {},
    territories: {},
  };
}

export function createGameState(options: {
  buildVersion: string;
  diagnostics?: boolean;
  diagnosticLimit?: number;
  seed: string;
}): GameState {
  const requestedLimit = options.diagnosticLimit ?? DEFAULT_DIAGNOSTIC_LIMIT;
  const diagnosticLimit = Number.isFinite(requestedLimit)
    ? Math.max(0, Math.min(MAX_DIAGNOSTIC_LIMIT, Math.floor(requestedLimit)))
    : DEFAULT_DIAGNOSTIC_LIMIT;

  return {
    ...createEmptyDomainExtensions(),
    buildVersion: options.buildVersion,
    chronicle: [],
    diagnostics: {
      commandHistory: [],
      enabled: options.diagnostics ?? false,
      lastResolved: [],
      limit: diagnosticLimit,
      randomDraws: [],
    },
    flags: {},
    metadata: { createdBy: 'petty-lord-kernel', values: {} },
    nextSequenceId: 1,
    pendingDecisions: [],
    rngState: createRandomState(options.seed),
    scheduledEvents: [],
    schemaVersion: CURRENT_KERNEL_SCHEMA_VERSION,
    seed: options.seed,
    speed: 1,
    status: 'playing',
    timeHours: 0,
  };
}
