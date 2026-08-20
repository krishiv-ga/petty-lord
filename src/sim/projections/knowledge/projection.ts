import { LORD_IDS, type LordId, type SecretId } from '../../../contracts/ids';
import { latestObservation, observationFreshness } from '../../systems/knowledge/ledger';
import {
  type KnowledgeLedger,
  MILITARY_BAND_MIDPOINT,
  type ObserverSelfFacts,
  type PublicRealmSnapshot,
  type SupportKnowledgeValue,
} from '../../systems/knowledge/types';

export type ProjectedPrivateFact<T> =
  | { readonly kind: 'current'; readonly observedAtHours: number; readonly value: T }
  | {
      readonly kind: 'stale';
      readonly ageHours: number;
      readonly observedAtHours: number;
      readonly value: T;
    }
  | { readonly kind: 'unknown' };

export type ProjectedMilitary =
  | {
      readonly band: keyof typeof MILITARY_BAND_MIDPOINT;
      readonly kind: 'banded';
      readonly estimate: number;
    }
  | { readonly kind: 'exact'; readonly observedAtHours: number; readonly value: number }
  | {
      readonly band: keyof typeof MILITARY_BAND_MIDPOINT;
      readonly kind: 'stale-estimate';
      readonly observedAtHours: number;
      readonly value: number;
    };

export interface ProjectedLordKnowledge {
  readonly army: ProjectedMilitary;
  readonly candidacy: 'declared' | 'not-declared' | 'withdrawn';
  readonly church: string;
  readonly claim: number;
  readonly intent: ProjectedPrivateFact<string | null>;
  readonly leaning: ProjectedPrivateFact<LordId | null>;
  readonly support: SupportKnowledgeValue & {
    readonly knowledge: 'current-private' | 'observer-self' | 'public' | 'stale-private';
    readonly observedAtHours: number | null;
  };
  readonly threatBand: 'concern' | 'existential' | 'low' | 'serious';
}

export interface PlayerKnowledgeProjection {
  readonly agreements: readonly string[];
  readonly capital: PublicRealmSnapshot['capital'];
  readonly generatedAtHours: number;
  readonly lords: Readonly<Record<LordId, ProjectedLordKnowledge>>;
  readonly knownSecrets: readonly SecretId[];
  readonly observerId: LordId;
  readonly occupations: PublicRealmSnapshot['occupations'];
  readonly publicWars: readonly string[];
}

function privateFact<T>(
  ledger: KnowledgeLedger,
  observerId: LordId,
  subjectId: string,
  field: 'intent' | 'leaning',
  atHours: number,
): ProjectedPrivateFact<T> {
  const observation = latestObservation(ledger, { atHours, field, observerId, subjectId });
  if (observation === null) return { kind: 'unknown' };
  const value = observation.value as T;
  return observationFreshness(observation, atHours) === 'current'
    ? { kind: 'current', observedAtHours: observation.observedAtHours, value }
    : {
        ageHours: atHours - observation.observedAtHours,
        kind: 'stale',
        observedAtHours: observation.observedAtHours,
        value,
      };
}

function militaryFact(
  ledger: KnowledgeLedger,
  observer: ObserverSelfFacts,
  subjectId: LordId,
  publicBand: keyof typeof MILITARY_BAND_MIDPOINT,
  atHours: number,
): ProjectedMilitary {
  if (subjectId === observer.lordId) {
    return { kind: 'exact', observedAtHours: atHours, value: observer.army };
  }
  const observation = latestObservation(ledger, {
    atHours,
    field: 'army',
    observerId: observer.lordId,
    subjectId,
  });
  if (
    observation !== null &&
    observation.field === 'army' &&
    typeof observation.value === 'string' &&
    observation.value in MILITARY_BAND_MIDPOINT &&
    observationFreshness(observation, atHours) === 'current'
  ) {
    const band = observation.value as keyof typeof MILITARY_BAND_MIDPOINT;
    return { band, estimate: MILITARY_BAND_MIDPOINT[band], kind: 'banded' };
  }
  if (observation === null || typeof observation.value !== 'number') {
    return { band: publicBand, estimate: MILITARY_BAND_MIDPOINT[publicBand], kind: 'banded' };
  }
  const exactSource =
    observation.confidence === 'confirmed' &&
    (observation.source === 'direct' || observation.source === 'spy-watch-court');
  if (observationFreshness(observation, atHours) === 'current' && exactSource) {
    return {
      kind: 'exact',
      observedAtHours: observation.observedAtHours,
      value: observation.value,
    };
  }
  return {
    band: publicBand,
    kind: 'stale-estimate',
    observedAtHours: observation.observedAtHours,
    value: Math.round((observation.value + MILITARY_BAND_MIDPOINT[publicBand]) / 2),
  };
}

function isSupportValue(value: unknown): value is SupportKnowledgeValue {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<SupportKnowledgeValue>;
  return (
    (candidate.candidateId === null || LORD_IDS.includes(candidate.candidateId as LordId)) &&
    ['known-coercion', 'known-voluntary', 'secretly-coerced', 'self', 'unknown'].includes(
      candidate.basis ?? '',
    ) &&
    ['committed', 'leaning', 'pledged', 'self', 'unaligned', 'under-duress'].includes(
      candidate.level ?? '',
    )
  );
}

function supportFact(
  ledger: KnowledgeLedger,
  observer: ObserverSelfFacts,
  subjectId: LordId,
  publicValue: SupportKnowledgeValue,
  atHours: number,
): ProjectedLordKnowledge['support'] {
  if (subjectId === observer.lordId) {
    return { ...observer.support, knowledge: 'observer-self', observedAtHours: atHours };
  }
  const observation = latestObservation(ledger, {
    atHours,
    field: 'support',
    observerId: observer.lordId,
    subjectId,
  });
  if (observation === null || !isSupportValue(observation.value)) {
    return { ...publicValue, knowledge: 'public', observedAtHours: null };
  }
  const supportValue: SupportKnowledgeValue = observation.value;
  return {
    ...supportValue,
    knowledge:
      observationFreshness(observation, atHours) === 'current'
        ? 'current-private'
        : 'stale-private',
    observedAtHours: observation.observedAtHours,
  };
}

function validatePublicSupport(value: PublicRealmSnapshot['lords'][LordId]['support']): void {
  const coerced = value.basis === 'known-coercion';
  if (coerced !== (value.level === 'under-duress')) {
    throw new Error('Public coercion must be represented as Under Duress and vice versa');
  }
}

function observedThreatBand(
  candidateId: LordId,
  army: ProjectedMilitary,
  ledger: KnowledgeLedger,
  observer: ObserverSelfFacts,
  publicRealm: PublicRealmSnapshot,
  atHours: number,
): ProjectedLordKnowledge['threatBand'] {
  const estimate = army.kind === 'banded' ? army.estimate : army.value;
  const seatByLord: Readonly<Record<LordId, string>> = {
    greyfen: 'greyfen',
    edric: 'northkeep',
    ysabel: 'eastvale',
    renard: 'southmere',
    oswin: 'abbeylands',
    mara: 'westmarch',
  };
  const adjacentBySeat: Readonly<Record<string, readonly string[]>> = {
    greyfen: ['westmarch', 'capital', 'abbeylands'],
    northkeep: ['westmarch', 'capital', 'eastvale'],
    westmarch: ['northkeep', 'capital', 'greyfen'],
    eastvale: ['northkeep', 'capital', 'southmere'],
    abbeylands: ['greyfen', 'capital', 'southmere'],
    southmere: ['eastvale', 'capital', 'abbeylands'],
  };
  const occupiedSeats = publicRealm.occupations.filter(
    ({ occupierId, territoryId }) => occupierId === candidateId && territoryId !== 'capital',
  );
  const adjacentSeats = adjacentBySeat[seatByLord[observer.lordId]] ?? [];
  const publicSupporters = LORD_IDS.filter((lordId) => {
    const support = publicRealm.lords[lordId].support;
    return (
      support.candidateId === candidateId &&
      ['committed', 'pledged', 'under-duress'].includes(support.level)
    );
  });
  const knownCoerced = LORD_IDS.filter((lordId) => {
    const support = supportFact(
      ledger,
      observer,
      lordId,
      publicRealm.lords[lordId].support,
      atHours,
    );
    return (
      support.candidateId === candidateId &&
      support.knowledge !== 'stale-private' &&
      (support.basis === 'known-coercion' || support.basis === 'secretly-coerced')
    );
  }).length;
  let points = estimate > observer.defensePower * 1.25 ? 20 : 0;
  if (occupiedSeats.some(({ territoryId }) => adjacentSeats.includes(territoryId))) points += 15;
  points += occupiedSeats.length * 10;
  if (publicRealm.capital.controllerId === candidateId) points += 15;
  if (publicSupporters.length >= 2) points += 10;
  if (publicRealm.publicOffensiveWarCounts[candidateId] >= 2) points += 10;
  points += knownCoerced * 10;
  if (
    observer.support.candidateId === candidateId &&
    observer.support.level === 'committed' &&
    observer.support.basis !== 'known-coercion' &&
    observer.support.basis !== 'secretly-coerced'
  ) {
    points -= 10;
  }
  if (points < 20) return 'low';
  if (points < 40) return 'concern';
  if (points < 60) return 'serious';
  return 'existential';
}

export function buildPlayerKnowledgeProjection(input: {
  readonly atHours: number;
  readonly ledger: KnowledgeLedger;
  readonly publicRealm: PublicRealmSnapshot;
  readonly self: ObserverSelfFacts;
}): PlayerKnowledgeProjection {
  const lordEntries = LORD_IDS.map((lordId) => {
    const publicFacts = input.publicRealm.lords[lordId];
    validatePublicSupport(publicFacts.support);
    const army = militaryFact(
      input.ledger,
      input.self,
      lordId,
      publicFacts.armyBand,
      input.atHours,
    );
    return [
      lordId,
      {
        army,
        candidacy: publicFacts.candidacy,
        church: publicFacts.church,
        claim: publicFacts.claim,
        intent:
          lordId === input.self.lordId
            ? ({
                kind: 'current',
                observedAtHours: input.atHours,
                value: input.self.intentId,
              } as const)
            : privateFact<string | null>(
                input.ledger,
                input.self.lordId,
                lordId,
                'intent',
                input.atHours,
              ),
        leaning: privateFact<LordId | null>(
          input.ledger,
          input.self.lordId,
          lordId,
          'leaning',
          input.atHours,
        ),
        support: supportFact(input.ledger, input.self, lordId, publicFacts.support, input.atHours),
        threatBand: observedThreatBand(
          lordId,
          army,
          input.ledger,
          input.self,
          input.publicRealm,
          input.atHours,
        ),
      },
    ] as const;
  });

  return {
    agreements: [
      ...new Set([...input.publicRealm.publicAgreements, ...input.self.agreements]),
    ].sort(),
    capital: input.publicRealm.capital,
    generatedAtHours: input.atHours,
    lords: Object.fromEntries(lordEntries) as Record<LordId, ProjectedLordKnowledge>,
    knownSecrets: [...input.self.secrets].sort(),
    observerId: input.self.lordId,
    occupations: [...input.publicRealm.occupations],
    publicWars: [...input.publicRealm.publicWars],
  };
}
