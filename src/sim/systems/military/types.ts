import type { LordId, PhaseId, TerritoryId } from '../../../contracts/ids';

export type CampaignGoal = 'capital' | 'liberate' | 'occupy';
export type CampaignOutcome =
  | 'attacker-victory'
  | 'cancelled'
  | 'defender-victory'
  | 'pyrrhic-capital'
  | 'unopposed-entry'
  | 'yield';
export type CampaignReaction = 'defend' | 'pending' | 'withdraw-occupation' | 'yield';
export type CampaignStatus = 'cancelled' | 'completed' | 'public' | 'scheduled';
export type CapitalStableStatus = 'occupied' | 'royal' | 'uncontrolled';
export type CommitmentKind =
  | 'aid'
  | 'campaign'
  | 'capital-garrison'
  | 'occupation-garrison'
  | 'returning';
export type ForceSourceKind = 'levy' | 'mercenary' | 'royal' | 'temporary';

export interface ForceAllocation {
  readonly garrisonEligible: boolean;
  readonly ownerId: LordId | null;
  readonly sourceId: string;
  readonly sourceKind: ForceSourceKind;
  readonly troops: number;
}

export interface MilitaryCommitment {
  readonly allocations: ForceAllocation[];
  readonly campaignId: string | null;
  readonly id: string;
  readonly kind: CommitmentKind;
  readonly releaseAtHours: number | null;
  readonly territoryId: TerritoryId | null;
}

export interface ContractedForce {
  readonly assignedCommitmentId: string | null;
  readonly expiresAtHours: number;
  readonly hiredAtHours: number;
  readonly id: string;
  readonly initialTroops: number;
  readonly ownerId: LordId;
  readonly renewalCostGold: number;
  readonly renewable: boolean;
  readonly sourceKind: 'mercenary' | 'temporary';
  readonly troops: number;
}

export interface LordMilitaryState {
  readonly alliedBasingTerritoryIds: TerritoryId[];
  readonly availableLevies: number;
  readonly commanderMultiplier: number;
  readonly dispossessed: boolean;
  readonly legalSeatId: TerritoryId;
  readonly levyCapacity: number;
  readonly lordId: LordId;
  readonly offensiveWarsInitiated: number;
  readonly permanentLevyCasualties: number;
  readonly recentBattleResults: RecentBattleFact[];
  readonly treatyViolations: number;
}

export interface RecentBattleFact {
  readonly atHours: number;
  readonly major: boolean;
  readonly result: 'defeat' | 'victory';
}

export interface OccupationRecord {
  readonly beganAtHours: number;
  readonly garrisonCommitmentId: string;
  readonly id: string;
  readonly occupierId: LordId;
}

export interface TerritoryMilitaryState {
  readonly controllerLordId: LordId | null;
  readonly fortification: number;
  readonly legalLordId: LordId | null;
  readonly occupation: OccupationRecord | null;
  readonly terrainDefenseMultiplier: number;
  readonly territoryId: TerritoryId;
  readonly traitId: string | null;
  readonly wealth: number;
}

export interface CapitalControlState {
  readonly controllerLordId: LordId | null;
  readonly garrisonCommitmentId: string | null;
  readonly pendingCampaignIds: string[];
  readonly royalGarrison: number;
  readonly stableStatus: CapitalStableStatus;
  readonly status: CapitalStableStatus | 'contested';
}

export interface ForceRequest {
  readonly basingTerritoryId: TerritoryId;
  readonly garrisonEligible: boolean;
  readonly levyTroops: number;
  readonly lordId: LordId;
  readonly mercenaryIds: string[];
}

export interface CampaignState {
  readonly attackerCommitmentIds: string[];
  readonly attackerFortune: number;
  readonly attackerId: LordId;
  readonly baseTerritoryId: TerritoryId;
  readonly createdAtHours: number;
  readonly defenderCommitmentIds: string[];
  readonly defenderFortune: number;
  readonly defenderId: LordId | null;
  readonly defenderIsAi: boolean;
  readonly goal: CampaignGoal;
  readonly id: string;
  readonly logisticsGold: number;
  readonly outcome: CampaignOutcome | null;
  readonly phaseAtStart: PhaseId;
  readonly publicAtHours: number;
  readonly reaction: CampaignReaction;
  readonly reasons: string[];
  readonly royalDefenderTroops: number;
  readonly resolvesAtHours: number;
  readonly status: CampaignStatus;
  readonly targetControllerAtStart: LordId | null;
  readonly targetTerritoryId: TerritoryId;
}

export interface DefensiveAuthorization {
  readonly actorId: LordId;
  readonly expiresAtHours: number;
  readonly id: string;
  readonly kind: 'allied-defense';
  readonly targetTerritoryId: TerritoryId;
}

export interface YieldAssessment {
  readonly alliedReliefAvailable: boolean;
  readonly attackerExpectedPower: number;
  readonly attackerId: LordId;
  readonly campaignId: string;
  readonly defenderExpectedPower: number;
  readonly expiresAtHours: number;
  readonly id: string;
  readonly observerId: LordId;
}

export interface MilitaryHistoryEntry {
  readonly atHours: number;
  readonly campaignId: string | null;
  readonly kind: string;
  readonly lordId: LordId | null;
  readonly reason: string;
  readonly territoryId: TerritoryId | null;
}

export interface MilitaryState {
  readonly campaigns: Record<string, CampaignState>;
  readonly capital: CapitalControlState;
  readonly commitments: Record<string, MilitaryCommitment>;
  readonly contractedForces: Record<string, ContractedForce>;
  readonly defensiveAuthorizations: Record<string, DefensiveAuthorization>;
  readonly history: MilitaryHistoryEntry[];
  readonly lords: Record<LordId, LordMilitaryState>;
  readonly phase: PhaseId;
  readonly territories: Record<TerritoryId, TerritoryMilitaryState>;
  readonly yieldAssessments: Record<string, YieldAssessment>;
}

export interface BattleSideInput {
  readonly allocations: ForceAllocation[];
  readonly commanderMultiplier: number;
  readonly fortificationMultiplier: number;
  readonly fortune: number;
  readonly terrainMultiplier: number;
}

export interface BattleSideResult {
  readonly baseForce: number;
  readonly casualties: number;
  readonly commanderMultiplier: number;
  readonly effectivePower: number;
  readonly fortificationMultiplier: number;
  readonly fortune: number;
  readonly survivors: number;
  readonly terrainMultiplier: number;
}

export interface BattleResult {
  readonly attacker: BattleSideResult;
  readonly casualtyRatio: number;
  readonly defender: BattleSideResult;
  readonly major: boolean;
  readonly reasons: string[];
  readonly winner: 'attacker' | 'defender';
}
