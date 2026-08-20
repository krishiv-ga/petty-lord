import type { LordId, TerritoryId } from '../../../contracts/ids';
import {
  assignGarrison,
  commitmentTroops,
  markCommitmentsReturning,
} from '../military/availability';
import type { MilitaryHistoryEntry, MilitaryState } from '../military/types';

export const HEREDITARY_GARRISON_REQUIREMENT = 75;

export interface OccupationTransition {
  readonly occupied: boolean;
  readonly reason: string;
  readonly state: MilitaryState;
}

function appendHistory(state: MilitaryState, entry: MilitaryHistoryEntry): MilitaryState {
  return { ...state, history: [...state.history, entry] };
}

export function occupyHereditarySeat(
  state: MilitaryState,
  options: {
    readonly atHours: number;
    readonly campaignId: string;
    readonly commitmentIds: readonly string[];
    readonly dispossessionShockAlreadyApplied?: boolean;
    readonly occupierId: LordId;
    readonly territoryId: Exclude<TerritoryId, 'capital'>;
  },
): OccupationTransition {
  const territory = state.territories[options.territoryId];
  if (territory.legalLordId === null || territory.legalLordId === options.occupierId) {
    return { occupied: false, reason: 'cannot occupy own or non-hereditary territory', state };
  }
  const assigned = assignGarrison(state, {
    campaignId: options.campaignId,
    commitmentIds: options.commitmentIds,
    lordId: options.occupierId,
    requiredTroops: HEREDITARY_GARRISON_REQUIREMENT,
    territoryId: options.territoryId,
  });
  if (!assigned) {
    return {
      occupied: false,
      reason: `fewer than ${HEREDITARY_GARRISON_REQUIREMENT} eligible survivors remain`,
      state,
    };
  }
  const legalLord = assigned.state.lords[territory.legalLordId];
  const occupationId = `occupation:${options.campaignId}`;
  const newlyDispossessed = !legalLord.dispossessed && !options.dispossessionShockAlreadyApplied;
  const next: MilitaryState = {
    ...assigned.state,
    lords: {
      ...assigned.state.lords,
      [legalLord.lordId]: { ...legalLord, dispossessed: true },
    },
    territories: {
      ...assigned.state.territories,
      [options.territoryId]: {
        ...territory,
        controllerLordId: options.occupierId,
        occupation: {
          beganAtHours: options.atHours,
          garrisonCommitmentId: assigned.commitmentId,
          id: occupationId,
          occupierId: options.occupierId,
        },
      },
    },
  };
  const occupiedState = appendHistory(next, {
    atHours: options.atHours,
    campaignId: options.campaignId,
    kind: 'occupation-began',
    lordId: options.occupierId,
    reason: 'physical control changed without legal annexation',
    territoryId: options.territoryId,
  });
  return {
    occupied: true,
    reason: `${assigned.troops} surviving troops assigned; legal title remains with ${legalLord.lordId}`,
    state: newlyDispossessed
      ? appendHistory(occupiedState, {
          atHours: options.atHours,
          campaignId: options.campaignId,
          kind: 'lord-dispossessed',
          lordId: legalLord.lordId,
          reason: 'one-time Prestige and political viability shock required',
          territoryId: options.territoryId,
        })
      : occupiedState,
  };
}

function restoreLegalControl(
  state: MilitaryState,
  territoryId: Exclude<TerritoryId, 'capital'>,
  atHours: number,
  reason: string,
  returnDelayHours: number,
): MilitaryState {
  const territory = state.territories[territoryId];
  const occupation = territory.occupation;
  if (!occupation || territory.legalLordId === null) return state;
  const legalLord = state.lords[territory.legalLordId];
  let next = markCommitmentsReturning(
    state,
    [occupation.garrisonCommitmentId],
    atHours + returnDelayHours,
  );
  next = {
    ...next,
    lords: {
      ...next.lords,
      [legalLord.lordId]: { ...legalLord, dispossessed: false },
    },
    territories: {
      ...next.territories,
      [territoryId]: {
        ...territory,
        controllerLordId: territory.legalLordId,
        occupation: null,
      },
    },
  };
  return appendHistory(next, {
    atHours,
    campaignId: null,
    kind: 'occupation-ended',
    lordId: occupation.occupierId,
    reason,
    territoryId,
  });
}

export function withdrawOccupation(
  state: MilitaryState,
  territoryId: Exclude<TerritoryId, 'capital'>,
  atHours: number,
): MilitaryState {
  return restoreLegalControl(state, territoryId, atHours, 'voluntary withdrawal', 24);
}

export function liberateTerritory(
  state: MilitaryState,
  territoryId: Exclude<TerritoryId, 'capital'>,
  atHours: number,
): MilitaryState {
  return restoreLegalControl(state, territoryId, atHours, 'liberated by military action', 24);
}

export function revalidateHereditaryGarrisons(
  state: MilitaryState,
  atHours: number,
): MilitaryState {
  let next = state;
  for (const territory of Object.values(state.territories)) {
    if (territory.territoryId === 'capital' || !territory.occupation) continue;
    const commitment = next.commitments[territory.occupation.garrisonCommitmentId];
    if (!commitment || commitmentTroops(commitment) < HEREDITARY_GARRISON_REQUIREMENT) {
      next = restoreLegalControl(
        next,
        territory.territoryId,
        atHours,
        'garrison fell below 75 troops',
        24,
      );
    }
  }
  return next;
}

export function occupationEconomyHooks(state: MilitaryState): readonly {
  readonly legalLordId: LordId;
  readonly legalLevyRecoveryMultiplier: 0;
  readonly legalTraitEnabled: false;
  readonly occupierId: LordId;
  readonly occupierIncomePerDay: number;
  readonly territoryId: Exclude<TerritoryId, 'capital'>;
}[] {
  return Object.values(state.territories).flatMap((territory) => {
    if (territory.territoryId === 'capital' || !territory.occupation || !territory.legalLordId)
      return [];
    return [
      {
        legalLordId: territory.legalLordId,
        legalLevyRecoveryMultiplier: 0 as const,
        legalTraitEnabled: false as const,
        occupierId: territory.occupation.occupierId,
        occupierIncomePerDay: territory.wealth * 0.25,
        territoryId: territory.territoryId,
      },
    ];
  });
}
