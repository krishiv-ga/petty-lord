import type { LordId } from '@contracts/ids';
import type { PoliticalActionRequest } from '../../systems/actions/politics';
import { intentForPoliticalAction } from '../../systems/actions/politics';
import type { CandidateEvaluation, EvaluationReason } from '../../systems/politics';
import type { RelationshipProjection } from '../../systems/relationships';
import type { SupportState } from '../../systems/support';

export type PoliticalSupportProjection = {
  readonly basis: 'known-coercion' | 'known-voluntary' | 'secretly-coerced' | 'self' | 'unknown';
  readonly candidateId: LordId | null;
  readonly level: 'committed' | 'leaning' | 'pledged' | 'self' | 'unaligned' | 'under-duress';
  readonly private: boolean;
  readonly voterId: LordId;
};

export type CandidateAssessmentProjection = {
  readonly candidateId: LordId;
  readonly excluded: boolean;
  readonly negativeReasons: readonly EvaluationReason[];
  readonly positiveReasons: readonly EvaluationReason[];
  readonly totalIsIntentionallyHidden: true;
  readonly voterId: LordId;
};

export function projectSupportForObserver(
  state: SupportState,
  observerId: LordId,
  observerKnowsPrivateSupport = false,
): PoliticalSupportProjection {
  const observerKnowsBasis = observerId === state.voterId || observerKnowsPrivateSupport;
  if (state.level === 'leaning' && !observerKnowsBasis) {
    return {
      basis: 'unknown',
      candidateId: null,
      level: 'unaligned',
      private: true,
      voterId: state.voterId,
    };
  }
  const visibleDuress = state.duress?.visibility === 'public';
  const level = visibleDuress ? 'under-duress' : state.level;
  const basis = state.duress
    ? visibleDuress
      ? 'known-coercion'
      : observerKnowsBasis
        ? 'secretly-coerced'
        : 'known-voluntary'
    : state.level === 'self'
      ? 'self'
      : state.level === 'unaligned'
        ? 'unknown'
        : 'known-voluntary';
  return {
    basis,
    candidateId: state.candidateId,
    level,
    private: state.visibility === 'private',
    voterId: state.voterId,
  };
}

export function projectCandidateAssessment(
  evaluation: CandidateEvaluation,
): CandidateAssessmentProjection {
  const positives = evaluation.orderedReasons.filter(({ value }) => value !== null && value > 0);
  const negatives = evaluation.orderedReasons.filter(
    ({ category, value }) => category === 'red-line' || (value !== null && value < 0),
  );
  return {
    candidateId: evaluation.candidateId,
    excluded: evaluation.excluded,
    negativeReasons: negatives.slice(0, 3),
    positiveReasons: positives.slice(0, 3),
    totalIsIntentionallyHidden: true,
    voterId: evaluation.voterId,
  };
}

export function explainRelationshipWithoutVoteShortcut(
  relationship: RelationshipProjection,
  support: PoliticalSupportProjection,
): {
  readonly explanation: string;
  readonly relationship: RelationshipProjection;
  readonly support: PoliticalSupportProjection;
} {
  const explanation =
    relationship.value >= 15 && support.candidateId !== relationship.toLordId
      ? 'Personal warmth does not bind a succession vote; legitimacy, desire, fear, proof and bargains remain separate.'
      : 'Relationship is one authored candidate-evaluation reason and never converts directly into Support.';
  return { explanation, relationship, support };
}

export function projectPoliticalActionSemantics(action: PoliticalActionRequest['action']): {
  readonly destructive: boolean;
  readonly hostile: boolean;
  readonly intent: ReturnType<typeof intentForPoliticalAction>;
  readonly literalColor: null;
} {
  const intent = intentForPoliticalAction(action);
  return {
    destructive: intent === 'destructive',
    hostile: intent === 'hostile',
    intent,
    literalColor: null,
  };
}
