import type { GameContent } from '../../../contracts/content';
import type { ConditionId, LordId, PolicyId, TerritoryId } from '../../../contracts/ids';
import type {
  LordResourceState,
  ResourceDeltaRecord,
  TerritoryEconomyState,
  TimedCondition,
  Wp020GameState,
  Wp020SystemShape,
} from '../time/types';
import { FRACTION_SCALE, getWp020, setWp020 } from '../time/types';

const MULTIPLIER_SCALE = 1_000_000;

function hasCondition(conditions: readonly TimedCondition[], id: ConditionId): boolean {
  return conditions.some((condition) => condition.id === id);
}

function multiplyFixed(value: number, multiplier: number): number {
  return Math.trunc((value * Math.round(multiplier * MULTIPLIER_SCALE)) / MULTIPLIER_SCALE);
}

function appendDelta(system: Wp020SystemShape, record: ResourceDeltaRecord): Wp020SystemShape {
  return { ...system, resourceLedger: [...system.resourceLedger, record] };
}

function replaceLord(
  system: Wp020SystemShape,
  lordId: LordId,
  lord: LordResourceState,
): Wp020SystemShape {
  return { ...system, lords: { ...system.lords, [lordId]: lord } };
}

function replaceTerritory(
  system: Wp020SystemShape,
  territoryId: TerritoryId,
  territory: TerritoryEconomyState,
): Wp020SystemShape {
  return { ...system, territories: { ...system.territories, [territoryId]: territory } };
}

export function availableGold(lord: LordResourceState): number {
  return lord.gold - lord.lockedGold;
}

export function isTerritoryOccupied(territory: TerritoryEconomyState): boolean {
  return (
    territory.physicalControllerId !== null &&
    territory.physicalControllerId !== territory.legalLordId
  );
}

export function legalTraitAvailableTo(territory: TerritoryEconomyState, lordId: LordId): boolean {
  return territory.legalLordId === lordId && territory.physicalControllerId === lordId;
}

export function effectiveFortification(territory: TerritoryEconomyState): number {
  return Math.max(
    0,
    territory.fortification - (hasCondition(territory.conditions, 'unrest') ? 1 : 0),
  );
}

export function enactPolicy(state: Wp020GameState, policyId: PolicyId): Wp020GameState {
  const system = getWp020(state);
  if (system.policies.includes(policyId)) return state;
  return setWp020(state, { ...system, policies: [...system.policies, policyId] });
}

export function activeConditions(
  conditions: readonly TimedCondition[],
  atHours: number,
): readonly TimedCondition[] {
  return conditions.filter(
    (condition) =>
      condition.startedAtHours <= atHours &&
      (condition.expiresAtHours === null || condition.expiresAtHours > atHours),
  );
}

export function putCondition(
  conditions: readonly TimedCondition[],
  id: ConditionId,
  startedAtHours: number,
  expiresAtHours: number | null,
): readonly TimedCondition[] {
  return [
    ...conditions.filter((condition) => condition.id !== id),
    { expiresAtHours, id, startedAtHours },
  ];
}

export function removeCondition(
  conditions: readonly TimedCondition[],
  id: ConditionId,
): readonly TimedCondition[] {
  return conditions.filter((condition) => condition.id !== id);
}

function permanentIncomeMultiplier(territory: TerritoryEconomyState): number {
  let multiplier = 1;
  if (hasCondition(territory.conditions, 'greyfen-charter')) multiplier *= 0.75;
  if (hasCondition(territory.conditions, 'provincial-liberties')) multiplier *= 0.9;
  if (hasCondition(territory.conditions, 'defaulted-debtor')) multiplier *= 0.5;
  return multiplier;
}

export function legalDailyIncomeMillionths(
  territory: TerritoryEconomyState,
  content: GameContent,
): number {
  if (territory.legalLordId === null || isTerritoryOccupied(territory)) return 0;
  const definition = content.territories.find(
    (candidate) => candidate.id === territory.territoryId,
  );
  if (!definition) throw new Error(`Missing territory content for ${territory.territoryId}`);
  let value = (definition.wealth + definition.legalIncomeBonus) * FRACTION_SCALE;
  value = multiplyFixed(value, permanentIncomeMultiplier(territory));
  if (hasCondition(territory.conditions, 'unrest')) return multiplyFixed(value, 0.25);
  if (hasCondition(territory.conditions, 'tax-strain')) return multiplyFixed(value, 0.5);
  return value;
}

export function occupierDailyIncomeMillionths(
  territory: TerritoryEconomyState,
  content: GameContent,
): number {
  if (!isTerritoryOccupied(territory)) return 0;
  const definition = content.territories.find(
    (candidate) => candidate.id === territory.territoryId,
  );
  if (!definition) throw new Error(`Missing territory content for ${territory.territoryId}`);
  return Math.round((definition.occupierIncomePerDay ?? definition.wealth * 0.25) * FRACTION_SCALE);
}

export function dailyLevyRecoveryMillionths(territory: TerritoryEconomyState): number {
  if (
    territory.levyCapacity === null ||
    territory.legalLordId === null ||
    isTerritoryOccupied(territory) ||
    hasCondition(territory.conditions, 'unrest')
  ) {
    return 0;
  }
  let value = territory.levyCapacity * 5_000;
  if (hasCondition(territory.conditions, 'tax-strain')) value = multiplyFixed(value, 0.5);
  if (hasCondition(territory.conditions, 'greyfen-charter')) value = multiplyFixed(value, 0.75);
  return value;
}

export function grossRaiseTaxesDailyMillionths(
  state: Wp020GameState,
  content: GameContent,
): number {
  const territory = getWp020(state).territories.greyfen;
  if (isTerritoryOccupied(territory)) return 0;
  const definition = content.territories.find((candidate) => candidate.id === 'greyfen');
  if (!definition) throw new Error('Missing Greyfen content');
  let value = (definition.wealth + definition.legalIncomeBonus) * FRACTION_SCALE;
  value = multiplyFixed(value, permanentIncomeMultiplier(territory));
  if (getWp020(state).policies.includes('church-immunities')) value = multiplyFixed(value, 0.8);
  return value;
}

export function adjustGold(
  state: Wp020GameState,
  lordId: LordId,
  amount: number,
  reasonId: string,
  territoryId: TerritoryId | null = null,
  chronicleKey: string | null = null,
): Wp020GameState {
  if (!Number.isSafeInteger(amount))
    throw new RangeError('Gold adjustments must be whole integers');
  const system = getWp020(state);
  const lord = system.lords[lordId];
  if (lord.gold + amount < lord.lockedGold || lord.gold + amount < 0) {
    throw new RangeError('Gold adjustment would make resources invalid');
  }
  let next = replaceLord(system, lordId, { ...lord, gold: lord.gold + amount });
  next = appendDelta(next, {
    amount,
    atHours: state.timeHours,
    chronicleKey,
    fractionMillionths: 0,
    lordId,
    reasonId,
    resource: 'gold',
    territoryId,
  });
  return setWp020(state, next);
}

export function spendGold(
  state: Wp020GameState,
  lordId: LordId,
  amount: number,
  reasonId: string,
): Wp020GameState {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new RangeError('Gold cost is invalid');
  if (availableGold(getWp020(state).lords[lordId]) < amount) {
    throw new RangeError('Insufficient available Gold');
  }
  return adjustGold(state, lordId, -amount, reasonId);
}

export function lockGold(state: Wp020GameState, lordId: LordId, amount: number): Wp020GameState {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new RangeError('Gold lock is invalid');
  const system = getWp020(state);
  const lord = system.lords[lordId];
  if (availableGold(lord) < amount) throw new RangeError('Insufficient available Gold');
  return setWp020(
    state,
    replaceLord(system, lordId, { ...lord, lockedGold: lord.lockedGold + amount }),
  );
}

export function unlockGold(state: Wp020GameState, lordId: LordId, amount: number): Wp020GameState {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new RangeError('Gold unlock is invalid');
  const system = getWp020(state);
  const lord = system.lords[lordId];
  if (lord.lockedGold < amount) throw new RangeError('Cannot unlock more Gold than is locked');
  return setWp020(
    state,
    replaceLord(system, lordId, { ...lord, lockedGold: lord.lockedGold - amount }),
  );
}

export function adjustInfluence(
  state: Wp020GameState,
  lordId: LordId,
  amount: number,
  reasonId: string,
): Wp020GameState {
  if (!Number.isSafeInteger(amount)) throw new RangeError('Influence adjustment is invalid');
  const system = getWp020(state);
  const lord = system.lords[lordId];
  const result = lord.influence + amount;
  if (result < 0) throw new RangeError('Influence adjustment would be negative');
  const bounded = Math.min(100, result);
  let next = replaceLord(system, lordId, { ...lord, influence: bounded });
  next = appendDelta(next, {
    amount: bounded - lord.influence,
    atHours: state.timeHours,
    chronicleKey: null,
    fractionMillionths: 0,
    lordId,
    reasonId,
    resource: 'influence',
    territoryId: null,
  });
  return setWp020(state, next);
}

export function spendInfluence(
  state: Wp020GameState,
  lordId: LordId,
  amount: number,
  reasonId: string,
): Wp020GameState {
  if (!Number.isSafeInteger(amount) || amount < 0)
    throw new RangeError('Influence cost is invalid');
  return adjustInfluence(state, lordId, -amount, reasonId);
}

export function adjustBoundedRating(
  state: Wp020GameState,
  lordId: LordId,
  resource: 'claim' | 'prestige',
  amount: number,
  reasonId: string,
): Wp020GameState {
  if (!Number.isSafeInteger(amount)) throw new RangeError('Rating adjustment is invalid');
  const system = getWp020(state);
  const lord = system.lords[lordId];
  const before = lord[resource];
  const after = Math.max(0, Math.min(100, before + amount));
  let next = replaceLord(system, lordId, { ...lord, [resource]: after });
  next = appendDelta(next, {
    amount: after - before,
    atHours: state.timeHours,
    chronicleKey: null,
    fractionMillionths: 0,
    lordId,
    reasonId,
    resource,
    territoryId: null,
  });
  return setWp020(state, next);
}

export function applyGoldMillionths(
  state: Wp020GameState,
  lordId: LordId,
  millionths: number,
  reasonId: string,
  territoryId: TerritoryId | null,
): Wp020GameState {
  if (!Number.isSafeInteger(millionths) || millionths < 0) {
    throw new RangeError('Fractional Gold adjustment is invalid');
  }
  const system = getWp020(state);
  const lord = system.lords[lordId];
  const total = lord.goldFractionMillionths + millionths;
  const whole = Math.floor(total / FRACTION_SCALE);
  const fraction = total % FRACTION_SCALE;
  let next = replaceLord(system, lordId, {
    ...lord,
    gold: lord.gold + whole,
    goldFractionMillionths: fraction,
  });
  next = appendDelta(next, {
    amount: whole,
    atHours: state.timeHours,
    chronicleKey: null,
    fractionMillionths: millionths,
    lordId,
    reasonId,
    resource: 'gold',
    territoryId,
  });
  return setWp020(state, next);
}

export function commitTroops(
  state: Wp020GameState,
  lordId: LordId,
  territoryId: TerritoryId,
  amount: number,
): Wp020GameState {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new RangeError('Troop lock is invalid');
  const system = getWp020(state);
  const territory = system.territories[territoryId];
  if (territory.legalLordId !== lordId || territory.availableLevies < amount) {
    throw new RangeError('Troops are not available to commit');
  }
  let next = replaceTerritory(system, territoryId, {
    ...territory,
    availableLevies: territory.availableLevies - amount,
  });
  next = replaceLord(next, lordId, {
    ...next.lords[lordId],
    committedTroops: next.lords[lordId].committedTroops + amount,
  });
  next = appendDelta(next, {
    amount: -amount,
    atHours: state.timeHours,
    chronicleKey: null,
    fractionMillionths: 0,
    lordId,
    reasonId: 'troops-committed',
    resource: 'levies',
    territoryId,
  });
  return setWp020(state, next);
}

export function releaseTroops(
  state: Wp020GameState,
  lordId: LordId,
  territoryId: TerritoryId,
  amount: number,
): Wp020GameState {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new RangeError('Troop release is invalid');
  const system = getWp020(state);
  const lord = system.lords[lordId];
  const territory = system.territories[territoryId];
  if (territory.legalLordId !== lordId || lord.committedTroops < amount) {
    throw new RangeError('Committed troops are not available to release');
  }
  if (
    territory.levyCapacity === null ||
    territory.availableLevies + amount > territory.levyCapacity
  ) {
    throw new RangeError('Troop release would exceed hereditary capacity');
  }
  let next = replaceLord(system, lordId, {
    ...lord,
    committedTroops: lord.committedTroops - amount,
  });
  next = replaceTerritory(next, territoryId, {
    ...territory,
    availableLevies: territory.availableLevies + amount,
  });
  next = appendDelta(next, {
    amount,
    atHours: state.timeHours,
    chronicleKey: null,
    fractionMillionths: 0,
    lordId,
    reasonId: 'troops-released',
    resource: 'levies',
    territoryId,
  });
  return setWp020(state, next);
}

export function applyDailyEconomy(state: Wp020GameState, content: GameContent): Wp020GameState {
  let next = state;
  let system = getWp020(next);
  const territoryIds = content.territories.map((territory) => territory.id);
  const lordIds = content.lords.map((lord) => lord.id);

  for (const territoryId of territoryIds) {
    const territory = system.territories[territoryId];
    const active = activeConditions(territory.conditions, state.timeHours);
    if (active.length !== territory.conditions.length) {
      system = replaceTerritory(system, territoryId, { ...territory, conditions: active });
    }
  }
  for (const lordId of lordIds) {
    const lord = system.lords[lordId];
    const active = activeConditions(lord.conditions, state.timeHours);
    if (active.length !== lord.conditions.length) {
      system = replaceLord(system, lordId, { ...lord, conditions: active });
    }
  }
  next = setWp020(next, system);

  for (const territoryId of territoryIds) {
    const territory = getWp020(next).territories[territoryId];
    const legalIncome = legalDailyIncomeMillionths(territory, content);
    if (territory.legalLordId !== null && legalIncome > 0) {
      next = applyGoldMillionths(
        next,
        territory.legalLordId,
        legalIncome,
        'territory-legal-income',
        territoryId,
      );
    }
    const occupierIncome = occupierDailyIncomeMillionths(territory, content);
    if (territory.physicalControllerId !== null && occupierIncome > 0) {
      next = applyGoldMillionths(
        next,
        territory.physicalControllerId,
        occupierIncome,
        'territory-occupation-income',
        territoryId,
      );
    }

    const current = getWp020(next).territories[territoryId];
    const recovery = dailyLevyRecoveryMillionths(current);
    const legalLord = current.legalLordId;
    if (current.levyCapacity !== null && legalLord !== null && recovery > 0) {
      const total = current.levyRecoveryMillionths + recovery;
      const maximumAvailable = Math.max(
        0,
        current.levyCapacity - getWp020(next).lords[legalLord].committedTroops,
      );
      const missing = Math.max(0, maximumAvailable - current.availableLevies);
      const recovered = Math.min(missing, Math.floor(total / FRACTION_SCALE));
      const fraction =
        missing === 0 || recovered === missing ? 0 : total - recovered * FRACTION_SCALE;
      let updated = getWp020(next);
      updated = replaceTerritory(updated, territoryId, {
        ...updated.territories[territoryId],
        availableLevies: updated.territories[territoryId].availableLevies + recovered,
        levyRecoveryMillionths: fraction,
      });
      if (recovered > 0 || recovery > 0) {
        updated = appendDelta(updated, {
          amount: recovered,
          atHours: state.timeHours,
          chronicleKey: null,
          fractionMillionths: recovery,
          lordId: legalLord,
          reasonId: 'territory-levy-recovery',
          resource: 'levies',
          territoryId,
        });
      }
      next = setWp020(next, updated);
    }
  }

  for (const lordId of lordIds) {
    if (!hasCondition(getWp020(next).lords[lordId].conditions, 'disgraced')) {
      next = adjustInfluence(next, lordId, 1, 'dawn-influence');
    }
  }
  return next;
}
