import type { FoundationEffect } from '../../../contracts/domains';
import type { LordId, PhaseId, SecretId } from '../../../contracts/ids';
import { RandomSession } from '../../random/random';
import type { KnowledgeObservation } from '../knowledge/types';
import { discoverSecret, firstDiscoverableSecret, type SecretFact } from '../secrets/secrets';

export interface SpyActorResources {
  readonly gold: number;
  readonly influence: number;
}

export interface SpyChargeResult {
  readonly resources: SpyActorResources;
  readonly spent: { readonly gold: number; readonly influence: number };
}

export interface WatchCourtPlan {
  readonly actorId: LordId;
  readonly cost: { readonly gold: number; readonly influence: 8 };
  readonly dueAtHours: number;
  readonly mode: 'watch-court';
  readonly startedAtHours: number;
  readonly targetId: LordId;
}

export type FindDirtTier = 'none' | 'partial' | 'secret';

export interface FindDirtStoredDraws {
  readonly defense: number;
  readonly detected: boolean;
  readonly detectionRoll: number;
  readonly spyPower: number;
  readonly spyVariance: number;
  readonly tier: FindDirtTier;
}

export interface FindDirtPlan {
  readonly actorId: LordId;
  readonly cost: { readonly gold: 30; readonly influence: 12 };
  readonly detected: boolean;
  readonly dueAtHours: number;
  readonly mode: 'find-dirt';
  readonly randomStateAfter: string;
  readonly startedAtHours: number;
  readonly storedDraws: FindDirtStoredDraws;
  readonly targetId: LordId;
  readonly tier: FindDirtTier;
  readonly wasReloaded: boolean;
}

function charge(resources: SpyActorResources, gold: number, influence: number): SpyChargeResult {
  if (resources.gold < gold || resources.influence < influence) {
    throw new Error('Spy action is unaffordable');
  }
  return {
    resources: { gold: resources.gold - gold, influence: resources.influence - influence },
    spent: { gold, influence },
  };
}

export function startWatchCourt(input: {
  readonly actorId: LordId;
  readonly adjacentFenRoadsDiscount?: boolean;
  readonly atHours: number;
  readonly phase: PhaseId;
  readonly resources: SpyActorResources;
  readonly targetId: LordId;
}): { readonly charge: SpyChargeResult; readonly plan: WatchCourtPlan } {
  if (input.actorId === input.targetId) throw new Error('Cannot spy on own court');
  const gold = input.adjacentFenRoadsDiscount ? 15 : 20;
  return {
    charge: charge(input.resources, gold, 8),
    plan: {
      actorId: input.actorId,
      cost: { gold, influence: 8 },
      dueAtHours: input.atHours + 72,
      mode: 'watch-court',
      startedAtHours: input.atHours,
      targetId: input.targetId,
    },
  };
}

function findDirtTier(spyPower: number, defense: number): FindDirtTier {
  if (spyPower >= defense) return 'secret';
  if (spyPower >= defense - 10) return 'partial';
  return 'none';
}

function detectionChance(tier: FindDirtTier, spyPower: number, defense: number): number {
  if (tier === 'none') return 100;
  if (tier === 'partial') return 50;
  return spyPower >= defense + 10 ? 0 : 25;
}

export function startFindDirt(input: {
  readonly actorId: LordId;
  readonly atHours: number;
  readonly modifiers?: { readonly defense?: number; readonly spy?: number };
  readonly phase: PhaseId;
  readonly randomState: string;
  readonly repeatedAttemptsWithinTenDays: number;
  readonly resources: SpyActorResources;
  readonly storedDraws?: FindDirtStoredDraws;
  readonly targetId: LordId;
  readonly targetInfluence: number;
}): { readonly charge: SpyChargeResult; readonly plan: FindDirtPlan } {
  if (input.phase === 'deathbed') throw new Error('Find Dirt cannot start during Deathbed');
  if (input.actorId === input.targetId) throw new Error('Cannot spy on own court');
  const actorInfluence = input.resources.influence;
  let randomStateAfter = input.randomState;
  let draws: FindDirtStoredDraws;
  if (input.storedDraws !== undefined) {
    draws = input.storedDraws;
  } else {
    const random = new RandomSession(input.randomState);
    const spyVariance = random.integer('spy.find-dirt.variance', -15, 15);
    const spyPower =
      50 + Math.floor(actorInfluence / 5) + (input.modifiers?.spy ?? 0) + spyVariance;
    const defense = 50 + Math.floor(input.targetInfluence / 5) + (input.modifiers?.defense ?? 0);
    const tier = findDirtTier(spyPower, defense);
    const chance = Math.min(
      100,
      detectionChance(tier, spyPower, defense) + input.repeatedAttemptsWithinTenDays * 20,
    );
    const detectionRoll = random.integer('spy.find-dirt.detection', 1, 100);
    draws = {
      defense,
      detected: detectionRoll <= chance,
      detectionRoll,
      spyPower,
      spyVariance,
      tier,
    };
    randomStateAfter = random.exportState();
  }
  return {
    charge: charge(input.resources, 30, 12),
    plan: {
      actorId: input.actorId,
      cost: { gold: 30, influence: 12 },
      detected: draws.detected,
      dueAtHours: input.atHours + 120,
      mode: 'find-dirt',
      randomStateAfter,
      startedAtHours: input.atHours,
      storedDraws: draws,
      targetId: input.targetId,
      tier: draws.tier,
      wasReloaded: input.storedDraws !== undefined,
    },
  };
}

export function resolveWatchCourt(input: {
  readonly currentArmy: number;
  readonly currentIntentId: string | null;
  readonly currentLeaningId: LordId | null;
  readonly plan: WatchCourtPlan;
  readonly sequenceId: number;
}): readonly KnowledgeObservation[] {
  const common = {
    confidence: 'confirmed' as const,
    invalidatedAtHours: null,
    observedAtHours: input.plan.dueAtHours,
    observerId: input.plan.actorId,
    sequenceId: input.sequenceId,
    source: 'spy-watch-court' as const,
    staleAfterHours: 168,
    subjectId: input.plan.targetId,
  };
  return [
    { ...common, field: 'intent', value: input.currentIntentId },
    { ...common, field: 'leaning', value: input.currentLeaningId },
    { ...common, field: 'army', value: input.currentArmy },
  ];
}

export interface ResolveFindDirtResult {
  readonly discoveredSecretId: SecretId | null;
  readonly effects: readonly FoundationEffect[];
  readonly observations: readonly KnowledgeObservation[];
  readonly secrets: readonly SecretFact[];
}

export function resolveFindDirt(input: {
  readonly lesserIntelligence:
    | {
        readonly field: 'army';
        readonly value: 'broken' | 'formidable' | 'modest' | 'strong';
      }
    | { readonly field: 'intent' | 'leaning'; readonly value: string | null };
  readonly plan: FindDirtPlan;
  readonly secrets: readonly SecretFact[];
  readonly sequenceId: number;
}): ResolveFindDirtResult {
  if (
    input.lesserIntelligence.field === 'army' &&
    !['broken', 'modest', 'strong', 'formidable'].includes(input.lesserIntelligence.value)
  ) {
    throw new Error('Partial Find Dirt can reveal only an army band');
  }
  const available = firstDiscoverableSecret(input.secrets, input.plan.targetId, input.plan.actorId);
  const discovered = input.plan.tier === 'secret' ? available : null;
  const secrets =
    discovered === null
      ? input.secrets
      : discoverSecret(input.secrets, discovered.id, input.plan.actorId);
  const observations: KnowledgeObservation[] = [];
  if (discovered !== null) {
    observations.push({
      confidence: 'confirmed',
      field: 'secret',
      invalidatedAtHours: null,
      observedAtHours: input.plan.dueAtHours,
      observerId: input.plan.actorId,
      sequenceId: input.sequenceId,
      source: 'spy-find-dirt',
      staleAfterHours: null,
      subjectId: input.plan.targetId,
      value: discovered.id,
    });
  } else if (
    input.plan.tier === 'partial' ||
    (input.plan.tier === 'secret' && available === null)
  ) {
    observations.push({
      confidence: 'credible',
      field: input.lesserIntelligence.field,
      invalidatedAtHours: null,
      observedAtHours: input.plan.dueAtHours,
      observerId: input.plan.actorId,
      sequenceId: input.sequenceId,
      source: 'spy-find-dirt',
      staleAfterHours: 168,
      subjectId: input.plan.targetId,
      value: input.lesserIntelligence.value,
    });
  }
  const effects: FoundationEffect[] = input.plan.detected
    ? [
        {
          domain: 'politics',
          kind: 'politics.adjust-relationship',
          payload: {
            actorId: input.plan.actorId,
            amount: -5,
            reason: 'detected-spying',
            targetId: input.plan.targetId,
          },
          type: 'effect',
        },
        {
          domain: 'knowledge',
          kind: 'knowledge.spy-alert',
          payload: { spyId: input.plan.actorId, targetId: input.plan.targetId },
          type: 'effect',
        },
      ]
    : [];
  return { discoveredSecretId: discovered?.id ?? null, effects, observations, secrets };
}
