import type { LordId, OpeningId, SecretId } from '../../../contracts/ids';
import { createRandomState, RandomSession } from '../../random/random';
import type { AuthoredEffect, OpeningContentView } from '../knowledge/authored';

type OpeningEffect = AuthoredEffect;

export interface SeededOpening {
  readonly additionalSecretIds: readonly [SecretId, SecretId];
  readonly effects: readonly OpeningEffect[];
  readonly id: OpeningId;
  readonly randomStateAfter: string;
  readonly renardSecretId: SecretId;
  readonly seed: string;
  readonly storedDraws: Readonly<{
    additionalSecretIds: readonly [SecretId, SecretId];
    openingId: OpeningId;
    renardSecretId: SecretId;
  }>;
}

export interface OpeningViability {
  readonly issues: readonly string[];
  readonly ok: boolean;
  readonly routeCount: number;
}

export function validateOpeningViability(
  opening: SeededOpening,
  content: OpeningContentView,
): OpeningViability {
  const definition = content.openings.find((entry) => entry.id === opening.id);
  const issues: string[] = [];
  if (definition === undefined) issues.push(`Unknown opening ${opening.id}`);
  if (!opening.renardSecretId.startsWith('renard-')) {
    issues.push('Opening lacks a legal Renard vulnerability');
  }
  if (new Set(opening.additionalSecretIds).size !== 2) {
    issues.push('Opening additional secrets must be distinct');
  }
  if (opening.additionalSecretIds.some((id) => id.startsWith('renard-'))) {
    issues.push('Additional secret pool may not replace the guaranteed Renard vulnerability');
  }
  const routeCount = definition?.compatibilityRouteIds.length ?? 0;
  if (routeCount < 3) issues.push('Opening supports fewer than three canonical routes');
  const forbiddenPlayerWinEffect = opening.effects.some(
    (effect) =>
      effect.effectId === 'declare-candidate' ||
      (effect.target === 'player' &&
        ['set-support-shock', 'set-bargain-progress'].includes(effect.effectId) &&
        (effect.value ?? 0) > 1),
  );
  if (forbiddenPlayerWinEffect)
    issues.push('Opening grants a pre-resolved player victory position');
  return { issues, ok: issues.length === 0, routeCount };
}

export function createSeededOpening(seed: string, content: OpeningContentView): SeededOpening {
  const random = new RandomSession(createRandomState(seed));
  const openingIndex =
    (random.integer('opening.package-draw-a', 0, 0xffff_ffff) +
      random.integer('opening.package-draw-b', 0, 0xffff_ffff)) %
    content.openings.length;
  const definition = content.openings[openingIndex];
  if (definition === undefined) throw new Error('No canonical opening packages are available');
  const renardIndex =
    (random.integer('opening.renard-secret-draw-a', 0, 0xffff_ffff) +
      random.integer('opening.renard-secret-draw-b', 0, 0xffff_ffff)) %
    definition.guaranteedSecretPool.length;
  const renardSecretId = definition.guaranteedSecretPool[renardIndex];
  if (renardSecretId === undefined) throw new Error('Opening lacks a Renard secret pool');
  const additional = random.shuffle('opening.additional-secrets', definition.additionalSecretPool);
  const additionalSecretIds = [additional[0], additional[1]] as [SecretId, SecretId];
  const opening: SeededOpening = {
    additionalSecretIds,
    effects: definition.effects,
    id: definition.id,
    randomStateAfter: random.exportState(),
    renardSecretId,
    seed,
    storedDraws: {
      additionalSecretIds,
      openingId: definition.id,
      renardSecretId,
    },
  };
  const viability = validateOpeningViability(opening, content);
  if (!viability.ok) throw new Error(`Invalid opening: ${viability.issues.join(' | ')}`);
  return opening;
}

export function openingAdjustmentsByLord(
  opening: SeededOpening,
): ReadonlyMap<LordId, OpeningEffect[]> {
  const byLord = new Map<LordId, OpeningEffect[]>();
  for (const effect of opening.effects) {
    if (!['greyfen', 'edric', 'ysabel', 'renard', 'oswin', 'mara'].includes(effect.target))
      continue;
    const target = effect.target as LordId;
    byLord.set(target, [...(byLord.get(target) ?? []), effect]);
  }
  return byLord;
}
