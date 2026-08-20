import type { LordId, SecretId, TerritoryId } from '../../../contracts/ids';
import type { JsonValue } from '../../state';

export type KnowledgeField =
  | 'agreement'
  | 'army'
  | 'candidacy'
  | 'capital'
  | 'church'
  | 'claim'
  | 'intent'
  | 'leaning'
  | 'occupation'
  | 'secret'
  | 'support'
  | 'war';

export type KnowledgeSource = 'direct' | 'public' | 'spy-find-dirt' | 'spy-watch-court' | 'shared';

export interface KnowledgeObservation {
  readonly confidence: 'confirmed' | 'credible' | 'rumor';
  readonly field: KnowledgeField;
  readonly invalidatedAtHours: number | null;
  readonly observedAtHours: number;
  readonly observerId: LordId;
  readonly sequenceId: number;
  readonly source: KnowledgeSource;
  readonly staleAfterHours: number | null;
  readonly subjectId: string;
  readonly value: JsonValue;
}

export interface KnowledgeLedger {
  readonly observations: readonly KnowledgeObservation[];
}

export type ObservationFreshness = 'current' | 'invalid' | 'stale';

export interface PublicLordFacts {
  readonly armyBand: 'broken' | 'formidable' | 'modest' | 'strong';
  readonly candidacy: 'declared' | 'not-declared' | 'withdrawn';
  readonly church: 'condemned' | 'endorsed' | 'favorable' | 'neutral' | 'skeptical';
  readonly claim: number;
  readonly support: PublicSupportKnowledgeValue;
}

export interface SupportKnowledgeValue {
  readonly basis: 'known-coercion' | 'known-voluntary' | 'secretly-coerced' | 'self' | 'unknown';
  readonly candidateId: LordId | null;
  readonly level: 'committed' | 'leaning' | 'pledged' | 'self' | 'unaligned' | 'under-duress';
}

export type PublicSupportKnowledgeValue = Omit<SupportKnowledgeValue, 'basis'> & {
  readonly basis: Exclude<SupportKnowledgeValue['basis'], 'secretly-coerced'>;
};

export interface PublicRealmSnapshot {
  readonly capital: {
    readonly controllerId: LordId | 'royal' | 'uncontrolled';
    readonly garrisonBand: 'broken' | 'formidable' | 'modest' | 'strong';
  };
  readonly lords: Readonly<Record<LordId, PublicLordFacts>>;
  readonly occupations: readonly {
    readonly occupierId: LordId;
    readonly territoryId: TerritoryId;
  }[];
  readonly publicAgreements: readonly string[];
  readonly publicOffensiveWarCounts: Readonly<Record<LordId, number>>;
  readonly publicWars: readonly string[];
}

export interface ObserverSelfFacts {
  readonly agreements: readonly string[];
  readonly army: number;
  readonly defensePower: number;
  readonly intentId: string | null;
  readonly lordId: LordId;
  readonly secrets: readonly SecretId[];
  readonly support: SupportKnowledgeValue;
}

export const MILITARY_BAND_MIDPOINT = {
  broken: 75,
  modest: 225,
  strong: 400,
  formidable: 600,
} as const;
