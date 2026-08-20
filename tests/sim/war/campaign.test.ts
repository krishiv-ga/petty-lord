import { describe, expect, it } from 'vitest';
import { applyCommand } from '../../../src/sim/kernel/engine';
import { createKernelRegistry } from '../../../src/sim/kernel/registry';
import { exportState, importState } from '../../../src/sim/serialization/serialization';
import {
  MILITARY_HANDLER_KINDS,
  militaryWarModule,
} from '../../../src/sim/systems/actions/military/module';
import type {
  MilitaryDomainExtensions,
  MilitaryGameState,
} from '../../../src/sim/systems/military/domain';
import { royalAuthorityConsequences } from '../../../src/sim/systems/war/campaign';
import { createTestMilitaryGameState, createTestMilitaryState } from './fixtures';

const registry = createKernelRegistry<MilitaryDomainExtensions>([militaryWarModule]);

const startWestmarch = (state: MilitaryGameState) => {
  const result = applyCommand(
    state,
    {
      initiativeType: MILITARY_HANDLER_KINDS.campaign,
      payload: {
        attackerId: 'greyfen',
        baseTerritoryId: 'greyfen',
        campaignId: 'greyfen-westmarch-1',
        declaredClaimant: true,
        defensiveAuthorizationId: null,
        forces: [
          {
            basingTerritoryId: 'greyfen',
            garrisonEligible: true,
            levyTroops: 350,
            lordId: 'greyfen',
            mercenaryIds: [],
          },
        ],
        goal: 'occupy',
        targetTerritoryId: 'westmarch',
      },
      type: 'START_INITIATIVE',
    },
    registry,
  );
  if (!result.ok) throw new Error(result.error.message);
  return result.state;
};

function advance(state: MilitaryGameState, hours: number): MilitaryGameState {
  const result = applyCommand(state, { hours, mode: 'instant', type: 'ADVANCE_TIME' }, registry);
  if (!result.ok) throw new Error(result.error.message);
  return result.state;
}

function chooseDefense(state: MilitaryGameState): MilitaryGameState {
  const decision = state.pendingDecisions[0];
  if (!decision) throw new Error('expected defender reaction');
  const result = applyCommand(
    state,
    {
      choiceId: 'defend',
      decisionId: decision.id,
      payload: {
        forces: [
          {
            basingTerritoryId: 'westmarch',
            garrisonEligible: true,
            levyTroops: 200,
            lordId: 'mara',
            mercenaryIds: [],
          },
        ],
      },
      type: 'CHOOSE_DECISION',
    },
    registry,
  );
  if (!result.ok) throw new Error(result.error.message);
  const resumed = applyCommand(result.state, { speed: 1, type: 'SET_REQUESTED_SPEED' }, registry);
  if (!resumed.ok) throw new Error(resumed.error.message);
  return resumed.state;
}

describe('campaign flow and Royal Authority', () => {
  it('opens a mandatory defender reaction outside two occupied Order slots', () => {
    const initial = { ...createTestMilitaryGameState(), orders: [{ id: 'one' }, { id: 'two' }] };
    const started = startWestmarch(initial);
    expect(
      started.systems.war.campaigns['greyfen-westmarch-1']?.attackerFortune,
    ).toBeGreaterThanOrEqual(0.92);
    const publicState = advance(started, 12);
    expect(publicState.pendingDecisions[0]?.kind).toBe(MILITARY_HANDLER_KINDS.defenderReaction);
    expect(publicState.orders).toHaveLength(2);
    expect(publicState.timeHours).toBe(12);
  });

  it('persists stored fortune and produces byte-identical battle results through reload and time chunking', () => {
    const started = startWestmarch(createTestMilitaryGameState(undefined, 'reload-battle'));
    const serialized = exportState(started);
    const imported = importState<MilitaryGameState>(serialized, { expectedSchemaVersion: 1 });
    expect(imported.ok).toBe(true);
    if (!imported.ok) return;
    const run = (state: MilitaryGameState, chunks: number[]) => {
      let next = advance(state, 12);
      next = chooseDefense(next);
      for (const hours of chunks) next = advance(next, hours);
      return next;
    };
    const direct = run(started, [60]);
    const reloaded = run(imported.state, [12, 12, 12, 12, 12]);
    expect(direct.systems.war.campaigns['greyfen-westmarch-1']).toEqual(
      reloaded.systems.war.campaigns['greyfen-westmarch-1'],
    );
    expect(direct.systems.war.lords.greyfen.permanentLevyCasualties).toBeGreaterThan(0);
    expect(direct.systems.war).toEqual(reloaded.systems.war);
    expect(direct.rngState).toBe(reloaded.rngState);
  });

  it('matches the Stable/Ailing/Gravely Ill/Deathbed sanctions matrix', () => {
    const matrix = ['stable', 'ailing', 'gravely-ill', 'deathbed'] as const;
    const consequences = Object.fromEntries(
      matrix.map((phase) => [
        phase,
        royalAuthorityConsequences(createTestMilitaryState({ phase }), 'westmarch', false),
      ]),
    );
    expect(consequences.stable).toMatchObject({
      churchConduct: -1,
      influenceCost: 15,
      prestige: -10,
      royalDefenderTroops: 150,
    });
    expect(consequences.ailing).toMatchObject({
      influenceCost: 0,
      prestige: -5,
      royalDefenderTroops: 0,
    });
    expect(consequences['gravely-ill']?.prestige).toBe(0);
    expect(consequences.deathbed?.prestige).toBe(0);
    expect(
      royalAuthorityConsequences(createTestMilitaryState({ phase: 'stable' }), 'abbeylands', false)
        .churchConduct,
    ).toBe(-2);
    expect(
      royalAuthorityConsequences(createTestMilitaryState(), 'westmarch', true)
        .defensiveThreatReduction,
    ).toBe(10);
  });
});
