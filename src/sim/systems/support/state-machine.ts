import type { LordId, PhaseId, ProofId, ShockId, SupportBasisId } from '@contracts/ids';
import {
  agreementProvidesPresentCollateral,
  isPresentCollateral,
  type PoliticalAgreement,
} from '../politics/bargains';

export type SupportLevel = 'committed' | 'leaning' | 'pledged' | 'self' | 'unaligned';
export type SupportVisibility = 'private' | 'public';

export type SupportShock = {
  readonly automaticBreaker: boolean;
  readonly createdAtDay: number;
  readonly id: string;
  readonly shockId: ShockId;
  readonly value: number;
};

export type MaturationClock = {
  readonly accumulatedDays: number;
  readonly activeSinceDay: number | null;
};

export type Duress = {
  readonly leverageId: string;
  readonly visibility: SupportVisibility;
};

export type SupportState = {
  readonly agreementId: string | null;
  readonly basis: SupportBasisId | null;
  readonly candidateId: LordId | null;
  readonly collateralIds: readonly string[];
  readonly duress: Duress | null;
  readonly lastChangedDay: number;
  readonly level: SupportLevel;
  readonly maturation: MaturationClock;
  readonly proofIds: readonly string[];
  readonly refusalUntilDay: number | null;
  readonly shocks: readonly SupportShock[];
  readonly voterId: LordId;
  readonly visibility: SupportVisibility;
};

export type SupportTransition = {
  readonly consequences: {
    readonly oathbreaker: boolean;
    readonly prestigeDelta: number;
    readonly relationshipDelta: number;
  };
  readonly outcome:
    | 'blocked-by-commitment'
    | 'blocked-by-self-support'
    | 'committed'
    | 'duress-applied'
    | 'duress-released'
    | 'leaning'
    | 'leverage-already-spent'
    | 'no-change'
    | 'pledge-broken'
    | 'pledged'
    | 'request-invalidated'
    | 'request-premature'
    | 'request-refused-cooldown'
    | 'unaligned';
  readonly state: SupportState;
};

export type CoercionLedger = {
  readonly spentSecretLeverageIds: readonly string[];
};

export type DuressTransition = SupportTransition & { readonly coercionLedger: CoercionLedger };

export type AgreementSupportTransition = SupportTransition & {
  readonly cause:
    | 'agreement-breached'
    | 'agreement-collapsed'
    | 'agreement-missing'
    | 'agreement-released'
    | null;
};

export function createCoercionLedger(): CoercionLedger {
  return { spentSecretLeverageIds: [] };
}

const MATURATION_DAYS: Record<Exclude<PhaseId, 'stable'>, number> = {
  ailing: 2,
  deathbed: 4,
  'gravely-ill': 3,
};

const PLEDGE_INERTIA: Record<Exclude<PhaseId, 'stable'>, number> = {
  ailing: 10,
  deathbed: 30,
  'gravely-ill': 20,
};

const noConsequences = {
  oathbreaker: false,
  prestigeDelta: 0,
  relationshipDelta: 0,
} as const;

export function createUnalignedSupport(voterId: LordId, currentDay = 0): SupportState {
  return {
    agreementId: null,
    basis: null,
    candidateId: null,
    collateralIds: [],
    duress: null,
    lastChangedDay: currentDay,
    level: 'unaligned',
    maturation: { accumulatedDays: 0, activeSinceDay: null },
    proofIds: [],
    refusalUntilDay: null,
    shocks: [],
    voterId,
    visibility: 'private',
  };
}

export function maturationDays(state: SupportState, currentDay: number): number {
  return (
    state.maturation.accumulatedDays +
    (state.maturation.activeSinceDay === null
      ? 0
      : Math.max(0, currentDay - state.maturation.activeSinceDay))
  );
}

export function setMaturationActive(
  state: SupportState,
  active: boolean,
  currentDay: number,
): SupportState {
  if (active && state.maturation.activeSinceDay === null) {
    return { ...state, maturation: { ...state.maturation, activeSinceDay: currentDay } };
  }
  if (!active && state.maturation.activeSinceDay !== null) {
    return {
      ...state,
      maturation: {
        accumulatedDays: maturationDays(state, currentDay),
        activeSinceDay: null,
      },
    };
  }
  return state;
}

export function applyLeaningPreference(
  state: SupportState,
  candidateId: LordId | null,
  basis: SupportBasisId | null,
  currentDay: number,
): SupportTransition {
  if (state.level === 'committed' || state.level === 'pledged' || state.level === 'self') {
    return { consequences: noConsequences, outcome: 'no-change', state };
  }
  if (candidateId === null) {
    return {
      consequences: noConsequences,
      outcome: 'unaligned',
      state: {
        ...createUnalignedSupport(state.voterId, currentDay),
        refusalUntilDay: state.refusalUntilDay,
        shocks: state.shocks,
      },
    };
  }
  if (candidateId === state.voterId) {
    throw new Error('Candidate self-support must use the explicit self-support constructor.');
  }
  const sameCandidate = state.level === 'leaning' && state.candidateId === candidateId;
  return {
    consequences: noConsequences,
    outcome: 'leaning',
    state: {
      ...state,
      basis: basis ?? 'opportunism',
      candidateId,
      lastChangedDay: sameCandidate ? state.lastChangedDay : currentDay,
      level: 'leaning',
      maturation: sameCandidate
        ? state.maturation
        : { accumulatedDays: 0, activeSinceDay: currentDay },
      visibility: 'private',
    },
  };
}

export function createSelfSupport(candidateId: LordId, currentDay: number): SupportState {
  return {
    ...createUnalignedSupport(candidateId, currentDay),
    basis: 'self',
    candidateId,
    level: 'self',
    visibility: 'public',
  };
}

export type PledgeProof = {
  readonly candidateId: LordId;
  readonly id: ProofId;
  readonly valid: boolean;
  readonly voterId: LordId;
};

export type PledgeEligibilityFacts = {
  readonly acceptedAgreement: PoliticalAgreement | null;
  readonly candidateDeclared: boolean;
  readonly candidateId: LordId;
  readonly hasActiveRedLine: boolean;
  readonly phase: PhaseId;
  readonly proofs: readonly PledgeProof[];
  readonly sharedRiskWaivesMaturation?: boolean;
};

export type PledgeStartAssessment = {
  readonly acceptedAgreementId: string | null;
  readonly assessedAtDay: number;
  readonly candidateId: LordId;
  readonly eligible: boolean;
  readonly proofIds: readonly ProofId[];
  readonly voterId: LordId;
};

const VOTER_PROOFS: Readonly<Record<LordId, readonly ProofId[]>> = {
  edric: [
    'edric-major-victory',
    'edric-military-peer',
    'edric-border-aid',
    'edric-capital-control',
  ],
  greyfen: [],
  mara: ['mara-charter', 'mara-provincial-aid', 'mara-liberation'],
  oswin: ['oswin-lawful-legitimacy'],
  renard: [],
  ysabel: [
    'ysabel-public-support',
    'ysabel-claim-and-church',
    'ysabel-capital-control',
    'ysabel-rival-defeat',
    'ysabel-escrow',
    'ysabel-protection',
  ],
};

export type PledgeRequest = PledgeEligibilityFacts & {
  readonly currentDay: number;
  readonly startAssessment: PledgeStartAssessment;
};

function validPledgeProofs(
  state: SupportState,
  facts: PledgeEligibilityFacts,
): readonly PledgeProof[] {
  return facts.proofs.filter(
    ({ candidateId, id, valid, voterId }) =>
      valid &&
      candidateId === facts.candidateId &&
      voterId === state.voterId &&
      VOTER_PROOFS[state.voterId].includes(id),
  );
}

function pledgeEligibility(
  state: SupportState,
  facts: PledgeEligibilityFacts,
  currentDay: number,
): { readonly eligible: boolean; readonly proofs: readonly PledgeProof[] } {
  const requiredMaturation =
    facts.phase === 'stable' ? Number.POSITIVE_INFINITY : MATURATION_DAYS[facts.phase];
  const agreementValid =
    facts.acceptedAgreement !== null &&
    (facts.acceptedAgreement.status === 'accepted' ||
      facts.acceptedAgreement.status === 'fulfilled') &&
    facts.acceptedAgreement.candidateId === facts.candidateId &&
    facts.acceptedAgreement.supporterId === state.voterId &&
    agreementProvidesPresentCollateral(facts.acceptedAgreement);
  const proofs = validPledgeProofs(state, facts);
  return {
    eligible:
      state.level === 'leaning' &&
      state.candidateId === facts.candidateId &&
      (state.refusalUntilDay === null || currentDay >= state.refusalUntilDay) &&
      facts.candidateDeclared &&
      !facts.hasActiveRedLine &&
      proofs.length > 0 &&
      agreementValid &&
      (facts.sharedRiskWaivesMaturation || maturationDays(state, currentDay) >= requiredMaturation),
    proofs,
  };
}

export function createPledgeStartAssessment(
  state: SupportState,
  facts: PledgeEligibilityFacts,
  assessedAtDay: number,
): PledgeStartAssessment {
  const assessment = pledgeEligibility(state, facts, assessedAtDay);
  return {
    acceptedAgreementId: facts.acceptedAgreement?.id ?? null,
    assessedAtDay,
    candidateId: facts.candidateId,
    eligible: assessment.eligible,
    proofIds: assessment.proofs.map(({ id }) => id),
    voterId: state.voterId,
  };
}

export function requestVoluntaryPledge(
  state: SupportState,
  request: PledgeRequest,
): SupportTransition {
  if (
    request.startAssessment.candidateId !== request.candidateId ||
    request.startAssessment.voterId !== state.voterId ||
    request.startAssessment.assessedAtDay > request.currentDay
  ) {
    throw new Error('Request resolution does not match its serialized start assessment.');
  }
  if (state.level === 'committed') {
    return { consequences: noConsequences, outcome: 'blocked-by-commitment', state };
  }
  if (state.level !== 'leaning' || state.candidateId !== request.candidateId) {
    return {
      consequences: { ...noConsequences, relationshipDelta: -2 },
      outcome: 'request-invalidated',
      state,
    };
  }
  if (state.refusalUntilDay !== null && request.currentDay < state.refusalUntilDay) {
    return {
      consequences: noConsequences,
      outcome: 'request-refused-cooldown',
      state,
    };
  }
  if (!request.startAssessment.eligible) {
    return {
      consequences: { ...noConsequences, relationshipDelta: -4 },
      outcome: 'request-premature',
      state: {
        ...state,
        refusalUntilDay: request.currentDay + 7,
      },
    };
  }
  const resolution = pledgeEligibility(state, request, request.currentDay);
  if (!resolution.eligible) {
    return {
      consequences: { ...noConsequences, relationshipDelta: -2 },
      outcome: 'request-invalidated',
      state,
    };
  }
  return {
    consequences: noConsequences,
    outcome: 'pledged',
    state: {
      ...state,
      agreementId: request.acceptedAgreement?.id ?? null,
      collateralIds:
        request.acceptedAgreement?.collateral.filter(isPresentCollateral).map(({ id }) => id) ?? [],
      duress: null,
      lastChangedDay: request.currentDay,
      level: 'pledged',
      proofIds: resolution.proofs.map(({ id }) => id),
      refusalUntilDay: null,
      visibility: 'public',
    },
  };
}

export type SharedRiskEvent =
  | 'costly-constitutional-concession'
  | 'joint-battle-victory'
  | 'public-financing'
  | 'synod-alignment';

export function commitSupport(
  state: SupportState,
  event: { readonly id: string; readonly kind: SharedRiskEvent; readonly occurredAtDay: number },
): SupportTransition {
  if (state.level !== 'pledged' || state.duress !== null || state.candidateId === null) {
    return { consequences: noConsequences, outcome: 'no-change', state };
  }
  return {
    consequences: noConsequences,
    outcome: 'committed',
    state: {
      ...state,
      basis: state.basis ?? 'bargain',
      collateralIds: [...state.collateralIds, event.id],
      lastChangedDay: event.occurredAtDay,
      level: 'committed',
      visibility: 'public',
    },
  };
}

export function applyDuress(
  state: SupportState,
  input: {
    readonly candidateId: LordId;
    readonly currentDay: number;
    readonly leverageId: string;
    readonly leverageValid: boolean;
  } & (
    | { readonly source: 'military' | 'occupation'; readonly visibility: 'public' }
    | { readonly source: 'secret'; readonly visibility: 'private' }
  ),
  coercionLedger: CoercionLedger,
): DuressTransition {
  if (state.level === 'committed') {
    return {
      coercionLedger,
      consequences: noConsequences,
      outcome: 'blocked-by-commitment',
      state,
    };
  }
  if (state.level === 'self' || state.voterId === input.candidateId) {
    return {
      coercionLedger,
      consequences: noConsequences,
      outcome: 'blocked-by-self-support',
      state,
    };
  }
  if (!input.leverageValid) {
    return { coercionLedger, consequences: noConsequences, outcome: 'no-change', state };
  }
  if (
    input.source === 'secret' &&
    coercionLedger.spentSecretLeverageIds.includes(input.leverageId)
  ) {
    return {
      coercionLedger,
      consequences: noConsequences,
      outcome: 'leverage-already-spent',
      state,
    };
  }
  return {
    coercionLedger:
      input.source === 'secret'
        ? {
            spentSecretLeverageIds: [...coercionLedger.spentSecretLeverageIds, input.leverageId],
          }
        : coercionLedger,
    consequences: noConsequences,
    outcome: 'duress-applied',
    state: {
      ...state,
      agreementId: `duress:${input.leverageId}`,
      basis: 'coercion',
      candidateId: input.candidateId,
      duress: { leverageId: input.leverageId, visibility: input.visibility },
      lastChangedDay: input.currentDay,
      level: 'pledged',
      visibility: 'public',
    },
  };
}

export function revalidateDuress(
  state: SupportState,
  currentDay: number,
  isLeverageValid: (leverageId: string) => boolean,
): SupportTransition {
  if (state.duress === null || isLeverageValid(state.duress.leverageId)) {
    return { consequences: noConsequences, outcome: 'no-change', state };
  }
  return {
    consequences: noConsequences,
    outcome: 'duress-released',
    state: createUnalignedSupport(state.voterId, currentDay),
  };
}

export function revalidateAgreementSupport(
  state: SupportState,
  input: {
    readonly agreement: PoliticalAgreement | null;
    readonly currentDay: number;
  },
): AgreementSupportTransition {
  if (
    state.agreementId === null ||
    state.duress !== null ||
    (state.level !== 'pledged' && state.level !== 'committed')
  ) {
    return { cause: null, consequences: noConsequences, outcome: 'no-change', state };
  }
  if (input.agreement !== null && input.agreement.id !== state.agreementId) {
    throw new Error(
      `Support agreement ${state.agreementId} cannot be revalidated with ${input.agreement.id}.`,
    );
  }
  if (
    input.agreement !== null &&
    (input.agreement.supporterId !== state.voterId ||
      input.agreement.candidateId !== state.candidateId)
  ) {
    throw new Error(`Support agreement ${state.agreementId} has mismatched participants.`);
  }
  if (
    input.agreement !== null &&
    (input.agreement.status === 'accepted' || input.agreement.status === 'fulfilled')
  ) {
    return { cause: null, consequences: noConsequences, outcome: 'no-change', state };
  }
  const cause: Exclude<AgreementSupportTransition['cause'], null> =
    input.agreement === null
      ? 'agreement-missing'
      : input.agreement.status === 'breached'
        ? 'agreement-breached'
        : input.agreement.status === 'collapsed'
          ? 'agreement-collapsed'
          : 'agreement-released';
  if (state.level === 'committed') {
    return {
      cause,
      consequences: noConsequences,
      outcome: 'no-change',
      state: { ...state, agreementId: null },
    };
  }
  return {
    cause,
    consequences: noConsequences,
    outcome: 'pledge-broken',
    state: createUnalignedSupport(state.voterId, input.currentDay),
  };
}

export function addSupportShock(state: SupportState, shock: SupportShock): SupportState {
  if (state.shocks.some(({ id }) => id === shock.id)) {
    throw new Error(`Support shock ${shock.id} already exists.`);
  }
  return { ...state, shocks: [...state.shocks, shock] };
}

export function removeSupportShock(state: SupportState, shockId: string): SupportState {
  return { ...state, shocks: state.shocks.filter(({ id }) => id !== shockId) };
}

export function activeSupportShocks(
  state: SupportState,
  currentDay: number,
): readonly SupportShock[] {
  return state.shocks.filter(
    (shock) => shock.automaticBreaker || currentDay - shock.createdAtDay < 10,
  );
}

export function reevaluatePledge(
  state: SupportState,
  input: {
    readonly alternativeLead: number;
    readonly currentDay: number;
    readonly phase: Exclude<PhaseId, 'stable'>;
  },
): SupportTransition {
  if (state.level !== 'pledged' || state.duress !== null) {
    return { consequences: noConsequences, outcome: 'no-change', state };
  }
  const shocks = activeSupportShocks(state, input.currentDay);
  const automatic = shocks.some(({ automaticBreaker }) => automaticBreaker);
  const numericShock = shocks.reduce((sum, { value }) => sum + value, 0);
  if (!automatic && (numericShock < PLEDGE_INERTIA[input.phase] || input.alternativeLead < 10)) {
    return {
      consequences: noConsequences,
      outcome: 'no-change',
      state: { ...state, shocks },
    };
  }
  return {
    consequences: noConsequences,
    outcome: 'pledge-broken',
    state: createUnalignedSupport(state.voterId, input.currentDay),
  };
}

export type CommitmentBreaker =
  | 'authored-betrayal'
  | 'candidate-withdrawal'
  | 'catastrophic-breaker'
  | 'red-line';

export function breakCommitment(
  state: SupportState,
  breaker: CommitmentBreaker,
  currentDay: number,
): SupportTransition {
  void breaker;
  if (state.level !== 'committed') {
    return { consequences: noConsequences, outcome: 'no-change', state };
  }
  return {
    consequences: noConsequences,
    outcome: 'pledge-broken',
    state: createUnalignedSupport(state.voterId, currentDay),
  };
}

export function canOpenDefectionBargain(input: {
  readonly challengerViabilityLead: number;
  readonly currentInertia: number;
  readonly currentShock: number;
  readonly hasKnownBreachOrRedLine: boolean;
  readonly hasValidCommitment: boolean;
  readonly hasValidCoercion: boolean;
  readonly opportunisticBasis: boolean;
}): boolean {
  if (input.hasValidCommitment) return false;
  return (
    input.currentShock >= input.currentInertia / 2 ||
    (input.opportunisticBasis && input.challengerViabilityLead >= 10) ||
    input.hasKnownBreachOrRedLine ||
    input.hasValidCoercion
  );
}
