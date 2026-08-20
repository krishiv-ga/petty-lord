import type { ActionId, LordId, PhaseId } from '../../../contracts/ids';
import type { PlayerKnowledgeProjection } from '../../projections/knowledge/projection';
import { RandomSession } from '../../random/random';

export type AiIntentCategory =
  | 'church'
  | 'containment'
  | 'defense'
  | 'economy'
  | 'expose'
  | 'legitimacy'
  | 'politics'
  | 'spy'
  | 'war';

export type AiReasonId =
  | 'defend-own-seat'
  | 'fulfill-known-agreement'
  | 'known-legitimacy-pressure'
  | 'known-opportunity'
  | 'known-secret'
  | 'known-threat'
  | 'phase-priority'
  | 'resource-recovery';

export interface AiResources {
  readonly availableTroops: number;
  readonly gold: number;
  readonly influence: number;
  readonly lockedTroops: number;
}

export interface AiIntentCandidate {
  readonly actionId: ActionId;
  readonly basePriority: number;
  readonly category: AiIntentCategory;
  readonly cost: { readonly gold: number; readonly influence: number; readonly troops: number };
  readonly durationHours: number;
  readonly id: string;
  readonly invalidationFallback: 'cancel-and-wait' | 'safe-fallback';
  readonly knowledgeRequirements?: readonly AiKnowledgeRequirement[];
  readonly reasons: readonly AiReasonId[];
  readonly targetId: LordId | string | null;
  readonly visibility: 'hidden' | 'public' | 'suspected';
}

export type AiKnowledgeRequirement =
  | { readonly kind: 'known-intent'; readonly subjectId: LordId }
  | { readonly kind: 'known-leaning'; readonly subjectId: LordId }
  | { readonly kind: 'known-secret'; readonly secretId: string }
  | {
      readonly band: 'concern' | 'existential' | 'serious';
      readonly kind: 'minimum-threat';
      readonly subjectId: LordId;
    };

export interface ActiveAiIntent {
  readonly actionId: ActionId;
  readonly cost: AiIntentCandidate['cost'];
  readonly dueAtHours: number;
  readonly explanation: readonly AiReasonId[];
  readonly id: string;
  readonly score: number;
  readonly sequenceId: number;
  readonly startedAtHours: number;
  readonly storedDraws: Readonly<Record<string, number>>;
  readonly targetId: AiIntentCandidate['targetId'];
  readonly visibility: AiIntentCandidate['visibility'];
  readonly invalidationFallback: AiIntentCandidate['invalidationFallback'];
}

export interface AiActorState {
  readonly activeIntent: ActiveAiIntent | null;
  readonly id: Exclude<LordId, 'greyfen'>;
  readonly nextDecisionAtHours: number;
  readonly resources: AiResources;
}

export interface AiDecisionResult {
  readonly actor: AiActorState;
  readonly candidateScores: readonly { readonly id: string; readonly score: number }[];
  readonly randomStateAfter: string;
  readonly selected: ActiveAiIntent | null;
}

const PERSONALITY: Readonly<
  Record<Exclude<LordId, 'greyfen'>, Partial<Record<AiIntentCategory, number>>>
> = {
  edric: { defense: 20, war: 18, politics: 8, legitimacy: -5, economy: -4 },
  ysabel: { defense: 20, economy: 20, politics: 18, containment: 8, war: -12 },
  renard: { defense: 20, legitimacy: 20, church: 18, politics: 16, containment: 15 },
  oswin: { defense: 20, church: 20, legitimacy: 18, expose: 12, war: -16 },
  mara: { defense: 20, containment: 18, politics: 12, war: 6, church: -8 },
};

const SUCCESSION_CATEGORIES = new Set<AiIntentCategory>([
  'church',
  'containment',
  'expose',
  'legitimacy',
  'politics',
  'war',
]);

function phaseModifier(phase: PhaseId, category: AiIntentCategory): number {
  if (phase === 'stable') return SUCCESSION_CATEGORIES.has(category) ? 0 : 5;
  if (phase === 'ailing') return SUCCESSION_CATEGORIES.has(category) ? 6 : 0;
  if (phase === 'gravely-ill') return SUCCESSION_CATEGORIES.has(category) ? 12 : -5;
  if (category === 'economy' || category === 'spy') return -15;
  return SUCCESSION_CATEGORIES.has(category) ? 20 : 0;
}

function threatModifier(
  category: AiIntentCategory,
  band: 'concern' | 'existential' | 'low' | 'serious',
): number {
  if (band === 'low') return 0;
  if (category !== 'defense' && category !== 'containment' && category !== 'war') return 0;
  return band === 'concern' ? 4 : band === 'serious' ? 10 : 18;
}

const THREAT_RANK = { low: 0, concern: 1, serious: 2, existential: 3 } as const;

function satisfiesKnowledge(
  projection: PlayerKnowledgeProjection,
  requirement: AiKnowledgeRequirement,
): boolean {
  if (requirement.kind === 'known-secret') {
    return projection.knownSecrets.includes(requirement.secretId as never);
  }
  const subject = projection.lords[requirement.subjectId];
  if (requirement.kind === 'known-intent') return subject.intent.kind !== 'unknown';
  if (requirement.kind === 'known-leaning') return subject.leaning.kind !== 'unknown';
  return THREAT_RANK[subject.threatBand] >= THREAT_RANK[requirement.band];
}

function observedThreatBand(
  projection: PlayerKnowledgeProjection,
  targetId: AiIntentCandidate['targetId'],
): 'concern' | 'existential' | 'low' | 'serious' {
  return targetId !== null && typeof targetId === 'string' && targetId in projection.lords
    ? projection.lords[targetId as LordId].threatBand
    : 'low';
}

function canAfford(resources: AiResources, candidate: AiIntentCandidate): boolean {
  return (
    resources.gold >= candidate.cost.gold &&
    resources.influence >= candidate.cost.influence &&
    resources.availableTroops - resources.lockedTroops >= candidate.cost.troops
  );
}

function payAndLock(resources: AiResources, candidate: AiIntentCandidate): AiResources {
  return {
    availableTroops: resources.availableTroops,
    gold: resources.gold - candidate.cost.gold,
    influence: resources.influence - candidate.cost.influence,
    lockedTroops: resources.lockedTroops + candidate.cost.troops,
  };
}

export function chooseAndStartIntent(input: {
  readonly actor: AiActorState;
  readonly atHours: number;
  readonly candidates: readonly AiIntentCandidate[];
  readonly knowledge: PlayerKnowledgeProjection;
  readonly phase: PhaseId;
  readonly randomState: string;
  readonly sequenceId: number;
  readonly storedNearTieDraws?: Readonly<Record<string, number>>;
}): AiDecisionResult {
  if (input.knowledge.observerId !== input.actor.id) {
    throw new Error('AI decision knowledge must belong to the acting lord');
  }
  if (input.actor.activeIntent !== null || input.atHours < input.actor.nextDecisionAtHours) {
    return {
      actor: input.actor,
      candidateScores: [],
      randomStateAfter: input.randomState,
      selected: null,
    };
  }
  const legal = input.candidates
    .filter(
      (candidate) =>
        (candidate.knowledgeRequirements ?? []).every((requirement) =>
          satisfiesKnowledge(input.knowledge, requirement),
        ) && canAfford(input.actor.resources, candidate),
    )
    .map((candidate) => ({
      candidate,
      score:
        candidate.basePriority +
        (PERSONALITY[input.actor.id][candidate.category] ?? 0) +
        phaseModifier(input.phase, candidate.category) +
        threatModifier(candidate.category, observedThreatBand(input.knowledge, candidate.targetId)),
    }))
    .sort(
      (left, right) =>
        right.score - left.score || left.candidate.id.localeCompare(right.candidate.id),
    );
  if (legal.length === 0) {
    return {
      actor: input.actor,
      candidateScores: [],
      randomStateAfter: input.randomState,
      selected: null,
    };
  }
  const topScore = legal[0]?.score ?? 0;
  const nearTies = legal.filter((entry) => topScore - entry.score <= 5);
  const random = new RandomSession(input.randomState);
  const storedDraws: Record<string, number> = { ...(input.storedNearTieDraws ?? {}) };
  const scored = legal.map((entry) => {
    if (!nearTies.includes(entry)) return entry;
    const existing = storedDraws[entry.candidate.id];
    const noise =
      existing ?? random.integer(`ai.near-tie.${input.actor.id}.${entry.candidate.id}`, -5, 5);
    storedDraws[entry.candidate.id] = noise;
    return { ...entry, score: entry.score * (1 + noise / 100) };
  });
  scored.sort(
    (left, right) =>
      right.score - left.score || left.candidate.id.localeCompare(right.candidate.id),
  );
  const winner = scored[0];
  if (winner === undefined) throw new Error('AI selection lost all candidates');
  const selected: ActiveAiIntent = {
    actionId: winner.candidate.actionId,
    cost: winner.candidate.cost,
    dueAtHours: input.atHours + winner.candidate.durationHours,
    explanation: winner.candidate.reasons.slice(0, 3),
    id: winner.candidate.id,
    score: winner.score,
    sequenceId: input.sequenceId,
    startedAtHours: input.atHours,
    storedDraws,
    targetId: winner.candidate.targetId,
    visibility: winner.candidate.visibility,
    invalidationFallback: winner.candidate.invalidationFallback,
  };
  const actor: AiActorState = {
    ...input.actor,
    activeIntent: selected,
    resources: payAndLock(input.actor.resources, winner.candidate),
  };
  return {
    actor,
    candidateScores: scored.map((entry) => ({ id: entry.candidate.id, score: entry.score })),
    randomStateAfter:
      input.storedNearTieDraws === undefined ? random.exportState() : input.randomState,
    selected,
  };
}

export function completeOrInvalidateIntent(input: {
  readonly actor: AiActorState;
  readonly atHours: number;
  readonly resolution: 'cancelled' | 'completed' | 'invalidated';
  readonly troopLosses?: number;
}): AiActorState {
  const intent = input.actor.activeIntent;
  if (intent === null) return input.actor;
  const troopLosses = input.troopLosses ?? 0;
  if (
    !Number.isSafeInteger(troopLosses) ||
    troopLosses < 0 ||
    troopLosses > intent.cost.troops ||
    troopLosses > input.actor.resources.availableTroops
  ) {
    throw new Error('Intent troop losses must be a nonnegative committed troop count');
  }
  return {
    ...input.actor,
    activeIntent: null,
    nextDecisionAtHours:
      input.resolution === 'invalidated'
        ? Math.max(input.actor.nextDecisionAtHours, (Math.floor(input.atHours / 24) + 1) * 24)
        : input.atHours,
    resources: {
      ...input.actor.resources,
      availableTroops:
        input.resolution === 'completed'
          ? input.actor.resources.availableTroops - troopLosses
          : input.actor.resources.availableTroops,
      lockedTroops: Math.max(0, input.actor.resources.lockedTroops - intent.cost.troops),
    },
  };
}

export interface AiReaction {
  readonly actorId: Exclude<LordId, 'greyfen'>;
  readonly kind: 'bargain-response' | 'defense' | 'mandatory-decision' | 'ultimatum';
  readonly sourceId: string;
}

export function recordReaction(
  actor: AiActorState,
  reaction: AiReaction,
): {
  readonly activeIntentPreserved: ActiveAiIntent | null;
  readonly reaction: AiReaction;
} {
  if (reaction.actorId !== actor.id) throw new Error('Reaction actor mismatch');
  return { activeIntentPreserved: actor.activeIntent, reaction };
}
