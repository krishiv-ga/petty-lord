import { describe, expect, it } from 'vitest';
import { buildPlayerKnowledgeProjection } from '../../../src/sim/projections/knowledge/projection';
import {
  invalidateObservations,
  latestObservation,
  observationFreshness,
  recordObservation,
} from '../../../src/sim/systems/knowledge/ledger';
import type {
  KnowledgeLedger,
  KnowledgeObservation,
} from '../../../src/sim/systems/knowledge/types';
import { PUBLIC_REALM_FIXTURE } from './fixtures';

const observed = (
  observerId: KnowledgeObservation['observerId'],
  field: KnowledgeObservation['field'],
  value: KnowledgeObservation['value'],
  observedAtHours = 0,
): KnowledgeObservation => ({
  confidence: 'confirmed',
  field,
  invalidatedAtHours: null,
  observedAtHours,
  observerId,
  sequenceId: observedAtHours + 1,
  source: 'spy-watch-court',
  staleAfterHours: 168,
  subjectId: 'renard',
  value,
});

describe('observer-specific knowledge', () => {
  it('gives different observers different beliefs about the same authoritative subject', () => {
    const ledger: KnowledgeLedger = {
      observations: [
        observed('greyfen', 'army', 447, 24),
        observed('oswin', 'army', 390, 0),
        observed('greyfen', 'leaning', 'ysabel', 24),
      ],
    };
    const greyfen = buildPlayerKnowledgeProjection({
      atHours: 48,
      ledger,
      publicRealm: PUBLIC_REALM_FIXTURE,
      self: {
        agreements: [],
        army: 360,
        defensePower: 360,
        intentId: null,
        lordId: 'greyfen',
        secrets: [],
        support: { basis: 'unknown', candidateId: null, level: 'unaligned' },
      },
    });
    const oswin = buildPlayerKnowledgeProjection({
      atHours: 200,
      ledger,
      publicRealm: PUBLIC_REALM_FIXTURE,
      self: {
        agreements: [],
        army: 210,
        defensePower: 210,
        intentId: null,
        lordId: 'oswin',
        secrets: [],
        support: { basis: 'unknown', candidateId: null, level: 'unaligned' },
      },
    });

    expect(greyfen.lords.renard.army).toEqual({
      kind: 'exact',
      observedAtHours: 24,
      value: 447,
    });
    expect(greyfen.lords.renard.leaning).toMatchObject({ kind: 'current', value: 'ysabel' });
    expect(oswin.lords.renard.army).toEqual({
      band: 'strong',
      kind: 'stale-estimate',
      observedAtHours: 0,
      value: 395,
    });
    expect(oswin.lords.renard.leaning).toEqual({ kind: 'unknown' });
  });

  it('timestamps staleness and invalidates facts without granting replacement truth', () => {
    const entry = observed('greyfen', 'intent', 'patronize-church');
    let ledger: KnowledgeLedger = { observations: [] };
    ledger = recordObservation(ledger, entry);
    expect(observationFreshness(entry, 168)).toBe('current');
    expect(observationFreshness(entry, 169)).toBe('stale');
    ledger = invalidateObservations(ledger, {
      atHours: 72,
      field: 'intent',
      observerId: 'greyfen',
      subjectId: 'renard',
    });
    expect(
      latestObservation(ledger, {
        atHours: 73,
        field: 'intent',
        observerId: 'greyfen',
        subjectId: 'renard',
      }),
    ).toBeNull();
  });

  it('cannot project undiscovered private facts or future draws', () => {
    const projection = buildPlayerKnowledgeProjection({
      atHours: 24,
      ledger: { observations: [] },
      publicRealm: PUBLIC_REALM_FIXTURE,
      self: {
        agreements: ['greyfen-own-bargain'],
        army: 360,
        defensePower: 360,
        intentId: 'watch-court',
        lordId: 'greyfen',
        secrets: [],
        support: { basis: 'unknown', candidateId: null, level: 'unaligned' },
      },
    });
    const serialized = JSON.stringify(projection);
    expect(projection.lords.renard.leaning).toEqual({ kind: 'unknown' });
    expect(projection.lords.renard.intent).toEqual({ kind: 'unknown' });
    expect(projection.lords.renard.army.kind).toBe('banded');
    expect(serialized).not.toContain('hidden-player-order');
    expect(serialized).not.toContain('futureDeath');
    expect(serialized).not.toContain('futureEvent');
    expect(serialized).not.toContain('private-blackmail-between-others');
  });

  it('lets stale partial army bands yield to the current public band', () => {
    const projection = buildPlayerKnowledgeProjection({
      atHours: 169,
      ledger: {
        observations: [
          {
            ...observed('greyfen', 'army', 'broken'),
            confidence: 'credible',
            source: 'spy-find-dirt',
          },
        ],
      },
      publicRealm: PUBLIC_REALM_FIXTURE,
      self: {
        agreements: [],
        army: 360,
        defensePower: 360,
        intentId: null,
        lordId: 'greyfen',
        secrets: [],
        support: { basis: 'unknown', candidateId: null, level: 'unaligned' },
      },
    });
    expect(projection.lords.renard.army).toEqual({
      band: 'strong',
      estimate: 400,
      kind: 'banded',
    });
  });

  it('shows private blackmail only to an informed observer', () => {
    const publicRealm = {
      ...PUBLIC_REALM_FIXTURE,
      lords: {
        ...PUBLIC_REALM_FIXTURE.lords,
        ysabel: {
          ...PUBLIC_REALM_FIXTURE.lords.ysabel,
          support: {
            basis: 'known-voluntary' as const,
            candidateId: 'renard' as const,
            level: 'pledged' as const,
          },
        },
      },
      publicOffensiveWarCounts: {
        ...PUBLIC_REALM_FIXTURE.publicOffensiveWarCounts,
        renard: 2,
      },
    };
    const privateSupport = {
      confidence: 'confirmed' as const,
      field: 'support' as const,
      invalidatedAtHours: null,
      observedAtHours: 24,
      observerId: 'greyfen' as const,
      sequenceId: 1,
      source: 'direct' as const,
      staleAfterHours: null,
      subjectId: 'ysabel',
      value: {
        basis: 'secretly-coerced',
        candidateId: 'renard',
        level: 'pledged',
      },
    };
    const project = (lordId: 'greyfen' | 'oswin') =>
      buildPlayerKnowledgeProjection({
        atHours: 48,
        ledger: { observations: [privateSupport] },
        publicRealm,
        self: {
          agreements: [],
          army: 300,
          defensePower: 400,
          intentId: null,
          lordId,
          secrets: [],
          support: { basis: 'unknown', candidateId: null, level: 'unaligned' },
        },
      });
    expect(project('greyfen').lords.ysabel.support).toMatchObject({
      basis: 'secretly-coerced',
      knowledge: 'current-private',
    });
    expect(project('oswin').lords.ysabel.support).toMatchObject({
      basis: 'known-voluntary',
      knowledge: 'public',
    });
    expect(project('greyfen').lords.renard.threatBand).toBe('concern');
    expect(project('oswin').lords.renard.threatBand).toBe('low');
  });
});
