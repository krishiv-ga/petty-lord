import type { ClaimBandId, PhaseId, SecretId, ShockId } from '../../../contracts/ids';

export type ClaimProjectId = 'forge-royal-descent' | 'research-lineage';
export type ClaimProjectStatus = 'available' | 'completed' | 'in-progress';
export type ForgeryStatus = 'absent' | 'condemned' | 'exposed-and-penitent' | 'unexposed';

export interface ClaimState {
  readonly fabricatedClaim: number;
  readonly forgeRoyalDescent: ClaimProjectStatus;
  readonly forgeryEvidence: ForgeryStatus;
  readonly researchLineage: ClaimProjectStatus;
  readonly safeClaim: number;
}

export interface ClaimProjectDefinition {
  readonly claimGain: number;
  readonly durationDays: number;
  readonly goldCost: number;
  readonly influenceCost: number;
  readonly projectId: ClaimProjectId;
}

export type ClaimProjectStartResult =
  | { readonly ok: true; readonly state: ClaimState }
  | {
      readonly ok: false;
      readonly reason: 'already-started' | 'deathbed-locked';
      readonly state: ClaimState;
    };

export type ClaimProjectResolutionResult =
  | {
      readonly authoredClaimGain: number;
      readonly claimGained: number;
      readonly createdSecretId: SecretId | null;
      readonly ok: true;
      readonly state: ClaimState;
    }
  | {
      readonly ok: false;
      readonly reason: 'project-not-in-progress';
      readonly state: ClaimState;
    };

export interface ForgerySupportShock {
  readonly audience: 'legitimacy-supporters' | 'other-supporters';
  readonly durationDays: 10;
  readonly magnitude: 10 | 20;
  readonly shockId: ShockId;
}

export type ForgeryExposureResult =
  | {
      readonly claimRemoved: number;
      readonly ok: true;
      readonly oswinFraudRedLineActive: true;
      readonly prestigeDelta: -10;
      readonly state: ClaimState;
      readonly supportShocks: readonly ForgerySupportShock[];
    }
  | {
      readonly ok: false;
      readonly reason: 'forgery-already-exposed' | 'no-forgery-evidence';
      readonly state: ClaimState;
    };

export type RumorConfessionResult =
  | {
      readonly claimRemoved: number;
      readonly ok: true;
      readonly prestigeDelta: -5;
      readonly state: ClaimState;
    }
  | {
      readonly ok: false;
      readonly reason: 'forgery-already-exposed' | 'no-unexposed-forgery';
      readonly state: ClaimState;
    };

export const CLAIM_PROJECTS: Readonly<Record<ClaimProjectId, ClaimProjectDefinition>> = {
  'forge-royal-descent': {
    claimGain: 25,
    durationDays: 8,
    goldCost: 50,
    influenceCost: 25,
    projectId: 'forge-royal-descent',
  },
  'research-lineage': {
    claimGain: 12,
    durationDays: 6,
    goldCost: 35,
    influenceCost: 12,
    projectId: 'research-lineage',
  },
};

export const PENANCE_REQUIREMENTS = {
  durationDays: 3,
  goldCost: 40,
  influenceCost: 10,
  prestigeLoss: 5,
} as const;

const CLAIM_BANDS: readonly {
  readonly band: ClaimBandId;
  readonly maximum: number;
  readonly minimum: number;
}[] = [
  { band: 'none', maximum: 9, minimum: 0 },
  { band: 'dubious', maximum: 24, minimum: 10 },
  { band: 'plausible', maximum: 44, minimum: 25 },
  { band: 'strong', maximum: 64, minimum: 45 },
  { band: 'excellent', maximum: 84, minimum: 65 },
  { band: 'overwhelming', maximum: 100, minimum: 85 },
];

function assertWholeNumber(value: number, label: string): void {
  if (!Number.isSafeInteger(value)) throw new RangeError(`${label} must be a safe integer`);
}

export function normalizeClaimRating(value: number): number {
  assertWholeNumber(value, 'Claim');
  return Math.min(100, Math.max(0, value));
}

export function createClaimState(startingClaim: number): ClaimState {
  return {
    fabricatedClaim: 0,
    forgeRoyalDescent: 'available',
    forgeryEvidence: 'absent',
    researchLineage: 'available',
    safeClaim: normalizeClaimRating(startingClaim),
  };
}

export function claimRating(state: ClaimState): number {
  return normalizeClaimRating(state.safeClaim + state.fabricatedClaim);
}

export function claimBand(rating: number): ClaimBandId {
  const bounded = normalizeClaimRating(rating);
  const match = CLAIM_BANDS.find((entry) => bounded >= entry.minimum && bounded <= entry.maximum);
  if (!match) throw new Error(`No Claim band for ${bounded}`);
  return match.band;
}

export function claimBandForState(state: ClaimState): ClaimBandId {
  return claimBand(claimRating(state));
}

export function adjustSafeClaim(state: ClaimState, delta: number): ClaimState {
  assertWholeNumber(delta, 'Claim delta');
  return { ...state, safeClaim: normalizeClaimRating(state.safeClaim + delta) };
}

function projectStatus(state: ClaimState, projectId: ClaimProjectId): ClaimProjectStatus {
  return projectId === 'research-lineage' ? state.researchLineage : state.forgeRoyalDescent;
}

function withProjectStatus(
  state: ClaimState,
  projectId: ClaimProjectId,
  status: ClaimProjectStatus,
): ClaimState {
  return projectId === 'research-lineage'
    ? { ...state, researchLineage: status }
    : { ...state, forgeRoyalDescent: status };
}

export function startClaimProject(
  state: ClaimState,
  projectId: ClaimProjectId,
  phase: PhaseId,
): ClaimProjectStartResult {
  if (phase === 'deathbed') return { ok: false, reason: 'deathbed-locked', state };
  if (projectStatus(state, projectId) !== 'available') {
    return { ok: false, reason: 'already-started', state };
  }
  return { ok: true, state: withProjectStatus(state, projectId, 'in-progress') };
}

export function resolveClaimProject(
  state: ClaimState,
  projectId: ClaimProjectId,
): ClaimProjectResolutionResult {
  if (projectStatus(state, projectId) !== 'in-progress') {
    return { ok: false, reason: 'project-not-in-progress', state };
  }
  const definition = CLAIM_PROJECTS[projectId];
  let next = withProjectStatus(state, projectId, 'completed');
  if (projectId === 'research-lineage') {
    const priorRating = claimRating(next);
    next = adjustSafeClaim(next, definition.claimGain);
    return {
      authoredClaimGain: definition.claimGain,
      claimGained: claimRating(next) - priorRating,
      createdSecretId: null,
      ok: true,
      state: next,
    };
  }
  const priorRating = claimRating(next);
  next = {
    ...next,
    fabricatedClaim: next.fabricatedClaim + definition.claimGain,
    forgeryEvidence: 'unexposed',
  };
  return {
    authoredClaimGain: definition.claimGain,
    claimGained: claimRating(next) - priorRating,
    createdSecretId: 'player-forgery-evidence',
    ok: true,
    state: next,
  };
}

export function exposeForgery(state: ClaimState): ForgeryExposureResult {
  if (state.forgeryEvidence === 'absent') {
    return { ok: false, reason: 'no-forgery-evidence', state };
  }
  if (state.forgeryEvidence !== 'unexposed') {
    return { ok: false, reason: 'forgery-already-exposed', state };
  }
  const claimRemoved = Math.min(20, state.fabricatedClaim);
  return {
    claimRemoved,
    ok: true,
    oswinFraudRedLineActive: true,
    prestigeDelta: -10,
    state: {
      ...state,
      fabricatedClaim: state.fabricatedClaim - claimRemoved,
      forgeryEvidence: 'condemned',
    },
    supportShocks: [
      {
        audience: 'legitimacy-supporters',
        durationDays: 10,
        magnitude: 20,
        shockId: 'forgery-exposed',
      },
      {
        audience: 'other-supporters',
        durationDays: 10,
        magnitude: 10,
        shockId: 'forgery-exposed-other-basis',
      },
    ],
  };
}

export function resolveRumorConfession(state: ClaimState): RumorConfessionResult {
  if (state.forgeryEvidence === 'absent') {
    return { ok: false, reason: 'no-unexposed-forgery', state };
  }
  if (state.forgeryEvidence !== 'unexposed') {
    return { ok: false, reason: 'forgery-already-exposed', state };
  }
  const claimRemoved = Math.min(12, state.fabricatedClaim);
  return {
    claimRemoved,
    ok: true,
    prestigeDelta: -5,
    state: {
      ...state,
      fabricatedClaim: state.fabricatedClaim - claimRemoved,
      forgeryEvidence: 'absent',
    },
  };
}

export function markForgeryPenitent(state: ClaimState): ClaimState {
  if (state.forgeryEvidence !== 'condemned') {
    throw new Error('Penance requires an exposed Forgery condemnation');
  }
  return { ...state, forgeryEvidence: 'exposed-and-penitent' };
}

export function hasOswinForgeryRedLine(state: ClaimState): boolean {
  return state.forgeryEvidence === 'condemned';
}
