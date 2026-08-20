import type { BargainId, ConditionId, LordId, OfficeId, PolicyId } from '@contracts/ids';

type CollateralBase = { readonly id: string };

export type BargainCollateral =
  | (CollateralBase & { readonly amount: number; readonly kind: 'gold-escrow' | 'gold-payment' })
  | (CollateralBase & {
      readonly amount: number;
      readonly kind: 'troop-lock';
      readonly ownerId: LordId;
    })
  | (CollateralBase & { readonly kind: 'office-reservation'; readonly officeId: OfficeId })
  | (CollateralBase & {
      readonly incompatiblePolicyIds?: readonly PolicyId[];
      readonly kind: 'policy-concession';
      readonly policyId: PolicyId;
    })
  | (CollateralBase & {
      readonly actionId: string;
      readonly kind: 'completed-action' | 'public-renunciation' | 'shared-risk';
    });

export type BargainOffer = {
  readonly bargainId: BargainId;
  readonly candidateId: LordId;
  readonly collateral: readonly BargainCollateral[];
  readonly createdAtDay: number;
  readonly expiresAtDay: number | null;
  readonly id: string;
  readonly reservedFutureReward: string | null;
  readonly status: 'accepted' | 'cancelled' | 'offered';
  readonly supporterId: LordId;
};

export type AgreementStatus = 'accepted' | 'breached' | 'collapsed' | 'fulfilled' | 'released';

export type PoliticalAgreement = {
  readonly acceptedAtDay: number;
  readonly bargainId: BargainId;
  readonly candidateId: LordId;
  readonly collateral: readonly BargainCollateral[];
  readonly fulfilledAtDay: number | null;
  readonly id: string;
  readonly reservedFutureReward: string | null;
  readonly status: AgreementStatus;
  readonly supporterId: LordId;
};

export type PoliticalAssetLedger = {
  readonly acceptedAgreementIds: readonly string[];
  readonly activeConditions: readonly ConditionId[];
  readonly availableTroops: Readonly<Record<LordId, number>>;
  readonly completedActions: readonly string[];
  readonly enactedPolicies: readonly PolicyId[];
  readonly frozenGoldUntilSuccession: Readonly<Record<string, number>>;
  readonly lockedGold: Readonly<Record<string, number>>;
  readonly lockedTroops: Readonly<Record<string, Readonly<Partial<Record<LordId, number>>>>>;
  readonly reservedOffices: Readonly<Record<string, string>>;
  readonly spendableGold: Readonly<Record<LordId, number>>;
  readonly ysabelAccessDebt: boolean;
};

export type BargainResult = {
  readonly agreement: PoliticalAgreement | null;
  readonly errors: readonly string[];
  readonly ledger: PoliticalAssetLedger;
  readonly offer: BargainOffer;
};

const officeKey = (candidateId: LordId, officeId: OfficeId) => `${candidateId}:${officeId}`;

const BARGAIN_TARGETS: Readonly<Record<BargainId, LordId>> = {
  'edric-border-aid': 'edric',
  'edric-joint-campaign': 'edric',
  'edric-marshal': 'edric',
  'mara-denounce-central-rule': 'mara',
  'mara-greyfen-charter': 'mara',
  'mara-provincial-aid': 'mara',
  'oswin-abbey-endowment': 'oswin',
  'oswin-church-immunities': 'oswin',
  'oswin-renunciation': 'oswin',
  'ysabel-chancellorship': 'ysabel',
  'ysabel-escrow': 'ysabel',
  'ysabel-protection': 'ysabel',
};

const BARGAIN_INCOMPATIBLE_CONDITIONS: Readonly<Record<BargainId, readonly ConditionId[]>> = {
  'edric-border-aid': ['oathbreaker'],
  'edric-joint-campaign': ['oathbreaker'],
  'edric-marshal': ['oathbreaker'],
  'mara-denounce-central-rule': [],
  'mara-greyfen-charter': ['usurper'],
  'mara-provincial-aid': [],
  'oswin-abbey-endowment': ['usurper'],
  'oswin-church-immunities': ['usurper'],
  'oswin-renunciation': ['usurper'],
  'ysabel-chancellorship': ['defaulted-debtor'],
  'ysabel-escrow': ['defaulted-debtor'],
  'ysabel-protection': ['defaulted-debtor'],
};

export function bargainTarget(bargainId: BargainId): LordId {
  return BARGAIN_TARGETS[bargainId];
}

export function createBargainOffer(input: Omit<BargainOffer, 'status'>): BargainOffer {
  if (input.candidateId === input.supporterId) {
    throw new Error('A candidate cannot offer a support bargain to themselves.');
  }
  if (bargainTarget(input.bargainId) !== input.supporterId) {
    throw new Error(`${input.bargainId} is authored only for ${bargainTarget(input.bargainId)}.`);
  }
  const collateralIds = new Set<string>();
  for (const item of input.collateral) {
    if (collateralIds.has(item.id)) throw new Error(`Duplicate collateral id ${item.id}.`);
    collateralIds.add(item.id);
  }
  return { ...input, status: 'offered' };
}

export function cancelBargainOffer(offer: BargainOffer): BargainOffer {
  if (offer.status !== 'offered') return offer;
  return { ...offer, status: 'cancelled' };
}

export function isPresentCollateral(collateral: BargainCollateral): boolean {
  return collateral.kind !== 'office-reservation';
}

export function agreementProvidesPresentCollateral(agreement: PoliticalAgreement): boolean {
  if (
    agreement.bargainId === 'edric-marshal' ||
    agreement.bargainId === 'mara-denounce-central-rule'
  ) {
    return false;
  }
  const offer: BargainOffer = {
    bargainId: agreement.bargainId,
    candidateId: agreement.candidateId,
    collateral: agreement.collateral,
    createdAtDay: agreement.acceptedAtDay,
    expiresAtDay: null,
    id: agreement.id,
    reservedFutureReward: agreement.reservedFutureReward,
    status: 'accepted',
    supporterId: agreement.supporterId,
  };
  const collateralIsAuthored =
    authoredCollateralMatches(offer, { ysabelAccessDebt: false } as PoliticalAssetLedger) ||
    authoredCollateralMatches(offer, { ysabelAccessDebt: true } as PoliticalAssetLedger);
  return collateralIsAuthored && agreement.collateral.some(isPresentCollateral);
}

function hasExactCollateralKinds(
  offer: BargainOffer,
  expectedKinds: readonly BargainCollateral['kind'][],
): boolean {
  return (
    offer.collateral.length === expectedKinds.length &&
    expectedKinds.every(
      (kind) => offer.collateral.filter((collateral) => collateral.kind === kind).length === 1,
    )
  );
}

function authoredCollateralMatches(offer: BargainOffer, ledger: PoliticalAssetLedger): boolean {
  const amount = (kind: 'gold-escrow' | 'gold-payment' | 'troop-lock') =>
    offer.collateral.find(
      (
        collateral,
      ): collateral is Extract<
        BargainCollateral,
        { kind: 'gold-escrow' | 'gold-payment' | 'troop-lock' }
      > => collateral.kind === kind,
    )?.amount;
  const troopLock = (ownerId: LordId, amountRequired: number) =>
    offer.collateral.some(
      (collateral) =>
        collateral.kind === 'troop-lock' &&
        collateral.ownerId === ownerId &&
        collateral.amount === amountRequired,
    );
  const office = offer.collateral.find(
    (collateral) => collateral.kind === 'office-reservation',
  )?.officeId;
  const policy = offer.collateral.find(
    (collateral) => collateral.kind === 'policy-concession',
  )?.policyId;
  const action = offer.collateral.find(
    (collateral) =>
      collateral.kind === 'completed-action' ||
      collateral.kind === 'public-renunciation' ||
      collateral.kind === 'shared-risk',
  );

  switch (offer.bargainId) {
    case 'edric-marshal':
      return hasExactCollateralKinds(offer, ['office-reservation']) && office === 'marshal';
    case 'edric-border-aid':
      return hasExactCollateralKinds(offer, ['troop-lock']) && troopLock(offer.candidateId, 150);
    case 'edric-joint-campaign':
      return (
        offer.collateral.length === 2 &&
        offer.collateral.every(({ kind }) => kind === 'troop-lock') &&
        troopLock(offer.candidateId, 100) &&
        troopLock(offer.supporterId, 100)
      );
    case 'ysabel-escrow':
      return (
        hasExactCollateralKinds(offer, ['gold-escrow']) &&
        amount('gold-escrow') === (ledger.ysabelAccessDebt ? 100 : 80)
      );
    case 'ysabel-chancellorship':
      return (
        hasExactCollateralKinds(offer, ['office-reservation', 'gold-escrow']) &&
        office === 'chancellor' &&
        amount('gold-escrow') === (ledger.ysabelAccessDebt ? 60 : 40)
      );
    case 'ysabel-protection':
      return (
        hasExactCollateralKinds(offer, ['troop-lock']) &&
        troopLock(offer.candidateId, ledger.ysabelAccessDebt ? 150 : 100)
      );
    case 'oswin-abbey-endowment':
      return hasExactCollateralKinds(offer, ['gold-payment']) && amount('gold-payment') === 60;
    case 'oswin-church-immunities':
      return (
        hasExactCollateralKinds(offer, ['policy-concession', 'completed-action']) &&
        policy === 'church-immunities' &&
        action?.kind === 'completed-action' &&
        action.actionId === 'patronize-church'
      );
    case 'oswin-renunciation':
      return hasExactCollateralKinds(offer, ['public-renunciation']);
    case 'mara-greyfen-charter':
      return hasExactCollateralKinds(offer, ['policy-concession']) && policy === 'greyfen-charter';
    case 'mara-denounce-central-rule':
      return (
        hasExactCollateralKinds(offer, ['policy-concession']) && policy === 'denounce-central-rule'
      );
    case 'mara-provincial-aid':
      return (
        (hasExactCollateralKinds(offer, ['troop-lock']) && troopLock(offer.candidateId, 100)) ||
        (hasExactCollateralKinds(offer, ['completed-action']) &&
          action?.kind === 'completed-action' &&
          action.actionId === 'liberate-westmarch')
      );
  }
}

function acceptanceErrors(
  offer: BargainOffer,
  ledger: PoliticalAssetLedger,
  currentDay: number,
): string[] {
  const errors: string[] = [];
  const offeredOffices = new Set<OfficeId>();
  const offeredPolicies = new Set<PolicyId>();
  const offeredPolicyCollateral = offer.collateral.filter(
    (collateral): collateral is Extract<BargainCollateral, { kind: 'policy-concession' }> =>
      collateral.kind === 'policy-concession',
  );
  if (offer.status !== 'offered') errors.push('offer-not-open');
  if (bargainTarget(offer.bargainId) !== offer.supporterId) {
    errors.push('bargain-target-mismatch');
  }
  if (!authoredCollateralMatches(offer, ledger)) {
    errors.push(`bargain-collateral-mismatch:${offer.bargainId}`);
  }
  const incompatibleCondition = BARGAIN_INCOMPATIBLE_CONDITIONS[offer.bargainId].find(
    (conditionId) => ledger.activeConditions.includes(conditionId),
  );
  if (incompatibleCondition) {
    errors.push(`bargain-incompatible-condition:${incompatibleCondition}`);
  }
  if (ledger.acceptedAgreementIds.includes(offer.id)) errors.push('offer-already-accepted');
  if (offer.expiresAtDay !== null && currentDay >= offer.expiresAtDay) errors.push('offer-expired');
  let goldRequired = 0;
  const troopsRequired: Partial<Record<LordId, number>> = {};
  for (const collateral of offer.collateral) {
    if (collateral.kind === 'gold-escrow' || collateral.kind === 'gold-payment') {
      if (collateral.amount <= 0) errors.push(`invalid-amount:${collateral.id}`);
      goldRequired += collateral.amount;
    }
    if (collateral.kind === 'troop-lock') {
      if (collateral.amount <= 0) errors.push(`invalid-amount:${collateral.id}`);
      troopsRequired[collateral.ownerId] =
        (troopsRequired[collateral.ownerId] ?? 0) + collateral.amount;
    }
    if (collateral.kind === 'office-reservation') {
      if (offeredOffices.has(collateral.officeId)) {
        errors.push(`duplicate-office-in-offer:${collateral.officeId}`);
      }
      offeredOffices.add(collateral.officeId);
      const existing = ledger.reservedOffices[officeKey(offer.candidateId, collateral.officeId)];
      if (existing && existing !== offer.id)
        errors.push(`office-already-reserved:${collateral.officeId}`);
    }
    if (collateral.kind === 'policy-concession') {
      if (offeredPolicies.has(collateral.policyId)) {
        errors.push(`duplicate-policy-in-offer:${collateral.policyId}`);
      }
      offeredPolicies.add(collateral.policyId);
      if (ledger.enactedPolicies.includes(collateral.policyId)) {
        errors.push(`policy-already-enacted:${collateral.policyId}`);
      }
      if (collateral.incompatiblePolicyIds?.some((id) => ledger.enactedPolicies.includes(id))) {
        errors.push(`policy-incompatible:${collateral.policyId}`);
      }
      if (
        collateral.incompatiblePolicyIds?.some((id) =>
          offeredPolicyCollateral.some(({ policyId }) => policyId === id),
        )
      ) {
        errors.push(`policy-incompatible-in-offer:${collateral.policyId}`);
      }
    }
    if (
      (collateral.kind === 'completed-action' ||
        collateral.kind === 'public-renunciation' ||
        collateral.kind === 'shared-risk') &&
      !ledger.completedActions.includes(collateral.actionId)
    ) {
      errors.push(`required-action-incomplete:${collateral.actionId}`);
    }
  }
  if ((ledger.spendableGold[offer.candidateId] ?? 0) < goldRequired)
    errors.push('insufficient-gold');
  for (const [ownerId, required] of Object.entries(troopsRequired) as [LordId, number][]) {
    if ((ledger.availableTroops[ownerId] ?? 0) < required) {
      errors.push(`insufficient-troops:${ownerId}`);
    }
  }
  return errors;
}

export function acceptBargainOffer(
  offer: BargainOffer,
  ledger: PoliticalAssetLedger,
  currentDay: number,
): BargainResult {
  const errors = acceptanceErrors(offer, ledger, currentDay);
  if (errors.length > 0) return { agreement: null, errors, ledger, offer };

  let goldSpent = 0;
  const troopsLocked: Partial<Record<LordId, number>> = {};
  const lockedGold = { ...ledger.lockedGold };
  const lockedTroops = { ...ledger.lockedTroops };
  const reservedOffices = { ...ledger.reservedOffices };
  const enactedPolicies = [...ledger.enactedPolicies];
  for (const collateral of offer.collateral) {
    if (collateral.kind === 'gold-escrow' || collateral.kind === 'gold-payment') {
      goldSpent += collateral.amount;
      if (collateral.kind === 'gold-escrow')
        lockedGold[offer.id] = (lockedGold[offer.id] ?? 0) + collateral.amount;
    }
    if (collateral.kind === 'troop-lock') {
      troopsLocked[collateral.ownerId] =
        (troopsLocked[collateral.ownerId] ?? 0) + collateral.amount;
    }
    if (collateral.kind === 'office-reservation') {
      reservedOffices[officeKey(offer.candidateId, collateral.officeId)] = offer.id;
    }
    if (collateral.kind === 'policy-concession') enactedPolicies.push(collateral.policyId);
  }
  const agreement: PoliticalAgreement = {
    acceptedAtDay: currentDay,
    bargainId: offer.bargainId,
    candidateId: offer.candidateId,
    collateral: [...offer.collateral],
    fulfilledAtDay: null,
    id: offer.id,
    reservedFutureReward: offer.reservedFutureReward,
    status: 'accepted',
    supporterId: offer.supporterId,
  };
  if (Object.keys(troopsLocked).length > 0) lockedTroops[offer.id] = troopsLocked;
  const availableTroops = { ...ledger.availableTroops };
  for (const [ownerId, amount] of Object.entries(troopsLocked) as [LordId, number][]) {
    availableTroops[ownerId] = (availableTroops[ownerId] ?? 0) - amount;
  }
  return {
    agreement,
    errors: [],
    ledger: {
      ...ledger,
      acceptedAgreementIds: [...ledger.acceptedAgreementIds, offer.id],
      availableTroops,
      enactedPolicies,
      lockedGold,
      lockedTroops,
      reservedOffices,
      spendableGold: {
        ...ledger.spendableGold,
        [offer.candidateId]: (ledger.spendableGold[offer.candidateId] ?? 0) - goldSpent,
      },
      ysabelAccessDebt:
        offer.supporterId === 'ysabel' && ledger.ysabelAccessDebt ? false : ledger.ysabelAccessDebt,
    },
    offer: { ...offer, status: 'accepted' },
  };
}

export function fulfillAgreement(
  agreement: PoliticalAgreement,
  currentDay: number,
): PoliticalAgreement {
  if (agreement.status !== 'accepted') return agreement;
  return { ...agreement, fulfilledAtDay: currentDay, status: 'fulfilled' };
}

function releaseLocks(
  agreement: PoliticalAgreement,
  ledger: PoliticalAssetLedger,
  goldReturn: number,
  goldRecipientId: LordId,
  frozenGold: number,
): PoliticalAssetLedger {
  const lockedGold = { ...ledger.lockedGold };
  const lockedTroops = { ...ledger.lockedTroops };
  const reservedOffices = { ...ledger.reservedOffices };
  const troops = lockedTroops[agreement.id] ?? {};
  delete lockedGold[agreement.id];
  delete lockedTroops[agreement.id];
  for (const [key, agreementId] of Object.entries(reservedOffices)) {
    if (agreementId === agreement.id) delete reservedOffices[key];
  }
  const availableTroops = { ...ledger.availableTroops };
  for (const [ownerId, amount] of Object.entries(troops) as [LordId, number][]) {
    availableTroops[ownerId] = (availableTroops[ownerId] ?? 0) + amount;
  }
  return {
    ...ledger,
    availableTroops,
    frozenGoldUntilSuccession:
      frozenGold > 0
        ? { ...ledger.frozenGoldUntilSuccession, [agreement.id]: frozenGold }
        : ledger.frozenGoldUntilSuccession,
    lockedGold,
    lockedTroops,
    reservedOffices,
    spendableGold: {
      ...ledger.spendableGold,
      [goldRecipientId]: (ledger.spendableGold[goldRecipientId] ?? 0) + goldReturn,
    },
  };
}

export function breakAgreement(
  agreement: PoliticalAgreement,
  ledger: PoliticalAssetLedger,
  breakerId: LordId,
): {
  readonly agreement: PoliticalAgreement;
  readonly ledger: PoliticalAssetLedger;
  readonly consequences: {
    readonly oathbreaker: true;
    readonly partnerRelationshipDelta: -25;
    readonly prestigeDelta: -8;
  };
} {
  if (agreement.status !== 'accepted' && agreement.status !== 'fulfilled') {
    throw new Error('Only an active agreement can be broken.');
  }
  if (breakerId !== agreement.candidateId && breakerId !== agreement.supporterId) {
    throw new Error('Only an agreement participant can break it.');
  }
  const escrow = ledger.lockedGold[agreement.id] ?? 0;
  const claimantBroke = breakerId === agreement.candidateId;
  const goldReturn = claimantBroke ? escrow : Math.floor(escrow * 0.5);
  const frozenGold = claimantBroke ? 0 : escrow - goldReturn;
  const recipient = claimantBroke ? agreement.supporterId : agreement.candidateId;
  return {
    agreement: { ...agreement, status: 'breached' },
    consequences: { oathbreaker: true, partnerRelationshipDelta: -25, prestigeDelta: -8 },
    ledger: releaseLocks(agreement, ledger, goldReturn, recipient, frozenGold),
  };
}

export function releaseAgreement(
  agreement: PoliticalAgreement,
  ledger: PoliticalAssetLedger,
  status: 'collapsed' | 'released',
): { readonly agreement: PoliticalAgreement; readonly ledger: PoliticalAssetLedger } {
  const escrow = ledger.lockedGold[agreement.id] ?? 0;
  return {
    agreement: { ...agreement, status },
    ledger: releaseLocks(agreement, ledger, escrow, agreement.candidateId, 0),
  };
}

export function endingAgreementObligations(
  agreements: readonly PoliticalAgreement[],
): readonly PoliticalAgreement[] {
  return agreements.filter(({ status }) => status === 'accepted' || status === 'fulfilled');
}
