import { describe, expect, it } from 'vitest';
import { createRandomState, RandomSession } from '../../../src/sim/random/random';
import {
  MILITARY_HANDLER_KINDS,
  militaryWarModule,
} from '../../../src/sim/systems/actions/military/module';
import {
  addContractedForce,
  applyCommitmentCasualties,
  armyAvailability,
  hireMercenaryBand,
  invariantMilitaryAccounting,
  lockForceRequests,
  releaseReturningForces,
} from '../../../src/sim/systems/military/availability';
import {
  occupationEconomyHooks,
  occupyHereditarySeat,
  revalidateHereditaryGarrisons,
  withdrawOccupation,
} from '../../../src/sim/systems/occupation/occupation';
import { createTestMilitaryGameState, createTestMilitaryState } from '../war/fixtures';

function lockedGreyfen(troops: number) {
  return lockForceRequests(createTestMilitaryState(), 'occupation-fixture', 'attacker', [
    {
      basingTerritoryId: 'greyfen',
      garrisonEligible: true,
      levyTroops: troops,
      lordId: 'greyfen',
      mercenaryIds: [],
    },
  ]);
}

describe('hereditary occupation and garrisons', () => {
  it('requires 75 survivors, preserves legal title/vote state and exposes bounded economy hooks', () => {
    const tooSmall = lockedGreyfen(50);
    const rejected = occupyHereditarySeat(tooSmall.state, {
      atHours: 72,
      campaignId: 'occupation-fixture',
      commitmentIds: tooSmall.commitmentIds,
      occupierId: 'greyfen',
      territoryId: 'westmarch',
    });
    expect(rejected.occupied).toBe(false);
    expect(rejected.state.territories.westmarch.controllerLordId).toBe('mara');

    const enough = lockedGreyfen(100);
    const occupied = occupyHereditarySeat(enough.state, {
      atHours: 72,
      campaignId: 'occupation-fixture',
      commitmentIds: enough.commitmentIds,
      occupierId: 'greyfen',
      territoryId: 'westmarch',
    });
    expect(occupied.occupied).toBe(true);
    expect(occupied.state.territories.westmarch).toMatchObject({
      controllerLordId: 'greyfen',
      legalLordId: 'mara',
      traitId: 'free-companies',
    });
    expect(occupied.state.lords.mara).toMatchObject({ dispossessed: true, lordId: 'mara' });
    expect(armyAvailability(occupied.state, 'greyfen').garrison).toBe(75);
    expect(occupationEconomyHooks(occupied.state)).toEqual([
      {
        legalLevyRecoveryMultiplier: 0,
        legalLordId: 'mara',
        legalTraitEnabled: false,
        occupierId: 'greyfen',
        occupierIncomePerDay: 0.5,
        territoryId: 'westmarch',
      },
    ]);
    expect(invariantMilitaryAccounting(occupied.state)).toEqual([]);
  });

  it('withdraws immediately but returns the garrison only after one day', () => {
    const locked = lockedGreyfen(100);
    const occupied = occupyHereditarySeat(locked.state, {
      atHours: 72,
      campaignId: 'occupation-fixture',
      commitmentIds: locked.commitmentIds,
      occupierId: 'greyfen',
      territoryId: 'westmarch',
    }).state;
    const withdrawn = withdrawOccupation(occupied, 'westmarch', 100);
    expect(withdrawn.territories.westmarch.controllerLordId).toBe('mara');
    expect(withdrawn.lords.mara.dispossessed).toBe(false);
    expect(armyAvailability(withdrawn, 'greyfen').returning).toBe(75);
    expect(releaseReturningForces(withdrawn, 123)).toBe(withdrawn);
    const returned = releaseReturningForces(withdrawn, 124);
    expect(armyAvailability(returned, 'greyfen').returning).toBe(0);
    expect(returned.lords.greyfen.availableLevies).toBe(335);
  });

  it('collapses control when casualties or contract expiry leave fewer than 75', () => {
    const locked = lockedGreyfen(100);
    const occupied = occupyHereditarySeat(locked.state, {
      atHours: 72,
      campaignId: 'occupation-fixture',
      commitmentIds: locked.commitmentIds,
      occupierId: 'greyfen',
      territoryId: 'westmarch',
    }).state;
    const garrisonId = occupied.territories.westmarch.occupation?.garrisonCommitmentId;
    if (!garrisonId) throw new Error('expected garrison');
    const weakened = applyCommitmentCasualties(occupied, [garrisonId], 1);
    const collapsed = revalidateHereditaryGarrisons(weakened, 80);
    expect(collapsed.territories.westmarch.controllerLordId).toBe('mara');
    expect(collapsed.history.at(-1)?.reason).toBe('garrison fell below 75 troops');
  });

  it('caps mercenary bands and rejects reuse across simultaneous commitments', () => {
    const band = (id: string) => ({
      assignedCommitmentId: null,
      expiresAtHours: 168,
      hiredAtHours: 0,
      id,
      initialTroops: 150,
      ownerId: 'greyfen' as const,
      renewable: true,
      renewalCostGold: 20,
      sourceKind: 'mercenary' as const,
      troops: 150,
    });
    let state = addContractedForce(createTestMilitaryState(), band('band-1'));
    state = addContractedForce(state, band('band-2'));
    expect(() => addContractedForce(state, band('band-3'))).toThrow(
      'more than two mercenary bands',
    );
    const first = lockForceRequests(state, 'campaign-one', 'attacker', [
      {
        basingTerritoryId: 'greyfen',
        garrisonEligible: true,
        levyTroops: 0,
        lordId: 'greyfen',
        mercenaryIds: ['band-1'],
      },
    ]);
    expect(() =>
      lockForceRequests(first.state, 'campaign-two', 'attacker', [
        {
          basingTerritoryId: 'greyfen',
          garrisonEligible: true,
          levyTroops: 0,
          lordId: 'greyfen',
          mercenaryIds: ['band-1'],
        },
      ]),
    ).toThrow('already committed');
    expect(invariantMilitaryAccounting(first.state)).toEqual([]);
  });

  it('constructs only canonical paid mercenary bands and applies Mara physical-control pricing', () => {
    expect(() =>
      addContractedForce(createTestMilitaryState(), {
        assignedCommitmentId: null,
        expiresAtHours: 10_000,
        hiredAtHours: 0,
        id: 'impossible-band',
        initialTroops: 10_000,
        ownerId: 'greyfen',
        renewable: true,
        renewalCostGold: 1,
        sourceKind: 'mercenary',
        troops: 10_000,
      }),
    ).toThrow('mercenary bands must start at 150 troops');
    const greyfen = hireMercenaryBand(createTestMilitaryState(), {
      atHours: 10,
      forceId: 'greyfen-band',
      ownerId: 'greyfen',
    });
    expect(greyfen.goldCost).toBe(50);
    expect(greyfen.state.contractedForces['greyfen-band']).toMatchObject({
      expiresAtHours: 178,
      initialTroops: 150,
      renewalCostGold: 20,
      troops: 150,
    });
    expect(
      hireMercenaryBand(createTestMilitaryState(), {
        atHours: 10,
        forceId: 'mara-band',
        ownerId: 'mara',
      }).goldCost,
    ).toBe(40);

    const hire = militaryWarModule.initiativeStarters?.[MILITARY_HANDLER_KINDS.hireMercenary];
    if (!hire) throw new Error('expected mercenary hire handler');
    const transition = hire({
      command: {
        initiativeType: MILITARY_HANDLER_KINDS.hireMercenary,
        payload: { actorId: 'greyfen', forceId: 'handler-band' },
        type: 'START_INITIATIVE',
      },
      random: new RandomSession(createRandomState('mercenary-hire')),
      state: createTestMilitaryGameState(),
    });
    expect(transition.effects?.[0]).toMatchObject({
      kind: 'war.mercenary-hired',
      payload: { actorId: 'greyfen', forceId: 'handler-band', goldDelta: -50 },
    });
    expect(transition.schedule).toContainEqual(
      expect.objectContaining({
        dueTimeHours: 144,
        kind: MILITARY_HANDLER_KINDS.contractExpiryWarning,
      }),
    );
    expect(transition.schedule).toContainEqual(
      expect.objectContaining({
        dueTimeHours: 168,
        kind: MILITARY_HANDLER_KINDS.contractExpiry,
      }),
    );
  });

  it('schedules mixed-garrison levy survivors to return after a contract collapse', () => {
    let state = hireMercenaryBand(createTestMilitaryState(), {
      atHours: 0,
      forceId: 'mixed-band',
      ownerId: 'greyfen',
    }).state;
    const locked = lockForceRequests(state, 'mixed-occupation', 'attacker', [
      {
        basingTerritoryId: 'greyfen',
        garrisonEligible: true,
        levyTroops: 25,
        lordId: 'greyfen',
        mercenaryIds: ['mixed-band'],
      },
    ]);
    state = occupyHereditarySeat(locked.state, {
      atHours: 1,
      campaignId: 'mixed-occupation',
      commitmentIds: locked.commitmentIds,
      occupierId: 'greyfen',
      territoryId: 'westmarch',
    }).state;
    const expiry = militaryWarModule.scheduledResolvers?.[MILITARY_HANDLER_KINDS.contractExpiry];
    if (!expiry) throw new Error('expected contract expiry resolver');
    const transition = expiry({
      item: {
        dueTimeHours: 168,
        kind: MILITARY_HANDLER_KINDS.contractExpiry,
        payload: {},
        priority: 0,
        sequenceId: 1,
        storedDraws: {},
      },
      random: new RandomSession(createRandomState('contract-expiry')),
      state: { ...createTestMilitaryGameState(state), timeHours: 168 },
    });
    expect(transition.state.systems.war.territories.westmarch.controllerLordId).toBe('mara');
    expect(armyAvailability(transition.state.systems.war, 'greyfen').returning).toBe(25);
    expect(transition.schedule?.[0]).toMatchObject({
      dueTimeHours: 192,
      kind: MILITARY_HANDLER_KINDS.returnForces,
    });
  });
});
