import { describe, expect, it } from 'vitest';
import { canonicalGameContent } from '../../../src/contracts/content';
import { buildPlayerKnowledgeProjection } from '../../../src/sim/projections/knowledge/projection';
import { createRandomState } from '../../../src/sim/random/random';
import {
  type AiActorState,
  type AiIntentCandidate,
  chooseAndStartIntent,
  completeOrInvalidateIntent,
} from '../../../src/sim/systems/ai/ai';
import {
  EMPTY_EVENT_ENGINE_STATE,
  resolveEventChoice,
} from '../../../src/sim/systems/events/events';
import {
  type NotificationKind,
  notificationVolumeSample,
} from '../../../src/sim/systems/events/notifications';
import { createSeededOpening } from '../../../src/sim/systems/openings/openings';
import { PUBLIC_REALM_FIXTURE } from '../knowledge/fixtures';

const nearTieCandidates: AiIntentCandidate[] = [
  {
    actionId: 'watch-court',
    basePriority: 35,
    category: 'politics',
    cost: { gold: 20, influence: 8, troops: 0 },
    durationHours: 72,
    id: 'watch-known-rival',
    invalidationFallback: 'cancel-and-wait',
    reasons: ['known-opportunity'],
    targetId: 'renard',
    visibility: 'suspected',
  },
  {
    actionId: 'send-gift',
    basePriority: 35,
    category: 'politics',
    cost: { gold: 20, influence: 0, troops: 0 },
    durationHours: 24,
    id: 'court-known-ally',
    invalidationFallback: 'cancel-and-wait',
    reasons: ['known-opportunity'],
    targetId: 'mara',
    visibility: 'public',
  },
];

const mara = (): AiActorState => ({
  activeIntent: null,
  id: 'mara',
  nextDecisionAtHours: 0,
  resources: { availableTroops: 430, gold: 65, influence: 40, lockedTroops: 0 },
});

const maraKnowledge = () =>
  buildPlayerKnowledgeProjection({
    atHours: 0,
    ledger: { observations: [] },
    publicRealm: PUBLIC_REALM_FIXTURE,
    self: {
      agreements: [],
      army: 430,
      defensePower: 430,
      intentId: null,
      lordId: 'mara',
      secrets: [],
      support: { basis: 'unknown', candidateId: null, level: 'unaligned' },
    },
  });

describe('WP-023 hostile AI and information probes', () => {
  it('never gives an actor hidden extra hands or negative resources across repeated cycles', () => {
    for (let seedIndex = 0; seedIndex < 32; seedIndex += 1) {
      let state = mara();
      let randomState = createRandomState(`hostile-capacity-${seedIndex}`);
      for (let cycle = 0; cycle < 3; cycle += 1) {
        const started = chooseAndStartIntent({
          actor: state,
          atHours: cycle * 96,
          candidates: nearTieCandidates,
          knowledge: maraKnowledge(),
          phase: 'ailing',
          randomState,
          sequenceId: cycle + 1,
        });
        expect(started.actor.activeIntent).not.toBeNull();
        expect(started.actor.resources.gold).toBeGreaterThanOrEqual(0);
        expect(started.actor.resources.influence).toBeGreaterThanOrEqual(0);
        const attemptedExtra = chooseAndStartIntent({
          actor: started.actor,
          atHours: cycle * 96 + 1,
          candidates: nearTieCandidates,
          knowledge: maraKnowledge(),
          phase: 'ailing',
          randomState: started.randomStateAfter,
          sequenceId: cycle + 100,
        });
        expect(attemptedExtra.selected).toBeNull();
        state = completeOrInvalidateIntent({
          actor: started.actor,
          atHours: cycle * 96 + 72,
          resolution: 'completed',
        });
        randomState = started.randomStateAfter;
      }
    }
  });

  it('does not collapse every seed to one AI script or one opening', () => {
    const aiSelections = new Set<string>();
    const openingSelections = new Set<string>();
    const renardSecrets = new Set<string>();
    for (let index = 0; index < 128; index += 1) {
      aiSelections.add(
        chooseAndStartIntent({
          actor: mara(),
          atHours: 0,
          candidates: nearTieCandidates,
          knowledge: maraKnowledge(),
          phase: 'ailing',
          randomState: createRandomState(`hostile-variety-${index}`),
          sequenceId: 1,
        }).selected?.id ?? 'idle',
      );
      const opening = createSeededOpening(`hostile-opening-${index}`, canonicalGameContent);
      openingSelections.add(opening.id);
      renardSecrets.add(opening.renardSecretId);
    }
    expect(aiSelections.size).toBeGreaterThan(1);
    expect(openingSelections.size).toBe(4);
    expect(renardSecrets.size).toBe(3);
  });

  it('keeps unknown private state absent for every observer projection', () => {
    for (const observerId of ['greyfen', 'edric', 'ysabel', 'renard', 'oswin', 'mara'] as const) {
      const projection = buildPlayerKnowledgeProjection({
        atHours: 240,
        ledger: { observations: [] },
        publicRealm: PUBLIC_REALM_FIXTURE,
        self: {
          agreements: [],
          army: 200,
          defensePower: 200,
          intentId: null,
          lordId: observerId,
          secrets: [],
          support: { basis: 'unknown', candidateId: null, level: 'unaligned' },
        },
      });
      for (const [lordId, lord] of Object.entries(projection.lords)) {
        if (lordId === observerId) continue;
        expect(lord.intent.kind).toBe('unknown');
        expect(lord.leaning.kind).toBe('unknown');
        expect(lord.army.kind).toBe('banded');
      }
      expect(projection.knownSecrets).toEqual([]);
    }
  });

  it('has a legal fallback for every authored event, preventing impossible-choice softlocks', () => {
    for (const event of canonicalGameContent.events) {
      const result = resolveEventChoice({
        atHours: 100,
        choiceId: 'invalid-or-unaffordable',
        content: canonicalGameContent,
        randomState: createRandomState(`event-fallback-${event.id}`),
        resources: { gold: 0, influence: 0 },
        satisfiedRequirementIds: new Set(),
        state: { ...EMPTY_EVENT_ENGINE_STATE, pendingEventId: event.id },
      });
      expect(result.fallbackUsed).toBe(true);
      expect(result.resources).toEqual({ gold: 0, influence: 0 });
    }
  });

  it('keeps a routine-heavy trace out of modal/interrupt overload', () => {
    const routine = Array.from(
      { length: 120 },
      (_, index): NotificationKind =>
        index % 3 === 0 ? 'routine-ai-gift' : index % 3 === 1 ? 'routine-tax' : 'harmless-court',
    );
    const sample = notificationVolumeSample([
      ...routine,
      'phase-change',
      'direct-attack',
      'mandatory-choice',
    ]);
    expect(sample).toEqual({ feed: 120, interrupts: 3, total: 123 });
  });
});
