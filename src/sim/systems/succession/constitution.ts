import { LORD_IDS, type LordId } from '../../../contracts/ids';
import type {
  BindingSupportInput,
  CandidateId,
  CandidateTally,
  ConstitutionReason,
  CouncilBallotReconstruction,
  CouncilVoteRecord,
  DecisiveRule,
  EliminationTieCriterion,
  FinalTieCriterion,
  ReleasedSupportContext,
  SuccessionCandidateInput,
  SuccessionConstitutionInput,
  SuccessionReason,
  SuccessionReconstruction,
  SuccessionResolution,
  SuppliedSuccessionReason,
  TieBreakStep,
} from './types';

const COUNCIL_SIZE = 6;
const COUNCIL_MAJORITY = 4;

function compareIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function supplied(reason: SuppliedSuccessionReason): SuccessionReason {
  return { ...reason, kind: 'supplied' };
}

function constitutionReason(
  code: ConstitutionReason['code'],
  summary: string,
  fields: Omit<ConstitutionReason, 'code' | 'kind' | 'summary'> = {},
): ConstitutionReason {
  return { ...fields, code, kind: 'constitution', summary };
}

function assertBoundedRating(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${name} must be an integer from 0 to 100`);
  }
}

function validateInput(input: SuccessionConstitutionInput): void {
  if (input.voters.length !== COUNCIL_SIZE) {
    throw new Error('Council of Six requires exactly six voters');
  }
  const voterIds = new Set(input.voters.map((voter) => voter.id));
  if (voterIds.size !== COUNCIL_SIZE || LORD_IDS.some((lordId) => !voterIds.has(lordId))) {
    throw new Error('Council voters must contain each legal lord exactly once');
  }

  const candidateIds = new Set<CandidateId>();
  const declarationKeys = new Set<string>();
  for (const candidate of input.candidates) {
    if (candidateIds.has(candidate.id)) throw new Error(`Duplicate candidate ${candidate.id}`);
    candidateIds.add(candidate.id);
    assertBoundedRating(`${candidate.id} Claim`, candidate.claim);
    assertBoundedRating(`${candidate.id} Prestige`, candidate.prestige);
    if (!Number.isFinite(candidate.declaration.timeHours) || candidate.declaration.timeHours < 0) {
      throw new Error(`${candidate.id} declaration time must be finite and non-negative`);
    }
    if (
      !Number.isSafeInteger(candidate.declaration.sequenceId) ||
      candidate.declaration.sequenceId < 0
    ) {
      throw new Error(`${candidate.id} declaration sequenceId must be a non-negative safe integer`);
    }
    if (candidate.eligible) {
      const declarationKey = `${candidate.declaration.timeHours}:${candidate.declaration.sequenceId}`;
      if (declarationKeys.has(declarationKey)) {
        throw new Error('Eligible candidates must have unique declaration precedence');
      }
      declarationKeys.add(declarationKey);
    }
  }
  const legalCount = input.candidates.filter((candidate) => candidate.eligible).length;
  if (legalCount < 1 || legalCount > 3) {
    throw new Error('The launch constitution requires one to three legal candidates');
  }

  const bindingVoters = new Set<LordId>();
  for (const binding of input.bindings) {
    if (bindingVoters.has(binding.voterId)) {
      throw new Error(`Voter ${binding.voterId} has more than one binding support record`);
    }
    bindingVoters.add(binding.voterId);
    if (!voterIds.has(binding.voterId)) {
      throw new Error(`Binding support references non-Council voter ${binding.voterId}`);
    }
    if (!candidateIds.has(binding.candidateId)) {
      throw new Error(`Binding support references unknown candidate ${binding.candidateId}`);
    }
  }
  if (input.militaryAcclamation.qualified) {
    const acclaimed = input.candidates.find(
      (candidate) => candidate.id === input.militaryAcclamation.candidateId,
    );
    if (!acclaimed?.eligible) {
      throw new Error('Military Acclamation may crown only a legal candidate');
    }
  }
}

function candidateById(
  candidates: readonly SuccessionCandidateInput[],
  candidateId: CandidateId,
): SuccessionCandidateInput {
  const candidate = candidates.find((entry) => entry.id === candidateId);
  if (!candidate) throw new Error(`Missing candidate facts for ${candidateId}`);
  return candidate;
}

function validCommitmentCount(
  candidateId: CandidateId,
  input: SuccessionConstitutionInput,
): number {
  const candidateVoters = new Set<LordId>(
    input.candidates.filter((candidate) => candidate.eligible).map((candidate) => candidate.id),
  );
  return input.bindings.filter(
    (binding) =>
      binding.valid &&
      binding.level === 'committed' &&
      binding.candidateId === candidateId &&
      binding.voterId !== 'greyfen' &&
      !candidateVoters.has(binding.voterId),
  ).length;
}

function declarationValue(candidate: SuccessionCandidateInput): string {
  return `${candidate.declaration.timeHours}:${candidate.declaration.sequenceId}`;
}

function makeTieStep(
  criterion: EliminationTieCriterion | FinalTieCriterion,
  candidates: readonly SuccessionCandidateInput[],
  values: (candidate: SuccessionCandidateInput) => boolean | number | string,
  decisiveCandidateId?: CandidateId,
): TieBreakStep {
  const base = {
    criterion,
    decisive: decisiveCandidateId !== undefined,
    values: candidates.map((candidate) => ({
      candidateId: candidate.id,
      value: values(candidate),
    })),
  };
  return decisiveCandidateId === undefined ? base : { ...base, decisiveCandidateId };
}

function earlier(left: SuccessionCandidateInput, right: SuccessionCandidateInput): number {
  if (left.declaration.timeHours !== right.declaration.timeHours) {
    return left.declaration.timeHours - right.declaration.timeHours;
  }
  return left.declaration.sequenceId - right.declaration.sequenceId;
}

function eliminateLowestTie(
  tiedIds: readonly CandidateId[],
  input: SuccessionConstitutionInput,
): { readonly eliminatedId: CandidateId; readonly steps: readonly TieBreakStep[] } {
  let tied = tiedIds.map((id) => candidateById(input.candidates, id));
  const steps: TieBreakStep[] = [];

  const applyLowest = (
    criterion: EliminationTieCriterion,
    value: (candidate: SuccessionCandidateInput) => number,
  ): void => {
    if (tied.length <= 1) return;
    const lowest = Math.min(...tied.map(value));
    const remaining = tied.filter((candidate) => value(candidate) === lowest);
    const decisiveCandidateId = remaining.length === 1 ? remaining[0]?.id : undefined;
    steps.push(makeTieStep(criterion, tied, value, decisiveCandidateId));
    tied = remaining;
  };

  applyLowest('commitments', (candidate) => validCommitmentCount(candidate.id, input));
  applyLowest('claim', (candidate) => candidate.claim);
  applyLowest('prestige', (candidate) => candidate.prestige);

  if (tied.length > 1) {
    const latest = tied.reduce((current, candidate) =>
      earlier(current, candidate) < 0 ? candidate : current,
    );
    steps.push(makeTieStep('declaration-time', tied, declarationValue, latest.id));
    tied = [latest];
  }

  const eliminated = tied[0];
  if (!eliminated) throw new Error('Elimination tie did not contain a candidate');
  return { eliminatedId: eliminated.id, steps };
}

function resolveFinalTie(
  candidateIds: readonly CandidateId[],
  input: SuccessionConstitutionInput,
): {
  readonly decisiveRule: DecisiveRule;
  readonly steps: readonly TieBreakStep[];
  readonly winnerId: CandidateId;
} {
  let tied = candidateIds.map((id) => candidateById(input.candidates, id));
  const steps: TieBreakStep[] = [];
  let decisiveRule: DecisiveRule | undefined;

  const applyHighest = (
    criterion: FinalTieCriterion,
    rule: DecisiveRule,
    value: (candidate: SuccessionCandidateInput) => number,
  ): void => {
    if (tied.length <= 1) return;
    const highest = Math.max(...tied.map(value));
    const remaining = tied.filter((candidate) => value(candidate) === highest);
    const decisiveCandidateId = remaining.length === 1 ? remaining[0]?.id : undefined;
    steps.push(makeTieStep(criterion, tied, value, decisiveCandidateId));
    if (decisiveCandidateId) decisiveRule = rule;
    tied = remaining;
  };

  applyHighest('church-endorsement', 'final-tiebreak-church-endorsement', (candidate) =>
    Number(input.churchEndorsedCandidateId === candidate.id),
  );
  applyHighest('capital-control', 'final-tiebreak-capital-control', (candidate) =>
    Number(input.capitalControllerId === candidate.id),
  );
  applyHighest('commitments', 'final-tiebreak-commitments', (candidate) =>
    validCommitmentCount(candidate.id, input),
  );
  applyHighest('claim', 'final-tiebreak-claim', (candidate) => candidate.claim);
  applyHighest('prestige', 'final-tiebreak-prestige', (candidate) => candidate.prestige);

  if (tied.length > 1) {
    const first = tied.reduce((current, candidate) =>
      earlier(current, candidate) <= 0 ? current : candidate,
    );
    steps.push(makeTieStep('declaration-time', tied, declarationValue, first.id));
    decisiveRule = 'final-tiebreak-declaration-time';
    tied = [first];
  }

  const winner = tied[0];
  if (!winner || !decisiveRule) throw new Error('Final constitutional tie did not resolve');
  return { decisiveRule, steps, winnerId: winner.id };
}

function releasedSupport(
  binding: BindingSupportInput,
  remainingCandidates: ReadonlySet<CandidateId>,
  candidates: readonly SuccessionCandidateInput[],
): ReleasedSupportContext | undefined {
  if (!binding.valid) {
    return {
      candidateId: binding.candidateId,
      cause: 'support-invalid',
      level: binding.level,
      sourceId: binding.sourceId,
    };
  }
  if (!remainingCandidates.has(binding.candidateId)) {
    const candidate = candidates.find((entry) => entry.id === binding.candidateId);
    return {
      candidateId: binding.candidateId,
      cause: candidate?.eligible ? 'candidate-eliminated' : 'candidate-ineligible',
      level: binding.level,
      sourceId: binding.sourceId,
    };
  }
  return undefined;
}

function voteBallot(
  candidateIds: readonly CandidateId[],
  ballotNumber: number,
  input: SuccessionConstitutionInput,
):
  | { readonly decisionRequired: true }
  | { readonly decisionRequired: false; readonly votes: readonly CouncilVoteRecord[] } {
  const candidateSet = new Set(candidateIds);
  const voters = [...input.voters].sort((left, right) => compareIds(left.id, right.id));
  const bindings = new Map(input.bindings.map((binding) => [binding.voterId, binding]));
  const votes: CouncilVoteRecord[] = [];

  if (candidateIds.length === 1) {
    const candidateId = candidateIds[0];
    if (!candidateId) throw new Error('Sole-candidate ballot is missing its candidate');
    for (const voter of voters) {
      votes.push({
        candidateId,
        reasons: [
          constitutionReason(
            'sole-candidate-six-zero',
            'The sole legal candidate receives the required six-to-zero acclamation.',
            { candidateId, voterId: voter.id },
          ),
        ],
        source: 'sole-candidate',
        voterDispossessed: voter.dispossessed,
        voterId: voter.id,
      });
    }
    return { decisionRequired: false, votes };
  }

  for (const voter of voters) {
    if (candidateSet.has(voter.id as CandidateId)) {
      const candidateId = voter.id as CandidateId;
      votes.push({
        candidateId,
        reasons: [
          constitutionReason('candidate-self-vote', 'A legal candidate votes for themself.', {
            candidateId,
            voterId: voter.id,
          }),
        ],
        source: 'self',
        voterDispossessed: voter.dispossessed,
        voterId: voter.id,
      });
      continue;
    }

    if (voter.id === 'greyfen') {
      if (!input.greyfenVote) return { decisionRequired: true };
      if (!candidateSet.has(input.greyfenVote.candidateId)) {
        throw new Error("Greyfen's manual vote must choose a remaining legal candidate");
      }
      votes.push({
        candidateId: input.greyfenVote.candidateId,
        reasons: [
          constitutionReason(
            'greyfen-manual-choice',
            "The player cast Greyfen's historical vote after losing candidacy.",
            { candidateId: input.greyfenVote.candidateId, voterId: voter.id },
          ),
          ...(input.greyfenVote.reasons ?? []).map(supplied),
        ],
        source: 'manual',
        voterDispossessed: voter.dispossessed,
        voterId: voter.id,
      });
      continue;
    }

    const binding = bindings.get(voter.id);
    const released = binding ? releasedSupport(binding, candidateSet, input.candidates) : undefined;
    if (binding && !released) {
      const code = binding.level === 'committed' ? 'binding-commitment' : 'binding-pledge';
      votes.push({
        candidateId: binding.candidateId,
        reasons: [
          constitutionReason(
            code,
            `A valid ${binding.level} support record binds this Council vote.`,
            {
              candidateId: binding.candidateId,
              facts: { basis: binding.basis, sourceId: binding.sourceId },
              voterId: voter.id,
            },
          ),
          ...binding.validationReasons.map(supplied),
        ],
        source: 'binding',
        voterDispossessed: voter.dispossessed,
        voterId: voter.id,
      });
      continue;
    }

    const evaluated = input.evaluateUnboundVote({
      ballotNumber,
      candidateIds,
      ...(released ? { releasedSupport: released } : {}),
      voter,
    });
    if (!candidateSet.has(evaluated.candidateId)) {
      throw new Error(`Evaluator chose non-remaining candidate ${evaluated.candidateId}`);
    }
    if (evaluated.reasons.length === 0) {
      throw new Error(`Evaluator must explain ${voter.id}'s vote with structured reasons`);
    }
    const releaseReasons: SuccessionReason[] = [];
    if (binding && released) {
      releaseReasons.push(
        constitutionReason(
          released.cause === 'support-invalid'
            ? 'binding-support-invalid'
            : 'binding-support-released',
          released.cause === 'support-invalid'
            ? 'The supplied binding support failed validation and does not bind this ballot.'
            : 'Support for an eliminated candidate is released for this ballot.',
          {
            candidateId: binding.candidateId,
            facts: { sourceId: binding.sourceId },
            voterId: voter.id,
          },
        ),
        ...binding.validationReasons.map(supplied),
      );
    }
    votes.push({
      candidateId: evaluated.candidateId,
      reasons: [
        ...releaseReasons,
        constitutionReason(
          'unbound-evaluation',
          'An unbound voter chose among the remaining candidates using exact evaluation.',
          { candidateId: evaluated.candidateId, voterId: voter.id },
        ),
        ...evaluated.reasons.map(supplied),
      ],
      ...(released ? { releasedSupport: released } : {}),
      source: 'evaluation',
      voterDispossessed: voter.dispossessed,
      voterId: voter.id,
    });
  }
  return { decisionRequired: false, votes };
}

function tallyVotes(
  candidateIds: readonly CandidateId[],
  votes: readonly CouncilVoteRecord[],
): readonly CandidateTally[] {
  return candidateIds.map((candidateId) => ({
    candidateId,
    votes: votes.filter((vote) => vote.candidateId === candidateId).length,
  }));
}

function baseReconstruction(
  input: SuccessionConstitutionInput,
  legalCandidateIds: readonly CandidateId[],
): SuccessionReconstruction {
  const acclamationReason = input.militaryAcclamation.qualified
    ? constitutionReason(
        'military-acclamation-qualified',
        'The supplied military hook qualified one legal claimant for acclamation.',
        { candidateId: input.militaryAcclamation.candidateId },
      )
    : constitutionReason(
        'military-acclamation-not-qualified',
        'The supplied military hook qualified no claimant, so the Council must sit.',
      );
  return {
    acclamation: {
      candidateId: input.militaryAcclamation.candidateId,
      qualified: input.militaryAcclamation.qualified,
      reasons: [acclamationReason, ...input.militaryAcclamation.reasons.map(supplied)],
    },
    ballots: [],
    candidateValidations: input.candidates.map((candidate) => ({
      candidateId: candidate.id,
      eligible: candidate.eligible,
      reasons: [
        constitutionReason(
          candidate.eligible ? 'candidate-eligible' : 'candidate-ineligible',
          candidate.eligible
            ? 'The supplied candidate validation admits this declared claimant.'
            : 'The supplied candidate validation excludes this claimant.',
          { candidateId: candidate.id },
        ),
        ...candidate.eligibilityReasons.map(supplied),
      ],
    })),
    candidates: input.candidates,
    decisiveRule: null,
    legalCandidateIds,
    winnerId: null,
  };
}

function resolved(
  winnerId: CandidateId,
  route: 'council' | 'military-acclamation',
  reconstruction: SuccessionReconstruction,
): SuccessionResolution {
  return {
    playerOutcome: winnerId === 'greyfen' ? 'won' : 'lost',
    reconstruction,
    route,
    status: 'resolved',
    winnerId,
  };
}

/**
 * Resolves the locked succession constitution from already validated external facts.
 * No military, support, Church, Capital, or evaluator subsystem is imported here.
 */
export function resolveSuccession(input: SuccessionConstitutionInput): SuccessionResolution {
  validateInput(input);
  const legalCandidateIds = input.candidates
    .filter((candidate) => candidate.eligible)
    .map((candidate) => candidate.id)
    .sort(compareIds);
  let reconstruction = baseReconstruction(input, legalCandidateIds);

  if (input.militaryAcclamation.qualified) {
    const winnerId = input.militaryAcclamation.candidateId;
    reconstruction = {
      ...reconstruction,
      decisiveRule: 'military-acclamation',
      winnerId,
    };
    return resolved(winnerId, 'military-acclamation', reconstruction);
  }

  let remaining = legalCandidateIds;
  const ballots: CouncilBallotReconstruction[] = [];
  let ballotNumber = 1;

  while (true) {
    const ballot = voteBallot(remaining, ballotNumber, input);
    if (ballot.decisionRequired) {
      const reason = constitutionReason(
        'greyfen-vote-required',
        "Greyfen remains a legal voter but is no longer a candidate; the player must choose history's recipient.",
        { voterId: 'greyfen' },
      );
      return {
        decision: {
          ballotNumber,
          candidateIds: remaining,
          playerCannotWin: true,
          reasons: [reason],
        },
        playerOutcome: 'lost',
        reconstruction: { ...reconstruction, ballots },
        status: 'awaiting-greyfen-vote',
      };
    }

    const tallies = tallyVotes(remaining, ballot.votes);
    if (remaining.length === 1) {
      const winnerId = remaining[0];
      if (!winnerId) throw new Error('Sole-candidate resolution lost its candidate');
      const reasons = [
        constitutionReason(
          'sole-candidate-six-zero',
          'Only one legal candidate remains and therefore receives all six votes.',
          { candidateId: winnerId, facts: { votes: COUNCIL_SIZE } },
        ),
      ];
      ballots.push({
        ballotNumber,
        candidateIds: remaining,
        majorityWinnerId: winnerId,
        reasons,
        tallies,
        tieBreak: [],
        votes: ballot.votes,
      });
      reconstruction = {
        ...reconstruction,
        ballots,
        decisiveRule: 'sole-candidate-six-zero',
        winnerId,
      };
      return resolved(winnerId, 'council', reconstruction);
    }

    const majority = tallies.find((tally) => tally.votes >= COUNCIL_MAJORITY);
    if (majority) {
      const reasons = [
        constitutionReason('council-majority', 'Four of six votes wins a Council ballot.', {
          candidateId: majority.candidateId,
          facts: { majority: COUNCIL_MAJORITY, votes: majority.votes },
        }),
      ];
      ballots.push({
        ballotNumber,
        candidateIds: remaining,
        majorityWinnerId: majority.candidateId,
        reasons,
        tallies,
        tieBreak: [],
        votes: ballot.votes,
      });
      reconstruction = {
        ...reconstruction,
        ballots,
        decisiveRule: 'council-majority',
        winnerId: majority.candidateId,
      };
      return resolved(majority.candidateId, 'council', reconstruction);
    }

    if (remaining.length === 3) {
      const lowestVotes = Math.min(...tallies.map((tally) => tally.votes));
      const lowest = tallies
        .filter((tally) => tally.votes === lowestVotes)
        .map((tally) => tally.candidateId);
      const elimination =
        lowest.length === 1
          ? { eliminatedId: lowest[0] as CandidateId, steps: [] }
          : eliminateLowestTie(lowest, input);
      const reasons: SuccessionReason[] = [
        constitutionReason(
          'runoff-elimination',
          'No candidate reached four votes; the lowest candidate is eliminated before the runoff.',
          {
            candidateId: elimination.eliminatedId,
            facts: { votes: lowestVotes },
          },
        ),
      ];
      ballots.push({
        ballotNumber,
        candidateIds: remaining,
        eliminatedCandidateId: elimination.eliminatedId,
        reasons,
        tallies,
        tieBreak: elimination.steps,
        votes: ballot.votes,
      });
      remaining = remaining.filter((candidateId) => candidateId !== elimination.eliminatedId);
      ballotNumber += 1;
      continue;
    }

    const finalTie = resolveFinalTie(remaining, input);
    const decisiveCode = finalTie.decisiveRule as ConstitutionReason['code'];
    ballots.push({
      ballotNumber,
      candidateIds: remaining,
      majorityWinnerId: finalTie.winnerId,
      reasons: [
        constitutionReason(
          decisiveCode,
          'A three-to-three Council ballot is decided by the first distinguishing constitutional tie-break.',
          { candidateId: finalTie.winnerId },
        ),
      ],
      tallies,
      tieBreak: finalTie.steps,
      votes: ballot.votes,
    });
    reconstruction = {
      ...reconstruction,
      ballots,
      decisiveRule: finalTie.decisiveRule,
      winnerId: finalTie.winnerId,
    };
    return resolved(finalTie.winnerId, 'council', reconstruction);
  }
}
