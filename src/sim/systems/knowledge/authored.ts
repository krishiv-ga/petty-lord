import type {
  EffectId,
  EventId,
  LordId,
  OpeningId,
  PhaseId,
  SecretId,
} from '../../../contracts/ids';

export interface AuthoredEffect {
  readonly durationDays?: number | undefined;
  readonly effectId: EffectId;
  readonly referenceId?: string | undefined;
  readonly target: string;
  readonly value?: number | undefined;
  readonly visibility: 'observer-limited' | 'parties' | 'private' | 'public';
}

export interface OpeningDefinitionView {
  readonly additionalSecretPool: readonly SecretId[];
  readonly compatibilityRouteIds: readonly string[];
  readonly effects: readonly AuthoredEffect[];
  readonly guaranteedSecretPool: readonly SecretId[];
  readonly id: OpeningId;
}

export interface OpeningContentView {
  readonly openings: readonly OpeningDefinitionView[];
}

export interface SecretDefinitionView {
  readonly effects: readonly AuthoredEffect[];
  readonly id: SecretId;
  readonly targetLordId: LordId;
}

export interface SecretContentView {
  readonly secrets: readonly SecretDefinitionView[];
}

export interface AuthoredRandomOutcome {
  readonly distribution: 'coin-flip' | 'uniform-integer' | 'weighted';
  readonly values: readonly number[];
  readonly weights?: readonly number[] | undefined;
}

export interface AuthoredEventChoice {
  readonly effects: readonly AuthoredEffect[];
  readonly goldCost: number;
  readonly id: string;
  readonly influenceCost: number;
  readonly randomOutcome?: AuthoredRandomOutcome | undefined;
  readonly requirementIds: readonly string[];
}

export interface AuthoredFollowUpDecision {
  readonly choices: readonly AuthoredEventChoice[];
  readonly delayDays: number;
  readonly id: string;
}

export interface AuthoredEventDefinition {
  readonly choices: readonly AuthoredEventChoice[];
  readonly cooldownDays: number;
  readonly displayOrder: number;
  readonly elapsedDayWindow: readonly [number, number] | null;
  readonly followUpDecisions?: readonly AuthoredFollowUpDecision[] | undefined;
  readonly id: EventId;
  readonly kind: 'ambient' | 'mandatory';
  readonly phaseIds: readonly PhaseId[];
  readonly requirementIds: readonly string[];
  readonly weight: number;
}

export interface EventContentView {
  readonly events: readonly AuthoredEventDefinition[];
}
