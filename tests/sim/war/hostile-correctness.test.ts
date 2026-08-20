import { describe, expect, it } from 'vitest';
import { projectForcePreview } from '../../../src/sim/projections/military/preview';
import { createRandomState, RandomSession } from '../../../src/sim/random/random';
import { occupyCapital } from '../../../src/sim/systems/capital/capital';
import {
  lockForceRequests,
  totalCommittedForce,
} from '../../../src/sim/systems/military/availability';
import {
  addDefensiveAuthorization,
  recordYieldAssessment,
} from '../../../src/sim/systems/military/state';
import { occupyHereditarySeat } from '../../../src/sim/systems/occupation/occupation';
import { queryMilitaryLeverage } from '../../../src/sim/systems/threat/threat';
import {
  campaignPrestigeDeltas,
  makeCampaignPublic,
  reactToCampaign,
  resolveCampaign,
  type StartCampaignInput,
  startCampaign,
} from '../../../src/sim/systems/war/campaign';
import { createTestMilitaryState } from './fixtures';

function campaignInput(override: Partial<StartCampaignInput> = {}): StartCampaignInput {
  return {
    attackerId: 'greyfen',
    baseTerritoryId: 'greyfen',
    campaignId: 'hostile-campaign',
    declaredClaimant: true,
    defensiveAuthorizationId: null,
    forces: [
      {
        basingTerritoryId: 'greyfen',
        garrisonEligible: true,
        levyTroops: 300,
        lordId: 'greyfen',
        mercenaryIds: [],
      },
    ],
    goal: 'occupy',
    targetTerritoryId: 'westmarch',
    ...override,
  };
}

function random(label: string): RandomSession {
  return new RandomSession(createRandomState(label));
}

describe('hostile military correctness scenarios', () => {
  it('gates Capital marches by phase/declaration and fixes Deathbed duration at creation', () => {
    for (const phase of ['stable', 'ailing'] as const) {
      expect(() =>
        startCampaign(
          createTestMilitaryState({ phase }),
          campaignInput({ goal: 'capital', targetTerritoryId: 'capital' }),
          0,
          random(`capital-gate-${phase}`),
        ),
      ).toThrow('unavailable before Gravely Ill');
    }
    expect(() =>
      startCampaign(
        createTestMilitaryState(),
        campaignInput({
          declaredClaimant: false,
          goal: 'capital',
          targetTerritoryId: 'capital',
        }),
        0,
        random('capital-not-declared'),
      ),
    ).toThrow('declared claimant');
    const deathbed = startCampaign(
      createTestMilitaryState({ phase: 'deathbed' }),
      campaignInput(),
      10,
      random('deathbed-duration'),
    );
    expect(deathbed.campaign.resolvesAtHours).toBe(58);
    expect(deathbed.state.capital.royalGarrison).toBe(300);
  });

  it('blocks an attack-Renard opener without an adjacent base and keeps early war costly', () => {
    const stable = createTestMilitaryState({ phase: 'stable' });
    expect(() =>
      startCampaign(
        stable,
        campaignInput({ targetTerritoryId: 'southmere' }),
        0,
        random('renard-opener'),
      ),
    ).toThrow('not adjacent');

    const started = startCampaign(stable, campaignInput(), 0, random('stable-defiance'));
    expect(started.consequences).toMatchObject({
      influenceCost: 15,
      prestige: -10,
      royalDefenderTroops: 150,
    });
    let state = makeCampaignPublic(started.state, started.campaign.id);
    state = reactToCampaign(
      state,
      started.campaign.id,
      'defend',
      [
        {
          basingTerritoryId: 'westmarch',
          garrisonEligible: true,
          levyTroops: 200,
          lordId: 'mara',
          mercenaryIds: [],
        },
      ],
      12,
    );
    const result = resolveCampaign(state, started.campaign.id, 72);
    expect(result.battle?.defender.baseForce).toBe(350);
  });

  it('derives defensive cause from authoritative state instead of caller assertions', () => {
    const stable = createTestMilitaryState({ phase: 'stable' });
    expect(() =>
      startCampaign(
        stable,
        campaignInput({ defensiveAuthorizationId: 'forged-defense' }),
        0,
        random('forged-defense'),
      ),
    ).toThrow('authorization is absent');
    const authorized = addDefensiveAuthorization(stable, {
      actorId: 'greyfen',
      expiresAtHours: 24,
      id: 'allied-defense',
      kind: 'allied-defense',
      targetTerritoryId: 'westmarch',
    });
    expect(
      startCampaign(
        authorized,
        campaignInput({ defensiveAuthorizationId: 'allied-defense' }),
        0,
        random('authorized-defense'),
      ).consequences,
    ).toMatchObject({ defensiveThreatReduction: 10, influenceCost: 0, prestige: 0 });
  });

  it('enforces AI Yield ratio/relief while preserving the player right to Yield', () => {
    const aiStarted = startCampaign(
      createTestMilitaryState(),
      campaignInput(),
      0,
      random('ai-yield'),
    );
    const assessed = recordYieldAssessment(aiStarted.state, {
      alliedReliefAvailable: true,
      attackerExpectedPower: 400,
      attackerId: 'greyfen',
      campaignId: aiStarted.campaign.id,
      defenderExpectedPower: 200,
      expiresAtHours: 24,
      id: 'mara-assessment',
      observerId: 'mara',
    });
    const aiPublic = makeCampaignPublic(assessed, aiStarted.campaign.id);
    expect(() =>
      reactToCampaign(aiPublic, aiStarted.campaign.id, 'yield', [], 12, 'mara-assessment'),
    ).toThrow('1.75× known power with no allied relief');

    const playerStarted = startCampaign(
      createTestMilitaryState(),
      campaignInput({
        attackerId: 'mara',
        baseTerritoryId: 'westmarch',
        forces: [
          {
            basingTerritoryId: 'westmarch',
            garrisonEligible: true,
            levyTroops: 300,
            lordId: 'mara',
            mercenaryIds: [],
          },
        ],
        targetTerritoryId: 'greyfen',
      }),
      0,
      random('player-yield'),
    );
    const playerPublic = makeCampaignPublic(playerStarted.state, playerStarted.campaign.id);
    expect(
      reactToCampaign(playerPublic, playerStarted.campaign.id, 'yield', [], 12).campaigns[
        'hostile-campaign'
      ]?.reaction,
    ).toBe('yield');
  });

  it('requires time and 200 troops to enter an Uncontrolled Capital', () => {
    const base = createTestMilitaryState({
      lordOverrides: { greyfen: { availableLevies: 420 } },
    });
    const uncontrolled = {
      ...base,
      capital: {
        ...base.capital,
        controllerLordId: null,
        royalGarrison: 0,
        stableStatus: 'uncontrolled' as const,
        status: 'uncontrolled' as const,
      },
    };
    const input = campaignInput({
      campaignId: 'uncontrolled-entry',
      forces: [
        {
          basingTerritoryId: 'greyfen',
          garrisonEligible: true,
          levyTroops: 200,
          lordId: 'greyfen',
          mercenaryIds: [],
        },
      ],
      goal: 'capital',
      targetTerritoryId: 'capital',
    });
    const started = startCampaign(uncontrolled, input, 10, random('uncontrolled-entry'));
    expect(started.campaign.resolvesAtHours).toBe(34);
    expect(started.state.capital.stableStatus).toBe('uncontrolled');
    let publicState = makeCampaignPublic(started.state, started.campaign.id);
    publicState = reactToCampaign(publicState, started.campaign.id, 'defend', [], 22);
    const resolved = resolveCampaign(publicState, started.campaign.id, 34);
    expect(resolved.battle).toBeNull();
    expect(resolved.state.capital).toMatchObject({
      controllerLordId: 'greyfen',
      stableStatus: 'occupied',
    });
    const firstForce = input.forces[0];
    if (!firstForce) throw new Error('expected uncontrolled-entry force');
    expect(() =>
      startCampaign(
        uncontrolled,
        { ...input, campaignId: 'too-small', forces: [{ ...firstForce, levyTroops: 175 }] },
        10,
        random('too-small'),
      ),
    ).toThrow('at least 200');
  });

  it('revalidates a simultaneous later Capital campaign against the first controller', () => {
    const base = createTestMilitaryState();
    let state = { ...base, capital: { ...base.capital, royalGarrison: 100 } };
    const first = startCampaign(
      state,
      campaignInput({ campaignId: 'capital-first', goal: 'capital', targetTerritoryId: 'capital' }),
      0,
      random('capital-first'),
    );
    state = first.state;
    const second = startCampaign(
      state,
      campaignInput({
        attackerId: 'renard',
        baseTerritoryId: 'southmere',
        campaignId: 'capital-second',
        forces: [
          {
            basingTerritoryId: 'southmere',
            garrisonEligible: true,
            levyTroops: 300,
            lordId: 'renard',
            mercenaryIds: [],
          },
        ],
        goal: 'capital',
        targetTerritoryId: 'capital',
      }),
      0,
      random('capital-second'),
    );
    state = makeCampaignPublic(second.state, 'capital-first');
    state = reactToCampaign(state, 'capital-first', 'defend', [], 12);
    state = makeCampaignPublic(state, 'capital-second');
    state = reactToCampaign(state, 'capital-second', 'defend', [], 12);
    const firstResult = resolveCampaign(state, 'capital-first', 72);
    expect(firstResult.state.capital.controllerLordId).toBe('greyfen');
    const secondResult = resolveCampaign(firstResult.state, 'capital-second', 72);
    expect(secondResult.battle?.defender.baseForce).toBeGreaterThanOrEqual(200);
  });

  it('collapses victorious defender control when battle casualties break its garrison', () => {
    const greyfenGarrison = lockForceRequests(
      createTestMilitaryState(),
      'greyfen-holds-westmarch',
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
    let hereditary = occupyHereditarySeat(greyfenGarrison.state, {
      atHours: 0,
      campaignId: 'greyfen-holds-westmarch',
      commitmentIds: greyfenGarrison.commitmentIds,
      occupierId: 'greyfen',
      territoryId: 'westmarch',
    }).state;
    const attack = startCampaign(
      hereditary,
      campaignInput({
        attackerId: 'edric',
        baseTerritoryId: 'northkeep',
        campaignId: 'probe-hereditary-garrison',
        forces: [
          {
            basingTerritoryId: 'northkeep',
            garrisonEligible: true,
            levyTroops: 25,
            lordId: 'edric',
            mercenaryIds: [],
          },
        ],
      }),
      1,
      random('probe-hereditary-garrison'),
    );
    hereditary = makeCampaignPublic(attack.state, attack.campaign.id);
    hereditary = reactToCampaign(hereditary, attack.campaign.id, 'defend', [], 13);
    const hereditaryResult = resolveCampaign(hereditary, attack.campaign.id, 73);
    expect(hereditaryResult.battle?.winner).toBe('defender');
    expect(hereditaryResult.state.territories.westmarch.controllerLordId).toBe('mara');

    const capitalLock = lockForceRequests(
      createTestMilitaryState(),
      'greyfen-capital-garrison',
      'attacker',
      [
        {
          basingTerritoryId: 'greyfen',
          garrisonEligible: true,
          levyTroops: 200,
          lordId: 'greyfen',
          mercenaryIds: [],
        },
      ],
    );
    let capital = occupyCapital(capitalLock.state, {
      atHours: 0,
      campaignId: 'greyfen-capital-garrison',
      claimantId: 'greyfen',
      commitmentIds: capitalLock.commitmentIds,
    }).state;
    const capitalAttack = startCampaign(
      capital,
      campaignInput({
        attackerId: 'mara',
        baseTerritoryId: 'westmarch',
        campaignId: 'probe-capital-garrison',
        forces: [
          {
            basingTerritoryId: 'westmarch',
            garrisonEligible: true,
            levyTroops: 250,
            lordId: 'mara',
            mercenaryIds: [],
          },
        ],
        goal: 'capital',
        targetTerritoryId: 'capital',
      }),
      1,
      random('probe-capital-garrison'),
    );
    capital = makeCampaignPublic(capitalAttack.state, capitalAttack.campaign.id);
    const storedCapitalCampaign = capital.campaigns[capitalAttack.campaign.id];
    if (!storedCapitalCampaign) throw new Error('expected stored Capital campaign');
    capital = {
      ...capital,
      campaigns: {
        ...capital.campaigns,
        [capitalAttack.campaign.id]: {
          ...storedCapitalCampaign,
          attackerFortune: 1,
          defenderFortune: 1,
        },
      },
    };
    capital = reactToCampaign(capital, capitalAttack.campaign.id, 'defend', [], 13);
    const capitalResult = resolveCampaign(capital, capitalAttack.campaign.id, 73);
    expect(capitalResult.battle?.winner).toBe('defender');
    expect(capitalResult.state.capital.stableStatus).toBe('uncontrolled');
  });

  it('emits pyrrhic, prior-controller and one-time dispossession Prestige fallout', () => {
    const started = startCampaign(
      createTestMilitaryState(),
      campaignInput({
        attackerId: 'mara',
        baseTerritoryId: 'westmarch',
        forces: [
          {
            basingTerritoryId: 'westmarch',
            garrisonEligible: true,
            levyTroops: 300,
            lordId: 'mara',
            mercenaryIds: [],
          },
        ],
        targetTerritoryId: 'greyfen',
      }),
      0,
      random('prestige-fallout'),
    );
    const capitalCampaign = {
      ...started.campaign,
      defenderId: 'renard' as const,
      targetTerritoryId: 'capital' as const,
    };
    expect(campaignPrestigeDeltas(capitalCampaign, null, 'pyrrhic-capital')).toEqual({
      mara: 8,
      renard: -8,
    });

    let publicState = makeCampaignPublic(started.state, started.campaign.id);
    publicState = reactToCampaign(publicState, started.campaign.id, 'yield', [], 12, null);
    const yielded = resolveCampaign(publicState, started.campaign.id, 72);
    expect(yielded.prestigeDeltas).toEqual({ mara: 3, greyfen: -13 });
    expect(yielded.state.history.some((entry) => entry.kind === 'lord-dispossessed')).toBe(true);
  });

  it('keeps a dispossessed player operative from an allied base without restoring income/trait', () => {
    const mara = lockForceRequests(createTestMilitaryState(), 'take-greyfen', 'attacker', [
      {
        basingTerritoryId: 'westmarch',
        garrisonEligible: true,
        levyTroops: 100,
        lordId: 'mara',
        mercenaryIds: [],
      },
    ]);
    let state = occupyHereditarySeat(mara.state, {
      atHours: 1,
      campaignId: 'take-greyfen',
      commitmentIds: mara.commitmentIds,
      occupierId: 'mara',
      territoryId: 'greyfen',
    }).state;
    expect(state.lords.greyfen.dispossessed).toBe(true);
    expect(state.territories.greyfen.legalLordId).toBe('greyfen');
    state = {
      ...state,
      lords: {
        ...state.lords,
        greyfen: { ...state.lords.greyfen, alliedBasingTerritoryIds: ['abbeylands'] },
      },
    };
    const based = lockForceRequests(state, 'greyfen-counter', 'attacker', [
      {
        basingTerritoryId: 'abbeylands',
        garrisonEligible: true,
        levyTroops: 100,
        lordId: 'greyfen',
        mercenaryIds: [],
      },
    ]);
    expect(totalCommittedForce(based.state, based.commitmentIds)).toHaveLength(1);
  });

  it('does not turn one Greyfen army into universal leverage and never leaks hidden force in preview', () => {
    const weakMara = createTestMilitaryState({ lordOverrides: { mara: { availableLevies: 100 } } });
    expect(queryMilitaryLeverage(weakMara, 'greyfen', 'mara').credible).toBe(true);
    expect(queryMilitaryLeverage(weakMara, 'greyfen', 'ysabel').credible).toBe(false);
    expect(queryMilitaryLeverage(weakMara, 'greyfen', 'oswin').credible).toBe(false);
    const preview = projectForcePreview({
      commanderMultiplier: 1,
      fortificationMultiplier: 1.2,
      knownDefense: { kind: 'unknown' },
      terrainMultiplier: 1,
    });
    expect(preview.defenseMinimum).toBeNull();
    expect(preview.knownFactors).toContain('defense unknown');
    expect(preview.fortuneStatement).toContain('0.92–1.08');
  });
});
