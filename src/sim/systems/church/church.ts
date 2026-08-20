import type { ChurchStateId, LordId, PhaseId } from '../../../contracts/ids';
import {
  type ClaimState,
  claimBand,
  claimRating,
  hasOswinForgeryRedLine,
  markForgeryPenitent,
  normalizeClaimRating,
} from '../claim';

export type ChurchCondemnationCause =
  | 'abbeylands-attacked'
  | 'church-wealth-seized'
  | 'exposed-forgery'
  | 'sacrilegious-agreement';

export type ChurchConductFact =
  | 'broke-kings-peace'
  | 'defended-abbeylands'
  | 'denounced-central-rule-capital-penalty'
  | 'edric-border-massacre'
  | 'funeral-observance'
  | 'renard-questioned-paternity'
  | 'renard-testament-fraud'
  | 'stable-defiance'
  | 'usurper';

export type OswinChurchSupport = 'committed' | 'none' | 'pledged';

export interface ChurchKnownCoercion {
  readonly active: boolean;
  readonly id: string;
  readonly knownToChurch: boolean;
  readonly visibility: 'public' | 'secret';
}

export interface ChurchCandidateInput {
  readonly candidateId: LordId;
  readonly claimRating: number;
  readonly coercions: readonly ChurchKnownCoercion[];
  readonly condemnationCauses: readonly ChurchCondemnationCause[];
  readonly conductFacts: readonly ChurchConductFact[];
  readonly hasInstitutionalPatronage: boolean;
  readonly isRenardUndiscreditedFavorite: boolean;
  readonly oswinSimonyExposed: boolean;
  readonly oswinSupport: OswinChurchSupport;
  readonly stanceCeiling: 'none' | 'skeptical';
}

export type ChurchReasonCategory =
  | 'claim'
  | 'coercion'
  | 'condemnation'
  | 'conduct'
  | 'favorite'
  | 'oswin'
  | 'patronage'
  | 'penance';

export interface ChurchCaseReason {
  readonly category: ChurchReasonCategory;
  readonly code: string;
  readonly score: number;
}

export interface ChurchCandidateCase {
  readonly candidateId: LordId;
  readonly caseScore: number;
  readonly claimRating: number;
  readonly eligibleForEndorsement: boolean;
  readonly endorsementBlocks: readonly string[];
  readonly knownCoercedPledges: number;
  readonly reasons: readonly ChurchCaseReason[];
  readonly stance: ChurchStateId;
}

export type EndorsementChange = 'granted' | 'none' | 'transferred' | 'withheld' | 'withdrawn';

export interface ChurchEndorsementResult {
  readonly cases: readonly ChurchCandidateCase[];
  readonly change: EndorsementChange;
  readonly endorsedCandidateId: LordId | null;
  readonly previousEndorsementId: LordId | null;
  readonly reason:
    | 'before-ailing'
    | 'highest-case'
    | 'higher-claim'
    | 'no-eligible-candidate'
    | 'oswin-preference'
    | 'tie-withheld';
}

export interface ChurchPatronageState {
  readonly abbeyEndowmentApplied: boolean;
  readonly firstOswinBenefitGranted: boolean;
  readonly institutionalBenefitGranted: boolean;
  readonly lastPatronizeCompletionDay: number | null;
  readonly patronizeCompletions: number;
}

export type ChurchPatronageResult =
  | {
      readonly institutionalCaseDelta: 0 | 1;
      readonly ok: true;
      readonly oswinRelationshipDelta: 0 | 3 | 8;
      readonly state: ChurchPatronageState;
    }
  | {
      readonly ok: false;
      readonly reason: 'abbey-endowment-already-applied' | 'patronage-cooldown';
      readonly state: ChurchPatronageState;
    };

export type PenanceResult =
  | {
      readonly claim: ClaimState;
      readonly church: ChurchCandidateInput;
      readonly ok: true;
      readonly oswinFraudRedLineActive: false;
      readonly prestigeDelta: -5;
      readonly restored: {
        readonly claim: 0;
        readonly relationship: 0;
        readonly support: 0;
        readonly trust: 0;
      };
    }
  | {
      readonly ok: false;
      readonly reason: 'fraud-condemnation-not-active' | 'start-cost-not-paid';
    };

const CLAIM_CASE: Readonly<Record<ReturnType<typeof claimBand>, number>> = {
  dubious: 1,
  excellent: 4,
  none: 0,
  overwhelming: 5,
  plausible: 2,
  strong: 3,
};

const CONDUCT_SCORES: Readonly<Record<ChurchConductFact, number>> = {
  'broke-kings-peace': -1,
  'defended-abbeylands': 1,
  'denounced-central-rule-capital-penalty': -1,
  'edric-border-massacre': -2,
  'funeral-observance': 1,
  'renard-questioned-paternity': -1,
  'renard-testament-fraud': -1,
  'stable-defiance': -1,
  usurper: -2,
};

const STANCE_ORDER: Readonly<Record<ChurchStateId, number>> = {
  condemned: 0,
  skeptical: 1,
  neutral: 2,
  favorable: 3,
  endorsed: 4,
};

function assertElapsedDay(day: number): void {
  if (!Number.isFinite(day) || day < 0)
    throw new RangeError('elapsed day must be a finite non-negative number');
}

function unique<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function knownCoercionCount(coercions: readonly ChurchKnownCoercion[]): number {
  return coercions.filter(
    (coercion) => coercion.active && (coercion.visibility === 'public' || coercion.knownToChurch),
  ).length;
}

function oswinScore(support: OswinChurchSupport, simonyExposed: boolean): number {
  if (support === 'none') return 0;
  if (support === 'committed') return simonyExposed ? 2 : 4;
  return simonyExposed ? 1 : 2;
}

function stanceFromScore(score: number): ChurchStateId {
  if (score <= 1) return 'skeptical';
  if (score <= 3) return 'neutral';
  return 'favorable';
}

function capStance(
  stance: ChurchStateId,
  ceiling: ChurchCandidateInput['stanceCeiling'],
): ChurchStateId {
  if (ceiling === 'none' || STANCE_ORDER[stance] <= STANCE_ORDER.skeptical) return stance;
  return 'skeptical';
}

export function createChurchPatronageState(): ChurchPatronageState {
  return {
    abbeyEndowmentApplied: false,
    firstOswinBenefitGranted: false,
    institutionalBenefitGranted: false,
    lastPatronizeCompletionDay: null,
    patronizeCompletions: 0,
  };
}

export function applyChurchPatronage(
  state: ChurchPatronageState,
  input: {
    readonly completionDay: number;
    readonly source: 'abbey-endowment' | 'patronize-action';
  },
): ChurchPatronageResult {
  assertElapsedDay(input.completionDay);
  if (input.source === 'abbey-endowment' && state.abbeyEndowmentApplied) {
    return { ok: false, reason: 'abbey-endowment-already-applied', state };
  }
  if (
    input.source === 'patronize-action' &&
    state.lastPatronizeCompletionDay !== null &&
    input.completionDay - state.lastPatronizeCompletionDay < 21
  ) {
    return { ok: false, reason: 'patronage-cooldown', state };
  }
  const firstInstitutionalBenefit = !state.institutionalBenefitGranted;
  const firstOswinBenefit = !state.firstOswinBenefitGranted;
  return {
    institutionalCaseDelta: firstInstitutionalBenefit ? 1 : 0,
    ok: true,
    oswinRelationshipDelta: firstOswinBenefit ? 8 : input.source === 'patronize-action' ? 3 : 0,
    state: {
      abbeyEndowmentApplied: state.abbeyEndowmentApplied || input.source === 'abbey-endowment',
      firstOswinBenefitGranted: true,
      institutionalBenefitGranted: true,
      lastPatronizeCompletionDay:
        input.source === 'patronize-action'
          ? input.completionDay
          : state.lastPatronizeCompletionDay,
      patronizeCompletions:
        state.patronizeCompletions + (input.source === 'patronize-action' ? 1 : 0),
    },
  };
}

export function addChurchCondemnation(
  input: ChurchCandidateInput,
  cause: ChurchCondemnationCause,
): ChurchCandidateInput {
  return { ...input, condemnationCauses: unique([...input.condemnationCauses, cause]) };
}

export function considerChurchCandidate(
  input: ChurchCandidateInput,
  phase: PhaseId,
): ChurchCandidateCase {
  const exactClaimRating = normalizeClaimRating(input.claimRating);
  const band = claimBand(exactClaimRating);
  const reasons: ChurchCaseReason[] = [];
  const claimScore = CLAIM_CASE[band];
  reasons.push({ category: 'claim', code: `claim-${band}`, score: claimScore });

  const oswin = oswinScore(input.oswinSupport, input.oswinSimonyExposed);
  if (oswin !== 0)
    reasons.push({ category: 'oswin', code: `oswin-${input.oswinSupport}`, score: oswin });

  const patronage = input.hasInstitutionalPatronage ? 1 : 0;
  if (patronage !== 0)
    reasons.push({ category: 'patronage', code: 'institutional-patronage', score: 1 });

  const conductFacts = unique(input.conductFacts);
  const rawConduct = conductFacts.reduce((total, fact) => total + CONDUCT_SCORES[fact], 0);
  const conduct = Math.min(2, Math.max(-6, rawConduct));
  for (const fact of conductFacts) {
    reasons.push({ category: 'conduct', code: fact, score: CONDUCT_SCORES[fact] });
  }
  if (conduct !== rawConduct) {
    reasons.push({
      category: 'conduct',
      code: 'lawful-conduct-clamp',
      score: conduct - rawConduct,
    });
  }

  const favorite = input.candidateId === 'renard' && input.isRenardUndiscreditedFavorite ? 1 : 0;
  if (favorite !== 0)
    reasons.push({ category: 'favorite', code: 'renard-undiscredited-favorite', score: 1 });

  const caseScore = claimScore + oswin + patronage + conduct + favorite;
  const knownCoercedPledges = knownCoercionCount(input.coercions);
  const condemnationCauses = unique(input.condemnationCauses);
  const endorsementBlocks: string[] = [];
  if (phase === 'stable') endorsementBlocks.push('endorsement-locked-before-ailing');
  if (CLAIM_CASE[band] < CLAIM_CASE.plausible) endorsementBlocks.push('claim-below-plausible');
  if (condemnationCauses.length > 0) endorsementBlocks.push('candidate-condemned');
  if (caseScore < 6) endorsementBlocks.push('church-case-below-six');
  if (knownCoercedPledges >= 2) endorsementBlocks.push('two-known-coerced-pledges');
  if (input.stanceCeiling === 'skeptical') endorsementBlocks.push('post-penance-skeptical-ceiling');

  let stance = condemnationCauses.length > 0 ? 'condemned' : stanceFromScore(caseScore);
  stance = capStance(stance, input.stanceCeiling);
  for (const cause of condemnationCauses) {
    reasons.unshift({ category: 'condemnation', code: cause, score: 0 });
  }
  if (knownCoercedPledges >= 2) {
    reasons.push({ category: 'coercion', code: 'two-known-coerced-pledges', score: 0 });
  }
  if (input.stanceCeiling === 'skeptical') {
    reasons.push({ category: 'penance', code: 'post-penance-skeptical-ceiling', score: 0 });
  }

  return {
    candidateId: input.candidateId,
    caseScore,
    claimRating: exactClaimRating,
    eligibleForEndorsement: endorsementBlocks.length === 0,
    endorsementBlocks,
    knownCoercedPledges,
    reasons,
    stance,
  };
}

function endorsementChange(
  previous: LordId | null,
  next: LordId | null,
  tied: boolean,
): EndorsementChange {
  if (previous === next) return 'none';
  if (previous === null && next !== null) return 'granted';
  if (previous !== null && next !== null) return 'transferred';
  return tied ? 'withheld' : 'withdrawn';
}

export function resolveChurchEndorsement(input: {
  readonly candidates: readonly ChurchCandidateInput[];
  readonly oswinPreferredCandidateId: LordId | null;
  readonly phase: PhaseId;
  readonly previousEndorsementId: LordId | null;
}): ChurchEndorsementResult {
  const cases = input.candidates.map((candidate) =>
    considerChurchCandidate(candidate, input.phase),
  );
  if (input.phase === 'stable') {
    return {
      cases,
      change: endorsementChange(input.previousEndorsementId, null, false),
      endorsedCandidateId: null,
      previousEndorsementId: input.previousEndorsementId,
      reason: 'before-ailing',
    };
  }
  const eligible = cases.filter((candidate) => candidate.eligibleForEndorsement);
  if (eligible.length === 0) {
    return {
      cases,
      change: endorsementChange(input.previousEndorsementId, null, false),
      endorsedCandidateId: null,
      previousEndorsementId: input.previousEndorsementId,
      reason: 'no-eligible-candidate',
    };
  }
  const highestCase = Math.max(...eligible.map((candidate) => candidate.caseScore));
  let finalists = eligible.filter((candidate) => candidate.caseScore === highestCase);
  let reason: ChurchEndorsementResult['reason'] = 'highest-case';
  if (finalists.length > 1) {
    const highestClaim = Math.max(...finalists.map((candidate) => candidate.claimRating));
    finalists = finalists.filter((candidate) => candidate.claimRating === highestClaim);
    reason = 'higher-claim';
  }
  if (finalists.length > 1 && input.oswinPreferredCandidateId !== null) {
    const preferred = finalists.find(
      (candidate) => candidate.candidateId === input.oswinPreferredCandidateId,
    );
    if (preferred) {
      finalists = [preferred];
      reason = 'oswin-preference';
    }
  }
  const endorsedCandidateId = finalists.length === 1 ? (finalists[0]?.candidateId ?? null) : null;
  if (endorsedCandidateId === null) reason = 'tie-withheld';
  const endorsedCases = cases.map(
    (candidate): ChurchCandidateCase =>
      candidate.candidateId === endorsedCandidateId
        ? { ...candidate, stance: 'endorsed' }
        : candidate,
  );
  return {
    cases: endorsedCases,
    change: endorsementChange(
      input.previousEndorsementId,
      endorsedCandidateId,
      endorsedCandidateId === null,
    ),
    endorsedCandidateId,
    previousEndorsementId: input.previousEndorsementId,
    reason,
  };
}

export function soleChurchEndorsement(cases: readonly ChurchCandidateCase[]): LordId | null {
  const endorsed = cases.filter((candidate) => candidate.stance === 'endorsed');
  return endorsed.length === 1 ? (endorsed[0]?.candidateId ?? null) : null;
}

export function completeForgeryPenance(input: {
  readonly church: ChurchCandidateInput;
  readonly claim: ClaimState;
  readonly costPaidAtStart: boolean;
}): PenanceResult {
  if (
    !hasOswinForgeryRedLine(input.claim) ||
    !input.church.condemnationCauses.includes('exposed-forgery')
  ) {
    return { ok: false, reason: 'fraud-condemnation-not-active' };
  }
  if (!input.costPaidAtStart) {
    return { ok: false, reason: 'start-cost-not-paid' };
  }
  return {
    claim: markForgeryPenitent(input.claim),
    church: {
      ...input.church,
      condemnationCauses: input.church.condemnationCauses.filter(
        (cause) => cause !== 'exposed-forgery',
      ),
      stanceCeiling: 'skeptical',
    },
    ok: true,
    oswinFraudRedLineActive: false,
    prestigeDelta: -5,
    restored: { claim: 0, relationship: 0, support: 0, trust: 0 },
  };
}

export function churchInputFromClaim(
  input: Omit<ChurchCandidateInput, 'claimRating'>,
  claim: ClaimState,
): ChurchCandidateInput {
  return {
    ...input,
    claimRating: claimRating(claim),
  };
}
