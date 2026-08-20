import { describe, expect, it } from 'vitest';
import type { ProofId } from '../../../src/contracts/ids';
import { projectSupportForObserver } from '../../../src/sim/projections/politics';
import { planPoliticalAction } from '../../../src/sim/systems/actions/politics';
import type { BargainCollateral, PoliticalAgreement } from '../../../src/sim/systems/politics';
import {
  addSupportShock,
  applyDuress,
  applyLeaningPreference,
  breakCommitment,
  commitSupport,
  createCoercionLedger,
  createPledgeStartAssessment,
  createSelfSupport,
  createUnalignedSupport,
  maturationDays,
  reevaluatePledge,
  requestVoluntaryPledge,
  revalidateAgreementSupport,
  revalidateDuress,
  setMaturationActive,
} from '../../../src/sim/systems/support';

const acceptedAgreement = (
  supporterId: PoliticalAgreement['supporterId'],
  collateral: readonly BargainCollateral[],
  id = 'agreement-1',
): PoliticalAgreement => ({
  acceptedAtDay: 1,
  bargainId:
    supporterId === 'edric'
      ? 'edric-marshal'
      : supporterId === 'mara'
        ? 'mara-greyfen-charter'
        : 'ysabel-escrow',
  candidateId: 'greyfen',
  collateral,
  fulfilledAtDay: null,
  id,
  reservedFutureReward: null,
  status: 'accepted',
  supporterId,
});

const proof = (voterId: PoliticalAgreement['supporterId'], id: ProofId) => ({
  candidateId: 'greyfen' as const,
  id,
  valid: true,
  voterId,
});

const startAssessment = (
  voterId: PoliticalAgreement['supporterId'],
  eligible: boolean,
  assessedAtDay = 0,
) => ({
  acceptedAgreementId: eligible ? 'agreement-1' : null,
  assessedAtDay,
  candidateId: 'greyfen' as const,
  eligible,
  proofIds: eligible ? (['ysabel-escrow'] as const) : [],
  voterId,
});

const maturePledge = () => {
  const leaning = applyLeaningPreference(
    createUnalignedSupport('ysabel'),
    'greyfen',
    'bargain',
    10,
  ).state;
  return requestVoluntaryPledge(leaning, {
    acceptedAgreement: acceptedAgreement('ysabel', [
      { amount: 80, id: 'escrow-1', kind: 'gold-escrow' },
    ]),
    candidateDeclared: true,
    candidateId: 'greyfen',
    currentDay: 12,
    startAssessment: startAssessment('ysabel', true, 10),
    hasActiveRedLine: false,
    phase: 'ailing',
    proofs: [proof('ysabel', 'ysabel-escrow')],
  }).state;
};

describe('support state machine', () => {
  it('matures continuously by current phase and preserves its clock through serialization', () => {
    let state = applyLeaningPreference(
      createUnalignedSupport('mara'),
      'greyfen',
      'ideological',
      10,
    ).state;
    state = setMaturationActive(state, false, 11);
    state = structuredClone(state);
    state = setMaturationActive(state, true, 13);
    expect(maturationDays(state, 14)).toBe(2);
    expect(
      requestVoluntaryPledge(state, {
        acceptedAgreement: acceptedAgreement(
          'mara',
          [{ id: 'greyfen-charter', kind: 'policy-concession', policyId: 'greyfen-charter' }],
          'charter-agreement',
        ),
        candidateDeclared: true,
        candidateId: 'greyfen',
        currentDay: 14,
        startAssessment: startAssessment('mara', false, 12),
        hasActiveRedLine: false,
        phase: 'deathbed',
        proofs: [proof('mara', 'mara-charter')],
      }).outcome,
    ).toBe('request-premature');
    expect(
      requestVoluntaryPledge(state, {
        acceptedAgreement: acceptedAgreement(
          'mara',
          [{ id: 'greyfen-charter', kind: 'policy-concession', policyId: 'greyfen-charter' }],
          'charter-agreement',
        ),
        candidateDeclared: true,
        candidateId: 'greyfen',
        currentDay: 16,
        startAssessment: startAssessment('mara', true, 14),
        hasActiveRedLine: false,
        phase: 'deathbed',
        proofs: [proof('mara', 'mara-charter')],
      }).outcome,
    ).toBe('pledged');
  });

  it('never turns a promise without Proof and present collateral into a voluntary Pledge', () => {
    const leaning = applyLeaningPreference(
      createUnalignedSupport('edric'),
      'greyfen',
      'bargain',
      1,
    ).state;
    const result = requestVoluntaryPledge(leaning, {
      acceptedAgreement: acceptedAgreement(
        'edric',
        [{ id: 'future-marshal', kind: 'office-reservation', officeId: 'marshal' }],
        'marshal-promise',
      ),
      candidateDeclared: true,
      candidateId: 'greyfen' as const,
      currentDay: 10,
      startAssessment: startAssessment('edric', false, 8),
      hasActiveRedLine: false,
      phase: 'ailing',
      proofs: [proof('edric', 'edric-military-peer')],
    });
    expect(result.outcome).toBe('request-premature');
    expect(result.consequences.relationshipDelta).toBe(-4);
    expect(result.state.refusalUntilDay).toBe(17);
    expect(
      requestVoluntaryPledge(result.state, {
        acceptedAgreement: acceptedAgreement(
          'edric',
          [{ amount: 150, id: 'troops-150', kind: 'troop-lock', ownerId: 'greyfen' }],
          'border-aid',
        ),
        candidateDeclared: true,
        candidateId: 'greyfen',
        currentDay: 12,
        startAssessment: startAssessment('edric', false, 10),
        hasActiveRedLine: false,
        phase: 'ailing',
        proofs: [proof('edric', 'edric-border-aid')],
      }).outcome,
    ).toBe('request-refused-cooldown');

    const unaligned = applyLeaningPreference(result.state, null, null, 11).state;
    expect(unaligned.refusalUntilDay).toBe(17);
    const churned = applyLeaningPreference(unaligned, 'greyfen', 'bargain', 11).state;
    expect(
      requestVoluntaryPledge(churned, {
        acceptedAgreement: acceptedAgreement(
          'edric',
          [{ amount: 150, id: 'troops-150', kind: 'troop-lock', ownerId: 'greyfen' }],
          'border-aid',
        ),
        candidateDeclared: true,
        candidateId: 'greyfen',
        currentDay: 12,
        startAssessment: startAssessment('edric', false, 10),
        hasActiveRedLine: false,
        phase: 'ailing',
        proofs: [proof('edric', 'edric-border-aid')],
      }).outcome,
    ).toBe('request-refused-cooldown');
  });

  it('hardens Pledges by phase and expires unrelated numeric shocks', () => {
    let pledged = maturePledge();
    pledged = addSupportShock(pledged, {
      automaticBreaker: false,
      createdAtDay: 13,
      id: 'defeat',
      shockId: 'major-defeat',
      value: 10,
    });
    expect(
      reevaluatePledge(pledged, {
        alternativeLead: 10,
        currentDay: 14,
        phase: 'ailing',
      }).outcome,
    ).toBe('pledge-broken');
    expect(
      reevaluatePledge(pledged, {
        alternativeLead: 10,
        currentDay: 14,
        phase: 'gravely-ill',
      }).outcome,
    ).toBe('no-change');
    expect(
      reevaluatePledge(pledged, {
        alternativeLead: 99,
        currentDay: 23,
        phase: 'ailing',
      }).outcome,
    ).toBe('no-change');
  });

  it('lets Commitment survive ordinary shocks and break only through authored breakers', () => {
    const committed = commitSupport(maturePledge(), {
      id: 'battle-westmarch',
      kind: 'joint-battle-victory',
      occurredAtDay: 13,
    }).state;
    const shocked = addSupportShock(committed, {
      automaticBreaker: false,
      createdAtDay: 14,
      id: 'major-defeat',
      shockId: 'major-defeat',
      value: 100,
    });
    expect(
      reevaluatePledge(shocked, {
        alternativeLead: 100,
        currentDay: 14,
        phase: 'ailing',
      }).outcome,
    ).toBe('no-change');
    expect(breakCommitment(shocked, 'red-line', 15).outcome).toBe('pledge-broken');
  });

  it('releases Under Duress with lost leverage and preserves private blackmail visibility', () => {
    const coerced = applyDuress(
      createUnalignedSupport('ysabel'),
      {
        candidateId: 'greyfen',
        currentDay: 20,
        leverageId: 'secret-renard-ledger',
        leverageValid: true,
        source: 'secret',
        visibility: 'private',
      },
      createCoercionLedger(),
    ).state;
    expect(projectSupportForObserver(coerced, 'oswin')).toMatchObject({
      basis: 'known-voluntary',
      level: 'pledged',
      private: false,
    });
    expect(projectSupportForObserver(coerced, 'greyfen', true)).toMatchObject({
      basis: 'secretly-coerced',
      level: 'pledged',
    });
    const released = revalidateDuress(coerced, 21, () => false);
    expect(released).toMatchObject({ outcome: 'duress-released', state: { level: 'unaligned' } });

    const publicDuress = applyDuress(
      createUnalignedSupport('mara'),
      {
        candidateId: 'greyfen',
        currentDay: 20,
        leverageId: 'occupation-westmarch',
        leverageValid: true,
        source: 'occupation',
        visibility: 'public',
      },
      createCoercionLedger(),
    ).state;
    expect(projectSupportForObserver(publicDuress, 'oswin')).toMatchObject({
      basis: 'known-coercion',
      level: 'under-duress',
    });
  });

  it('spends a secret after one successful blackmail agreement', () => {
    const first = applyDuress(
      createUnalignedSupport('ysabel'),
      {
        candidateId: 'greyfen',
        currentDay: 20,
        leverageId: 'single-secret',
        leverageValid: true,
        source: 'secret',
        visibility: 'private',
      },
      createCoercionLedger(),
    );
    const second = applyDuress(
      createUnalignedSupport('mara'),
      {
        candidateId: 'greyfen',
        currentDay: 21,
        leverageId: 'single-secret',
        leverageValid: true,
        source: 'secret',
        visibility: 'private',
      },
      structuredClone(first.coercionLedger),
    );
    expect(first.outcome).toBe('duress-applied');
    expect(second.outcome).toBe('leverage-already-spent');
    expect(second.state.level).toBe('unaligned');
  });

  it('never coerces candidate self-support and hides private Leaning without intelligence', () => {
    const self = createSelfSupport('renard', 1);
    expect(
      applyDuress(
        self,
        {
          candidateId: 'greyfen',
          currentDay: 2,
          leverageId: 'capital-occupation',
          leverageValid: true,
          source: 'occupation',
          visibility: 'public',
        },
        createCoercionLedger(),
      ).outcome,
    ).toBe('blocked-by-self-support');

    const leaning = applyLeaningPreference(
      createUnalignedSupport('mara'),
      'greyfen',
      'ideological',
      3,
    ).state;
    expect(projectSupportForObserver(leaning, 'greyfen')).toMatchObject({
      basis: 'unknown',
      candidateId: null,
      level: 'unaligned',
    });
    expect(projectSupportForObserver(leaning, 'greyfen', true)).toMatchObject({
      candidateId: 'greyfen',
      level: 'leaning',
    });
  });

  it('requires Proof to belong to the requesting voter and candidate', () => {
    const leaning = applyLeaningPreference(
      createUnalignedSupport('ysabel'),
      'greyfen',
      'bargain',
      1,
    ).state;
    expect(
      requestVoluntaryPledge(leaning, {
        acceptedAgreement: acceptedAgreement('ysabel', [
          { amount: 80, id: 'escrow', kind: 'gold-escrow' },
        ]),
        candidateDeclared: true,
        candidateId: 'greyfen',
        currentDay: 3,
        startAssessment: startAssessment('ysabel', false, 1),
        hasActiveRedLine: false,
        phase: 'ailing',
        proofs: [proof('ysabel', 'fake-proof' as ProofId)],
      }).outcome,
    ).toBe('request-premature');
  });

  it('treats a valid-at-start Request that later loses Proof as external invalidation', () => {
    const leaning = applyLeaningPreference(
      createUnalignedSupport('ysabel'),
      'greyfen',
      'bargain',
      1,
    ).state;
    const agreement = acceptedAgreement('ysabel', [
      { amount: 80, id: 'escrow', kind: 'gold-escrow' },
    ]);
    const startFacts = {
      acceptedAgreement: agreement,
      candidateDeclared: true,
      candidateId: 'greyfen' as const,
      hasActiveRedLine: false,
      phase: 'ailing' as const,
      proofs: [proof('ysabel', 'ysabel-escrow')],
    };
    const assessment = createPledgeStartAssessment(leaning, startFacts, 3);
    expect(assessment.eligible).toBe(true);
    const planned = structuredClone(
      planPoliticalAction(
        {
          action: 'request-declaration',
          actorId: 'greyfen',
          id: 'request-ysabel',
          startAssessment: assessment,
          targetId: 'ysabel',
        },
        {
          activeFraudCondemnation: false,
          availableGold: 100,
          availableInfluence: 100,
          candidateDeclared: true,
          claimProjectUsage: { forgeUsed: false, researchUsed: false },
          currentDay: 3,
          eligibleVoteCandidateIds: [],
          lastPatronizeCompletionDay: null,
          phase: 'ailing',
          playerAlreadyLost: false,
          threatHistory: [],
        },
      ),
    );
    const resolutionEffect = planned.effectsAtResolution.find(
      (effect) => effect.kind === 'request-pledge-resolution',
    );
    if (resolutionEffect?.kind !== 'request-pledge-resolution') {
      throw new Error('Expected serialized Request resolution assessment.');
    }
    const result = requestVoluntaryPledge(leaning, {
      ...startFacts,
      currentDay: 5,
      proofs: [],
      startAssessment: resolutionEffect.startAssessment,
    });
    expect(result).toMatchObject({
      consequences: { relationshipDelta: -2 },
      outcome: 'request-invalidated',
      state: { refusalUntilDay: null },
    });
  });

  it('fails a Request begun prematurely even if maturation completes during the Order', () => {
    const leaning = applyLeaningPreference(
      createUnalignedSupport('ysabel'),
      'greyfen',
      'bargain',
      1,
    ).state;
    const facts = {
      acceptedAgreement: acceptedAgreement('ysabel', [
        { amount: 80, id: 'escrow', kind: 'gold-escrow' },
      ]),
      candidateDeclared: true,
      candidateId: 'greyfen' as const,
      hasActiveRedLine: false,
      phase: 'ailing' as const,
      proofs: [proof('ysabel', 'ysabel-escrow')],
    };
    const start = createPledgeStartAssessment(leaning, facts, 2);
    expect(start.eligible).toBe(false);
    expect(
      requestVoluntaryPledge(leaning, {
        ...facts,
        currentDay: 4,
        startAssessment: start,
      }),
    ).toMatchObject({
      consequences: { relationshipDelta: -4 },
      outcome: 'request-premature',
      state: { refusalUntilDay: 11 },
    });
  });

  it('releases binding Support when its accepted Agreement terminates', () => {
    const pledged = maturePledge();
    const agreement = acceptedAgreement('ysabel', [
      { amount: 80, id: 'escrow-1', kind: 'gold-escrow' },
    ]);
    expect(revalidateAgreementSupport(pledged, { agreement, currentDay: 13 }).outcome).toBe(
      'no-change',
    );
    expect(
      revalidateAgreementSupport(pledged, {
        agreement: { ...agreement, status: 'breached' },
        currentDay: 13,
      }),
    ).toMatchObject({
      cause: 'agreement-breached',
      outcome: 'pledge-broken',
      state: { agreementId: null, level: 'unaligned' },
    });

    const committed = commitSupport(pledged, {
      id: 'joint-victory',
      kind: 'joint-battle-victory',
      occurredAtDay: 13,
    }).state;
    expect(
      revalidateAgreementSupport(committed, {
        agreement: { ...agreement, status: 'released' },
        currentDay: 14,
      }),
    ).toMatchObject({
      cause: 'agreement-released',
      outcome: 'no-change',
      state: { agreementId: null, level: 'committed' },
    });
    expect(() =>
      revalidateAgreementSupport(pledged, {
        agreement: { ...agreement, supporterId: 'mara' },
        currentDay: 14,
      }),
    ).toThrow(/mismatched participants/);
  });
});
