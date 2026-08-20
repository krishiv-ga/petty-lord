import { describe, expect, it } from 'vitest';
import type { ChurchStateId, ClaimBandId, LordId } from '../../../src/contracts/ids';
import {
  type CandidateEvaluationInput,
  chooseCouncilVote,
  choosePreference,
  type DeclarationPrecedence,
  evaluateCandidate,
} from '../../../src/sim/systems/politics';

const candidate = (
  voterId: LordId,
  candidateId: LordId,
  relationshipValue: number,
  claimBand: ClaimBandId,
  churchState: ChurchStateId = 'neutral',
): CandidateEvaluationInput => ({
  bargainStage: 'none',
  bindingSupport: 'none',
  candidateId,
  churchState,
  claimBand,
  declarationDay: candidateId === 'renard' ? 1 : 2,
  desireFlags: {},
  knownThreatBand: 'low',
  proofState: 'not-required',
  redLines: [],
  relationshipValue,
  viability: {
    capitalControlled: false,
    dispossessed: false,
    majorDefeatRecent: false,
    majorVictoryRecent: false,
    supportStanding: 'none',
  },
  voterId,
});

describe('exact authored candidate evaluation', () => {
  it('reproduces every canonical opening private position exactly', () => {
    const declarations = new Map<LordId, DeclarationPrecedence>([
      ['renard', { day: 1, sequenceId: 1 }],
      ['greyfen', { day: 2, sequenceId: 2 }],
    ]);
    const ysabelRenard = evaluateCandidate(candidate('ysabel', 'renard', 20, 'excellent'));
    const ysabelGreyfen = evaluateCandidate(candidate('ysabel', 'greyfen', 5, 'dubious'));
    expect(ysabelRenard.total).toBe(16);
    expect(choosePreference([ysabelRenard, ysabelGreyfen], declarations, 'renard')).toMatchObject({
      bestCandidateId: 'renard',
      decision: 'lean',
      lead: 24,
    });

    const oswinRenard = evaluateCandidate(candidate('oswin', 'renard', 15, 'excellent'));
    const oswinGreyfen = evaluateCandidate(candidate('oswin', 'greyfen', 0, 'dubious'));
    expect(oswinRenard.total).toBe(17);
    expect(choosePreference([oswinRenard, oswinGreyfen], declarations, 'renard')).toMatchObject({
      bestCandidateId: 'renard',
      decision: 'lean',
      lead: 31,
    });

    const maraRenard = evaluateCandidate(candidate('mara', 'renard', -30, 'excellent'));
    const maraGreyfen = evaluateCandidate(candidate('mara', 'greyfen', 10, 'dubious'));
    expect([maraRenard.total, maraGreyfen.total]).toEqual([-6, 2]);
    expect(choosePreference([maraRenard, maraGreyfen], declarations, null)).toMatchObject({
      bestCandidateId: null,
      decision: 'unalign',
    });

    const edricRenard = evaluateCandidate(candidate('edric', 'renard', -20, 'excellent'));
    const edricGreyfen = evaluateCandidate(candidate('edric', 'greyfen', 0, 'dubious'));
    expect([edricRenard.total, edricGreyfen.total]).toEqual([6, -7]);
    expect(choosePreference([edricRenard, edricGreyfen], declarations, null)).toMatchObject({
      bestCandidateId: null,
      decision: 'unalign',
    });
  });

  it('uses each lord’s authored desire, fear and legitimacy rules', () => {
    const edric = evaluateCandidate({
      ...candidate('edric', 'greyfen', 25, 'strong'),
      desireFlags: {
        'major-victory-recent': true,
        'military-peer-edric': true,
        'shared-campaign-victory': true,
      },
      knownThreatBand: 'concern',
      viability: {
        capitalControlled: true,
        dispossessed: false,
        majorDefeatRecent: false,
        majorVictoryRecent: true,
        supportStanding: 'voluntary-pledge',
      },
    });
    expect(edric.components).toEqual({
      bargain: 0,
      desireAndConduct: 25,
      fear: 3,
      legitimacy: 2,
      relationship: 5,
      viability: 17,
    });
    expect(edric.orderedReasons[0]?.category).toBe('desire-conduct');

    const ysabelProtected = evaluateCandidate({
      ...candidate('ysabel', 'greyfen', 0, 'plausible'),
      desireFlags: { 'active-troop-protection': true },
      knownThreatBand: 'serious',
    });
    const ysabelUnprotected = evaluateCandidate({
      ...candidate('ysabel', 'greyfen', 0, 'plausible'),
      knownThreatBand: 'serious',
    });
    expect(ysabelProtected.components.fear).toBe(4);
    expect(ysabelUnprotected.components.fear).toBe(-6);

    const maraLiberties = evaluateCandidate({
      ...candidate('mara', 'greyfen', 0, 'plausible'),
      bindingSupport: 'voluntary-pledge',
      desireFlags: { 'supported-provincial-liberties': true },
      proofState: 'maturing',
    });
    expect(maraLiberties.components.desireAndConduct).toBe(6);
    expect(maraLiberties.orderedReasons.slice(0, 2)).toMatchObject([
      { category: 'binding-support', id: 'binding-voluntary-pledge' },
      { category: 'proof-maturation', id: 'proof-maturing' },
    ]);

    const ysabelDefault = evaluateCandidate({
      ...candidate('ysabel', 'greyfen', 0, 'plausible'),
      desireFlags: { 'defaulted-debtor-to-ysabel': true },
    });
    expect(ysabelDefault.components.desireAndConduct).toBe(-25);
    expect(ysabelDefault.orderedReasons).toContainEqual({
      category: 'desire-conduct',
      id: 'defaulted-debtor-to-ysabel',
      value: -25,
    });
  });

  it('excludes active red lines and retains a current leaning on exact total ties', () => {
    const excluded = evaluateCandidate({
      ...candidate('mara', 'greyfen', 100, 'dubious'),
      redLines: ['mara-charter-revoked'],
    });
    expect(excluded).toMatchObject({ excluded: true, total: null });
    expect(excluded.orderedReasons[0]).toMatchObject({
      category: 'red-line',
      id: 'mara-charter-revoked',
    });

    const first = evaluateCandidate(candidate('edric', 'greyfen', 50, 'strong'));
    const second = evaluateCandidate(candidate('edric', 'renard', 50, 'strong'));
    const result = choosePreference(
      [first, second],
      new Map<LordId, DeclarationPrecedence>([
        ['greyfen', { day: 2, sequenceId: 2 }],
        ['renard', { day: 1, sequenceId: 1 }],
      ]),
      'greyfen',
    );
    expect(result.orderedCandidates[0]?.candidateId).toBe('greyfen');
    expect(result.decision).toBe('retain');
  });

  it('retains the current Leaning when a challenger lacks the eight-point switching margin', () => {
    const current = {
      ...evaluateCandidate(candidate('ysabel', 'renard', 0, 'plausible')),
      total: 14,
    };
    const challenger = {
      ...evaluateCandidate(candidate('ysabel', 'greyfen', 0, 'plausible')),
      total: 18,
    };
    expect(
      choosePreference(
        [current, challenger],
        new Map<LordId, DeclarationPrecedence>([
          ['renard', { day: 1, sequenceId: 1 }],
          ['greyfen', { day: 2, sequenceId: 2 }],
        ]),
        'renard',
      ),
    ).toMatchObject({ bestCandidateId: 'renard', decision: 'retain', lead: 4 });
  });

  it('never auto-evaluates Greyfen’s player-controlled vote', () => {
    expect(() => evaluateCandidate(candidate('greyfen', 'renard', 0, 'excellent'))).toThrow(
      /player-controlled/,
    );
  });

  it('forces a Council choice when every finalist is excluded using the exact fallback order', () => {
    const violent = evaluateCandidate({
      ...candidate('mara', 'renard', 100, 'excellent'),
      redLines: ['mara-centralizing-program'],
    });
    const nonviolent = evaluateCandidate({
      ...candidate('mara', 'greyfen', -50, 'dubious'),
      redLines: ['mara-charter-revoked'],
    });
    const choice = chooseCouncilVote(
      [violent, nonviolent],
      [
        {
          candidateId: 'renard',
          currentViolenceAgainstVoterSeat: true,
          declarationSequenceId: 1,
          declarationTime: 1,
          exactClaim: 72,
        },
        {
          candidateId: 'greyfen',
          currentViolenceAgainstVoterSeat: false,
          declarationSequenceId: 2,
          declarationTime: 2,
          exactClaim: 10,
        },
      ],
    );
    expect(choice).toMatchObject({
      candidateId: 'greyfen',
      usedExcludedFinalistFallback: true,
    });
    expect(choice.reasons[0]?.id).toBe('forced-choice-no-current-seat-violence');
  });

  it('uses declaration sequence before stable ID for same-time ordinary Council ties', () => {
    const renard = evaluateCandidate(candidate('mara', 'renard', 0, 'plausible'));
    const greyfen = evaluateCandidate(candidate('mara', 'greyfen', 0, 'plausible'));
    expect(
      chooseCouncilVote(
        [greyfen, renard],
        [
          {
            candidateId: 'greyfen',
            currentViolenceAgainstVoterSeat: false,
            declarationSequenceId: 2,
            declarationTime: 4,
            exactClaim: 25,
          },
          {
            candidateId: 'renard',
            currentViolenceAgainstVoterSeat: false,
            declarationSequenceId: 1,
            declarationTime: 4,
            exactClaim: 25,
          },
        ],
      ).candidateId,
    ).toBe('renard');
  });
});
