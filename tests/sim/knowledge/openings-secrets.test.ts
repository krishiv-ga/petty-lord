import { describe, expect, it } from 'vitest';
import { canonicalGameContent } from '../../../src/contracts/content';
import {
  createSeededOpening,
  validateOpeningViability,
} from '../../../src/sim/systems/openings/openings';
import {
  destroySecretEvidence,
  discoverSecret,
  exposeSecret,
  initializeOpeningSecrets,
  useSecretForBlackmail,
} from '../../../src/sim/systems/secrets/secrets';

describe('seeded openings and secrets', () => {
  it('recreates the full opening package and secret set from the same seed', () => {
    const first = createSeededOpening('same-opening-seed', canonicalGameContent);
    const second = createSeededOpening('same-opening-seed', canonicalGameContent);
    expect(second).toEqual(first);
    expect(initializeOpeningSecrets(first, canonicalGameContent)).toHaveLength(3);
  });

  it('varies meaningfully but stays bounded and always guarantees Renard vulnerability', () => {
    const openings = Array.from({ length: 64 }, (_, index) =>
      createSeededOpening(`opening-${index}`, canonicalGameContent),
    );
    expect(new Set(openings.map((opening) => opening.id)).size).toBeGreaterThan(1);
    expect(new Set(openings.map((opening) => opening.renardSecretId)).size).toBeGreaterThan(1);
    for (const opening of openings) {
      expect(opening.renardSecretId).toMatch(/^renard-/);
      expect(validateOpeningViability(opening, canonicalGameContent)).toMatchObject({ ok: true });
      expect(opening.additionalSecretIds).toHaveLength(2);
    }
  });

  it('uses private leverage once and releases its political hook when exposed', () => {
    const opening = createSeededOpening('blackmail-seed', canonicalGameContent);
    let secrets = initializeOpeningSecrets(opening, canonicalGameContent);
    secrets = discoverSecret(secrets, opening.renardSecretId, 'greyfen');
    secrets = useSecretForBlackmail(secrets, {
      actorId: 'greyfen',
      secretId: opening.renardSecretId,
      targetId: 'renard',
    });
    expect(() =>
      useSecretForBlackmail(secrets, {
        actorId: 'greyfen',
        secretId: opening.renardSecretId,
        targetId: 'renard',
      }),
    ).toThrow(/unused private leverage/);
    const exposed = exposeSecret(secrets, {
      actorId: 'greyfen',
      atHours: 120,
      content: canonicalGameContent,
      secretId: opening.renardSecretId,
    });
    expect(exposed.domainEffects).toContainEqual(
      expect.objectContaining({ domain: 'politics', kind: 'politics.release-secret-coercion' }),
    );
    expect(exposed.authoredEffects.length).toBeGreaterThan(0);
    expect(exposed.secrets.find((secret) => secret.id === opening.renardSecretId)).toMatchObject({
      discoverable: false,
      evidence: 'exposed',
      exposedAtHours: 120,
    });
  });

  it('cannot expose destroyed evidence or resurrect its authored scandal effects', () => {
    const opening = createSeededOpening('hunter-destroyed-secret', canonicalGameContent);
    let secrets = initializeOpeningSecrets(opening, canonicalGameContent);
    secrets = discoverSecret(secrets, opening.renardSecretId, 'greyfen');
    secrets = destroySecretEvidence(secrets, opening.renardSecretId).secrets;
    expect(() =>
      exposeSecret(secrets, {
        actorId: 'greyfen',
        atHours: 120,
        content: canonicalGameContent,
        secretId: opening.renardSecretId,
      }),
    ).toThrow(/no longer valid/);
  });

  it('releases a blackmail hook only once when evidence is destroyed', () => {
    const opening = createSeededOpening('destroyed-blackmail-once', canonicalGameContent);
    let secrets = initializeOpeningSecrets(opening, canonicalGameContent);
    secrets = discoverSecret(secrets, opening.renardSecretId, 'greyfen');
    secrets = useSecretForBlackmail(secrets, {
      actorId: 'greyfen',
      secretId: opening.renardSecretId,
      targetId: 'renard',
    });
    const destroyed = destroySecretEvidence(secrets, opening.renardSecretId);
    expect(destroyed.effects).toHaveLength(1);
    expect(() => destroySecretEvidence(destroyed.secrets, opening.renardSecretId)).toThrow(
      /already invalid/,
    );
  });
});
