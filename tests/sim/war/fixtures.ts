import { canonicalGameContent } from '../../../src/contracts/content';
import type { LordId, PhaseId, TerritoryId } from '../../../src/contracts/ids';
import { createFoundationGameState } from '../../../src/contracts/state';
import {
  installMilitaryState,
  type MilitaryGameState,
} from '../../../src/sim/systems/military/domain';
import { createMilitaryState } from '../../../src/sim/systems/military/state';
import type {
  LordMilitaryState,
  MilitaryState,
  TerritoryMilitaryState,
} from '../../../src/sim/systems/military/types';

const seats: Record<LordId, Exclude<TerritoryId, 'capital'>> = {
  edric: 'northkeep',
  greyfen: 'greyfen',
  mara: 'westmarch',
  oswin: 'abbeylands',
  renard: 'southmere',
  ysabel: 'eastvale',
};
const capacities: Record<LordId, number> = {
  edric: 720,
  greyfen: 420,
  mara: 500,
  oswin: 260,
  renard: 520,
  ysabel: 300,
};
const available: Record<LordId, number> = {
  edric: 620,
  greyfen: 360,
  mara: 430,
  oswin: 210,
  renard: 450,
  ysabel: 240,
};

export function testLord(
  lordId: LordId,
  override: Partial<LordMilitaryState> = {},
): LordMilitaryState {
  return {
    alliedBasingTerritoryIds: [],
    availableLevies: available[lordId],
    commanderMultiplier: lordId === 'edric' ? 1.1 : 1,
    dispossessed: false,
    legalSeatId: seats[lordId],
    levyCapacity: capacities[lordId],
    lordId,
    offensiveWarsInitiated: 0,
    permanentLevyCasualties: 0,
    recentBattleResults: [],
    treatyViolations: 0,
    ...override,
  };
}

const territoryData: Record<
  TerritoryId,
  Omit<TerritoryMilitaryState, 'controllerLordId' | 'legalLordId' | 'occupation' | 'territoryId'>
> = {
  abbeylands: { fortification: 2, terrainDefenseMultiplier: 1, traitId: 'holy-seat', wealth: 3 },
  capital: { fortification: 3, terrainDefenseMultiplier: 1, traitId: 'seat-of-crown', wealth: 4 },
  eastvale: { fortification: 1, terrainDefenseMultiplier: 1, traitId: 'golden-vale', wealth: 5 },
  greyfen: { fortification: 1, terrainDefenseMultiplier: 1, traitId: 'fen-roads', wealth: 2 },
  northkeep: { fortification: 3, terrainDefenseMultiplier: 1.1, traitId: 'iron-hills', wealth: 2 },
  southmere: { fortification: 2, terrainDefenseMultiplier: 1, traitId: 'old-blood', wealth: 4 },
  westmarch: {
    fortification: 1,
    terrainDefenseMultiplier: 1,
    traitId: 'free-companies',
    wealth: 2,
  },
};

export function testTerritory(
  territoryId: TerritoryId,
  override: Partial<TerritoryMilitaryState> = {},
): TerritoryMilitaryState {
  const legalLordId =
    territoryId === 'capital'
      ? null
      : (Object.entries(seats).find(([, seat]) => seat === territoryId)?.[0] as LordId);
  return {
    ...territoryData[territoryId],
    controllerLordId: legalLordId,
    legalLordId,
    occupation: null,
    territoryId,
    ...override,
  };
}

export function createTestMilitaryState(
  options: {
    readonly lordOverrides?: Partial<Record<LordId, Partial<LordMilitaryState>>>;
    readonly phase?: PhaseId;
    readonly territoryOverrides?: Partial<Record<TerritoryId, Partial<TerritoryMilitaryState>>>;
  } = {},
): MilitaryState {
  const lordIds = Object.keys(seats) as LordId[];
  const territoryIds = Object.keys(territoryData) as TerritoryId[];
  return createMilitaryState({
    capitalRoyalGarrison: options.phase === 'deathbed' ? 300 : 450,
    lords: lordIds.map((lordId) => testLord(lordId, options.lordOverrides?.[lordId])),
    phase: options.phase ?? 'gravely-ill',
    territories: territoryIds.map((territoryId) =>
      testTerritory(territoryId, options.territoryOverrides?.[territoryId]),
    ),
  });
}

export function createTestMilitaryGameState(
  military = createTestMilitaryState(),
  seed = 'wp-022-test',
): MilitaryGameState {
  return installMilitaryState(
    createFoundationGameState({ content: canonicalGameContent, diagnostics: true, seed }),
    military,
  );
}
