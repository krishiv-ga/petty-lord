import {
  LORD_IDS,
  type LordId,
  type PhaseId,
  TERRITORY_IDS,
  type TerritoryId,
} from '../../../contracts/ids';
import type {
  CapitalControlState,
  DefensiveAuthorization,
  LordMilitaryState,
  MilitaryState,
  TerritoryMilitaryState,
  YieldAssessment,
} from './types';

export interface CreateMilitaryStateOptions {
  readonly capitalRoyalGarrison?: number;
  readonly lords: readonly LordMilitaryState[];
  readonly phase?: PhaseId;
  readonly territories: readonly TerritoryMilitaryState[];
}

function exactRecord<K extends string, V>(
  ids: readonly K[],
  values: readonly V[],
  getId: (value: V) => K,
  label: string,
): Record<K, V> {
  const entries = new Map(values.map((value) => [getId(value), value]));
  for (const id of ids) {
    if (!entries.has(id)) throw new Error(`Missing ${label} ${id}`);
  }
  if (entries.size !== ids.length) throw new Error(`Unexpected or duplicate ${label}`);
  return Object.fromEntries(ids.map((id) => [id, entries.get(id)])) as Record<K, V>;
}

export function createMilitaryState(options: CreateMilitaryStateOptions): MilitaryState {
  const lords = exactRecord(LORD_IDS, options.lords, (lord) => lord.lordId, 'lord');
  const territories = exactRecord(
    TERRITORY_IDS,
    options.territories,
    (territory) => territory.territoryId,
    'territory',
  );
  for (const lord of Object.values(lords)) {
    validateWholeTroops(lord.availableLevies, `${lord.lordId} available levies`);
    validateWholeTroops(lord.levyCapacity, `${lord.lordId} levy capacity`);
    if (lord.availableLevies > lord.levyCapacity) {
      throw new Error(`${lord.lordId} available levies exceed capacity`);
    }
    if (lord.commanderMultiplier < 0.9 || lord.commanderMultiplier > 1.1) {
      throw new Error(
        `${lord.lordId} commander multiplier is outside the canonical 0.90–1.10 range`,
      );
    }
    if (territories[lord.legalSeatId].legalLordId !== lord.lordId) {
      throw new Error(`${lord.lordId} legal seat does not match territory authority`);
    }
  }
  for (const territory of Object.values(territories)) {
    if (!Number.isSafeInteger(territory.fortification) || territory.fortification < 0) {
      throw new Error(`${territory.territoryId} fortification must be a non-negative integer`);
    }
    if (
      !Number.isFinite(territory.terrainDefenseMultiplier) ||
      territory.terrainDefenseMultiplier <= 0
    ) {
      throw new Error(`${territory.territoryId} terrain multiplier must be positive`);
    }
  }
  const capital = territories.capital;
  if (capital.legalLordId !== null || capital.controllerLordId !== null) {
    throw new Error('Capital must begin under royal administration');
  }
  const capitalState: CapitalControlState = {
    controllerLordId: null,
    garrisonCommitmentId: null,
    pendingCampaignIds: [],
    royalGarrison: options.capitalRoyalGarrison ?? 450,
    stableStatus: 'royal',
    status: 'royal',
  };
  return {
    campaigns: {},
    capital: capitalState,
    commitments: {},
    contractedForces: {},
    defensiveAuthorizations: {},
    history: [],
    lords,
    phase: options.phase ?? 'stable',
    territories,
    yieldAssessments: {},
  };
}

export function validateWholeTroops(value: number, label = 'troops'): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative whole number`);
  }
}

export function setMilitaryPhase(state: MilitaryState, phase: PhaseId): MilitaryState {
  const phaseMaximum = phase === 'deathbed' ? 300 : phase === 'gravely-ill' ? 450 : null;
  const royalGarrison =
    state.capital.stableStatus === 'royal' && phaseMaximum !== null
      ? Math.min(state.capital.royalGarrison, phaseMaximum)
      : state.capital.royalGarrison;
  return { ...state, capital: { ...state.capital, royalGarrison }, phase };
}

export function addDefensiveAuthorization(
  state: MilitaryState,
  authorization: DefensiveAuthorization,
): MilitaryState {
  if (state.defensiveAuthorizations[authorization.id]) {
    throw new Error(`defensive authorization ${authorization.id} already exists`);
  }
  return {
    ...state,
    defensiveAuthorizations: {
      ...state.defensiveAuthorizations,
      [authorization.id]: authorization,
    },
  };
}

export function recordYieldAssessment(
  state: MilitaryState,
  assessment: YieldAssessment,
): MilitaryState {
  if (
    !Number.isFinite(assessment.attackerExpectedPower) ||
    assessment.attackerExpectedPower < 0 ||
    !Number.isFinite(assessment.defenderExpectedPower) ||
    assessment.defenderExpectedPower < 0
  ) {
    throw new Error('yield assessment powers must be finite and non-negative');
  }
  return {
    ...state,
    yieldAssessments: { ...state.yieldAssessments, [assessment.id]: assessment },
  };
}

export function isAdjacent(left: TerritoryId, right: TerritoryId): boolean {
  if (left === right) return false;
  if (left === 'capital' || right === 'capital') return true;
  const adjacency: Record<Exclude<TerritoryId, 'capital'>, readonly TerritoryId[]> = {
    abbeylands: ['greyfen', 'capital', 'southmere'],
    eastvale: ['northkeep', 'capital', 'southmere'],
    greyfen: ['westmarch', 'capital', 'abbeylands'],
    northkeep: ['westmarch', 'capital', 'eastvale'],
    southmere: ['eastvale', 'capital', 'abbeylands'],
    westmarch: ['northkeep', 'capital', 'greyfen'],
  };
  return adjacency[left as Exclude<TerritoryId, 'capital'>]?.includes(right) ?? false;
}

export function hasCampaignBase(
  state: MilitaryState,
  lordId: LordId,
  territoryId: TerritoryId,
): boolean {
  const lord = state.lords[lordId];
  const territory = state.territories[territoryId];
  const ownUnoccupiedSeat =
    lord.legalSeatId === territoryId &&
    territory.controllerLordId === lordId &&
    territory.occupation === null;
  const occupiedControl = territory.controllerLordId === lordId;
  return (
    ownUnoccupiedSeat || occupiedControl || lord.alliedBasingTerritoryIds.includes(territoryId)
  );
}
