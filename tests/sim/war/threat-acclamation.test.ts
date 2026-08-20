import { describe, expect, it } from 'vitest';
import { occupyCapital } from '../../../src/sim/systems/capital/capital';
import { lockForceRequests } from '../../../src/sim/systems/military/availability';
import {
  occupyHereditarySeat,
  withdrawOccupation,
} from '../../../src/sim/systems/occupation/occupation';
import {
  collectAuthoritativeMilitaryFacts,
  findMilitaryAcclamation,
  militaryAcclamationChecklist,
  queryMilitaryLeverage,
  queryRenardWithdrawalLeverage,
} from '../../../src/sim/systems/threat/threat';
import { createTestMilitaryState } from './fixtures';

describe('military facts, leverage and Acclamation', () => {
  it('invalidates occupation leverage immediately when its garrison/control disappears', () => {
    const locked = lockForceRequests(
      createTestMilitaryState(),
      'westmarch-occupation',
      'attacker',
      [
        {
          basingTerritoryId: 'greyfen',
          garrisonEligible: true,
          levyTroops: 100,
          lordId: 'greyfen',
          mercenaryIds: [],
        },
      ],
    );
    const occupied = occupyHereditarySeat(locked.state, {
      atHours: 72,
      campaignId: 'westmarch-occupation',
      commitmentIds: locked.commitmentIds,
      occupierId: 'greyfen',
      territoryId: 'westmarch',
    }).state;
    expect(queryMilitaryLeverage(occupied, 'greyfen', 'mara').credible).toBe(true);
    expect(
      collectAuthoritativeMilitaryFacts(occupied, 'greyfen').some(
        (fact) => fact.kind === 'occupation',
      ),
    ).toBe(true);
    const withdrawn = withdrawOccupation(occupied, 'westmarch', 80);
    expect(queryMilitaryLeverage(withdrawn, 'greyfen', 'mara').credible).toBe(false);
  });

  it('requires declared + Capital + three seats + 200 Capital troops exactly', () => {
    let state = createTestMilitaryState();
    const west = lockForceRequests(state, 'occ-west', 'attacker', [
      {
        basingTerritoryId: 'greyfen',
        garrisonEligible: true,
        levyTroops: 75,
        lordId: 'greyfen',
        mercenaryIds: [],
      },
    ]);
    state = occupyHereditarySeat(west.state, {
      atHours: 1,
      campaignId: 'occ-west',
      commitmentIds: west.commitmentIds,
      occupierId: 'greyfen',
      territoryId: 'westmarch',
    }).state;
    const abbey = lockForceRequests(state, 'occ-abbey', 'attacker', [
      {
        basingTerritoryId: 'greyfen',
        garrisonEligible: true,
        levyTroops: 75,
        lordId: 'greyfen',
        mercenaryIds: [],
      },
    ]);
    state = occupyHereditarySeat(abbey.state, {
      atHours: 2,
      campaignId: 'occ-abbey',
      commitmentIds: abbey.commitmentIds,
      occupierId: 'greyfen',
      territoryId: 'abbeylands',
    }).state;
    const capital = lockForceRequests(state, 'occ-capital', 'attacker', [
      {
        basingTerritoryId: 'greyfen',
        garrisonEligible: true,
        levyTroops: 200,
        lordId: 'greyfen',
        mercenaryIds: [],
      },
    ]);
    state = occupyCapital(capital.state, {
      atHours: 3,
      campaignId: 'occ-capital',
      claimantId: 'greyfen',
      commitmentIds: capital.commitmentIds,
    }).state;
    const checklist = militaryAcclamationChecklist(state, 'greyfen', ['greyfen']);
    expect(checklist).toMatchObject({
      capitalControlled: true,
      capitalTroops: 200,
      declared: true,
      eligible: true,
    });
    expect(checklist.nonCapitalSeatsControlled).toEqual(['abbeylands', 'greyfen', 'westmarch']);
    expect(findMilitaryAcclamation(state, ['greyfen'])?.claimantId).toBe('greyfen');
    expect(militaryAcclamationChecklist(state, 'greyfen', []).eligible).toBe(false);
    expect(state.lords.mara.lordId).toBe('mara');
    expect(state.territories.westmarch.legalLordId).toBe('mara');
  });

  it('uses Renard’s full forced-withdrawal checklist instead of generic Pledge leverage', () => {
    const base = createTestMilitaryState({
      lordOverrides: { greyfen: { availableLevies: 420 }, renard: { availableLevies: 100 } },
    });
    expect(queryMilitaryLeverage(base, 'greyfen', 'renard', 'pledge')).toMatchObject({
      credible: false,
    });
    const capital = lockForceRequests(base, 'renard-gate-capital', 'attacker', [
      {
        basingTerritoryId: 'greyfen',
        garrisonEligible: true,
        levyTroops: 200,
        lordId: 'greyfen',
        mercenaryIds: [],
      },
    ]);
    const controlled = occupyCapital(capital.state, {
      atHours: 1,
      campaignId: 'renard-gate-capital',
      claimantId: 'greyfen',
      commitmentIds: capital.commitmentIds,
    }).state;
    expect(queryRenardWithdrawalLeverage(controlled, 'greyfen', 1)).toMatchObject({
      capitalControlled: true,
      credible: false,
      renardArmyBelowThreshold: true,
      renardHasNoSupporters: false,
    });
    expect(queryRenardWithdrawalLeverage(controlled, 'greyfen', 0)).toMatchObject({
      capitalControlled: true,
      credible: true,
      renardArmyBelowThreshold: true,
      renardHasNoSupporters: true,
    });

    const thirdPartySeat = lockForceRequests(
      createTestMilitaryState({ lordOverrides: { greyfen: { availableLevies: 420 } } }),
      'third-party-southmere',
      'attacker',
      [
        {
          basingTerritoryId: 'greyfen',
          garrisonEligible: true,
          levyTroops: 75,
          lordId: 'greyfen',
          mercenaryIds: [],
        },
      ],
    );
    const southmereOccupied = occupyHereditarySeat(thirdPartySeat.state, {
      atHours: 1,
      campaignId: 'third-party-southmere',
      commitmentIds: thirdPartySeat.commitmentIds,
      occupierId: 'greyfen',
      territoryId: 'southmere',
    }).state;
    const edricCapital = lockForceRequests(
      southmereOccupied,
      'edric-controls-capital',
      'attacker',
      [
        {
          basingTerritoryId: 'northkeep',
          garrisonEligible: true,
          levyTroops: 200,
          lordId: 'edric',
          mercenaryIds: [],
        },
      ],
    );
    const edricControlled = occupyCapital(edricCapital.state, {
      atHours: 2,
      campaignId: 'edric-controls-capital',
      claimantId: 'edric',
      commitmentIds: edricCapital.commitmentIds,
    }).state;
    expect(queryRenardWithdrawalLeverage(edricControlled, 'edric', 0)).toMatchObject({
      capitalControlled: true,
      credible: true,
      renardArmyBelowThreshold: false,
      southmereOccupied: true,
    });
  });
});
