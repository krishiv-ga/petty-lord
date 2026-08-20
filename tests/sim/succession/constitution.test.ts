import { describe, expect, it, vi } from 'vitest';
import {
  type BindingSupportInput,
  type CandidateId,
  type CouncilVoterInput,
  resolveSuccession,
  type SuccessionCandidateInput,
  type SuccessionConstitutionInput,
  type SuppliedSuccessionReason,
  type UnboundVoteEvaluator,
} from '../../../src/sim/systems/succession';

const VOTERS: readonly CouncilVoterInput[] = [
  { dispossessed: false, id: 'greyfen' },
  { dispossessed: false, id: 'edric' },
  { dispossessed: false, id: 'ysabel' },
  { dispossessed: false, id: 'renard' },
  { dispossessed: false, id: 'oswin' },
  { dispossessed: false, id: 'mara' },
];

function reason(
  summary: string,
  source: SuppliedSuccessionReason['source'] = 'evaluation',
): SuppliedSuccessionReason {
  return { code: summary.toLowerCase().replaceAll(' ', '-'), source, summary };
}

function candidate(
  id: CandidateId,
  declarationOrder: number,
  overrides: Partial<SuccessionCandidateInput> = {},
): SuccessionCandidateInput {
  return {
    claim: id === 'renard' ? 72 : 30,
    declaration: { sequenceId: declarationOrder, timeHours: declarationOrder * 24 },
    dispossessed: false,
    eligibilityReasons: [reason(`${id} is legally declared`, 'candidate-validation')],
    eligible: true,
    id,
    prestige: 50,
    ...overrides,
  };
}

function binding(
  voterId: BindingSupportInput['voterId'],
  candidateId: CandidateId,
  level: BindingSupportInput['level'] = 'pledged',
): BindingSupportInput {
  return {
    basis: 'bargain',
    candidateId,
    level,
    sourceId: `${voterId}-${candidateId}-${level}`,
    valid: true,
    validationReasons: [reason('support remains valid', 'support-validation')],
    voterId,
  };
}

function evaluator(
  preferences: Partial<Record<BindingSupportInput['voterId'], readonly CandidateId[]>>,
): UnboundVoteEvaluator {
  return ({ candidateIds, releasedSupport, voter }) => {
    const candidateId =
      preferences[voter.id]?.find((id) => candidateIds.includes(id)) ?? candidateIds[0];
    if (!candidateId) throw new Error('Test evaluator received no candidates');
    return {
      candidateId,
      reasons: [
        reason(
          releasedSupport
            ? `${voter.id} reevaluated after ${releasedSupport.candidateId} released`
            : `${voter.id} exact evaluation chose ${candidateId}`,
        ),
      ],
    };
  };
}

function councilInput(
  overrides: Partial<SuccessionConstitutionInput> = {},
): SuccessionConstitutionInput {
  return {
    bindings: [],
    candidates: [candidate('greyfen', 2), candidate('renard', 1)],
    capitalControllerId: null,
    churchEndorsedCandidateId: null,
    evaluateUnboundVote: evaluator({
      edric: ['greyfen'],
      mara: ['renard'],
      oswin: ['renard'],
      ysabel: ['greyfen'],
    }),
    militaryAcclamation: {
      candidateId: null,
      qualified: false,
      reasons: [reason('no claimant qualified by force', 'military-acclamation')],
    },
    voters: VOTERS,
    ...overrides,
  };
}

function expectResolved(result: ReturnType<typeof resolveSuccession>) {
  expect(result.status).toBe('resolved');
  if (result.status !== 'resolved') throw new Error('Expected resolved succession');
  return result;
}

describe('exact succession constitution', () => {
  it('stops at a supplied legal Military Acclamation result before convening Council', () => {
    const evaluateUnboundVote = vi.fn(evaluator({}));
    const result = expectResolved(
      resolveSuccession(
        councilInput({
          evaluateUnboundVote,
          militaryAcclamation: {
            candidateId: 'greyfen',
            qualified: true,
            reasons: [reason('capital seats and troops validated', 'military-acclamation')],
          },
        }),
      ),
    );

    expect(result.route).toBe('military-acclamation');
    expect(result.winnerId).toBe('greyfen');
    expect(result.playerOutcome).toBe('won');
    expect(result.reconstruction.ballots).toEqual([]);
    expect(
      result.reconstruction.candidateValidations.every((entry) => entry.reasons.length > 0),
    ).toBe(true);
    expect(result.reconstruction.acclamation.reasons.map((entry) => entry.code)).toContain(
      'military-acclamation-qualified',
    );
    expect(evaluateUnboundVote).not.toHaveBeenCalled();
  });

  it('reconstructs a four-vote coalition from self-vote and supplied binding supports', () => {
    const result = expectResolved(
      resolveSuccession(
        councilInput({
          bindings: [
            binding('greyfen', 'renard', 'committed'),
            binding('edric', 'greyfen'),
            binding('ysabel', 'greyfen'),
            binding('oswin', 'greyfen', 'committed'),
          ],
          evaluateUnboundVote: evaluator({ mara: ['renard'] }),
        }),
      ),
    );

    expect(result.winnerId).toBe('greyfen');
    expect(result.reconstruction.decisiveRule).toBe('council-majority');
    const ballot = result.reconstruction.ballots[0];
    expect(ballot?.tallies).toEqual([
      { candidateId: 'greyfen', votes: 4 },
      { candidateId: 'renard', votes: 2 },
    ]);
    expect(ballot?.votes.find((vote) => vote.voterId === 'greyfen')?.source).toBe('self');
    expect(ballot?.votes.every((vote) => vote.reasons.length > 0)).toBe(true);
  });

  it.each([
    {
      decisiveRule: 'final-tiebreak-church-endorsement',
      label: 'Church Endorsement',
      overrides: { churchEndorsedCandidateId: 'greyfen' as const },
      steps: ['church-endorsement'],
    },
    {
      decisiveRule: 'final-tiebreak-capital-control',
      label: 'Capital control',
      overrides: { capitalControllerId: 'greyfen' as const },
      steps: ['church-endorsement', 'capital-control'],
    },
    {
      decisiveRule: 'final-tiebreak-commitments',
      label: 'valid Commitments',
      overrides: {
        bindings: [
          binding('ysabel', 'greyfen', 'committed'),
          binding('oswin', 'renard', 'pledged'),
        ],
      },
      steps: ['church-endorsement', 'capital-control', 'commitments'],
    },
    {
      decisiveRule: 'final-tiebreak-claim',
      label: 'exact Claim',
      overrides: {
        candidates: [candidate('greyfen', 2, { claim: 73 }), candidate('renard', 1, { claim: 72 })],
      },
      steps: ['church-endorsement', 'capital-control', 'commitments', 'claim'],
    },
    {
      decisiveRule: 'final-tiebreak-prestige',
      label: 'Prestige',
      overrides: {
        candidates: [
          candidate('greyfen', 2, { claim: 50, prestige: 51 }),
          candidate('renard', 1, { claim: 50, prestige: 50 }),
        ],
      },
      steps: ['church-endorsement', 'capital-control', 'commitments', 'claim', 'prestige'],
    },
  ])('uses $label at its exact position in a final three-to-three tie', (scenario) => {
    const result = expectResolved(
      resolveSuccession(
        councilInput({
          bindings: [binding('ysabel', 'greyfen'), binding('oswin', 'renard')],
          evaluateUnboundVote: evaluator({ edric: ['greyfen'], mara: ['renard'] }),
          ...scenario.overrides,
        }),
      ),
    );

    expect(result.winnerId).toBe('greyfen');
    expect(result.reconstruction.decisiveRule).toBe(scenario.decisiveRule);
    expect(result.reconstruction.ballots[0]?.tallies).toEqual([
      { candidateId: 'greyfen', votes: 3 },
      { candidateId: 'renard', votes: 3 },
    ]);
    expect(result.reconstruction.ballots[0]?.tieBreak.map((step) => step.criterion)).toEqual(
      scenario.steps,
    );
  });

  it('applies the complete final tie order through earlier declaration when nothing else differs', () => {
    const result = expectResolved(
      resolveSuccession(
        councilInput({
          candidates: [
            candidate('greyfen', 1, { claim: 50, prestige: 50 }),
            candidate('renard', 2, { claim: 50, prestige: 50 }),
          ],
          evaluateUnboundVote: evaluator({
            edric: ['greyfen'],
            mara: ['renard'],
            oswin: ['renard'],
            ysabel: ['greyfen'],
          }),
        }),
      ),
    );

    expect(result.winnerId).toBe('greyfen');
    expect(result.reconstruction.decisiveRule).toBe('final-tiebreak-declaration-time');
    expect(result.reconstruction.ballots[0]?.tieBreak.map((step) => step.criterion)).toEqual([
      'church-endorsement',
      'capital-control',
      'commitments',
      'claim',
      'prestige',
      'declaration-time',
    ]);
  });

  it('eliminates the lowest of three by Commitments, then releases and reevaluates that vote', () => {
    const result = expectResolved(
      resolveSuccession(
        councilInput({
          bindings: [
            binding('ysabel', 'greyfen', 'committed'),
            binding('oswin', 'renard', 'committed'),
            binding('mara', 'edric'),
          ],
          candidates: [
            candidate('greyfen', 2, { claim: 80 }),
            candidate('edric', 3, { claim: 18 }),
            candidate('renard', 1, { claim: 72 }),
          ],
          evaluateUnboundVote: evaluator({ edric: ['greyfen'], mara: ['renard'] }),
        }),
      ),
    );

    expect(result.reconstruction.ballots).toHaveLength(2);
    const first = result.reconstruction.ballots[0];
    expect(first?.tallies).toEqual([
      { candidateId: 'edric', votes: 2 },
      { candidateId: 'greyfen', votes: 2 },
      { candidateId: 'renard', votes: 2 },
    ]);
    expect(first?.eliminatedCandidateId).toBe('edric');
    expect(first?.tieBreak.map((step) => step.criterion)).toEqual(['commitments']);
    const releasedVote = result.reconstruction.ballots[1]?.votes.find(
      (vote) => vote.voterId === 'mara',
    );
    expect(releasedVote?.releasedSupport).toMatchObject({
      candidateId: 'edric',
      cause: 'candidate-eliminated',
    });
    expect(releasedVote?.reasons.map((entry) => entry.code)).toContain('binding-support-released');
  });

  it('uses Claim, Prestige, then later declaration in the exact runoff-elimination order', () => {
    const result = expectResolved(
      resolveSuccession(
        councilInput({
          bindings: [
            binding('ysabel', 'greyfen'),
            binding('oswin', 'renard'),
            binding('mara', 'edric'),
          ],
          candidates: [
            candidate('greyfen', 1, { claim: 40, prestige: 50 }),
            candidate('edric', 3, { claim: 40, prestige: 50 }),
            candidate('renard', 2, { claim: 40, prestige: 50 }),
          ],
          evaluateUnboundVote: evaluator({ edric: ['greyfen'], mara: ['greyfen'] }),
        }),
      ),
    );

    const first = result.reconstruction.ballots[0];
    expect(first?.eliminatedCandidateId).toBe('edric');
    expect(first?.tieBreak.map((step) => step.criterion)).toEqual([
      'commitments',
      'claim',
      'prestige',
      'declaration-time',
    ]);
  });

  it.each([
    {
      candidates: [
        candidate('greyfen', 1, { claim: 40, prestige: 50 }),
        candidate('edric', 3, { claim: 39, prestige: 50 }),
        candidate('renard', 2, { claim: 40, prestige: 50 }),
      ],
      criterion: 'claim',
      steps: ['commitments', 'claim'],
    },
    {
      candidates: [
        candidate('greyfen', 1, { claim: 40, prestige: 50 }),
        candidate('edric', 3, { claim: 40, prestige: 49 }),
        candidate('renard', 2, { claim: 40, prestige: 50 }),
      ],
      criterion: 'prestige',
      steps: ['commitments', 'claim', 'prestige'],
    },
  ])('makes elimination $criterion decisive with complete evidence', ({ candidates, steps }) => {
    const result = expectResolved(
      resolveSuccession(
        councilInput({
          bindings: [
            binding('ysabel', 'greyfen'),
            binding('oswin', 'renard'),
            binding('mara', 'edric'),
          ],
          candidates,
          evaluateUnboundVote: evaluator({ edric: ['greyfen'], mara: ['greyfen'] }),
        }),
      ),
    );
    expect(result.reconstruction.ballots[0]?.eliminatedCandidateId).toBe('edric');
    expect(result.reconstruction.ballots[0]?.tieBreak.map((step) => step.criterion)).toEqual(steps);
  });

  it('retains every dispossessed lord and permits a dispossessed Greyfen Council win', () => {
    const dispossessedVoters = VOTERS.map((voter) => ({ ...voter, dispossessed: true }));
    const result = expectResolved(
      resolveSuccession(
        councilInput({
          bindings: [
            binding('edric', 'greyfen'),
            binding('ysabel', 'greyfen'),
            binding('oswin', 'greyfen'),
          ],
          candidates: [candidate('greyfen', 2, { dispossessed: true }), candidate('renard', 1)],
          evaluateUnboundVote: evaluator({ mara: ['renard'] }),
          voters: dispossessedVoters,
        }),
      ),
    );

    expect(result.winnerId).toBe('greyfen');
    expect(result.reconstruction.ballots[0]?.votes).toHaveLength(6);
    expect(result.reconstruction.ballots[0]?.votes.every((vote) => vote.voterDispossessed)).toBe(
      true,
    );
  });

  it('pauses for Greyfen after player elimination and never restores player victory', () => {
    const base = councilInput({
      bindings: [binding('ysabel', 'edric'), binding('oswin', 'renard')],
      candidates: [
        candidate('greyfen', 2, { claim: 30 }),
        candidate('edric', 3, { claim: 40 }),
        candidate('renard', 1, { claim: 72 }),
      ],
      evaluateUnboundVote: evaluator({ mara: ['renard'] }),
    });

    const paused = resolveSuccession(base);
    expect(paused.status).toBe('awaiting-greyfen-vote');
    if (paused.status !== 'awaiting-greyfen-vote') return;
    expect(paused.playerOutcome).toBe('lost');
    expect(paused.decision).toMatchObject({
      ballotNumber: 2,
      candidateIds: ['edric', 'renard'],
      playerCannotWin: true,
    });
    expect(paused.reconstruction.ballots[0]?.eliminatedCandidateId).toBe('greyfen');

    const finished = expectResolved(
      resolveSuccession({
        ...base,
        greyfenVote: {
          candidateId: 'edric',
          reasons: [reason('Greyfen opposed Renard', 'manual-choice')],
        },
      }),
    );
    expect(finished.winnerId).toBe('renard');
    expect(finished.playerOutcome).toBe('lost');
    expect(
      finished.reconstruction.ballots[1]?.votes.find((vote) => vote.voterId === 'greyfen'),
    ).toMatchObject({ candidateId: 'edric', source: 'manual' });
  });

  it('forces the sole legal candidate to a six-to-zero Council acclamation without pausing', () => {
    const evaluateUnboundVote = vi.fn(evaluator({}));
    const result = expectResolved(
      resolveSuccession(
        councilInput({
          candidates: [candidate('renard', 1)],
          evaluateUnboundVote,
        }),
      ),
    );

    expect(result.winnerId).toBe('renard');
    expect(result.playerOutcome).toBe('lost');
    expect(result.reconstruction.decisiveRule).toBe('sole-candidate-six-zero');
    expect(result.reconstruction.ballots[0]?.tallies).toEqual([
      { candidateId: 'renard', votes: 6 },
    ]);
    expect(
      result.reconstruction.ballots[0]?.votes.every((vote) => vote.source === 'sole-candidate'),
    ).toBe(true);
    expect(evaluateUnboundVote).not.toHaveBeenCalled();
  });

  it('is pure and byte-stable for identical external facts and evaluator results', () => {
    const input = councilInput({
      bindings: [binding('edric', 'greyfen'), binding('oswin', 'renard')],
      evaluateUnboundVote: evaluator({ mara: ['renard'], ysabel: ['greyfen'] }),
    });
    const before = JSON.stringify(input, (_key, value) =>
      typeof value === 'function' ? '[pure evaluator]' : value,
    );

    const first = resolveSuccession(input);
    const second = resolveSuccession(input);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(
      JSON.stringify(input, (_key, value) =>
        typeof value === 'function' ? '[pure evaluator]' : value,
      ),
    ).toBe(before);
  });
});
