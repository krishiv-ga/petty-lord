import { DAWN_PRIORITY } from '../kernel/priorities';
import type { DomainModule, ScheduleInput } from '../kernel/types';
import { createGameState } from '../state/create';
import type { JsonObject, JsonValue } from '../state/json';
import { cloneJson } from '../state/json';
import type { DomainExtensions, GameState } from '../state/types';

export interface FakeDomainState {
  choices: string[];
  counter: number;
  randomResults: number[];
  resolutions: string[];
}

export interface FakeExtensions extends DomainExtensions {
  fake: FakeDomainState;
}

function payloadObject(value: JsonValue): JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function payloadNumber(payload: JsonObject, key: string, fallback: number): number {
  const value = payload[key];
  return typeof value === 'number' ? value : fallback;
}

function payloadString(payload: JsonObject, key: string, fallback: string): string {
  const value = payload[key];
  return typeof value === 'string' ? value : fallback;
}

export function createFakeState(
  options: {
    buildVersion?: string;
    diagnostics?: boolean;
    diagnosticLimit?: number;
    seed?: string;
  } = {},
): GameState<FakeExtensions> {
  const base = createGameState({
    buildVersion: options.buildVersion ?? 'test-build',
    diagnostics: options.diagnostics ?? false,
    seed: options.seed ?? 'fake-seed',
    ...(options.diagnosticLimit === undefined ? {} : { diagnosticLimit: options.diagnosticLimit }),
  });
  return {
    ...base,
    fake: { choices: [], counter: 0, randomResults: [], resolutions: [] },
  };
}

function recurringInput(
  dueTimeHours: number,
  payload: JsonObject,
  remaining: number,
  intervalHours: number,
): ScheduleInput[] {
  if (remaining <= 0) {
    return [];
  }
  return [
    {
      dueTimeHours: dueTimeHours + intervalHours,
      kind: 'fake.increment',
      payload: { ...cloneJson(payload), remaining: remaining - 1 },
      priority: payloadNumber(
        payload,
        'recursivePriority',
        DAWN_PRIORITY.PLAYER_ORDERS_AND_AI_INTENTS,
      ),
    },
  ];
}

export const fakeDomainModule: DomainModule<FakeExtensions> = {
  debugHandlers: {
    'fake.set-counter': ({ command, state }) => {
      const payload = payloadObject(command.payload);
      return {
        state: {
          ...state,
          fake: { ...state.fake, counter: payloadNumber(payload, 'counter', state.fake.counter) },
        },
      };
    },
  },
  decisionResolvers: {
    'fake.choice': ({ command, state }) => ({
      effects: [{ kind: 'fake.choice-recorded', payload: { choiceId: command.choiceId } }],
      state: {
        ...state,
        fake: { ...state.fake, choices: [...state.fake.choices, command.choiceId] },
      },
    }),
  },
  id: 'fake-domain',
  initiativeStarters: {
    'fake.increment': ({ command, state }) => {
      const payload = payloadObject(command.payload);
      return {
        schedule: [
          {
            dueTimeHours: state.timeHours + payloadNumber(payload, 'delayHours', 1),
            kind: 'fake.increment',
            payload,
            priority: payloadNumber(
              payload,
              'priority',
              DAWN_PRIORITY.PLAYER_ORDERS_AND_AI_INTENTS,
            ),
          },
        ],
        state,
      };
    },
  },
  scheduledResolvers: {
    'fake.decision': ({ item, state }) => {
      const payload = payloadObject(item.payload);
      return {
        decision: {
          choiceIds: ['accept', 'refuse'],
          id: payloadString(payload, 'decisionId', `decision-${item.sequenceId}`),
          kind: 'fake.choice',
          payload,
        },
        state,
      };
    },
    'fake.increment': ({ item, state }) => {
      const payload = payloadObject(item.payload);
      const amount = payloadNumber(payload, 'amount', 1);
      const remaining = payloadNumber(payload, 'remaining', 0);
      const intervalHours = payloadNumber(payload, 'intervalHours', 0);
      const label = payloadString(payload, 'label', String(item.sequenceId));
      return {
        schedule: recurringInput(item.dueTimeHours, payload, remaining, intervalHours),
        state: {
          ...state,
          fake: {
            ...state.fake,
            counter: state.fake.counter + amount,
            resolutions: [...state.fake.resolutions, label],
          },
        },
      };
    },
    'fake.random': ({ item, random, state }) => {
      const payload = payloadObject(item.payload);
      const result = random.integer(
        payloadString(payload, 'label', `random-${item.sequenceId}`),
        payloadNumber(payload, 'minimum', 0),
        payloadNumber(payload, 'maximum', 100),
      );
      return {
        state: {
          ...state,
          fake: { ...state.fake, randomResults: [...state.fake.randomResults, result] },
        },
      };
    },
    'fake.terminal': ({ item, state }) => {
      const payload = payloadObject(item.payload);
      const requestedStatus = payloadString(payload, 'status', 'won');
      const status = ['lost', 'succession', 'won'].includes(requestedStatus)
        ? (requestedStatus as 'lost' | 'succession' | 'won')
        : 'won';
      return { state: { ...state, status } };
    },
  },
};
