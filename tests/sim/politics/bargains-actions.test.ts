import { describe, expect, it } from 'vitest';
import { projectPoliticalActionSemantics } from '../../../src/sim/projections/politics';
import {
  type PoliticalActionContext,
  planPoliticalAction,
} from '../../../src/sim/systems/actions/politics';
import {
  acceptBargainOffer,
  agreementProvidesPresentCollateral,
  breakAgreement,
  cancelBargainOffer,
  createBargainOffer,
  type PoliticalAssetLedger,
} from '../../../src/sim/systems/politics';

const ledger = (): PoliticalAssetLedger => ({
  acceptedAgreementIds: [],
  activeConditions: [],
  availableTroops: { greyfen: 360, edric: 620, ysabel: 240, renard: 450, oswin: 210, mara: 430 },
  completedActions: [],
  enactedPolicies: [],
  frozenGoldUntilSuccession: {},
  lockedGold: {},
  lockedTroops: {},
  reservedOffices: {},
  spendableGold: { greyfen: 100, edric: 55, ysabel: 170, renard: 110, oswin: 85, mara: 65 },
  ysabelAccessDebt: false,
});

const actionContext = (
  overrides: Partial<PoliticalActionContext> = {},
): PoliticalActionContext => ({
  activeFraudCondemnation: false,
  availableGold: 100,
  availableInfluence: 100,
  candidateDeclared: true,
  claimProjectUsage: { forgeUsed: false, researchUsed: false },
  currentDay: 20,
  eligibleVoteCandidateIds: ['renard', 'edric'],
  lastPatronizeCompletionDay: null,
  phase: 'ailing',
  playerAlreadyLost: false,
  threatHistory: [],
  ...overrides,
});

describe('bargain and collateral lifecycle', () => {
  it('does not touch collateral before acceptance and applies accepted locks atomically', () => {
    const offer = createBargainOffer({
      bargainId: 'ysabel-chancellorship',
      candidateId: 'greyfen',
      collateral: [
        { amount: 40, id: 'court-budget-40', kind: 'gold-escrow' },
        { id: 'chancellor', kind: 'office-reservation', officeId: 'chancellor' },
      ],
      createdAtDay: 10,
      expiresAtDay: 15,
      id: 'agreement-ysabel',
      reservedFutureReward: 'Chancellorship',
      supporterId: 'ysabel',
    });
    const before = ledger();
    expect(cancelBargainOffer(offer)).toMatchObject({ status: 'cancelled' });
    expect(before.spendableGold.greyfen).toBe(100);
    const accepted = acceptBargainOffer(offer, before, 12);
    expect(accepted.errors).toEqual([]);
    expect(accepted.ledger.spendableGold.greyfen).toBe(60);
    expect(accepted.ledger.lockedGold['agreement-ysabel']).toBe(40);
    expect(accepted.ledger.reservedOffices['greyfen:chancellor']).toBe('agreement-ysabel');
    if (!accepted.agreement) throw new Error('Expected accepted bargain.');
    expect(agreementProvidesPresentCollateral(accepted.agreement)).toBe(true);
    expect(accepted.offer.status).toBe('accepted');
    const replayed = acceptBargainOffer(
      structuredClone(offer),
      structuredClone(accepted.ledger),
      13,
    );
    expect(replayed.errors).toContain('offer-already-accepted');
    expect(replayed.ledger).toEqual(accepted.ledger);
  });

  it('rejects duplicate offices and never treats a future office alone as Pledge collateral', () => {
    const first = createBargainOffer({
      bargainId: 'edric-marshal',
      candidateId: 'greyfen',
      collateral: [{ id: 'marshal-1', kind: 'office-reservation', officeId: 'marshal' }],
      createdAtDay: 1,
      expiresAtDay: null,
      id: 'agreement-edric',
      reservedFutureReward: 'Marshalship',
      supporterId: 'edric',
    });
    const accepted = acceptBargainOffer(first, ledger(), 2);
    if (!accepted.agreement) throw new Error('Expected accepted bargain.');
    expect(agreementProvidesPresentCollateral(accepted.agreement)).toBe(false);
    const duplicate = createBargainOffer({
      bargainId: 'edric-marshal',
      candidateId: 'greyfen',
      collateral: [{ id: 'marshal-2', kind: 'office-reservation', officeId: 'marshal' }],
      createdAtDay: 3,
      expiresAtDay: null,
      id: 'agreement-mara',
      reservedFutureReward: 'Marshalship',
      supporterId: 'edric',
    });
    expect(acceptBargainOffer(duplicate, accepted.ledger, 4).errors).toContain(
      'office-already-reserved:marshal',
    );
    const promiseSpam = createBargainOffer({
      bargainId: 'edric-marshal',
      candidateId: 'greyfen',
      collateral: [
        { id: 'marshal-spam-1', kind: 'office-reservation', officeId: 'marshal' },
        { id: 'marshal-spam-2', kind: 'office-reservation', officeId: 'marshal' },
      ],
      createdAtDay: 3,
      expiresAtDay: null,
      id: 'agreement-spam',
      reservedFutureReward: 'Marshalship twice',
      supporterId: 'edric',
    });
    const spamResult = acceptBargainOffer(promiseSpam, ledger(), 4);
    expect(spamResult.errors).toContain('duplicate-office-in-offer:marshal');
    expect(spamResult.ledger).toEqual(ledger());

    const incompatiblePolicies = createBargainOffer({
      bargainId: 'mara-greyfen-charter',
      candidateId: 'greyfen',
      collateral: [
        {
          id: 'charter',
          incompatiblePolicyIds: ['church-immunities'],
          kind: 'policy-concession',
          policyId: 'greyfen-charter',
        },
        {
          id: 'immunities',
          incompatiblePolicyIds: ['greyfen-charter'],
          kind: 'policy-concession',
          policyId: 'church-immunities',
        },
      ],
      createdAtDay: 4,
      expiresAtDay: null,
      id: 'agreement-incompatible',
      reservedFutureReward: null,
      supporterId: 'mara',
    });
    const incompatibleResult = acceptBargainOffer(incompatiblePolicies, ledger(), 5);
    expect(incompatibleResult.errors).toContain('policy-incompatible-in-offer:greyfen-charter');
    expect(incompatibleResult.agreement).toBeNull();
    expect(incompatibleResult.ledger.enactedPolicies).toEqual([]);
  });

  it('applies canonical escrow outcomes when either participant breaks', () => {
    const offer = createBargainOffer({
      bargainId: 'ysabel-escrow',
      candidateId: 'greyfen',
      collateral: [{ amount: 80, id: 'escrow', kind: 'gold-escrow' }],
      createdAtDay: 1,
      expiresAtDay: null,
      id: 'agreement-break',
      reservedFutureReward: null,
      supporterId: 'ysabel',
    });
    const accepted = acceptBargainOffer(offer, ledger(), 2);
    if (!accepted.agreement) throw new Error('Expected accepted bargain.');
    const supporterBreak = breakAgreement(accepted.agreement, accepted.ledger, 'ysabel');
    expect(supporterBreak.ledger.spendableGold.greyfen).toBe(60);
    expect(supporterBreak.ledger.frozenGoldUntilSuccession['agreement-break']).toBe(40);
    expect(supporterBreak.consequences).toEqual({
      oathbreaker: true,
      partnerRelationshipDelta: -25,
      prestigeDelta: -8,
    });

    const acceptedAgain = acceptBargainOffer(offer, ledger(), 2);
    if (!acceptedAgain.agreement) throw new Error('Expected accepted bargain.');
    const claimantBreak = breakAgreement(acceptedAgain.agreement, acceptedAgain.ledger, 'greyfen');
    expect(claimantBreak.ledger.spendableGold.ysabel).toBe(250);
    expect(claimantBreak.ledger.lockedGold['agreement-break']).toBeUndefined();
  });

  it('rejects an authored bargain offered to the wrong lord', () => {
    expect(() =>
      createBargainOffer({
        bargainId: 'mara-greyfen-charter',
        candidateId: 'greyfen',
        collateral: [{ id: 'charter', kind: 'policy-concession', policyId: 'greyfen-charter' }],
        createdAtDay: 1,
        expiresAtDay: null,
        id: 'wrong-target',
        reservedFutureReward: null,
        supporterId: 'edric',
      }),
    ).toThrow(/authored only for mara/);
    expect(
      planPoliticalAction(
        {
          action: 'offer-bargain',
          actorId: 'greyfen',
          bargainId: 'mara-greyfen-charter',
          id: 'wrong-target-plan',
          targetId: 'edric',
        },
        actionContext(),
      ),
    ).toMatchObject({ ok: false, reason: 'bargain-target-mismatch' });
  });

  it('enforces authored collateral, Access Debt, and Leaning-only concessions', () => {
    const underpriced = createBargainOffer({
      bargainId: 'ysabel-escrow',
      candidateId: 'greyfen',
      collateral: [{ amount: 1, id: 'underpriced', kind: 'gold-escrow' }],
      createdAtDay: 1,
      expiresAtDay: null,
      id: 'underpriced-ysabel',
      reservedFutureReward: null,
      supporterId: 'ysabel',
    });
    expect(acceptBargainOffer(underpriced, ledger(), 2).errors).toContain(
      'bargain-collateral-mismatch:ysabel-escrow',
    );

    const baseEscrow = createBargainOffer({
      ...underpriced,
      collateral: [{ amount: 80, id: 'escrow-80', kind: 'gold-escrow' }],
      id: 'base-ysabel',
    });
    expect(
      acceptBargainOffer(baseEscrow, { ...ledger(), ysabelAccessDebt: true }, 2).errors,
    ).toContain('bargain-collateral-mismatch:ysabel-escrow');
    const debtEscrow = createBargainOffer({
      ...baseEscrow,
      collateral: [{ amount: 100, id: 'escrow-100', kind: 'gold-escrow' }],
      id: 'debt-ysabel',
    });
    const debtLedger = {
      ...ledger(),
      spendableGold: { ...ledger().spendableGold, greyfen: 120 },
      ysabelAccessDebt: true,
    };
    const debtAccepted = acceptBargainOffer(debtEscrow, debtLedger, 2);
    expect(debtAccepted.errors).toEqual([]);
    expect(debtAccepted.ledger.ysabelAccessDebt).toBe(false);

    const denounce = createBargainOffer({
      bargainId: 'mara-denounce-central-rule',
      candidateId: 'greyfen',
      collateral: [
        {
          id: 'denounce',
          kind: 'policy-concession',
          policyId: 'denounce-central-rule',
        },
      ],
      createdAtDay: 1,
      expiresAtDay: null,
      id: 'denounce-mara',
      reservedFutureReward: null,
      supporterId: 'mara',
    });
    const denounceAccepted = acceptBargainOffer(denounce, ledger(), 2);
    if (!denounceAccepted.agreement) throw new Error('Expected accepted denouncement.');
    expect(agreementProvidesPresentCollateral(denounceAccepted.agreement)).toBe(false);
  });

  it('locks both sides of Joint Campaign atomically and releases both through the Agreement', () => {
    const offer = createBargainOffer({
      bargainId: 'edric-joint-campaign',
      candidateId: 'greyfen',
      collateral: [
        { amount: 100, id: 'greyfen-100', kind: 'troop-lock', ownerId: 'greyfen' },
        { amount: 100, id: 'edric-100', kind: 'troop-lock', ownerId: 'edric' },
      ],
      createdAtDay: 5,
      expiresAtDay: null,
      id: 'joint-campaign',
      reservedFutureReward: null,
      supporterId: 'edric',
    });
    const insufficient = {
      ...ledger(),
      availableTroops: { ...ledger().availableTroops, edric: 99 },
    };
    const rejected = acceptBargainOffer(offer, insufficient, 6);
    expect(rejected.errors).toContain('insufficient-troops:edric');
    expect(rejected.ledger).toEqual(insufficient);

    const accepted = acceptBargainOffer(offer, ledger(), 6);
    expect(accepted.errors).toEqual([]);
    expect(accepted.ledger.availableTroops).toMatchObject({ edric: 520, greyfen: 260 });
    expect(accepted.ledger.lockedTroops['joint-campaign']).toEqual({
      edric: 100,
      greyfen: 100,
    });
    if (!accepted.agreement) throw new Error('Expected Joint Campaign agreement.');
    const released = breakAgreement(
      structuredClone(accepted.agreement),
      structuredClone(accepted.ledger),
      'greyfen',
    );
    expect(released.ledger.availableTroops).toMatchObject({ edric: 620, greyfen: 360 });
  });

  it('rejects authored incompatible conditions before applying collateral', () => {
    const offer = createBargainOffer({
      bargainId: 'ysabel-escrow',
      candidateId: 'greyfen',
      collateral: [{ amount: 80, id: 'escrow', kind: 'gold-escrow' }],
      createdAtDay: 1,
      expiresAtDay: null,
      id: 'debtor-escrow',
      reservedFutureReward: null,
      supporterId: 'ysabel',
    });
    const defaulted = { ...ledger(), activeConditions: ['defaulted-debtor'] as const };
    const result = acceptBargainOffer(offer, defaulted, 2);
    expect(result.errors).toContain('bargain-incompatible-condition:defaulted-debtor');
    expect(result.agreement).toBeNull();
    expect(result.ledger).toEqual(defaulted);
  });
});

describe('political action handlers and presentation semantics', () => {
  it('keeps ordinary sealed confirmation distinct from destructive agreement breaking', () => {
    expect(projectPoliticalActionSemantics('offer-bargain')).toEqual({
      destructive: false,
      hostile: false,
      intent: 'confirm',
      literalColor: null,
    });
    expect(projectPoliticalActionSemantics('break-agreement')).toEqual({
      destructive: true,
      hostile: false,
      intent: 'destructive',
      literalColor: null,
    });
    expect(projectPoliticalActionSemantics('threaten')).toMatchObject({
      destructive: false,
      hostile: true,
      intent: 'hostile',
    });
  });

  it('charges negotiation only at bargain start and accepts typed external leverage/secret facts', () => {
    const bargain = planPoliticalAction(
      {
        action: 'offer-bargain',
        actorId: 'greyfen',
        bargainId: 'mara-greyfen-charter',
        id: 'order-1',
        targetId: 'mara',
      },
      actionContext(),
    );
    expect(bargain.effectsAtStart).toEqual([{ amount: 8, kind: 'charge-influence' }]);
    expect(bargain.effectsAtStart).not.toContainEqual(
      expect.objectContaining({ kind: 'charge-gold' }),
    );
    expect(
      planPoliticalAction(
        {
          action: 'offer-bargain',
          actorId: 'greyfen',
          bargainId: 'mara-greyfen-charter',
          id: 'deathbed-bargain',
          targetId: 'mara',
        },
        actionContext({ phase: 'deathbed' }),
      ).completesAtDay,
    ).toBe(21);
    expect(
      planPoliticalAction(
        {
          action: 'offer-bargain',
          actorId: 'greyfen',
          bargainId: 'mara-greyfen-charter',
          id: 'order-locked',
          targetId: 'mara',
        },
        actionContext({ candidateDeclared: false }),
      ),
    ).toMatchObject({ ok: false, reason: 'candidate-not-declared' });

    const invalidThreat = planPoliticalAction(
      {
        action: 'threaten',
        actorId: 'greyfen',
        id: 'order-2',
        leverage: {
          leverageId: 'army-westmarch',
          source: 'military',
          valid: false,
          visibility: 'public',
        },
        targetId: 'mara',
      },
      actionContext(),
    );
    expect(invalidThreat).toMatchObject({ ok: false, reason: 'leverage-invalid-at-start' });

    const repeatedThreat = planPoliticalAction(
      {
        action: 'threaten',
        actorId: 'greyfen',
        id: 'order-repeat-threat',
        leverage: {
          leverageId: 'army-westmarch',
          source: 'military',
          valid: true,
          visibility: 'public',
        },
        targetId: 'mara',
      },
      actionContext({
        threatHistory: [{ leverageId: 'army-westmarch', phase: 'ailing', targetId: 'mara' }],
      }),
    );
    expect(repeatedThreat).toMatchObject({
      ok: false,
      reason: 'threat-target-already-attempted',
    });

    expect(
      planPoliticalAction(
        { action: 'patronize-church', actorId: 'greyfen', id: 'repeat-patronage' },
        actionContext({ lastPatronizeCompletionDay: 10 }),
      ),
    ).toMatchObject({ effectsAtStart: [], ok: false, reason: 'patronage-cooldown' });

    const expose = planPoliticalAction(
      {
        action: 'expose-secret',
        actorId: 'greyfen',
        id: 'order-3',
        secret: {
          discovered: true,
          exposed: false,
          secretId: 'renard-questioned-paternity',
          targetId: 'renard',
        },
      },
      actionContext({ phase: 'deathbed' }),
    );
    expect(expose).toMatchObject({ completesAtDay: 21, ok: true, revalidateAtResolution: true });
  });

  it('records Greyfen’s historical vote only after player loss and cannot restore victory', () => {
    const vote = planPoliticalAction(
      { action: 'cast-greyfens-vote', actorId: 'greyfen', candidateId: 'edric', id: 'vote-1' },
      actionContext({ playerAlreadyLost: true }),
    );
    expect(vote.effectsAtResolution).toEqual([
      { candidateId: 'edric', kind: 'record-greyfen-vote', playerRemainsLost: true },
    ]);
  });
});
