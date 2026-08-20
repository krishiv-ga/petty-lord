import { describe, expect, it } from 'vitest';
import { canonicalGameContent } from '../../../src/contracts/content';
import { createRandomState } from '../../../src/sim/random/random';
import {
  resolveFindDirt,
  resolveWatchCourt,
  startFindDirt,
  startWatchCourt,
} from '../../../src/sim/systems/intelligence/spy';
import { createSeededOpening } from '../../../src/sim/systems/openings/openings';
import { initializeOpeningSecrets } from '../../../src/sim/systems/secrets/secrets';

describe('Watch Court and Find Dirt', () => {
  it('charges actual resources and Watch Court reveals timestamped current facts', () => {
    const started = startWatchCourt({
      actorId: 'greyfen',
      adjacentFenRoadsDiscount: true,
      atHours: 24,
      phase: 'stable',
      resources: { gold: 70, influence: 35 },
      targetId: 'mara',
    });
    expect(started.charge.resources).toEqual({ gold: 55, influence: 27 });
    expect(started.plan.dueAtHours).toBe(96);
    const observations = resolveWatchCourt({
      currentArmy: 431,
      currentIntentId: 'resist-renard',
      currentLeaningId: 'greyfen',
      plan: started.plan,
      sequenceId: 8,
    });
    expect(observations.map((entry) => entry.field)).toEqual(['intent', 'leaning', 'army']);
    expect(observations.every((entry) => entry.staleAfterHours === 168)).toBe(true);
  });

  it('cannot start Find Dirt in Deathbed or when unaffordable', () => {
    const base = {
      actorId: 'greyfen' as const,
      atHours: 0,
      phase: 'deathbed' as const,
      randomState: createRandomState('blocked'),
      repeatedAttemptsWithinTenDays: 0,
      resources: { gold: 70, influence: 35 },
      targetId: 'renard' as const,
      targetInfluence: 60,
    };
    expect(() => startFindDirt(base)).toThrow(/Deathbed/);
    expect(() =>
      startFindDirt({ ...base, phase: 'stable', resources: { gold: 20, influence: 35 } }),
    ).toThrow(/unaffordable/);
  });

  it('stores the contested outcome so reload cannot reroll it', () => {
    const first = startFindDirt({
      actorId: 'greyfen',
      atHours: 48,
      phase: 'ailing',
      randomState: createRandomState('spy-reload'),
      repeatedAttemptsWithinTenDays: 1,
      resources: { gold: 90, influence: 80 },
      targetId: 'renard',
      targetInfluence: 60,
    });
    const reload = startFindDirt({
      actorId: 'greyfen',
      atHours: 48,
      phase: 'ailing',
      randomState: createRandomState('different-post-reload-state'),
      repeatedAttemptsWithinTenDays: 1,
      resources: { gold: 90, influence: 13 },
      storedDraws: first.plan.storedDraws,
      targetId: 'renard',
      targetInfluence: 100,
    });
    expect(reload.plan.storedDraws).toEqual(first.plan.storedDraws);
    expect(reload.plan.tier).toBe(first.plan.tier);
    expect(reload.plan.detected).toBe(first.plan.detected);
    expect(reload.plan.wasReloaded).toBe(true);
  });

  it('returns partial intelligence and emits hostility plus alert on detected failure', () => {
    const opening = createSeededOpening('spy-partial', canonicalGameContent);
    const secrets = initializeOpeningSecrets(opening, canonicalGameContent);
    const started = startFindDirt({
      actorId: 'greyfen',
      atHours: 0,
      phase: 'stable',
      randomState: createRandomState('ignored-by-stored'),
      repeatedAttemptsWithinTenDays: 0,
      resources: { gold: 100, influence: 100 },
      storedDraws: {
        defense: 70,
        detected: true,
        detectionRoll: 1,
        spyPower: 60,
        spyVariance: -10,
        tier: 'partial',
      },
      targetId: 'renard',
      targetInfluence: 100,
    });
    expect(started.plan.tier).toBe('partial');
    const result = resolveFindDirt({
      lesserIntelligence: { field: 'intent', value: 'court-oswin' },
      plan: started.plan,
      secrets,
      sequenceId: 21,
    });
    expect(result.discoveredSecretId).toBeNull();
    expect(result.observations).toHaveLength(1);
    expect(result.effects.map((effect) => effect.kind)).toEqual([
      'politics.adjust-relationship',
      'knowledge.spy-alert',
    ]);
  });

  it('never turns partial Find Dirt into an exact army count', () => {
    const opening = createSeededOpening('critic-partial-exact', canonicalGameContent);
    const started = startFindDirt({
      actorId: 'greyfen',
      atHours: 0,
      phase: 'stable',
      randomState: createRandomState('ignored-by-stored'),
      repeatedAttemptsWithinTenDays: 0,
      resources: { gold: 100, influence: 100 },
      storedDraws: {
        defense: 70,
        detected: false,
        detectionRoll: 100,
        spyPower: 60,
        spyVariance: -10,
        tier: 'partial',
      },
      targetId: 'renard',
      targetInfluence: 100,
    });
    const result = resolveFindDirt({
      lesserIntelligence: { field: 'army', value: 'strong' },
      plan: started.plan,
      secrets: initializeOpeningSecrets(opening, canonicalGameContent),
      sequenceId: 22,
    });
    expect(result.observations[0]).toMatchObject({
      confidence: 'credible',
      field: 'army',
      value: 'strong',
    });
  });
});
