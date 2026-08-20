import { describe, expect, it } from 'vitest';
import { projectPlayerResources } from '../../../src/sim/projections/resources';
import {
  applyDailyEconomy,
  commitTroops,
  dailyLevyRecoveryMillionths,
  effectiveFortification,
  legalDailyIncomeMillionths,
  legalTraitAvailableTo,
  lockGold,
  occupierDailyIncomeMillionths,
  putCondition,
} from '../../../src/sim/systems/economy';
import { getWp020, setWp020, type Wp020GameState } from '../../../src/sim/systems/time';
import { content, setup } from '../time/helpers';

function runDawns(state: Wp020GameState, count: number): Wp020GameState {
  let next = state;
  for (let day = 1; day <= count; day += 1) {
    next = applyDailyEconomy({ ...next, timeHours: day * 24 }, content);
  }
  return next;
}

describe('WP-020 fixed-point economy', () => {
  it('matches the hand-calculated 56-day economy table without fractional drift', () => {
    const final = runDawns(setup('economy-table').state, 56);
    const system = getWp020(final);
    expect(
      Object.fromEntries(
        Object.entries(system.lords).map(([id, lord]) => [
          id,
          { gold: lord.gold, influence: lord.influence },
        ]),
      ),
    ).toEqual({
      edric: { gold: 167, influence: 91 },
      greyfen: { gold: 182, influence: 91 },
      mara: { gold: 177, influence: 96 },
      oswin: { gold: 253, influence: 100 },
      renard: { gold: 334, influence: 100 },
      ysabel: { gold: 506, influence: 100 },
    });
    expect(
      Object.fromEntries(
        Object.entries(system.territories)
          .filter(([, territory]) => territory.levyCapacity !== null)
          .map(([id, territory]) => [
            id,
            { available: territory.availableLevies, fraction: territory.levyRecoveryMillionths },
          ]),
      ),
    ).toEqual({
      abbeylands: { available: 260, fraction: 0 },
      eastvale: { available: 300, fraction: 0 },
      greyfen: { available: 420, fraction: 0 },
      northkeep: { available: 720, fraction: 0 },
      southmere: { available: 520, fraction: 0 },
      westmarch: { available: 500, fraction: 0 },
    });
  });

  it('preserves exact fractional accumulation under multiplicative conditions', () => {
    const fixture = setup('fractional-economy');
    const greyfen = getWp020(fixture.state).territories.greyfen;
    const conditioned = setWp020(fixture.state, {
      ...getWp020(fixture.state),
      territories: {
        ...getWp020(fixture.state).territories,
        greyfen: {
          ...greyfen,
          conditions: putCondition(
            putCondition(greyfen.conditions, 'greyfen-charter', 0, null),
            'tax-strain',
            0,
            null,
          ),
        },
      },
    });
    const final = runDawns(conditioned, 56);
    expect(getWp020(final).lords.greyfen.gold).toBe(112);
    expect(getWp020(final).territories.greyfen.availableLevies).toBe(404);
    expect(getWp020(final).territories.greyfen.levyRecoveryMillionths).toBe(100_000);
  });

  it('grants occupiers 25% income but no legal income, recovery or trait benefit', () => {
    const fixture = setup('occupation-economy');
    const eastvale = getWp020(fixture.state).territories.eastvale;
    const occupied = {
      ...eastvale,
      physicalControllerId: 'greyfen' as const,
    };
    expect(legalDailyIncomeMillionths(occupied, content)).toBe(0);
    expect(occupierDailyIncomeMillionths(occupied, content)).toBe(1_250_000);
    expect(dailyLevyRecoveryMillionths(occupied)).toBe(0);
    expect(legalTraitAvailableTo(occupied, 'ysabel')).toBe(false);
    expect(legalTraitAvailableTo(occupied, 'greyfen')).toBe(false);
    expect(occupied.traitId).toBe('golden-vale');
    expect(
      content.territories.find((territory) => territory.id === 'eastvale')?.legalIncomeBonus,
    ).toBe(1);
  });

  it('keeps escrow and committed troops unavailable without destroying them', () => {
    const fixture = setup('resource-locks');
    let state = lockGold(fixture.state, 'greyfen', 40);
    state = commitTroops(state, 'greyfen', 'greyfen', 100);
    expect(getWp020(state).lords.greyfen).toMatchObject({
      committedTroops: 100,
      gold: 70,
      lockedGold: 40,
    });
    expect(getWp020(state).territories.greyfen.availableLevies).toBe(260);
  });

  it('reduces effective Fortification by one during Unrest', () => {
    const eastvale = getWp020(setup('unrest-fort').state).territories.eastvale;
    expect(effectiveFortification(eastvale)).toBe(1);
    expect(
      effectiveFortification({
        ...eastvale,
        conditions: putCondition(eastvale.conditions, 'unrest', 0, 504),
      }),
    ).toBe(0);
  });

  it('projects exact-expiry modifiers as inactive and explains levy recovery by territory', () => {
    const fixture = setup('projection-expiry');
    const greyfen = getWp020(fixture.state).territories.greyfen;
    const conditioned = setWp020(fixture.state, {
      ...getWp020(fixture.state),
      territories: {
        ...getWp020(fixture.state).territories,
        greyfen: {
          ...greyfen,
          conditions: putCondition(greyfen.conditions, 'tax-strain', 0, 12),
        },
      },
    });
    const beforeExpiry = projectPlayerResources({ ...conditioned, timeHours: 11 }, content);
    const atExpiry = projectPlayerResources({ ...conditioned, timeHours: 12 }, content);

    expect(beforeExpiry.conditions).toContainEqual({
      expiresAtHours: 12,
      id: 'tax-strain',
      scopeId: 'greyfen',
    });
    expect(atExpiry.conditions).not.toContainEqual(expect.objectContaining({ id: 'tax-strain' }));
    expect(atExpiry.dailyGoldIncome).toBeGreaterThan(beforeExpiry.dailyGoldIncome);
    expect(atExpiry.dailyLevyRecovery).toBeGreaterThan(beforeExpiry.dailyLevyRecovery);
    expect(atExpiry.dailyLevyReasons).toContainEqual({
      rate: 2.1,
      reasonId: 'territory-levy-recovery',
      territoryId: 'greyfen',
    });
    const futureStarted = setWp020(fixture.state, {
      ...getWp020(fixture.state),
      territories: {
        ...getWp020(fixture.state).territories,
        greyfen: {
          ...greyfen,
          conditions: putCondition(greyfen.conditions, 'tax-strain', 12, 24),
        },
      },
    });
    expect(projectPlayerResources(futureStarted, content).conditions).toHaveLength(0);
  });
});
