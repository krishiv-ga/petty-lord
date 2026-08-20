import type {
  ActionId,
  ConditionId,
  LordId,
  PhaseId,
  PolicyId,
  TerritoryId,
} from '../../../contracts/ids';
import type { FoundationGameState } from '../../../contracts/state';
import type { JsonObject, JsonValue } from '../../state';

export const FRACTION_SCALE = 1_000_000;
export const HOURS_PER_DAY = 24;
export const CRISIS_DAYS = 56;
export const PLAYER_ORDER_SLOTS = 2;

export type PrognosisId =
  | 'roughly-eight-weeks'
  | 'perhaps-a-fortnight'
  | 'unlikely-to-survive-week'
  | 'days'
  | 'any-hour';

export interface TimedCondition {
  readonly expiresAtHours: number | null;
  readonly id: ConditionId;
  readonly startedAtHours: number;
}

export interface KingHealthState {
  readonly alive: boolean;
  readonly deathDawnElapsedDay: number;
  readonly diedAtHours: number | null;
  readonly phase: PhaseId;
  readonly phaseTrace: readonly {
    readonly elapsedDay: number;
    readonly phase: PhaseId;
    readonly timeHours: number;
  }[];
  readonly prognosis: PrognosisId;
  readonly prognosisTrace: readonly {
    readonly elapsedDay: number;
    readonly prognosis: PrognosisId;
    readonly timeHours: number;
  }[];
}

export interface LordResourceState {
  readonly claim: number;
  readonly committedTroops: number;
  readonly conditions: readonly TimedCondition[];
  readonly gold: number;
  readonly goldFractionMillionths: number;
  readonly influence: number;
  readonly lockedGold: number;
  readonly prestige: number;
}

export interface TerritoryEconomyState {
  readonly availableLevies: number;
  readonly conditions: readonly TimedCondition[];
  readonly fortification: number;
  readonly legalLordId: LordId | null;
  readonly levyCapacity: number | null;
  readonly levyRecoveryMillionths: number;
  readonly physicalControllerId: LordId | null;
  readonly traitId: string;
  readonly territoryId: TerritoryId;
}

export type ResourceKind = 'claim' | 'gold' | 'influence' | 'levies' | 'prestige';

export interface ResourceDeltaRecord {
  readonly amount: number;
  readonly atHours: number;
  readonly chronicleKey: string | null;
  readonly fractionMillionths: number;
  readonly lordId: LordId;
  readonly reasonId: string;
  readonly resource: ResourceKind;
  readonly territoryId: TerritoryId | null;
}

export type ActionIntent = 'commit' | 'confirm' | 'danger';
export type ConsequenceSeverity = 'ordinary' | 'warning' | 'critical';

export interface ActionCostProjection {
  readonly gold: number;
  readonly influence: number;
  readonly logisticsGold: number;
}

export interface ActionPreview {
  readonly acceptanceCollateral: readonly string[];
  readonly actionId: ActionId;
  readonly available: boolean;
  readonly cancellationLoss: readonly string[];
  readonly disabledReasons: readonly string[];
  readonly durationHours: number;
  readonly fallback: string;
  readonly intentionalUnknowns: readonly string[];
  readonly intent: ActionIntent;
  readonly irreversible: boolean;
  readonly knownConsequences: readonly string[];
  readonly name: string;
  readonly severity: ConsequenceSeverity;
  readonly startCost: ActionCostProjection;
  readonly troopsLocked: number;
  readonly visibility: 'hidden' | 'private-to-parties' | 'public' | 'suspected';
  readonly warnings: readonly string[];
}

export interface OrderPayload {
  readonly actionId: ActionId;
  readonly inviteeIds?: readonly LordId[];
  readonly optionId?: string;
  readonly resolutionData?: JsonObject;
  readonly targetId?: string;
}

export type OrderStatus = 'active' | 'cancelled' | 'failed' | 'resolved';

export interface OrderRecord {
  readonly actionId: ActionId;
  readonly cancellationLoss: readonly string[];
  readonly completedAtHours: number;
  readonly endedAtHours: number | null;
  readonly fallback: string;
  readonly payload: OrderPayload;
  readonly scheduledSequenceId: number;
  readonly slot: 0 | 1;
  readonly startedAtHours: number;
  readonly status: OrderStatus;
}

export interface ActionUseRecord {
  readonly actionId: ActionId;
  readonly phase: PhaseId;
  readonly targetId: string | null;
  readonly timeHours: number;
}

export interface ReactionRecord {
  readonly choiceIds: readonly string[];
  readonly deadlineHours: number | null;
  readonly id: string;
  readonly kind: string;
  readonly openedAtHours: number | null;
  readonly outcome: { readonly choiceId: string; readonly payload: JsonValue } | null;
  readonly payload: JsonValue;
  readonly priority: number;
  readonly resumeSpeed: 0 | 1 | 2;
  readonly scheduledSequenceId: number;
  readonly status: 'expired' | 'opened' | 'queued' | 'resolved';
}

export interface Wp020SystemShape {
  readonly actionHistory: readonly ActionUseRecord[];
  readonly invalidTargets: readonly string[];
  readonly king: KingHealthState;
  readonly lords: Readonly<Record<LordId, LordResourceState>>;
  readonly orders: readonly OrderRecord[];
  readonly policies: readonly PolicyId[];
  readonly reactions: readonly ReactionRecord[];
  readonly resourceLedger: readonly ResourceDeltaRecord[];
  readonly territories: Readonly<Record<TerritoryId, TerritoryEconomyState>>;
  readonly version: 1;
}

export type Wp020SystemState = JsonObject & Wp020SystemShape;

export type Wp020GameState = Omit<FoundationGameState, 'systems'> & {
  systems: Omit<FoundationGameState['systems'], 'time'> & { time: Wp020SystemState };
};

export function getWp020(state: Wp020GameState): Wp020SystemShape {
  return state.systems.time;
}

export function setWp020(state: Wp020GameState, time: Wp020SystemShape): Wp020GameState {
  return {
    ...state,
    systems: { ...state.systems, time: time as unknown as Wp020SystemState },
  };
}
