import type { FoundationEffect } from '../../../contracts/domains';
import type { LordId, SecretId } from '../../../contracts/ids';
import type { AuthoredEffect, SecretContentView } from '../knowledge/authored';
import type { SeededOpening } from '../openings/openings';

type AuthoredSecretEffect = AuthoredEffect;
export type SecretEvidenceState = 'credible' | 'destroyed' | 'exposed' | 'latent';

export interface SecretFact {
  readonly blackmailUse: { readonly by: LordId; readonly against: LordId } | null;
  readonly discoverable: boolean;
  readonly discoveredBy: readonly LordId[];
  readonly evidence: SecretEvidenceState;
  readonly exposedAtHours: number | null;
  readonly id: SecretId;
  readonly sourceId: LordId | 'opening' | 'player-action';
  readonly targetId: LordId;
}

export function initializeOpeningSecrets(
  opening: SeededOpening,
  content: SecretContentView,
): readonly SecretFact[] {
  const ids = [opening.renardSecretId, ...opening.additionalSecretIds];
  return ids.map((id) => {
    const definition = content.secrets.find((entry) => entry.id === id);
    if (definition === undefined) throw new Error(`Missing secret definition ${id}`);
    return {
      blackmailUse: null,
      discoverable: true,
      discoveredBy: [],
      evidence: 'latent',
      exposedAtHours: null,
      id,
      sourceId: 'opening',
      targetId: definition.targetLordId,
    };
  });
}

export function discoverSecret(
  secrets: readonly SecretFact[],
  secretId: SecretId,
  observerId: LordId,
): readonly SecretFact[] {
  return secrets.map((secret) => {
    if (secret.id !== secretId || !secret.discoverable || secret.exposedAtHours !== null)
      return secret;
    return {
      ...secret,
      discoveredBy: [...new Set([...secret.discoveredBy, observerId])].sort() as LordId[],
      evidence: 'credible' as const,
    };
  });
}

export function firstDiscoverableSecret(
  secrets: readonly SecretFact[],
  targetId: LordId,
  observerId: LordId,
): SecretFact | null {
  return (
    secrets.find(
      (secret) =>
        secret.targetId === targetId &&
        secret.discoverable &&
        secret.exposedAtHours === null &&
        !secret.discoveredBy.includes(observerId),
    ) ?? null
  );
}

export function useSecretForBlackmail(
  secrets: readonly SecretFact[],
  input: { readonly actorId: LordId; readonly secretId: SecretId; readonly targetId: LordId },
): readonly SecretFact[] {
  return secrets.map((secret) => {
    if (secret.id !== input.secretId) return secret;
    if (!secret.discoveredBy.includes(input.actorId))
      throw new Error('Secret is not known to actor');
    if (
      secret.blackmailUse !== null ||
      secret.exposedAtHours !== null ||
      secret.evidence === 'destroyed'
    ) {
      throw new Error('Secret no longer provides unused private leverage');
    }
    if (secret.targetId !== input.targetId) throw new Error('Secret target mismatch');
    return { ...secret, blackmailUse: { against: input.targetId, by: input.actorId } };
  });
}

export interface ExposeSecretResult {
  readonly authoredEffects: readonly AuthoredSecretEffect[];
  readonly domainEffects: readonly FoundationEffect[];
  readonly secrets: readonly SecretFact[];
}

export function exposeSecret(
  secrets: readonly SecretFact[],
  input: {
    readonly actorId: LordId;
    readonly atHours: number;
    readonly content: SecretContentView;
    readonly secretId: SecretId;
  },
): ExposeSecretResult {
  const secret = secrets.find((entry) => entry.id === input.secretId);
  if (secret === undefined || !secret.discoveredBy.includes(input.actorId)) {
    throw new Error('Secret cannot be exposed by an uninformed actor');
  }
  if (secret.exposedAtHours !== null) throw new Error('Secret has already been exposed');
  if (!secret.discoverable || secret.evidence === 'destroyed') {
    throw new Error('Secret evidence is no longer valid for exposure');
  }
  const definition = input.content.secrets.find((entry) => entry.id === secret.id);
  if (definition === undefined) throw new Error(`Missing secret definition ${secret.id}`);
  const next = secrets.map((entry) =>
    entry.id === secret.id
      ? {
          ...entry,
          discoverable: false,
          evidence: 'exposed' as const,
          exposedAtHours: input.atHours,
        }
      : entry,
  );
  const domainEffects: FoundationEffect[] = [
    {
      domain: 'knowledge',
      kind: 'knowledge.secret-exposed',
      payload: { actorId: input.actorId, secretId: secret.id, targetId: secret.targetId },
      type: 'effect',
    },
  ];
  if (secret.blackmailUse !== null) {
    domainEffects.push({
      domain: 'politics',
      kind: 'politics.release-secret-coercion',
      payload: {
        coercedBy: secret.blackmailUse.by,
        secretId: secret.id,
        targetId: secret.blackmailUse.against,
      },
      type: 'effect',
    });
  }
  return { authoredEffects: definition.effects, domainEffects, secrets: next };
}

export function destroySecretEvidence(
  secrets: readonly SecretFact[],
  secretId: SecretId,
): { readonly effects: readonly FoundationEffect[]; readonly secrets: readonly SecretFact[] } {
  const secret = secrets.find((entry) => entry.id === secretId);
  if (secret === undefined) throw new Error(`Unknown secret ${secretId}`);
  if (!secret.discoverable || secret.evidence === 'destroyed' || secret.exposedAtHours !== null) {
    throw new Error('Secret evidence is already invalid');
  }
  const effects: FoundationEffect[] = secret.blackmailUse
    ? [
        {
          domain: 'politics',
          kind: 'politics.release-secret-coercion',
          payload: {
            coercedBy: secret.blackmailUse.by,
            reason: 'evidence-destroyed',
            secretId,
            targetId: secret.blackmailUse.against,
          },
          type: 'effect',
        },
      ]
    : [];
  return {
    effects,
    secrets: secrets.map((entry) =>
      entry.id === secretId
        ? { ...entry, blackmailUse: null, discoverable: false, evidence: 'destroyed' as const }
        : entry,
    ),
  };
}
