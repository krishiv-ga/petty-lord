import type { RandomSession } from '../random/random';
import type { JsonObject, JsonValue } from '../state/json';
import type {
  ChronicleEntry,
  DomainExtensions,
  GameState,
  PendingDecision,
  RequestedSpeed,
  ScheduledItem,
} from '../state/types';

export interface ScheduleInput {
  dueTimeHours: number;
  kind: string;
  payload?: JsonValue;
  priority: number;
  storedDraws?: Record<string, JsonValue>;
}

export interface DecisionInput {
  choiceIds: string[];
  id: string;
  kind: string;
  payload?: JsonValue;
}

export interface ChronicleInput {
  data?: JsonObject;
  id: string;
  kind: string;
  message: string;
}

export interface SimulationEffect {
  kind: string;
  payload: JsonValue;
}

export interface DomainTransition<E extends DomainExtensions> {
  cancelSequenceIds?: number[];
  chronicle?: ChronicleInput[];
  decision?: DecisionInput;
  effects?: SimulationEffect[];
  schedule?: ScheduleInput[];
  state: GameState<E>;
}

export interface ScheduledResolverContext<E extends DomainExtensions> {
  item: ScheduledItem;
  random: RandomSession;
  state: GameState<E>;
}

export type ScheduledResolver<E extends DomainExtensions> = (
  context: ScheduledResolverContext<E>,
) => DomainTransition<E>;

export interface InitiativeCommand {
  initiativeType: string;
  payload: JsonValue;
  type: 'START_INITIATIVE';
}

export interface CancelInitiativeCommand {
  sequenceId: number;
  type: 'CANCEL_INITIATIVE';
}

export interface ChooseDecisionCommand {
  choiceId: string;
  decisionId: string;
  payload: JsonValue;
  type: 'CHOOSE_DECISION';
}

export interface SetRequestedSpeedCommand {
  speed: RequestedSpeed;
  type: 'SET_REQUESTED_SPEED';
}

export interface AdvanceTimeCommand {
  hours: number;
  mode: 'instant' | 'paced';
  type: 'ADVANCE_TIME';
}

export interface ImportStateCommand {
  serialized: string;
  type: 'IMPORT_STATE';
}

export interface ExportStateCommand {
  type: 'EXPORT_STATE';
}

export interface DebugCommand {
  name: string;
  payload: JsonValue;
  type: 'DEBUG';
}

export type KernelCommand =
  | AdvanceTimeCommand
  | CancelInitiativeCommand
  | ChooseDecisionCommand
  | DebugCommand
  | ExportStateCommand
  | ImportStateCommand
  | InitiativeCommand
  | SetRequestedSpeedCommand;

export interface DomainCommandContext<E extends DomainExtensions, C extends KernelCommand> {
  command: C;
  random: RandomSession;
  state: GameState<E>;
}

export type InitiativeStarter<E extends DomainExtensions> = (
  context: DomainCommandContext<E, InitiativeCommand>,
) => DomainTransition<E>;

export type InitiativeCanceller<E extends DomainExtensions> = (
  context: DomainCommandContext<E, CancelInitiativeCommand> & { item: ScheduledItem },
) => DomainTransition<E>;

export type DecisionResolver<E extends DomainExtensions> = (
  context: DomainCommandContext<E, ChooseDecisionCommand> & { decision: PendingDecision },
) => DomainTransition<E>;

export type DebugHandler<E extends DomainExtensions> = (
  context: DomainCommandContext<E, DebugCommand>,
) => DomainTransition<E>;

export interface DomainModule<E extends DomainExtensions> {
  debugHandlers?: Record<string, DebugHandler<E>>;
  decisionResolvers?: Record<string, DecisionResolver<E>>;
  id: string;
  initiativeCancellers?: Record<string, InitiativeCanceller<E>>;
  initiativeStarters?: Record<string, InitiativeStarter<E>>;
  scheduledResolvers?: Record<string, ScheduledResolver<E>>;
}

export interface KernelRegistry<E extends DomainExtensions> {
  debugHandlers: Map<string, DebugHandler<E>>;
  decisionResolvers: Map<string, DecisionResolver<E>>;
  initiativeCancellers: Map<string, InitiativeCanceller<E>>;
  initiativeStarters: Map<string, InitiativeStarter<E>>;
  scheduledResolvers: Map<string, ScheduledResolver<E>>;
}

export interface KernelErrorDetail {
  code: string;
  context: JsonObject;
  message: string;
}

export interface SchedulerTrace {
  nextScheduled: ScheduledItem | null;
  resolved: ScheduledItem[];
  stoppedForDecision: string | null;
  targetTimeHours: number;
}

export type KernelResult<E extends DomainExtensions> =
  | {
      diagnostics: SchedulerTrace | null;
      effects: SimulationEffect[];
      ok: true;
      state: GameState<E>;
    }
  | {
      diagnostics: SchedulerTrace | null;
      error: KernelErrorDetail;
      ok: false;
      state: GameState<E>;
    };

export type ChronicleRecord = ChronicleEntry;
