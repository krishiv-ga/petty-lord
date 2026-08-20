import { describe, expect, it } from 'vitest';
import {
  applyRenardAutomaticDeclaration,
  canEdricDeclare,
  createCandidateStatus,
  legalCandidates,
  resolvePlayerDeclaration,
  withdrawRenard,
} from '../../../src/sim/systems/politics';

describe('candidacy constitution', () => {
  it('declares Renard automatically at Ailing and resolves irreversible player declaration', () => {
    expect(
      applyRenardAutomaticDeclaration(createCandidateStatus('renard'), 'stable', 1).declared,
    ).toBe(false);
    expect(
      applyRenardAutomaticDeclaration(createCandidateStatus('renard'), 'ailing', 14),
    ).toMatchObject({ declarationDay: 14, declared: true, eligible: true });

    const laughable = resolvePlayerDeclaration({
      candidate: createCandidateStatus('greyfen'),
      claim: 9,
      costPaidAtStart: true,
      currentDay: 15,
      phase: 'ailing',
    });
    expect(laughable).toMatchObject({
      effects: {
        laughablePretender: true,
        prestigeDelta: -5,
        renardRivalReaction: true,
      },
      ok: true,
    });
    expect(
      resolvePlayerDeclaration({
        candidate: laughable.candidate,
        claim: 50,
        costPaidAtStart: true,
        currentDay: 16,
        phase: 'ailing',
      }).reason,
    ).toMatch(/irreversible/);
  });

  it('prevents Edric candidacy while any valid Pledge exists, including duress', () => {
    const base = {
      availableOrContractedTroops: 500,
      phase: 'gravely-ill' as const,
      prestige: 50,
      renardPledgedOrCommittedSupporters: 1,
    };
    expect(canEdricDeclare({ ...base, hasAnyValidPledge: false })).toBe(true);
    expect(canEdricDeclare({ ...base, hasAnyValidPledge: true })).toBe(false);
  });

  it('allows Renard withdrawal only through the complete authored leverage gate', () => {
    const declared = applyRenardAutomaticDeclaration(createCandidateStatus('renard'), 'ailing', 10);
    expect(
      withdrawRenard(declared, {
        availableMilitary: 149,
        capitalControlledByDemandingClaimant: true,
        southmereOccupied: false,
        successfulThreat: true,
        validSupporters: 0,
      }),
    ).toMatchObject({ eligible: false, withdrawn: true });
    expect(
      withdrawRenard(declared, {
        availableMilitary: 149,
        capitalControlledByDemandingClaimant: true,
        southmereOccupied: false,
        successfulThreat: true,
        validSupporters: 1,
      }).eligible,
    ).toBe(true);
  });

  it('returns only declared, non-withdrawn legal candidates in stable order', () => {
    const renard = applyRenardAutomaticDeclaration(createCandidateStatus('renard'), 'ailing', 10);
    const greyfen = resolvePlayerDeclaration({
      candidate: createCandidateStatus('greyfen'),
      claim: 25,
      costPaidAtStart: true,
      currentDay: 12,
      phase: 'ailing',
    }).candidate;
    expect(
      legalCandidates([greyfen, createCandidateStatus('edric'), renard]).map(
        ({ lordId }) => lordId,
      ),
    ).toEqual(['renard', 'greyfen']);
  });
});
