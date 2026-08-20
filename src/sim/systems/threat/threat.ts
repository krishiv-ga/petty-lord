import type { LordId, TerritoryId } from '../../../contracts/ids';
import { armyAvailability, commitmentTroops } from '../military/availability';
import { fortificationMultiplier } from '../military/battle';
import { isAdjacent } from '../military/state';
import type { MilitaryState } from '../military/types';

export interface MilitaryFact {
  readonly kind:
    | 'army-strength'
    | 'capital-control'
    | 'occupation'
    | 'offensive-war'
    | 'proximity'
    | 'public-support'
    | 'recent-result'
    | 'succession-viability'
    | 'treaty-violation';
  readonly lordId: LordId;
  readonly magnitude: number;
  readonly territoryId: TerritoryId | null;
}

export interface MilitaryLeverageResult {
  readonly credible: boolean;
  readonly reasons: string[];
  readonly sourceCommitmentIds: string[];
  readonly supportingFacts: MilitaryFact[];
}

export function collectAuthoritativeMilitaryFacts(
  state: MilitaryState,
  lordId: LordId,
  succession: {
    readonly declared?: boolean;
    readonly publicSupportCount?: number;
    readonly viable?: boolean;
  } = {},
): MilitaryFact[] {
  const availability = armyAvailability(state, lordId);
  const facts: MilitaryFact[] = [
    {
      kind: 'army-strength',
      lordId,
      magnitude: availability.totalAvailable,
      territoryId: null,
    },
  ];
  for (const territory of Object.values(state.territories)) {
    if (territory.occupation?.occupierId === lordId) {
      facts.push({ kind: 'occupation', lordId, magnitude: 1, territoryId: territory.territoryId });
    }
    if (territory.controllerLordId === lordId) {
      for (const adjacent of Object.values(state.territories)) {
        if (adjacent.legalLordId && isAdjacent(territory.territoryId, adjacent.territoryId)) {
          facts.push({
            kind: 'proximity',
            lordId,
            magnitude: 1,
            territoryId: adjacent.territoryId,
          });
        }
      }
    }
  }
  if (state.capital.controllerLordId === lordId && state.capital.stableStatus === 'occupied') {
    facts.push({ kind: 'capital-control', lordId, magnitude: 1, territoryId: 'capital' });
  }
  if (succession.declared || succession.viable) {
    facts.push({
      kind: 'succession-viability',
      lordId,
      magnitude: Number(Boolean(succession.declared)) + Number(Boolean(succession.viable)),
      territoryId: null,
    });
  }
  if ((succession.publicSupportCount ?? 0) > 0) {
    facts.push({
      kind: 'public-support',
      lordId,
      magnitude: succession.publicSupportCount ?? 0,
      territoryId: null,
    });
  }
  const lord = state.lords[lordId];
  if (lord.offensiveWarsInitiated > 0) {
    facts.push({
      kind: 'offensive-war',
      lordId,
      magnitude: lord.offensiveWarsInitiated,
      territoryId: null,
    });
  }
  if (lord.treatyViolations > 0) {
    facts.push({
      kind: 'treaty-violation',
      lordId,
      magnitude: lord.treatyViolations,
      territoryId: null,
    });
  }
  for (const result of lord.recentBattleResults) {
    facts.push({
      kind: 'recent-result',
      lordId,
      magnitude: result.result === 'victory' ? 1 : -1,
      territoryId: null,
    });
  }
  return facts;
}

function defensivePower(state: MilitaryState, targetId: LordId): number {
  const lord = state.lords[targetId];
  const seat = state.territories[lord.legalSeatId];
  const available = armyAvailability(state, targetId).totalAvailable;
  return (
    available *
    lord.commanderMultiplier *
    seat.terrainDefenseMultiplier *
    fortificationMultiplier(seat.fortification)
  );
}

export function queryMilitaryLeverage(
  state: MilitaryState,
  candidateId: LordId,
  targetId: LordId,
  purpose: 'concession' | 'pledge' = 'pledge',
): MilitaryLeverageResult {
  if (candidateId === targetId)
    return {
      credible: false,
      reasons: ['cannot coerce self'],
      sourceCommitmentIds: [],
      supportingFacts: [],
    };
  if (targetId === 'renard') {
    return {
      credible: false,
      reasons: ['Renard uses the separate forced-withdrawal gate'],
      sourceCommitmentIds: [],
      supportingFacts: [],
    };
  }
  const targetSeat = state.lords[targetId].legalSeatId;
  const occupation = state.territories[targetSeat].occupation;
  const targetDefense = defensivePower(state, targetId);
  const candidateAvailable = armyAvailability(state, candidateId).totalAvailable;
  const adjacentBase = Object.values(state.territories).some(
    (territory) =>
      (territory.controllerLordId === candidateId ||
        state.lords[candidateId].alliedBasingTerritoryIds.includes(territory.territoryId)) &&
      isAdjacent(territory.territoryId, targetSeat),
  );
  const threshold =
    targetId === 'ysabel' ? 1.25 : targetId === 'mara' ? 1.5 : targetId === 'edric' ? 2 : 1.25;
  const overwhelming =
    adjacentBase && candidateAvailable > 0 && candidateAvailable >= targetDefense * threshold;
  const occupiesSeat = occupation?.occupierId === candidateId;
  const reasons: string[] = [];
  if (overwhelming)
    reasons.push(`adjacent available force meets ${threshold.toFixed(2)}× threshold`);
  if (occupiesSeat) reasons.push(`candidate occupies ${targetSeat}`);
  if (!adjacentBase && !occupiesSeat)
    reasons.push('no adjacent campaign base or target-seat occupation');
  if (targetId === 'edric' && occupiesSeat && candidateAvailable >= 250) {
    reasons.push(
      'Edric retains at least 250 available troops; occupation alone cannot force a Pledge',
    );
  }
  if (targetId === 'oswin' && purpose === 'pledge')
    reasons.push('Oswin does not yield a Pledge to military force');
  const occupationCredible =
    occupiesSeat &&
    (targetId !== 'edric' || armyAvailability(state, targetId).totalAvailable < 250);
  const credible =
    (overwhelming || occupationCredible) && !(targetId === 'oswin' && purpose === 'pledge');
  return {
    credible,
    reasons,
    sourceCommitmentIds: Object.values(state.commitments)
      .filter((commitment) =>
        commitment.allocations.some((allocation) => allocation.ownerId === candidateId),
      )
      .map((commitment) => commitment.id)
      .sort(),
    supportingFacts: collectAuthoritativeMilitaryFacts(state, candidateId).filter(
      (fact) => fact.kind === 'army-strength' || fact.territoryId === targetSeat,
    ),
  };
}

export interface RenardWithdrawalLeverageResult extends MilitaryLeverageResult {
  readonly capitalControlled: boolean;
  readonly renardArmyBelowThreshold: boolean;
  readonly renardHasNoSupporters: boolean;
  readonly southmereOccupied: boolean;
}

export function queryRenardWithdrawalLeverage(
  state: MilitaryState,
  candidateId: LordId,
  renardSupportCount: number,
): RenardWithdrawalLeverageResult {
  if (!Number.isSafeInteger(renardSupportCount) || renardSupportCount < 0) {
    throw new RangeError('Renard support count must be a non-negative whole number');
  }
  const capitalControlled = state.capital.controllerLordId === candidateId;
  const renardHasNoSupporters = renardSupportCount === 0;
  const southmereOccupied = state.territories.southmere.occupation !== null;
  const renardArmyBelowThreshold = armyAvailability(state, 'renard').totalAvailable < 150;
  const credible =
    candidateId !== 'renard' &&
    capitalControlled &&
    renardHasNoSupporters &&
    (southmereOccupied || renardArmyBelowThreshold);
  const reasons = [
    capitalControlled ? 'candidate controls the Capital' : 'candidate does not control the Capital',
    renardHasNoSupporters ? 'Renard has no supporters' : 'Renard still has supporters',
    southmereOccupied
      ? 'Southmere is occupied'
      : renardArmyBelowThreshold
        ? 'Renard army is below 150'
        : 'Southmere is not occupied and Renard army is at least 150',
  ];
  return {
    capitalControlled,
    credible,
    reasons,
    renardArmyBelowThreshold,
    renardHasNoSupporters,
    southmereOccupied,
    sourceCommitmentIds: [],
    supportingFacts: collectAuthoritativeMilitaryFacts(state, candidateId).filter(
      (fact) => fact.kind === 'capital-control',
    ),
  };
}

export interface AcclamationChecklist {
  readonly capitalControlled: boolean;
  readonly capitalTroops: number;
  readonly claimantId: LordId;
  readonly declared: boolean;
  readonly eligible: boolean;
  readonly nonCapitalSeatsControlled: TerritoryId[];
  readonly reasons: string[];
}

export function militaryAcclamationChecklist(
  state: MilitaryState,
  claimantId: LordId,
  declaredClaimants: readonly LordId[],
): AcclamationChecklist {
  const declared = declaredClaimants.includes(claimantId);
  const capitalControlled =
    state.capital.stableStatus === 'occupied' && state.capital.controllerLordId === claimantId;
  const capitalTroops = state.capital.garrisonCommitmentId
    ? commitmentTroops(
        state.commitments[state.capital.garrisonCommitmentId] ?? {
          allocations: [],
          campaignId: null,
          id: '',
          kind: 'capital-garrison',
          releaseAtHours: null,
          territoryId: 'capital',
        },
      )
    : 0;
  const nonCapitalSeatsControlled = Object.values(state.territories)
    .filter(
      (territory) =>
        territory.territoryId !== 'capital' && territory.controllerLordId === claimantId,
    )
    .map((territory) => territory.territoryId)
    .sort();
  const reasons = [
    declared ? 'claimant is declared' : 'claimant is not declared',
    capitalControlled ? 'claimant controls the Capital' : 'claimant does not control the Capital',
    `${nonCapitalSeatsControlled.length} non-Capital seats physically controlled`,
    `${capitalTroops} troops assigned in the Capital`,
  ];
  return {
    capitalControlled,
    capitalTroops,
    claimantId,
    declared,
    eligible:
      declared &&
      capitalControlled &&
      nonCapitalSeatsControlled.length >= 3 &&
      capitalTroops >= 200,
    nonCapitalSeatsControlled,
    reasons,
  };
}

export function findMilitaryAcclamation(
  state: MilitaryState,
  declaredClaimants: readonly LordId[],
): AcclamationChecklist | null {
  const eligible = declaredClaimants
    .map((claimantId) => militaryAcclamationChecklist(state, claimantId, declaredClaimants))
    .filter((checklist) => checklist.eligible);
  if (eligible.length > 1)
    throw new Error('contradictory state: multiple Military Acclamation claimants');
  return eligible[0] ?? null;
}
