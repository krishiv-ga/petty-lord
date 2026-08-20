import type { LordId } from '../../../contracts/ids';

export type CandidateId = Extract<LordId, 'edric' | 'greyfen' | 'renard'>;

export type SuccessionFact = Readonly<Record<string, boolean | number | string | null>>;

export interface SuppliedSuccessionReason {
  readonly code: string;
  readonly facts?: SuccessionFact;
  readonly source:
    | 'candidate-validation'
    | 'evaluation'
    | 'manual-choice'
    | 'military-acclamation'
    | 'support-validation';
  readonly summary: string;
}

export type ConstitutionReasonCode =
  | 'binding-commitment'
  | 'binding-pledge'
  | 'binding-support-invalid'
  | 'binding-support-released'
  | 'candidate-eligible'
  | 'candidate-ineligible'
  | 'candidate-self-vote'
  | 'council-majority'
  | 'elimination-tiebreak-claim'
  | 'elimination-tiebreak-commitments'
  | 'elimination-tiebreak-declaration-time'
  | 'elimination-tiebreak-prestige'
  | 'final-tiebreak-capital-control'
  | 'final-tiebreak-church-endorsement'
  | 'final-tiebreak-claim'
  | 'final-tiebreak-commitments'
  | 'final-tiebreak-declaration-time'
  | 'final-tiebreak-prestige'
  | 'greyfen-manual-choice'
  | 'greyfen-vote-required'
  | 'military-acclamation-not-qualified'
  | 'military-acclamation-qualified'
  | 'runoff-elimination'
  | 'sole-candidate-six-zero'
  | 'unbound-evaluation';

export interface ConstitutionReason {
  readonly candidateId?: CandidateId;
  readonly code: ConstitutionReasonCode;
  readonly facts?: SuccessionFact;
  readonly kind: 'constitution';
  readonly summary: string;
  readonly voterId?: LordId;
}

export interface SuppliedReasonRecord extends SuppliedSuccessionReason {
  readonly kind: 'supplied';
}

export type SuccessionReason = ConstitutionReason | SuppliedReasonRecord;

export interface DeclarationPrecedence {
  /** Lower times are earlier. */
  readonly timeHours: number;
  /** Scheduler sequenceId makes declarations at the same time totally ordered. */
  readonly sequenceId: number;
}

export interface SuccessionCandidateInput {
  readonly claim: number;
  readonly declaration: DeclarationPrecedence;
  readonly dispossessed: boolean;
  readonly eligibilityReasons: readonly SuppliedSuccessionReason[];
  readonly eligible: boolean;
  readonly id: CandidateId;
  readonly prestige: number;
}

export interface CouncilVoterInput {
  readonly dispossessed: boolean;
  readonly id: LordId;
}

export interface BindingSupportInput {
  readonly basis: string;
  readonly candidateId: CandidateId;
  readonly level: 'committed' | 'pledged';
  readonly sourceId: string;
  readonly valid: boolean;
  readonly validationReasons: readonly SuppliedSuccessionReason[];
  readonly voterId: LordId;
}

export type MilitaryAcclamationInput =
  | {
      readonly candidateId: CandidateId;
      readonly qualified: true;
      readonly reasons: readonly SuppliedSuccessionReason[];
    }
  | {
      readonly candidateId: null;
      readonly qualified: false;
      readonly reasons: readonly SuppliedSuccessionReason[];
    };

export interface ReleasedSupportContext {
  readonly candidateId: CandidateId;
  readonly cause: 'candidate-eliminated' | 'candidate-ineligible' | 'support-invalid';
  readonly level: 'committed' | 'pledged';
  readonly sourceId: string;
}

export interface UnboundVoteContext {
  readonly ballotNumber: number;
  readonly candidateIds: readonly CandidateId[];
  readonly releasedSupport?: ReleasedSupportContext;
  readonly voter: CouncilVoterInput;
}

export interface EvaluatedVote {
  readonly candidateId: CandidateId;
  readonly reasons: readonly SuppliedSuccessionReason[];
}

/** This hook must be pure and must evaluate only the supplied remaining candidates. */
export type UnboundVoteEvaluator = (context: UnboundVoteContext) => EvaluatedVote;

export interface GreyfenManualVoteInput {
  readonly candidateId: CandidateId;
  readonly reasons?: readonly SuppliedSuccessionReason[];
}

export interface SuccessionConstitutionInput {
  readonly bindings: readonly BindingSupportInput[];
  readonly candidates: readonly SuccessionCandidateInput[];
  readonly capitalControllerId: CandidateId | null;
  readonly churchEndorsedCandidateId: CandidateId | null;
  readonly evaluateUnboundVote: UnboundVoteEvaluator;
  readonly greyfenVote?: GreyfenManualVoteInput;
  readonly militaryAcclamation: MilitaryAcclamationInput;
  readonly voters: readonly CouncilVoterInput[];
}

export type VoteSource = 'binding' | 'evaluation' | 'manual' | 'self' | 'sole-candidate';

export interface CouncilVoteRecord {
  readonly candidateId: CandidateId;
  readonly reasons: readonly SuccessionReason[];
  readonly releasedSupport?: ReleasedSupportContext;
  readonly source: VoteSource;
  readonly voterDispossessed: boolean;
  readonly voterId: LordId;
}

export interface CandidateTally {
  readonly candidateId: CandidateId;
  readonly votes: number;
}

export type EliminationTieCriterion = 'claim' | 'commitments' | 'declaration-time' | 'prestige';
export type FinalTieCriterion =
  | 'capital-control'
  | 'church-endorsement'
  | 'claim'
  | 'commitments'
  | 'declaration-time'
  | 'prestige';

export interface TieBreakValue {
  readonly candidateId: CandidateId;
  readonly value: boolean | number | string;
}

export interface TieBreakStep {
  readonly criterion: EliminationTieCriterion | FinalTieCriterion;
  readonly decisiveCandidateId?: CandidateId;
  readonly decisive: boolean;
  readonly values: readonly TieBreakValue[];
}

export interface CouncilBallotReconstruction {
  readonly ballotNumber: number;
  readonly candidateIds: readonly CandidateId[];
  readonly eliminatedCandidateId?: CandidateId;
  readonly majorityWinnerId?: CandidateId;
  readonly reasons: readonly SuccessionReason[];
  readonly tallies: readonly CandidateTally[];
  readonly tieBreak: readonly TieBreakStep[];
  readonly votes: readonly CouncilVoteRecord[];
}

export interface CandidateValidationReconstruction {
  readonly candidateId: CandidateId;
  readonly eligible: boolean;
  readonly reasons: readonly SuccessionReason[];
}

export type DecisiveRule =
  | 'council-majority'
  | 'final-tiebreak-capital-control'
  | 'final-tiebreak-church-endorsement'
  | 'final-tiebreak-claim'
  | 'final-tiebreak-commitments'
  | 'final-tiebreak-declaration-time'
  | 'final-tiebreak-prestige'
  | 'military-acclamation'
  | 'sole-candidate-six-zero';

export interface SuccessionReconstruction {
  readonly acclamation: {
    readonly candidateId: CandidateId | null;
    readonly qualified: boolean;
    readonly reasons: readonly SuccessionReason[];
  };
  readonly ballots: readonly CouncilBallotReconstruction[];
  readonly candidateValidations: readonly CandidateValidationReconstruction[];
  readonly candidates: readonly SuccessionCandidateInput[];
  readonly decisiveRule: DecisiveRule | null;
  readonly legalCandidateIds: readonly CandidateId[];
  readonly winnerId: CandidateId | null;
}

export interface GreyfenVoteDecision {
  readonly ballotNumber: number;
  readonly candidateIds: readonly CandidateId[];
  readonly playerCannotWin: true;
  readonly reasons: readonly SuccessionReason[];
}

export type SuccessionResolution =
  | {
      readonly decision: GreyfenVoteDecision;
      readonly playerOutcome: 'lost';
      readonly reconstruction: SuccessionReconstruction;
      readonly status: 'awaiting-greyfen-vote';
    }
  | {
      readonly playerOutcome: 'lost' | 'won';
      readonly reconstruction: SuccessionReconstruction;
      readonly route: 'council' | 'military-acclamation';
      readonly status: 'resolved';
      readonly winnerId: CandidateId;
    };
