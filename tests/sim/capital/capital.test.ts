import { describe, expect, it } from 'vitest';
import {
  capitalControlBenefits,
  finishCapitalCampaign,
  markCapitalCampaignPending,
  occupyCapital,
  revalidateCapitalGarrison,
} from '../../../src/sim/systems/capital/capital';
import {
  addContractedForce,
  applyCommitmentCasualties,
  lockForceRequests,
} from '../../../src/sim/systems/military/availability';
import { processMilitaryExpiry } from '../../../src/sim/systems/military/maintenance';
import { setMilitaryPhase } from '../../../src/sim/systems/military/state';
import { createTestMilitaryState } from '../war/fixtures';

function capitalForce(troops: number, campaignId = 'capital-campaign') {
  return lockForceRequests(createTestMilitaryState(), campaignId, 'attacker', [
    {
      basingTerritoryId: 'greyfen',
      garrisonEligible: true,
      levyTroops: troops,
      lordId: 'greyfen',
      mercenaryIds: [],
    },
  ]);
}

describe('Capital state machine', () => {
  it('transitions Royal → contested → Occupied and grants benefits only with 200 troops', () => {
    const locked = capitalForce(250);
    const contested = markCapitalCampaignPending(locked.state, 'capital-campaign');
    expect(contested.capital).toMatchObject({ stableStatus: 'royal', status: 'contested' });
    const occupied = occupyCapital(contested, {
      atHours: 72,
      campaignId: 'capital-campaign',
      claimantId: 'greyfen',
      commitmentIds: locked.commitmentIds,
    });
    expect(occupied.controlled).toBe(true);
    const finished = finishCapitalCampaign(occupied.state, 'capital-campaign');
    expect(finished.capital).toMatchObject({
      controllerLordId: 'greyfen',
      stableStatus: 'occupied',
      status: 'occupied',
    });
    expect(capitalControlBenefits(finished, 'greyfen')).toEqual({
      acclamationAccess: true,
      incomePerDay: 1,
      tieBreak: true,
    });
  });

  it('makes a pyrrhic victory Uncontrolled and revokes every Capital benefit', () => {
    const locked = capitalForce(175);
    const result = occupyCapital(locked.state, {
      atHours: 72,
      campaignId: 'capital-campaign',
      claimantId: 'greyfen',
      commitmentIds: locked.commitmentIds,
    });
    expect(result.controlled).toBe(false);
    expect(result.state.capital).toMatchObject({
      controllerLordId: null,
      royalGarrison: 0,
      stableStatus: 'uncontrolled',
    });
    expect(capitalControlBenefits(result.state, 'greyfen')).toEqual({
      acclamationAccess: false,
      incomePerDay: 0,
      tieBreak: false,
    });
  });

  it('drops an occupied Capital to Uncontrolled when its garrison falls below 200', () => {
    const locked = capitalForce(250);
    const occupied = occupyCapital(locked.state, {
      atHours: 72,
      campaignId: 'capital-campaign',
      claimantId: 'greyfen',
      commitmentIds: locked.commitmentIds,
    }).state;
    const garrisonId = occupied.capital.garrisonCommitmentId;
    if (!garrisonId) throw new Error('expected Capital garrison');
    const weakened = applyCommitmentCasualties(occupied, [garrisonId], 1);
    const collapsed = revalidateCapitalGarrison(weakened, 80);
    expect(collapsed.capital.stableStatus).toBe('uncontrolled');
    expect(collapsed.history.at(-1)?.kind).toBe('capital-control-lost');
  });

  it('expires temporary or mercenary garrison troops before succession validation', () => {
    let state = addContractedForce(createTestMilitaryState(), {
      assignedCommitmentId: null,
      expiresAtHours: 100,
      hiredAtHours: 28,
      id: 'funeral-troops',
      initialTroops: 200,
      ownerId: 'greyfen',
      renewable: false,
      renewalCostGold: 0,
      sourceKind: 'temporary',
      troops: 200,
    });
    const locked = lockForceRequests(state, 'temporary-capital', 'attacker', [
      {
        basingTerritoryId: 'greyfen',
        garrisonEligible: true,
        levyTroops: 0,
        lordId: 'greyfen',
        mercenaryIds: ['funeral-troops'],
      },
    ]);
    state = occupyCapital(locked.state, {
      atHours: 72,
      campaignId: 'temporary-capital',
      claimantId: 'greyfen',
      commitmentIds: locked.commitmentIds,
    }).state;
    expect(state.capital.stableStatus).toBe('occupied');
    const expired = processMilitaryExpiry(state, 100);
    expect(expired.expiredForceIds).toEqual(['funeral-troops']);
    expect(expired.state.capital.stableStatus).toBe('uncontrolled');
  });

  it('never resurrects a casualty-reduced royal garrison at Deathbed', () => {
    const weakened = createTestMilitaryState();
    const deathbed = setMilitaryPhase(
      { ...weakened, capital: { ...weakened.capital, royalGarrison: 10 } },
      'deathbed',
    );
    expect(deathbed.capital.royalGarrison).toBe(10);
  });
});
