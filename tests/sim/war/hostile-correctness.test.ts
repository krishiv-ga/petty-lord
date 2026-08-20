import { describe, expect, it } from 'vitest';
import { projectForcePreview } from '../../../src/sim/projections/military/preview';
import { createRandomState, RandomSession } from '../../../src/sim/random/random';
import { occupyCapital } from '../../../src/sim/systems/capital/capital';
import {
  lockForceRequests,
  totalCommittedForce,
} from '../../../src/sim/systems/military/availability';
import {
  addCapitalMarchAuthorization,
  addDefensiveAuthorization,
  addMilitaryAidAuthorization,
  hasCampaignBase,
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
    capitalAuthorizationId: null,
    campaignId: 'hostile-campaign',
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

function authorizeCapital(
  state: ReturnType<typeof createTestMilitaryState>,
  campaignId: string,
  claimantId: 'edric' | 'greyfen' | 'mara' | 'oswin' | 'renard' | 'ysabel' = 'greyfen',
) {
  const id = `capital-authorization:${campaignId}`;
  return {
    authorizationId: id,
    state: addCapitalMarchAuthorization(state, {
      campaignId,
      claimantId,
      expiresAtHours: 1_000,
      id,
    }),
  };
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
          goal: 'capital',
          targetTerritoryId: 'capital',
        }),
        0,
        random('capital-not-declared'),
      ),
    ).toThrow('claimant authorization');
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

  it('requires campaign-bound adjacent aid and rejects an enemy-occupied allied base', () => {
    const alliedForces = [
      {
        basingTerritoryId: 'greyfen' as const,
        garrisonEligible: true,
        levyTroops: 25,
        lordId: 'greyfen' as const,
        mercenaryIds: [],
      },
      {
        basingTerritoryId: 'northkeep' as const,
        garrisonEligible: false,
        levyTroops: 225,
        lordId: 'edric' as const,
        mercenaryIds: [],
      },
    ];
    const [greyfenForce, edricForce] = alliedForces;
    if (!greyfenForce || !edricForce) throw new Error('expected allied force fixtures');
    expect(() =>
      startCampaign(
        createTestMilitaryState(),
        campaignInput({ campaignId: 'unauthorized-aid', forces: alliedForces }),
        0,
        random('unauthorized-aid'),
      ),
    ).toThrow('campaign-bound military aid authorization');

    let authorized = addMilitaryAidAuthorization(createTestMilitaryState(), {
      beneficiaryId: 'greyfen',
      campaignId: 'authorized-aid',
      expiresAtHours: 100,
      id: 'edric-aids-greyfen',
      maximumTroops: 225,
      providerId: 'edric',
      side: 'attacker',
    });
    const started = startCampaign(
      authorized,
      campaignInput({ campaignId: 'authorized-aid', forces: alliedForces }),
      0,
      random('authorized-aid'),
    );
    expect(started.campaign.attackerCommitmentIds).toHaveLength(2);

    authorized = addMilitaryAidAuthorization(createTestMilitaryState(), {
      beneficiaryId: 'greyfen',
      campaignId: 'remote-aid',
      expiresAtHours: 100,
      id: 'ysabel-remote-aid',
      maximumTroops: 225,
      providerId: 'ysabel',
      side: 'attacker',
    });
    expect(() =>
      startCampaign(
        authorized,
        campaignInput({
          campaignId: 'remote-aid',
          forces: [
            greyfenForce,
            { ...edricForce, basingTerritoryId: 'eastvale', lordId: 'ysabel' },
          ],
        }),
        0,
        random('remote-aid'),
      ),
    ).toThrow('not adjacent');

    const mara = lockForceRequests(createTestMilitaryState(), 'mara-takes-abbeylands', 'attacker', [
      {
        basingTerritoryId: 'westmarch',
        garrisonEligible: true,
        levyTroops: 75,
        lordId: 'mara',
        mercenaryIds: [],
      },
    ]);
    let occupiedAlly = occupyHereditarySeat(mara.state, {
      atHours: 1,
      campaignId: 'mara-takes-abbeylands',
      commitmentIds: mara.commitmentIds,
      occupierId: 'mara',
      territoryId: 'abbeylands',
    }).state;
    occupiedAlly = {
      ...occupiedAlly,
      lords: {
        ...occupiedAlly.lords,
        greyfen: { ...occupiedAlly.lords.greyfen, alliedBasingTerritoryIds: ['abbeylands'] },
      },
    };
    expect(hasCampaignBase(occupiedAlly, 'greyfen', 'abbeylands')).toBe(false);
    expect(() =>
      startCampaign(
        occupiedAlly,
        campaignInput({
          baseTerritoryId: 'abbeylands',
          campaignId: 'occupied-allied-base',
          forces: [{ ...greyfenForce, basingTerritoryId: 'abbeylands' }],
          targetTerritoryId: 'southmere',
        }),
        2,
        random('occupied-allied-base'),
      ),
    ).toThrow('lacks a valid campaign base');
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
    const entryAuthorization = authorizeCapital(uncontrolled, 'uncontrolled-entry');
    const input = campaignInput({
      capitalAuthorizationId: entryAuthorization.authorizationId,
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
    const started = startCampaign(
      entryAuthorization.state,
      input,
      10,
      random('uncontrolled-entry'),
    );
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
    const tooSmallAuthorization = authorizeCapital(uncontrolled, 'too-small');
    expect(() =>
      startCampaign(
        tooSmallAuthorization.state,
        {
          ...input,
          campaignId: 'too-small',
          capitalAuthorizationId: tooSmallAuthorization.authorizationId,
          forces: [{ ...firstForce, levyTroops: 175 }],
        },
        10,
        random('too-small'),
      ),
    ).toThrow('at least 200');
    const ineligibleAuthorization = authorizeCapital(uncontrolled, 'ineligible-entry');
    expect(() =>
      startCampaign(
        ineligibleAuthorization.state,
        {
          ...input,
          campaignId: 'ineligible-entry',
          capitalAuthorizationId: ineligibleAuthorization.authorizationId,
          forces: [{ ...firstForce, garrisonEligible: false }],
        },
        10,
        random('ineligible-entry'),
      ),
    ).toThrow('200 claimant-owned garrison troops');
  });

  it('revalidates a simultaneous later Capital campaign against the first controller', () => {
    const base = createTestMilitaryState();
    let state = { ...base, capital: { ...base.capital, royalGarrison: 100 } };
    const firstAuthorization = authorizeCapital(state, 'capital-first');
    state = firstAuthorization.state;
    const first = startCampaign(
      state,
      campaignInput({
        campaignId: 'capital-first',
        capitalAuthorizationId: firstAuthorization.authorizationId,
        goal: 'capital',
        targetTerritoryId: 'capital',
      }),
      0,
      random('capital-first'),
    );
    state = first.state;
    const secondAuthorization = authorizeCapital(state, 'capital-second', 'renard');
    state = secondAuthorization.state;
    const second = startCampaign(
      state,
      campaignInput({
        attackerId: 'renard',
        baseTerritoryId: 'southmere',
        campaignId: 'capital-second',
        capitalAuthorizationId: secondAuthorization.authorizationId,
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

  it('does not combine stale and current defenders after a simultaneous controller change', () => {
    let state = createTestMilitaryState({ lordOverrides: { greyfen: { availableLevies: 420 } } });
    const first = startCampaign(
      state,
      campaignInput({ campaignId: 'simultaneous-first' }),
      0,
      random('simultaneous-first'),
    );
    state = first.state;
    const second = startCampaign(
      state,
      campaignInput({
        attackerId: 'edric',
        baseTerritoryId: 'northkeep',
        campaignId: 'simultaneous-second',
        forces: [
          {
            basingTerritoryId: 'northkeep',
            garrisonEligible: true,
            levyTroops: 250,
            lordId: 'edric',
            mercenaryIds: [],
          },
        ],
      }),
      0,
      random('simultaneous-second'),
    );
    state = makeCampaignPublic(second.state, first.campaign.id);
    state = reactToCampaign(
      state,
      first.campaign.id,
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
    state = makeCampaignPublic(state, second.campaign.id);
    state = reactToCampaign(
      state,
      second.campaign.id,
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
    const firstStored = state.campaigns[first.campaign.id];
    const secondStored = state.campaigns[second.campaign.id];
    if (!firstStored || !secondStored) throw new Error('expected simultaneous campaigns');
    state = {
      ...state,
      campaigns: {
        ...state.campaigns,
        [first.campaign.id]: { ...firstStored, attackerFortune: 1, defenderFortune: 1 },
        [second.campaign.id]: { ...secondStored, attackerFortune: 1, defenderFortune: 1 },
      },
    };
    const firstResult = resolveCampaign(state, first.campaign.id, 72);
    const displacedGarrisonId =
      firstResult.state.territories.westmarch.occupation?.garrisonCommitmentId;
    if (!displacedGarrisonId) throw new Error('expected first occupier garrison');
    const secondResult = resolveCampaign(firstResult.state, second.campaign.id, 72);
    expect(secondResult.battle).not.toBeNull();
    expect(secondResult.battle?.defender.baseForce).toBe(75);
    expect(secondResult.state.commitments[displacedGarrisonId]?.kind).toBe('returning');
    expect(secondResult.state.territories.westmarch.controllerLordId).toBe('edric');
    const staleMaraCommitmentId = `${second.campaign.id}:defender:mara`;
    expect(secondResult.state.commitments[staleMaraCommitmentId]?.kind).toBe('returning');
  });

  it('cancels a simultaneous later campaign when its attacker already controls the target', () => {
    let state = createTestMilitaryState({ lordOverrides: { greyfen: { availableLevies: 420 } } });
    const first = startCampaign(
      state,
      campaignInput({
        campaignId: 'same-attacker-first',
        forces: [
          {
            basingTerritoryId: 'greyfen',
            garrisonEligible: true,
            levyTroops: 250,
            lordId: 'greyfen',
            mercenaryIds: [],
          },
        ],
      }),
      0,
      random('same-attacker-first'),
    );
    const second = startCampaign(
      first.state,
      campaignInput({
        campaignId: 'same-attacker-second',
        forces: [
          {
            basingTerritoryId: 'greyfen',
            garrisonEligible: true,
            levyTroops: 150,
            lordId: 'greyfen',
            mercenaryIds: [],
          },
        ],
      }),
      0,
      random('same-attacker-second'),
    );
    state = makeCampaignPublic(second.state, first.campaign.id);
    state = reactToCampaign(state, first.campaign.id, 'defend', [], 12);
    state = makeCampaignPublic(state, second.campaign.id);
    state = reactToCampaign(state, second.campaign.id, 'defend', [], 12);

    const firstResult = resolveCampaign(state, first.campaign.id, 72);
    expect(firstResult.state.territories.westmarch.controllerLordId).toBe('greyfen');
    const secondResult = resolveCampaign(firstResult.state, second.campaign.id, 72);
    expect(secondResult.battle).toBeNull();
    expect(secondResult.state.campaigns[second.campaign.id]?.outcome).toBe('cancelled');
    expect(
      second.campaign.attackerCommitmentIds.every(
        (id) => secondResult.state.commitments[id]?.kind === 'returning',
      ),
    ).toBe(true);
  });

  it('ends and returns the prior occupation before a yielded third-party transfer', () => {
    const greyfen = lockForceRequests(
      createTestMilitaryState(),
      'yield-transfer-garrison',
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
    let state = occupyHereditarySeat(greyfen.state, {
      atHours: 1,
      campaignId: 'yield-transfer-garrison',
      commitmentIds: greyfen.commitmentIds,
      occupierId: 'greyfen',
      territoryId: 'westmarch',
    }).state;
    const oldGarrisonId = state.territories.westmarch.occupation?.garrisonCommitmentId;
    if (!oldGarrisonId) throw new Error('expected prior occupation garrison');
    const started = startCampaign(
      state,
      campaignInput({
        attackerId: 'edric',
        baseTerritoryId: 'northkeep',
        campaignId: 'yield-transfer',
        forces: [
          {
            basingTerritoryId: 'northkeep',
            garrisonEligible: true,
            levyTroops: 250,
            lordId: 'edric',
            mercenaryIds: [],
          },
        ],
      }),
      2,
      random('yield-transfer'),
    );
    state = makeCampaignPublic(started.state, started.campaign.id);
    state = reactToCampaign(state, started.campaign.id, 'yield', [], 14);
    const result = resolveCampaign(state, started.campaign.id, 74);
    expect(result.battle).toBeNull();
    expect(result.state.commitments[oldGarrisonId]?.kind).toBe('returning');
    expect(result.state.territories.westmarch.controllerLordId).toBe('edric');
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
    const capitalAttackAuthorization = authorizeCapital(capital, 'probe-capital-garrison', 'mara');
    capital = capitalAttackAuthorization.state;
    const capitalAttack = startCampaign(
      capital,
      campaignInput({
        attackerId: 'mara',
        baseTerritoryId: 'westmarch',
        campaignId: 'probe-capital-garrison',
        capitalAuthorizationId: capitalAttackAuthorization.authorizationId,
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
    expect(capitalResult.prestigeDeltas).toEqual({ mara: -6, greyfen: 0 });
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

    const royalAuthorization = authorizeCapital(
      createTestMilitaryState(),
      'royal-defender-prestige',
    );
    const royalAttack = startCampaign(
      royalAuthorization.state,
      campaignInput({
        campaignId: 'royal-defender-prestige',
        capitalAuthorizationId: royalAuthorization.authorizationId,
        forces: [
          {
            basingTerritoryId: 'greyfen',
            garrisonEligible: true,
            levyTroops: 250,
            lordId: 'greyfen',
            mercenaryIds: [],
          },
        ],
        goal: 'capital',
        targetTerritoryId: 'capital',
      }),
      0,
      random('royal-defender-prestige'),
    );
    let royalState = makeCampaignPublic(royalAttack.state, royalAttack.campaign.id);
    royalState = reactToCampaign(royalState, royalAttack.campaign.id, 'defend', [], 12);
    const royalResult = resolveCampaign(royalState, royalAttack.campaign.id, 72);
    expect(royalResult.battle).toMatchObject({ major: true, winner: 'defender' });
    expect(royalResult.prestigeDeltas).toEqual({ greyfen: -6 });

    const claimantLock = lockForceRequests(
      createTestMilitaryState(),
      'claimant-defender-prestige',
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
    let claimantState = occupyCapital(claimantLock.state, {
      atHours: 0,
      campaignId: 'claimant-defender-prestige',
      claimantId: 'greyfen',
      commitmentIds: claimantLock.commitmentIds,
    }).state;
    const claimantAttackAuthorization = authorizeCapital(
      claimantState,
      'claimant-loss-prestige',
      'mara',
    );
    claimantState = claimantAttackAuthorization.state;
    const claimantAttack = startCampaign(
      claimantState,
      campaignInput({
        attackerId: 'mara',
        baseTerritoryId: 'westmarch',
        campaignId: 'claimant-loss-prestige',
        capitalAuthorizationId: claimantAttackAuthorization.authorizationId,
        forces: [
          {
            basingTerritoryId: 'westmarch',
            garrisonEligible: true,
            levyTroops: 400,
            lordId: 'mara',
            mercenaryIds: [],
          },
        ],
        goal: 'capital',
        targetTerritoryId: 'capital',
      }),
      0,
      random('claimant-loss-prestige'),
    );
    claimantState = makeCampaignPublic(claimantAttack.state, claimantAttack.campaign.id);
    const claimantStored = claimantState.campaigns[claimantAttack.campaign.id];
    if (!claimantStored) throw new Error('expected claimant-loss campaign');
    claimantState = {
      ...claimantState,
      campaigns: {
        ...claimantState.campaigns,
        [claimantAttack.campaign.id]: {
          ...claimantStored,
          attackerFortune: 1,
          defenderFortune: 1,
        },
      },
    };
    claimantState = reactToCampaign(claimantState, claimantAttack.campaign.id, 'defend', [], 12);
    const claimantResult = resolveCampaign(claimantState, claimantAttack.campaign.id, 72);
    expect(claimantResult.battle?.winner).toBe('attacker');
    expect(claimantResult.prestigeDeltas).toEqual({ mara: 8, greyfen: -12 });

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
