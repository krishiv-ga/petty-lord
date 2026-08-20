import type { LordId, TerritoryId } from '../../../contracts/ids';
import type { RandomSession } from '../../random/random';
import {
  CAPITAL_GARRISON_REQUIREMENT,
  CAPITAL_MINIMUM_ATTACK,
  occupyCapital,
  revalidateCapitalGarrison,
} from '../capital/capital';
import {
  applyCommitmentCasualties,
  lockForceRequests,
  markCommitmentsReturning,
  totalCommittedForce,
} from '../military/availability';
import { fortificationMultiplier, resolveBattle } from '../military/battle';
import { hasCampaignBase, isAdjacent } from '../military/state';
import type {
  BattleResult,
  CampaignState,
  ForceAllocation,
  ForceRequest,
  MilitaryState,
} from '../military/types';
import {
  liberateTerritory,
  occupyHereditarySeat,
  revalidateHereditaryGarrisons,
} from '../occupation/occupation';

export interface StartCampaignInput {
  readonly attackerId: LordId;
  readonly baseTerritoryId: TerritoryId;
  readonly capitalAuthorizationId: string | null;
  readonly campaignId: string;
  readonly defensiveAuthorizationId: string | null;
  readonly forces: ForceRequest[];
  readonly goal: CampaignState['goal'];
  readonly targetTerritoryId: TerritoryId;
}

export interface RoyalAuthorityConsequences {
  readonly churchConduct: number;
  readonly defensiveThreatReduction: number;
  readonly influenceCost: number;
  readonly lawfulRelationshipPenalty: number;
  readonly maraRelationshipPenalty: number;
  readonly prestige: number;
  readonly royalDefenderTroops: number;
  readonly tags: string[];
}

export interface StartCampaignResult {
  readonly campaign: CampaignState;
  readonly consequences: RoyalAuthorityConsequences;
  readonly state: MilitaryState;
}

const emptyConsequences = (): RoyalAuthorityConsequences => ({
  churchConduct: 0,
  defensiveThreatReduction: 0,
  influenceCost: 0,
  lawfulRelationshipPenalty: 0,
  maraRelationshipPenalty: 0,
  prestige: 0,
  royalDefenderTroops: 0,
  tags: [],
});

export function royalAuthorityConsequences(
  state: MilitaryState,
  targetTerritoryId: TerritoryId,
  defensiveCause: boolean,
): RoyalAuthorityConsequences {
  if (defensiveCause) {
    return { ...emptyConsequences(), defensiveThreatReduction: 10, tags: ['defensive-cause'] };
  }
  const abbeyPenalty = targetTerritoryId === 'abbeylands' ? -1 : 0;
  if (state.phase === 'stable') {
    return {
      churchConduct: -1 + abbeyPenalty,
      defensiveThreatReduction: 0,
      influenceCost: 15,
      lawfulRelationshipPenalty: -8,
      maraRelationshipPenalty: -2,
      prestige: -10,
      royalDefenderTroops: 150,
      tags: ['royally-sanctioned', ...(abbeyPenalty ? ['unjustified-abbeylands-attack'] : [])],
    };
  }
  if (state.phase === 'ailing') {
    return {
      ...emptyConsequences(),
      churchConduct: abbeyPenalty,
      prestige: -5,
      tags: ['broke-kings-peace', ...(abbeyPenalty ? ['unjustified-abbeylands-attack'] : [])],
    };
  }
  return {
    ...emptyConsequences(),
    churchConduct: abbeyPenalty,
    tags: abbeyPenalty ? ['unjustified-abbeylands-attack'] : [],
  };
}

function campaignDefender(state: MilitaryState, targetTerritoryId: TerritoryId): LordId | null {
  if (targetTerritoryId === 'capital') return state.capital.controllerLordId;
  const territory = state.territories[targetTerritoryId];
  return territory.controllerLordId ?? territory.legalLordId;
}

function isDefensiveCampaign(
  state: MilitaryState,
  input: StartCampaignInput,
  defenderId: LordId | null,
  atHours: number,
): boolean {
  const actor = state.lords[input.attackerId];
  const target = state.territories[input.targetTerritoryId];
  const reclaimOwnSeat =
    actor.legalSeatId === input.targetTerritoryId && target.controllerLordId !== input.attackerId;
  const recentResponse =
    defenderId !== null &&
    Object.values(state.campaigns).some((campaign) => {
      const priorTarget = state.territories[campaign.targetTerritoryId];
      return (
        campaign.attackerId === defenderId &&
        campaign.createdAtHours >= atHours - 14 * 24 &&
        (priorTarget.legalLordId === input.attackerId ||
          priorTarget.controllerLordId === input.attackerId)
      );
    });
  if (input.defensiveAuthorizationId !== null) {
    const authorization = state.defensiveAuthorizations[input.defensiveAuthorizationId];
    if (
      !authorization ||
      authorization.actorId !== input.attackerId ||
      authorization.targetTerritoryId !== input.targetTerritoryId ||
      authorization.expiresAtHours < atHours
    ) {
      throw new Error('defensive authorization is absent, mismatched or expired');
    }
    return true;
  }
  return reclaimOwnSeat || recentResponse;
}

function durationHours(state: MilitaryState, targetTerritoryId: TerritoryId): number {
  if (targetTerritoryId === 'capital' && state.capital.stableStatus === 'uncontrolled') return 24;
  return state.phase === 'deathbed' ? 48 : 72;
}

function requestTroops(state: MilitaryState, request: ForceRequest): number {
  return (
    request.levyTroops +
    request.mercenaryIds.reduce(
      (total, forceId) => total + (state.contractedForces[forceId]?.troops ?? 0),
      0,
    )
  );
}

function validateForceContributors(
  state: MilitaryState,
  options: {
    readonly atHours: number;
    readonly beneficiaryId: LordId;
    readonly campaignId: string;
    readonly forceRequests: readonly ForceRequest[];
    readonly side: 'attacker' | 'defender';
    readonly targetTerritoryId: TerritoryId;
  },
): string[] {
  const authorizationIds: string[] = [];
  options.forceRequests.forEach((request, index) => {
    const baseCanReachTarget =
      request.basingTerritoryId === options.targetTerritoryId ||
      isAdjacent(request.basingTerritoryId, options.targetTerritoryId);
    if (!baseCanReachTarget) {
      throw new Error(`${request.lordId} force base is not adjacent to the campaign target`);
    }
    if (index === 0) return;
    const authorization = Object.values(state.militaryAidAuthorizations).find(
      (candidate) =>
        candidate.beneficiaryId === options.beneficiaryId &&
        candidate.campaignId === options.campaignId &&
        candidate.expiresAtHours >= options.atHours &&
        candidate.providerId === request.lordId &&
        candidate.side === options.side,
    );
    if (!authorization || requestTroops(state, request) > authorization.maximumTroops) {
      throw new Error(`${request.lordId} lacks campaign-bound military aid authorization`);
    }
    authorizationIds.push(authorization.id);
  });
  return authorizationIds;
}

function garrisonEligibleTroops(allocations: readonly ForceAllocation[], lordId: LordId): number {
  return allocations
    .filter((allocation) => allocation.ownerId === lordId && allocation.garrisonEligible)
    .reduce((total, allocation) => total + allocation.troops, 0);
}

function fortune(random: RandomSession, label: string): number {
  return random.integer(label, 920, 1080) / 1000;
}

export function startCampaign(
  state: MilitaryState,
  input: StartCampaignInput,
  atHours: number,
  random: RandomSession,
): StartCampaignResult {
  if (state.campaigns[input.campaignId])
    throw new Error(`campaign ${input.campaignId} already exists`);
  if (!hasCampaignBase(state, input.attackerId, input.baseTerritoryId)) {
    throw new Error('attacker lacks a valid campaign base');
  }
  if (!isAdjacent(input.baseTerritoryId, input.targetTerritoryId)) {
    throw new Error('campaign target is not adjacent to its base');
  }
  if (input.targetTerritoryId === 'capital') {
    if (state.phase === 'stable' || state.phase === 'ailing') {
      throw new Error('Capital march is unavailable before Gravely Ill');
    }
    const authorization = input.capitalAuthorizationId
      ? state.capitalMarchAuthorizations[input.capitalAuthorizationId]
      : null;
    if (
      !authorization ||
      authorization.campaignId !== input.campaignId ||
      authorization.claimantId !== input.attackerId ||
      authorization.expiresAtHours < atHours
    ) {
      throw new Error(
        'March on the Capital requires a current campaign-bound claimant authorization',
      );
    }
    if (input.goal !== 'capital') throw new Error('Capital campaign requires capital goal');
  } else if (input.goal === 'capital') {
    throw new Error('capital goal requires the Capital target');
  } else if (input.capitalAuthorizationId !== null) {
    throw new Error('Capital authorization is valid only for a Capital campaign');
  }
  if (
    input.goal === 'liberate' &&
    input.targetTerritoryId !== 'capital' &&
    !state.territories[input.targetTerritoryId].occupation
  ) {
    throw new Error('liberation requires a hostile occupation');
  }
  if (input.forces[0]?.lordId !== input.attackerId) {
    throw new Error('first force request must be the attacking lord');
  }
  if (input.forces[0].basingTerritoryId !== input.baseTerritoryId) {
    throw new Error('first force request must use the declared campaign base');
  }
  const attackerAidAuthorizationIds = validateForceContributors(state, {
    atHours,
    beneficiaryId: input.attackerId,
    campaignId: input.campaignId,
    forceRequests: input.forces,
    side: 'attacker',
    targetTerritoryId: input.targetTerritoryId,
  });
  const defenderId = campaignDefender(state, input.targetTerritoryId);
  const defensiveCause = isDefensiveCampaign(state, input, defenderId, atHours);
  const consequences = royalAuthorityConsequences(state, input.targetTerritoryId, defensiveCause);
  const locked = lockForceRequests(state, input.campaignId, 'attacker', input.forces);
  const committedTroops = totalCommittedForce(locked.state, locked.commitmentIds).reduce(
    (total, allocation) => total + allocation.troops,
    0,
  );
  const capitalMinimum =
    locked.state.capital.stableStatus === 'uncontrolled' ? 200 : CAPITAL_MINIMUM_ATTACK;
  if (input.targetTerritoryId === 'capital' && committedTroops < capitalMinimum) {
    throw new Error(`March on the Capital requires at least ${capitalMinimum} committed troops`);
  }
  if (
    input.targetTerritoryId === 'capital' &&
    locked.state.capital.stableStatus === 'uncontrolled' &&
    garrisonEligibleTroops(
      totalCommittedForce(locked.state, locked.commitmentIds),
      input.attackerId,
    ) < CAPITAL_GARRISON_REQUIREMENT
  ) {
    throw new Error('Uncontrolled Capital entry requires 200 claimant-owned garrison troops');
  }
  if (defenderId === input.attackerId)
    throw new Error('attacker already controls target territory');
  const resolvesAtHours = atHours + durationHours(locked.state, input.targetTerritoryId);
  const campaign: CampaignState = {
    attackerAidAuthorizationIds,
    attackerCommitmentIds: locked.commitmentIds,
    attackerFortune: fortune(random, `war.${input.campaignId}.attacker-fortune`),
    attackerId: input.attackerId,
    baseTerritoryId: input.baseTerritoryId,
    createdAtHours: atHours,
    defenderCommitmentIds: [],
    defenderAidAuthorizationIds: [],
    defenderFortune: fortune(random, `war.${input.campaignId}.defender-fortune`),
    defenderId,
    defenderIsAi: defenderId !== null && defenderId !== 'greyfen',
    goal: input.goal,
    id: input.campaignId,
    logisticsGold: 10,
    outcome: null,
    phaseAtStart: locked.state.phase,
    publicAtHours: atHours + 12,
    reaction: 'pending',
    reasons: [],
    royalDefenderTroops: consequences.royalDefenderTroops,
    resolvesAtHours,
    status: 'scheduled',
    targetControllerAtStart: defenderId,
    targetTerritoryId: input.targetTerritoryId,
  };
  const attacker = locked.state.lords[input.attackerId];
  const offensive = !defensiveCause;
  const next: MilitaryState = {
    ...locked.state,
    campaigns: { ...locked.state.campaigns, [campaign.id]: campaign },
    history: [
      ...locked.state.history,
      {
        atHours,
        campaignId: campaign.id,
        kind: 'campaign-started',
        lordId: input.attackerId,
        reason: `${committedTroops} troops committed from ${input.baseTerritoryId}`,
        territoryId: input.targetTerritoryId,
      },
    ],
    lords: {
      ...locked.state.lords,
      [input.attackerId]: {
        ...attacker,
        offensiveWarsInitiated: attacker.offensiveWarsInitiated + (offensive ? 1 : 0),
      },
    },
  };
  return {
    campaign,
    consequences,
    state: next,
  };
}

export function existingDefenseCommitments(
  state: MilitaryState,
  campaign: CampaignState,
): string[] {
  if (campaign.targetTerritoryId === 'capital') {
    return state.capital.garrisonCommitmentId ? [state.capital.garrisonCommitmentId] : [];
  }
  const occupation = state.territories[campaign.targetTerritoryId].occupation;
  return occupation ? [occupation.garrisonCommitmentId] : [];
}

export function makeCampaignPublic(state: MilitaryState, campaignId: string): MilitaryState {
  const campaign = state.campaigns[campaignId];
  if (campaign?.status !== 'scheduled') throw new Error('campaign is not awaiting visibility');
  const existing = existingDefenseCommitments(state, campaign);
  return {
    ...state,
    campaigns: {
      ...state.campaigns,
      [campaignId]: { ...campaign, defenderCommitmentIds: existing, status: 'public' },
    },
    history: [
      ...state.history,
      {
        atHours: campaign.publicAtHours,
        campaignId,
        kind: 'campaign-public',
        lordId: campaign.attackerId,
        reason: 'campaign became public after 12 hours',
        territoryId: campaign.targetTerritoryId,
      },
    ],
  };
}

export function reactToCampaign(
  state: MilitaryState,
  campaignId: string,
  reaction: 'defend' | 'withdraw-occupation' | 'yield',
  forceRequests: readonly ForceRequest[],
  atHours: number,
  yieldAssessmentId: string | null = null,
): MilitaryState {
  const campaign = state.campaigns[campaignId];
  if (campaign?.status !== 'public' || campaign.reaction !== 'pending') {
    throw new Error('campaign is not awaiting a defender reaction');
  }
  if (reaction === 'yield' && campaign.defenderIsAi) {
    const assessment = yieldAssessmentId ? state.yieldAssessments[yieldAssessmentId] : null;
    if (
      !assessment ||
      assessment.observerId !== campaign.defenderId ||
      assessment.attackerId !== campaign.attackerId ||
      assessment.campaignId !== campaign.id ||
      assessment.expiresAtHours < atHours
    ) {
      throw new Error('AI Yield requires a current observer-scoped knowledge assessment');
    }
    const ratio = assessment.attackerExpectedPower / Math.max(1, assessment.defenderExpectedPower);
    if (ratio < 1.75 || assessment.alliedReliefAvailable) {
      throw new Error('AI may yield only at 1.75× known power with no allied relief');
    }
  }
  if (reaction === 'withdraw-occupation' && campaign.goal !== 'liberate') {
    throw new Error('withdraw-occupation is available only against a hostile occupation');
  }
  let next = state;
  let addedCommitmentIds: string[] = [];
  let addedAuthorizationIds: string[] = [];
  if (reaction === 'defend' && forceRequests.length > 0) {
    const defenderId = campaign.defenderId;
    if (!defenderId || forceRequests[0]?.lordId !== defenderId) {
      throw new Error('first defensive force must belong to the current defender');
    }
    addedAuthorizationIds = validateForceContributors(next, {
      atHours,
      beneficiaryId: defenderId,
      campaignId,
      forceRequests,
      side: 'defender',
      targetTerritoryId: campaign.targetTerritoryId,
    });
    const locked = lockForceRequests(next, campaignId, 'defender', forceRequests);
    next = locked.state;
    addedCommitmentIds = locked.commitmentIds;
  }
  const current = next.campaigns[campaignId] as CampaignState;
  return {
    ...next,
    campaigns: {
      ...next.campaigns,
      [campaignId]: {
        ...current,
        defenderAidAuthorizationIds: [
          ...current.defenderAidAuthorizationIds,
          ...addedAuthorizationIds,
        ],
        defenderCommitmentIds: [...current.defenderCommitmentIds, ...addedCommitmentIds],
        reaction,
      },
    },
  };
}

function royalDefense(state: MilitaryState, campaign: CampaignState): ForceAllocation[] {
  const troops =
    campaign.targetTerritoryId === 'capital' && state.capital.stableStatus === 'royal'
      ? state.capital.royalGarrison
      : campaign.royalDefenderTroops;
  if (troops === 0) return [];
  return [
    {
      garrisonEligible: false,
      ownerId: null,
      sourceId: 'royal-capital-garrison',
      sourceKind: 'royal',
      troops,
    },
  ];
}

function stableTargetController(state: MilitaryState, campaign: CampaignState): LordId | null {
  return campaign.targetTerritoryId === 'capital'
    ? state.capital.controllerLordId
    : state.territories[campaign.targetTerritoryId].controllerLordId;
}

function updateBattleFacts(
  state: MilitaryState,
  campaign: CampaignState,
  battle: BattleResult,
  atHours: number,
  resolvedDefenderId: LordId | null,
): MilitaryState {
  const attacker = state.lords[campaign.attackerId];
  const attackerVictory = battle.winner === 'attacker';
  const lords = {
    ...state.lords,
    [campaign.attackerId]: {
      ...attacker,
      recentBattleResults: [
        ...attacker.recentBattleResults.filter((fact) => fact.atHours > atHours - 10 * 24),
        {
          atHours,
          major: battle.major,
          result: attackerVictory ? ('victory' as const) : ('defeat' as const),
        },
      ],
    },
  };
  if (resolvedDefenderId) {
    const defender = lords[resolvedDefenderId];
    lords[resolvedDefenderId] = {
      ...defender,
      recentBattleResults: [
        ...defender.recentBattleResults.filter((fact) => fact.atHours > atHours - 10 * 24),
        {
          atHours,
          major: battle.major,
          result: attackerVictory ? ('defeat' as const) : ('victory' as const),
        },
      ],
    };
  }
  return { ...state, lords };
}

function completeCampaign(
  state: MilitaryState,
  campaign: CampaignState,
  outcome: CampaignState['outcome'],
  reasons: readonly string[],
  atHours: number,
): MilitaryState {
  const current = state.campaigns[campaign.id] as CampaignState;
  return {
    ...state,
    campaigns: {
      ...state.campaigns,
      [campaign.id]: { ...current, outcome, reasons: [...reasons], status: 'completed' },
    },
    history: [
      ...state.history,
      {
        atHours,
        campaignId: campaign.id,
        kind: 'campaign-completed',
        lordId: campaign.attackerId,
        reason: reasons.join('; '),
        territoryId: campaign.targetTerritoryId,
      },
    ],
  };
}

function markCampaignForcesReturning(
  state: MilitaryState,
  commitmentIds: readonly string[],
  atHours: number,
): MilitaryState {
  const returnable = commitmentIds.filter((id) => state.commitments[id]?.kind === 'campaign');
  return markCommitmentsReturning(state, returnable, atHours + 24);
}

export interface ResolveCampaignResult {
  readonly battle: BattleResult | null;
  readonly prestigeDeltas: Readonly<Record<string, number>>;
  readonly state: MilitaryState;
}

export function campaignPrestigeDeltas(
  campaign: CampaignState,
  battle: BattleResult | null,
  outcome: CampaignState['outcome'],
): Readonly<Record<string, number>> {
  if (campaign.targetTerritoryId === 'capital') {
    if (
      outcome === 'attacker-victory' ||
      outcome === 'unopposed-entry' ||
      outcome === 'pyrrhic-capital'
    ) {
      const defenderBattleLoss = battle ? (battle.major ? -4 : -2) : 0;
      return {
        [campaign.attackerId]: 8,
        ...(campaign.defenderId ? { [campaign.defenderId]: defenderBattleLoss - 8 } : {}),
      };
    }
    if (outcome === 'yield') {
      return {
        [campaign.attackerId]: 3,
        ...(campaign.defenderId ? { [campaign.defenderId]: -13 } : {}),
      };
    }
    if (outcome !== 'defender-victory') return {};
  }
  if (outcome === 'yield') {
    return {
      [campaign.attackerId]: 3,
      ...(campaign.defenderId ? { [campaign.defenderId]: -5 } : {}),
    };
  }
  if (!battle) return {};
  const winnerGain = battle.major ? 8 : 4;
  if (battle.winner === 'attacker') {
    return {
      [campaign.attackerId]: winnerGain,
      ...(campaign.defenderId ? { [campaign.defenderId]: battle.major ? -4 : -2 } : {}),
    };
  }
  return {
    [campaign.attackerId]: battle.major ? -6 : -2,
    ...(campaign.defenderId ? { [campaign.defenderId]: winnerGain } : {}),
  };
}

function withDispossessionPrestige(
  before: MilitaryState,
  after: MilitaryState,
  targetTerritoryId: TerritoryId,
  deltas: Readonly<Record<string, number>>,
): Readonly<Record<string, number>> {
  const legalLordId = before.territories[targetTerritoryId].legalLordId;
  if (
    targetTerritoryId === 'capital' ||
    !legalLordId ||
    before.lords[legalLordId].dispossessed ||
    !after.lords[legalLordId].dispossessed
  ) {
    return deltas;
  }
  return { ...deltas, [legalLordId]: (deltas[legalLordId] ?? 0) - 8 };
}

function dispossessionShockAlreadyApplied(
  state: MilitaryState,
  targetTerritoryId: TerritoryId,
): boolean {
  const legalLordId = state.territories[targetTerritoryId].legalLordId;
  return legalLordId ? state.lords[legalLordId].dispossessed : false;
}

function withCollapsedCapitalPrestige(
  before: MilitaryState,
  after: MilitaryState,
  outcome: CampaignState['outcome'],
  deltas: Readonly<Record<string, number>>,
): Readonly<Record<string, number>> {
  const priorController = before.capital.controllerLordId;
  if (
    outcome !== 'defender-victory' ||
    !priorController ||
    after.capital.controllerLordId === priorController
  ) {
    return deltas;
  }
  return { ...deltas, [priorController]: (deltas[priorController] ?? 0) - 8 };
}

function targetGarrisonCommitmentId(state: MilitaryState, campaign: CampaignState): string | null {
  return campaign.targetTerritoryId === 'capital'
    ? state.capital.garrisonCommitmentId
    : (state.territories[campaign.targetTerritoryId].occupation?.garrisonCommitmentId ?? null);
}

function activeCampaignCommitments(
  state: MilitaryState,
  campaign: CampaignState,
  side: 'attacker' | 'defender',
  atHours: number,
): { readonly activeIds: string[]; readonly state: MilitaryState } {
  const primaryLordId = side === 'attacker' ? campaign.attackerId : campaign.defenderId;
  const authorizationIds =
    side === 'attacker'
      ? campaign.attackerAidAuthorizationIds
      : campaign.defenderAidAuthorizationIds;
  const commitmentIds =
    side === 'attacker' ? campaign.attackerCommitmentIds : campaign.defenderCommitmentIds;
  const activeIds: string[] = [];
  const invalidIds: string[] = [];
  for (const commitmentId of commitmentIds) {
    const commitment = state.commitments[commitmentId];
    if (commitment?.kind !== 'campaign') continue;
    const providerId = commitment.allocations[0]?.ownerId;
    if (providerId === primaryLordId) {
      activeIds.push(commitmentId);
      continue;
    }
    const authorization = authorizationIds
      .map((id) => state.militaryAidAuthorizations[id])
      .find(
        (candidate) =>
          candidate?.beneficiaryId === primaryLordId &&
          candidate.campaignId === campaign.id &&
          candidate.expiresAtHours >= atHours &&
          candidate.providerId === providerId &&
          candidate.side === side,
      );
    const baseId = commitment.territoryId;
    const canReach =
      baseId !== null &&
      (baseId === campaign.targetTerritoryId || isAdjacent(baseId, campaign.targetTerritoryId));
    if (
      authorization &&
      providerId !== null &&
      providerId !== undefined &&
      baseId !== null &&
      canReach &&
      hasCampaignBase(state, providerId, baseId)
    ) {
      activeIds.push(commitmentId);
    } else {
      invalidIds.push(commitmentId);
    }
  }
  return {
    activeIds,
    state:
      invalidIds.length === 0 ? state : markCommitmentsReturning(state, invalidIds, atHours + 24),
  };
}

function cancelAndReturnCampaign(
  state: MilitaryState,
  campaign: CampaignState,
  atHours: number,
  reason: string,
  attackerDelayHours = 24,
): ResolveCampaignResult {
  let cancelled = markCommitmentsReturning(
    state,
    campaign.attackerCommitmentIds,
    atHours + attackerDelayHours,
  );
  cancelled = markCampaignForcesReturning(cancelled, campaign.defenderCommitmentIds, atHours);
  cancelled = completeCampaign(cancelled, campaign, 'cancelled', [reason], atHours);
  return { battle: null, prestigeDeltas: {}, state: cancelled };
}

export function resolveCampaign(
  state: MilitaryState,
  campaignId: string,
  atHours: number,
): ResolveCampaignResult {
  let campaign = state.campaigns[campaignId];
  if (campaign?.status !== 'public' || campaign.reaction === 'pending') {
    throw new Error('campaign cannot resolve before visibility and defender reaction');
  }
  if (!hasCampaignBase(state, campaign.attackerId, campaign.baseTerritoryId)) {
    return cancelAndReturnCampaign(state, campaign, atHours, 'attacker lost every valid base', 48);
  }
  let workingState = state;
  const currentController = stableTargetController(workingState, campaign);
  if (currentController === campaign.attackerId) {
    return cancelAndReturnCampaign(
      workingState,
      campaign,
      atHours,
      'attacker already achieved physical control',
    );
  }
  if (
    campaign.targetTerritoryId !== 'capital' &&
    currentController !== campaign.targetControllerAtStart &&
    currentController === workingState.territories[campaign.targetTerritoryId].legalLordId
  ) {
    return cancelAndReturnCampaign(workingState, campaign, atHours, 'target was already liberated');
  }
  if (currentController !== campaign.targetControllerAtStart) {
    const currentGarrisonId = targetGarrisonCommitmentId(workingState, campaign);
    const obsoleteDefenderIds = campaign.defenderCommitmentIds.filter(
      (id) => id !== currentGarrisonId,
    );
    workingState = markCommitmentsReturning(workingState, obsoleteDefenderIds, atHours + 24);
    campaign = {
      ...campaign,
      defenderAidAuthorizationIds: [],
      defenderCommitmentIds: currentGarrisonId ? [currentGarrisonId] : [],
      defenderId: currentController,
      defenderIsAi: currentController !== null && currentController !== 'greyfen',
      reaction: 'defend',
    };
    workingState = {
      ...workingState,
      campaigns: { ...workingState.campaigns, [campaignId]: campaign },
    };
  }
  if (campaign.reaction === 'withdraw-occupation') {
    const target = campaign.targetTerritoryId;
    if (target === 'capital') throw new Error('Capital cannot use hereditary withdrawal reaction');
    let next = liberateTerritory(workingState, target, atHours);
    next = markCampaignForcesReturning(next, campaign.attackerCommitmentIds, atHours);
    return {
      battle: null,
      prestigeDeltas: {},
      state: completeCampaign(
        next,
        campaign,
        'cancelled',
        ['occupier withdrew before battle'],
        atHours,
      ),
    };
  }
  const activeAttack = activeCampaignCommitments(workingState, campaign, 'attacker', atHours);
  workingState = activeAttack.state;
  const attackerCommitmentIds = activeAttack.activeIds;
  const attackerAllocations = totalCommittedForce(workingState, attackerCommitmentIds);
  if (
    campaign.targetTerritoryId === 'capital' &&
    workingState.capital.stableStatus === 'uncontrolled'
  ) {
    if (
      garrisonEligibleTroops(attackerAllocations, campaign.attackerId) <
      CAPITAL_GARRISON_REQUIREMENT
    ) {
      return cancelAndReturnCampaign(
        workingState,
        campaign,
        atHours,
        'Uncontrolled Capital entry no longer has 200 eligible claimant troops',
      );
    }
    let next = workingState;
    const control = occupyCapital(next, {
      atHours,
      campaignId,
      claimantId: campaign.attackerId,
      commitmentIds: attackerCommitmentIds,
    });
    next = markCampaignForcesReturning(control.state, campaign.attackerCommitmentIds, atHours);
    const completed = completeCampaign(
      next,
      campaign,
      control.controlled ? 'unopposed-entry' : 'cancelled',
      [control.reason],
      atHours,
    );
    const completedCampaign = completed.campaigns[campaignId] as CampaignState;
    return {
      battle: null,
      prestigeDeltas: campaignPrestigeDeltas(
        { ...campaign, defenderId: currentController },
        null,
        completedCampaign.outcome,
      ),
      state: completed,
    };
  }
  if (campaign.reaction === 'yield') {
    let next = workingState;
    let reasons: string[];
    let outcome: CampaignState['outcome'] = 'yield';
    if (campaign.targetTerritoryId === 'capital') {
      const control = occupyCapital(next, {
        atHours,
        campaignId,
        claimantId: campaign.attackerId,
        commitmentIds: attackerCommitmentIds,
      });
      next = control.state;
      reasons = [control.reason, 'defender yielded without casualties'];
      if (!control.controlled) outcome = 'pyrrhic-capital';
    } else if (campaign.goal === 'liberate') {
      next = liberateTerritory(next, campaign.targetTerritoryId, atHours);
      reasons = ['hostile occupier yielded; legal control restored without casualties'];
    } else {
      if (next.territories[campaign.targetTerritoryId].occupation) {
        next = liberateTerritory(next, campaign.targetTerritoryId, atHours);
      }
      const occupation = occupyHereditarySeat(next, {
        atHours,
        campaignId,
        commitmentIds: attackerCommitmentIds,
        dispossessionShockAlreadyApplied: dispossessionShockAlreadyApplied(
          state,
          campaign.targetTerritoryId,
        ),
        occupierId: campaign.attackerId,
        territoryId: campaign.targetTerritoryId,
      });
      next = occupation.state;
      reasons = [occupation.reason, 'defender yielded without casualties'];
      if (!occupation.occupied) outcome = 'cancelled';
    }
    next = markCampaignForcesReturning(next, campaign.attackerCommitmentIds, atHours);
    next = markCampaignForcesReturning(next, campaign.defenderCommitmentIds, atHours);
    const prestigeDeltas = withDispossessionPrestige(
      state,
      next,
      campaign.targetTerritoryId,
      campaignPrestigeDeltas(campaign, null, outcome),
    );
    return {
      battle: null,
      prestigeDeltas,
      state: completeCampaign(next, campaign, outcome, reasons, atHours),
    };
  }
  const activeDefense = activeCampaignCommitments(workingState, campaign, 'defender', atHours);
  workingState = activeDefense.state;
  const currentGarrisonId = targetGarrisonCommitmentId(workingState, campaign);
  const currentDefenseCommitmentIds = [
    ...new Set([...activeDefense.activeIds, ...(currentGarrisonId ? [currentGarrisonId] : [])]),
  ];
  const defenderAllocations = [
    ...totalCommittedForce(workingState, currentDefenseCommitmentIds),
    ...royalDefense(workingState, campaign),
  ];
  if (defenderAllocations.reduce((sum, allocation) => sum + allocation.troops, 0) === 0) {
    const noDefense = {
      ...workingState,
      campaigns: {
        ...workingState.campaigns,
        [campaignId]: { ...campaign, reaction: 'yield' as const },
      },
    };
    return resolveCampaign(noDefense, campaignId, atHours);
  }
  const target = workingState.territories[campaign.targetTerritoryId];
  const resolvedDefenderId = currentController ?? campaign.defenderId;
  const defenderCommander = resolvedDefenderId
    ? workingState.lords[resolvedDefenderId].commanderMultiplier
    : 1;
  let battle = resolveBattle(
    {
      allocations: attackerAllocations,
      commanderMultiplier: workingState.lords[campaign.attackerId].commanderMultiplier,
      fortificationMultiplier: 1,
      fortune: campaign.attackerFortune,
      terrainMultiplier: 1,
    },
    {
      allocations: defenderAllocations,
      commanderMultiplier: defenderCommander,
      fortificationMultiplier: fortificationMultiplier(target.fortification),
      fortune: campaign.defenderFortune,
      terrainMultiplier: target.terrainDefenseMultiplier,
    },
    false,
  );
  let next = applyCommitmentCasualties(
    workingState,
    attackerCommitmentIds,
    battle.attacker.casualties,
  );
  const totalDefenderTroops = defenderAllocations.reduce(
    (sum, allocation) => sum + allocation.troops,
    0,
  );
  const nonRoyalDefenderTroops = defenderAllocations
    .filter((allocation) => allocation.sourceKind !== 'royal')
    .reduce((sum, allocation) => sum + allocation.troops, 0);
  const nonRoyalCasualties = Math.min(
    nonRoyalDefenderTroops,
    Math.round((battle.defender.casualties * nonRoyalDefenderTroops) / totalDefenderTroops),
  );
  next = applyCommitmentCasualties(next, currentDefenseCommitmentIds, nonRoyalCasualties);
  if (campaign.targetTerritoryId === 'capital' && workingState.capital.stableStatus === 'royal') {
    const royalCasualties = battle.defender.casualties - nonRoyalCasualties;
    next = {
      ...next,
      capital: {
        ...next.capital,
        royalGarrison: Math.max(0, next.capital.royalGarrison - royalCasualties),
      },
    };
  }
  let outcome: CampaignState['outcome'] =
    battle.winner === 'attacker' ? 'attacker-victory' : 'defender-victory';
  const reasons = [
    ...battle.reasons,
    `casualties ${battle.attacker.casualties}/${battle.defender.casualties}`,
  ];
  if (battle.winner === 'attacker') {
    if (campaign.targetTerritoryId === 'capital') {
      const control = occupyCapital(next, {
        atHours,
        campaignId,
        claimantId: campaign.attackerId,
        commitmentIds: attackerCommitmentIds,
      });
      next = control.state;
      reasons.push(control.reason);
      if (!control.controlled) outcome = 'pyrrhic-capital';
    } else if (campaign.goal === 'liberate') {
      next = liberateTerritory(next, campaign.targetTerritoryId, atHours);
      reasons.push('legal control restored');
    } else {
      if (next.territories[campaign.targetTerritoryId].occupation) {
        next = liberateTerritory(next, campaign.targetTerritoryId, atHours);
      }
      const occupation = occupyHereditarySeat(next, {
        atHours,
        campaignId,
        commitmentIds: attackerCommitmentIds,
        dispossessionShockAlreadyApplied: dispossessionShockAlreadyApplied(
          state,
          campaign.targetTerritoryId,
        ),
        occupierId: campaign.attackerId,
        territoryId: campaign.targetTerritoryId,
      });
      next = occupation.state;
      reasons.push(occupation.reason);
      if (!occupation.occupied) outcome = 'cancelled';
    }
  }
  if (
    !battle.major &&
    battle.winner === 'attacker' &&
    (outcome === 'attacker-victory' || outcome === 'pyrrhic-capital')
  ) {
    battle = { ...battle, major: true };
  }
  next = revalidateHereditaryGarrisons(next, atHours);
  next = revalidateCapitalGarrison(next, atHours);
  if (!battle.major && stableTargetController(next, campaign) !== currentController) {
    battle = { ...battle, major: true };
  }
  next = updateBattleFacts(next, campaign, battle, atHours, resolvedDefenderId);
  next = markCampaignForcesReturning(next, campaign.attackerCommitmentIds, atHours);
  next = markCampaignForcesReturning(next, campaign.defenderCommitmentIds, atHours);
  next = completeCampaign(next, campaign, outcome, reasons, atHours);
  const prestigeDeltas = withCollapsedCapitalPrestige(
    state,
    next,
    outcome,
    withDispossessionPrestige(
      state,
      next,
      campaign.targetTerritoryId,
      campaignPrestigeDeltas({ ...campaign, defenderId: resolvedDefenderId }, battle, outcome),
    ),
  );
  return {
    battle,
    prestigeDeltas,
    state: next,
  };
}
