import { describe, expect, it } from 'vitest';
import { buildPlayerKnowledgeProjection } from '../../../src/sim/projections/knowledge/projection';
import { createRandomState } from '../../../src/sim/random/random';
import {
  type AiActorState,
  type AiIntentCandidate,
  chooseAndStartIntent,
  completeOrInvalidateIntent,
  recordReaction,
} from '../../../src/sim/systems/ai/ai';
import { PUBLIC_REALM_FIXTURE } from '../knowledge/fixtures';

const actor = (id: AiActorState['id'] = 'renard'): AiActorState => ({
  activeIntent: null,
  id,
  nextDecisionAtHours: 0,
  resources: { availableTroops: 450, gold: 100, influence: 50, lockedTroops: 0 },
});

const knowledge = (id: AiActorState['id']) =>
  buildPlayerKnowledgeProjection({
    atHours: 0,
    ledger: { observations: [] },
    publicRealm: PUBLIC_REALM_FIXTURE,
    self: {
      agreements: [],
      army: 450,
      defensePower: 450,
      intentId: null,
      lordId: id,
      secrets: [],
      support: { basis: 'unknown', candidateId: null, level: 'unaligned' },
    },
  });

const candidate = (id: string, overrides: Partial<AiIntentCandidate> = {}): AiIntentCandidate => ({
  actionId: 'patronize-church',
  basePriority: 35,
  category: 'legitimacy',
  cost: { gold: 20, influence: 5, troops: 0 },
  durationHours: 72,
  id,
  invalidationFallback: 'cancel-and-wait',
  reasons: ['known-legitimacy-pressure', 'phase-priority'],
  targetId: 'oswin',
  visibility: 'public',
  ...overrides,
});

describe('one-Intent rival AI', () => {
  it('filters illegal and unaffordable actions and pays/locks actual resources', () => {
    const result = chooseAndStartIntent({
      actor: actor(),
      atHours: 24,
      candidates: [
        candidate('illegal', {
          basePriority: 100,
          knowledgeRequirements: [{ kind: 'known-intent', subjectId: 'edric' }],
        }),
        candidate('unaffordable', {
          basePriority: 99,
          cost: { gold: 101, influence: 0, troops: 0 },
        }),
        candidate('legal', { cost: { gold: 20, influence: 8, troops: 75 } }),
      ],
      knowledge: knowledge('renard'),
      phase: 'ailing',
      randomState: createRandomState('ai-affordability'),
      sequenceId: 12,
    });
    expect(result.selected?.id).toBe('legal');
    expect(result.actor.resources).toEqual({
      availableTroops: 450,
      gold: 80,
      influence: 42,
      lockedTroops: 75,
    });
    expect(result.selected).toMatchObject({ dueAtHours: 96, sequenceId: 12 });
  });

  it('holds at most one major Intent while reacting without consuming it', () => {
    const first = chooseAndStartIntent({
      actor: actor('edric'),
      atHours: 0,
      candidates: [candidate('defend', { actionId: 'invade-territory', category: 'defense' })],
      knowledge: knowledge('edric'),
      phase: 'gravely-ill',
      randomState: createRandomState('one-intent'),
      sequenceId: 1,
    });
    const second = chooseAndStartIntent({
      actor: first.actor,
      atHours: 24,
      candidates: [candidate('extra-hidden-action')],
      knowledge: knowledge('edric'),
      phase: 'gravely-ill',
      randomState: first.randomStateAfter,
      sequenceId: 2,
    });
    expect(second.selected).toBeNull();
    const reaction = recordReaction(first.actor, {
      actorId: 'edric',
      kind: 'defense',
      sourceId: 'incoming-campaign',
    });
    expect(reaction.activeIntentPreserved).toEqual(first.selected);
  });

  it('stores near-tie noise for reload determinism while varying across seeds', () => {
    const candidates = [
      candidate('court-oswin'),
      candidate('court-ysabel', { targetId: 'ysabel' }),
    ];
    const first = chooseAndStartIntent({
      actor: actor(),
      atHours: 0,
      candidates,
      knowledge: knowledge('renard'),
      phase: 'ailing',
      randomState: createRandomState('near-tie'),
      sequenceId: 1,
    });
    const storedNearTieDraws = first.selected?.storedDraws;
    if (storedNearTieDraws === undefined) throw new Error('Expected a selected near-tie Intent');
    const reload = chooseAndStartIntent({
      actor: actor(),
      atHours: 0,
      candidates,
      knowledge: knowledge('renard'),
      phase: 'ailing',
      randomState: createRandomState('unrelated-reload-state'),
      sequenceId: 1,
      storedNearTieDraws,
    });
    expect(reload.selected?.id).toBe(first.selected?.id);
    expect(reload.selected?.storedDraws).toEqual(first.selected?.storedDraws);

    const selections = Array.from(
      { length: 40 },
      (_, index) =>
        chooseAndStartIntent({
          actor: actor(),
          atHours: 0,
          candidates,
          knowledge: knowledge('renard'),
          phase: 'ailing',
          randomState: createRandomState(`near-tie-${index}`),
          sequenceId: 1,
        }).selected?.id,
    );
    expect(new Set(selections).size).toBe(2);
  });

  it('shifts authored priorities toward succession without leaking hidden reasons', () => {
    const result = chooseAndStartIntent({
      actor: actor('renard'),
      atHours: 720,
      candidates: [
        candidate('taxes', {
          actionId: 'raise-taxes',
          basePriority: 35,
          category: 'economy',
          reasons: ['resource-recovery'],
          targetId: null,
        }),
        candidate('legitimacy', {
          basePriority: 35,
          category: 'legitimacy',
          reasons: ['known-legitimacy-pressure'],
        }),
      ],
      knowledge: knowledge('renard'),
      phase: 'deathbed',
      randomState: createRandomState('phase-priority'),
      sequenceId: 44,
    });
    expect(result.selected?.id).toBe('legitimacy');
    expect(JSON.stringify(result.selected?.explanation)).not.toContain('hidden');
  });

  it('releases capacity after invalidation without refunding paid Gold or Influence', () => {
    const started = chooseAndStartIntent({
      actor: actor('mara'),
      atHours: 0,
      candidates: [candidate('campaign', { cost: { gold: 10, influence: 0, troops: 100 } })],
      knowledge: knowledge('mara'),
      phase: 'ailing',
      randomState: createRandomState('fallback'),
      sequenceId: 3,
    });
    const invalidated = completeOrInvalidateIntent({
      actor: started.actor,
      atHours: 100,
      resolution: 'invalidated',
    });
    expect(invalidated.activeIntent).toBeNull();
    expect(invalidated.resources).toMatchObject({ gold: 90, influence: 50, lockedTroops: 0 });
    expect(invalidated.nextDecisionAtHours).toBe(120);
    expect(
      chooseAndStartIntent({
        actor: invalidated,
        atHours: 119,
        candidates: [candidate('too-soon')],
        knowledge: knowledge('mara'),
        phase: 'ailing',
        randomState: createRandomState('invalidation-wait'),
        sequenceId: 4,
      }).selected,
    ).toBeNull();
    expect(
      chooseAndStartIntent({
        actor: invalidated,
        atHours: 120,
        candidates: [candidate('next-dawn')],
        knowledge: knowledge('mara'),
        phase: 'ailing',
        randomState: createRandomState('invalidation-next-dawn'),
        sequenceId: 5,
      }).selected?.id,
    ).toBe('next-dawn');
    expect(() =>
      completeOrInvalidateIntent({
        actor: started.actor,
        atHours: 24,
        resolution: 'completed',
        troopLosses: -1,
      }),
    ).toThrow(/troop losses/);
  });
});
