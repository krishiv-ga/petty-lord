import type { LordId } from '../../../contracts/ids';
import {
  assignGarrison,
  commitmentTroops,
  markCommitmentsReturning,
} from '../military/availability';
import type { CapitalStableStatus, MilitaryState } from '../military/types';

export const CAPITAL_GARRISON_REQUIREMENT = 200;
export const CAPITAL_MINIMUM_ATTACK = 250;

function withCapitalStatus(
  state: MilitaryState,
  stableStatus: CapitalStableStatus,
  controllerLordId: LordId | null,
  garrisonCommitmentId: string | null,
): MilitaryState {
  return {
    ...state,
    capital: {
      ...state.capital,
      controllerLordId,
      garrisonCommitmentId,
      stableStatus,
      status: state.capital.pendingCampaignIds.length > 0 ? 'contested' : stableStatus,
    },
    territories: {
      ...state.territories,
      capital: { ...state.territories.capital, controllerLordId },
    },
  };
}

export function markCapitalCampaignPending(
  state: MilitaryState,
  campaignId: string,
): MilitaryState {
  if (state.capital.pendingCampaignIds.includes(campaignId)) return state;
  return {
    ...state,
    capital: {
      ...state.capital,
      pendingCampaignIds: [...state.capital.pendingCampaignIds, campaignId],
      status: 'contested',
    },
  };
}

export function finishCapitalCampaign(state: MilitaryState, campaignId: string): MilitaryState {
  const pendingCampaignIds = state.capital.pendingCampaignIds.filter((id) => id !== campaignId);
  return {
    ...state,
    capital: {
      ...state.capital,
      pendingCampaignIds,
      status: pendingCampaignIds.length > 0 ? 'contested' : state.capital.stableStatus,
    },
  };
}

export function occupyCapital(
  state: MilitaryState,
  options: {
    readonly atHours: number;
    readonly campaignId: string;
    readonly claimantId: LordId;
    readonly commitmentIds: readonly string[];
  },
): { readonly controlled: boolean; readonly reason: string; readonly state: MilitaryState } {
  const priorGarrison = state.capital.garrisonCommitmentId;
  let base = state;
  if (priorGarrison) {
    base = markCommitmentsReturning(base, [priorGarrison], options.atHours + 24);
  }
  const assigned = assignGarrison(base, {
    campaignId: options.campaignId,
    commitmentIds: options.commitmentIds,
    lordId: options.claimantId,
    requiredTroops: CAPITAL_GARRISON_REQUIREMENT,
    territoryId: 'capital',
  });
  if (!assigned) {
    const uncontrolled = withCapitalStatus(base, 'uncontrolled', null, null);
    return {
      controlled: false,
      reason: 'victory left fewer than 200 eligible survivors; Capital is Uncontrolled',
      state: {
        ...uncontrolled,
        capital: { ...uncontrolled.capital, royalGarrison: 0 },
        history: [
          ...uncontrolled.history,
          {
            atHours: options.atHours,
            campaignId: options.campaignId,
            kind: 'capital-uncontrolled',
            lordId: options.claimantId,
            reason: 'pyrrhic victory without a legal garrison',
            territoryId: 'capital',
          },
        ],
      },
    };
  }
  const occupied = withCapitalStatus(
    assigned.state,
    'occupied',
    options.claimantId,
    assigned.commitmentId,
  );
  return {
    controlled: true,
    reason: `${assigned.troops} troops assigned to Capital control`,
    state: {
      ...occupied,
      capital: { ...occupied.capital, royalGarrison: 0 },
      history: [
        ...occupied.history,
        {
          atHours: options.atHours,
          campaignId: options.campaignId,
          kind: 'capital-occupied',
          lordId: options.claimantId,
          reason: 'claimant holds at least 200 surviving troops in the Capital',
          territoryId: 'capital',
        },
      ],
    },
  };
}

export function revalidateCapitalGarrison(state: MilitaryState, atHours: number): MilitaryState {
  if (state.capital.stableStatus !== 'occupied' || !state.capital.garrisonCommitmentId)
    return state;
  const commitment = state.commitments[state.capital.garrisonCommitmentId];
  if (commitment && commitmentTroops(commitment) >= CAPITAL_GARRISON_REQUIREMENT) return state;
  const priorController = state.capital.controllerLordId;
  const returning = markCommitmentsReturning(
    state,
    [state.capital.garrisonCommitmentId],
    atHours + 24,
  );
  const uncontrolled = withCapitalStatus(returning, 'uncontrolled', null, null);
  return {
    ...uncontrolled,
    history: [
      ...uncontrolled.history,
      {
        atHours,
        campaignId: null,
        kind: 'capital-control-lost',
        lordId: priorController,
        reason: 'Capital garrison fell below 200 troops',
        territoryId: 'capital',
      },
    ],
  };
}

export function capitalControlBenefits(
  state: MilitaryState,
  lordId: LordId,
): {
  readonly acclamationAccess: boolean;
  readonly incomePerDay: number;
  readonly tieBreak: boolean;
} {
  const controlled =
    state.capital.stableStatus === 'occupied' && state.capital.controllerLordId === lordId;
  return { acclamationAccess: controlled, incomePerDay: controlled ? 1 : 0, tieBreak: controlled };
}
