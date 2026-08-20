import type { LordId, PhaseId } from '@contracts/ids';

export type CandidateStatus = {
  readonly declarationDay: number | null;
  readonly declared: boolean;
  readonly eliminated: boolean;
  readonly eligible: boolean;
  readonly lordId: LordId;
  readonly withdrawn: boolean;
};

export type DeclarationResult = {
  readonly candidate: CandidateStatus;
  readonly effects: {
    readonly laughablePretender: boolean;
    readonly prestigeDelta: number;
    readonly renardRivalReaction: boolean;
  };
  readonly ok: boolean;
  readonly reason: string;
};

const phaseRank: Record<PhaseId, number> = {
  stable: 0,
  ailing: 1,
  'gravely-ill': 2,
  deathbed: 3,
};

export function createCandidateStatus(lordId: LordId): CandidateStatus {
  return {
    declarationDay: null,
    declared: false,
    eliminated: false,
    eligible: false,
    lordId,
    withdrawn: false,
  };
}

function declarationPrestige(claim: number): { laughable: boolean; prestigeDelta: number } {
  if (claim < 10) return { laughable: true, prestigeDelta: -5 };
  if (claim >= 45) return { laughable: false, prestigeDelta: 5 };
  if (claim >= 25) return { laughable: false, prestigeDelta: 3 };
  return { laughable: false, prestigeDelta: 0 };
}

export function resolvePlayerDeclaration(input: {
  readonly candidate: CandidateStatus;
  readonly claim: number;
  readonly costPaidAtStart: boolean;
  readonly currentDay: number;
  readonly phase: PhaseId;
}): DeclarationResult {
  if (input.candidate.lordId !== 'greyfen') {
    return {
      candidate: input.candidate,
      effects: {
        laughablePretender: false,
        prestigeDelta: 0,
        renardRivalReaction: false,
      },
      ok: false,
      reason: 'only-greyfen-is-player-declared',
    };
  }
  if (input.candidate.declared) {
    return {
      candidate: input.candidate,
      effects: {
        laughablePretender: false,
        prestigeDelta: 0,
        renardRivalReaction: false,
      },
      ok: false,
      reason: 'declaration-is-irreversible-and-already-complete',
    };
  }
  if (phaseRank[input.phase] < phaseRank.ailing || !input.costPaidAtStart) {
    return {
      candidate: input.candidate,
      effects: {
        laughablePretender: false,
        prestigeDelta: 0,
        renardRivalReaction: false,
      },
      ok: false,
      reason: !input.costPaidAtStart
        ? 'declaration-start-cost-not-paid'
        : 'candidacy-locked-until-ailing',
    };
  }
  const prestige = declarationPrestige(input.claim);
  return {
    candidate: {
      ...input.candidate,
      declarationDay: input.currentDay,
      declared: true,
      eligible: true,
    },
    effects: {
      laughablePretender: prestige.laughable,
      prestigeDelta: prestige.prestigeDelta,
      renardRivalReaction: true,
    },
    ok: true,
    reason: 'greyfen-declared',
  };
}

export function applyRenardAutomaticDeclaration(
  candidate: CandidateStatus,
  phase: PhaseId,
  currentDay: number,
): CandidateStatus {
  if (candidate.lordId !== 'renard' || candidate.declared || phaseRank[phase] < phaseRank.ailing) {
    return candidate;
  }
  return {
    ...candidate,
    declarationDay: currentDay,
    declared: true,
    eligible: true,
  };
}

export function canEdricDeclare(input: {
  readonly availableOrContractedTroops: number;
  readonly hasAnyValidPledge: boolean;
  readonly phase: PhaseId;
  readonly prestige: number;
  readonly renardPledgedOrCommittedSupporters: number;
}): boolean {
  return (
    phaseRank[input.phase] >= phaseRank['gravely-ill'] &&
    input.renardPledgedOrCommittedSupporters <= 1 &&
    input.availableOrContractedTroops >= 500 &&
    input.prestige >= 50 &&
    !input.hasAnyValidPledge
  );
}

export function declareEdric(
  candidate: CandidateStatus,
  input: Parameters<typeof canEdricDeclare>[0] & { readonly currentDay: number },
): CandidateStatus {
  if (candidate.lordId !== 'edric' || candidate.declared || !canEdricDeclare(input))
    return candidate;
  return {
    ...candidate,
    declarationDay: input.currentDay,
    declared: true,
    eligible: true,
  };
}

export function canForceRenardWithdrawal(input: {
  readonly capitalControlledByDemandingClaimant: boolean;
  readonly southmereOccupied: boolean;
  readonly successfulThreat: boolean;
  readonly validSupporters: number;
  readonly availableMilitary: number;
}): boolean {
  return (
    input.validSupporters === 0 &&
    (input.southmereOccupied || input.availableMilitary < 150) &&
    input.capitalControlledByDemandingClaimant &&
    input.successfulThreat
  );
}

export function withdrawRenard(
  candidate: CandidateStatus,
  input: Parameters<typeof canForceRenardWithdrawal>[0],
): CandidateStatus {
  if (candidate.lordId !== 'renard' || !candidate.eligible || !canForceRenardWithdrawal(input)) {
    return candidate;
  }
  return { ...candidate, eligible: false, withdrawn: true };
}

export function eliminateCandidate(candidate: CandidateStatus): CandidateStatus {
  return { ...candidate, eliminated: true, eligible: false };
}

export function legalCandidates(
  candidates: readonly CandidateStatus[],
): readonly CandidateStatus[] {
  return candidates
    .filter(
      ({ declared, eliminated, eligible, withdrawn }) =>
        declared && eligible && !withdrawn && !eliminated,
    )
    .sort((left, right) => {
      const declarationOrder =
        (left.declarationDay ?? Number.POSITIVE_INFINITY) -
        (right.declarationDay ?? Number.POSITIVE_INFINITY);
      return declarationOrder !== 0 ? declarationOrder : left.lordId.localeCompare(right.lordId);
    });
}
