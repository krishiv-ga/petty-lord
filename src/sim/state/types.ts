import type { JsonObject, JsonValue } from './json';

export const CURRENT_KERNEL_SCHEMA_VERSION = 1;
export const DEFAULT_DIAGNOSTIC_LIMIT = 128;
export const MAX_DIAGNOSTIC_LIMIT = 1_024;

export type GameStatus = 'lost' | 'playing' | 'succession' | 'won';
export type RequestedSpeed = 0 | 1 | 2;

export interface ScheduledItem {
  dueTimeHours: number;
  kind: string;
  payload: JsonValue;
  priority: number;
  sequenceId: number;
  storedDraws: Record<string, JsonValue>;
}

export interface PendingDecision {
  choiceIds: string[];
  id: string;
  kind: string;
  openedAtTimeHours: number;
  openedBySequenceId: number | null;
  payload: JsonValue;
}

export interface ChronicleEntry {
  data: JsonObject;
  id: string;
  kind: string;
  message: string;
  timeHours: number;
}

export interface RandomDrawTrace {
  label: string;
  result: JsonValue;
  stateAfter: string;
}

export interface ResolutionTrace {
  dueTimeHours: number;
  kind: string;
  priority: number;
  sequenceId: number;
}

export interface CommandTrace {
  commandType: string;
  payload: JsonObject;
  timeHours: number;
}

export interface DiagnosticsState {
  commandHistory: CommandTrace[];
  enabled: boolean;
  lastResolved: ResolutionTrace[];
  limit: number;
  randomDraws: RandomDrawTrace[];
}

export interface DeterministicMetadata {
  createdBy: string;
  values: Record<string, JsonValue>;
}

export interface DomainExtensions {
  agreements: JsonValue[];
  aiIntents: Record<string, JsonValue>;
  church: JsonValue;
  ending?: JsonValue;
  king: JsonValue;
  knowledge: Record<string, JsonValue>;
  lords: Record<string, JsonValue>;
  orders: JsonValue[];
  playerId: string;
  relationships: Record<string, JsonValue>;
  secrets: JsonValue[];
  supports: Record<string, JsonValue>;
  territories: Record<string, JsonValue>;
}

export interface KernelState {
  buildVersion: string;
  chronicle: ChronicleEntry[];
  diagnostics: DiagnosticsState;
  flags: Record<string, boolean | number | string>;
  metadata: DeterministicMetadata;
  nextSequenceId: number;
  pendingDecisions: PendingDecision[];
  rngState: string;
  scheduledEvents: ScheduledItem[];
  schemaVersion: number;
  seed: string;
  speed: RequestedSpeed;
  status: GameStatus;
  timeHours: number;
}

export type GameState<E extends DomainExtensions = DomainExtensions> = KernelState & E;

export interface CreateStateOptions {
  buildVersion: string;
  diagnostics?: boolean;
  diagnosticLimit?: number;
  seed: string;
}
