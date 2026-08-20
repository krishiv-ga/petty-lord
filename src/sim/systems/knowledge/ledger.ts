import type { LordId } from '../../../contracts/ids';
import type {
  KnowledgeField,
  KnowledgeLedger,
  KnowledgeObservation,
  ObservationFreshness,
} from './types';

export const EMPTY_KNOWLEDGE_LEDGER: KnowledgeLedger = Object.freeze({ observations: [] });

export function observationFreshness(
  observation: KnowledgeObservation,
  atHours: number,
): ObservationFreshness {
  if (observation.invalidatedAtHours !== null && observation.invalidatedAtHours <= atHours) {
    return 'invalid';
  }
  if (
    observation.staleAfterHours !== null &&
    atHours - observation.observedAtHours > observation.staleAfterHours
  ) {
    return 'stale';
  }
  return 'current';
}

export function recordObservation(
  ledger: KnowledgeLedger,
  observation: KnowledgeObservation,
): KnowledgeLedger {
  const withoutSuperseded = ledger.observations.map((existing) =>
    existing.observerId === observation.observerId &&
    existing.subjectId === observation.subjectId &&
    existing.field === observation.field &&
    existing.invalidatedAtHours === null
      ? { ...existing, invalidatedAtHours: observation.observedAtHours }
      : existing,
  );
  return { observations: [...withoutSuperseded, observation] };
}

export function invalidateObservations(
  ledger: KnowledgeLedger,
  filter: {
    readonly atHours: number;
    readonly field?: KnowledgeField;
    readonly observerId?: LordId;
    readonly subjectId?: string;
  },
): KnowledgeLedger {
  return {
    observations: ledger.observations.map((observation) => {
      const matches =
        (filter.field === undefined || observation.field === filter.field) &&
        (filter.observerId === undefined || observation.observerId === filter.observerId) &&
        (filter.subjectId === undefined || observation.subjectId === filter.subjectId);
      return matches && observation.invalidatedAtHours === null
        ? { ...observation, invalidatedAtHours: filter.atHours }
        : observation;
    }),
  };
}

export function latestObservation(
  ledger: KnowledgeLedger,
  query: {
    readonly atHours: number;
    readonly field: KnowledgeField;
    readonly observerId: LordId;
    readonly subjectId: string;
  },
): KnowledgeObservation | null {
  return (
    ledger.observations
      .filter(
        (entry) =>
          entry.observerId === query.observerId &&
          entry.subjectId === query.subjectId &&
          entry.field === query.field &&
          observationFreshness(entry, query.atHours) !== 'invalid',
      )
      .sort(
        (left, right) =>
          right.observedAtHours - left.observedAtHours || right.sequenceId - left.sequenceId,
      )[0] ?? null
  );
}
