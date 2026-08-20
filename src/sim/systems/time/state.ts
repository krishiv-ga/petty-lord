import type { GameContent } from '../../../contracts/content';
import type { LordId, TerritoryId } from '../../../contracts/ids';
import {
  ACTION_IDS,
  CONDITION_IDS,
  LORD_IDS,
  PHASE_IDS,
  POLICY_IDS,
  TERRITORY_IDS,
} from '../../../contracts/ids';
import type { FoundationGameState } from '../../../contracts/state';
import { importFoundationGameState } from '../../../contracts/state';
import { DAWN_PRIORITY, isCanonicalSimulationHours, scheduleItem } from '../../kernel';
import { RandomSession } from '../../random';
import type { ImportResult, ValidationFailure } from '../../serialization';
import { stableJson } from '../../state';
import type {
  KingHealthState,
  LordResourceState,
  TerritoryEconomyState,
  Wp020GameState,
  Wp020SystemState,
} from './types';

export const TIME_EVENT_KINDS = {
  dawnEconomy: 'time.dawn-economy',
  death: 'time.king-death',
  phase: 'time.health-phase',
  prognosis: 'time.prognosis',
  reaction: 'time.reaction',
} as const;

const PHASE_EVENTS = [
  { day: 14, phase: 'ailing' },
  { day: 28, phase: 'gravely-ill' },
  { day: 42, phase: 'deathbed' },
] as const;

const PROGNOSIS_DAYS = [42, 49, 53, 55] as const;

function chooseDeathDay(random: RandomSession, content: GameContent): number {
  const entries = Object.entries(content.constants.clock.deathDayWeights)
    .map(([day, weight]) => ({ day: Number(day), weight }))
    .sort((left, right) => left.day - right.day);
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  const roll = random.integer('time.king.death-dawn', 1, total);
  let cumulative = 0;
  for (const entry of entries) {
    cumulative += entry.weight;
    if (roll <= cumulative) return entry.day;
  }
  throw new Error('Death-day weights did not select a day');
}

function lordResources(content: GameContent): Record<LordId, LordResourceState> {
  return Object.fromEntries(
    content.lords.map((lord) => [
      lord.id,
      {
        claim: lord.starting.claim,
        committedTroops: 0,
        conditions: [],
        gold: lord.starting.gold,
        goldFractionMillionths: 0,
        influence: lord.starting.influence,
        lockedGold: 0,
        prestige: lord.starting.prestige,
      } satisfies LordResourceState,
    ]),
  ) as unknown as Record<LordId, LordResourceState>;
}

function territories(content: GameContent): Record<TerritoryId, TerritoryEconomyState> {
  return Object.fromEntries(
    content.territories.map((territory) => [
      territory.id,
      {
        availableLevies: territory.startingLevies ?? 0,
        conditions: [],
        fortification: territory.fortification,
        legalLordId: territory.legalLordId,
        levyCapacity: territory.levyCapacity,
        levyRecoveryMillionths: 0,
        physicalControllerId: territory.legalLordId,
        territoryId: territory.id,
        traitId: territory.traitId,
      } satisfies TerritoryEconomyState,
    ]),
  ) as unknown as Record<TerritoryId, TerritoryEconomyState>;
}

export function createWp020GameState(
  foundation: FoundationGameState,
  content: GameContent,
): Wp020GameState {
  if (foundation.timeHours !== 0 || foundation.scheduledEvents.length !== 0) {
    throw new Error('WP-020 state must be initialized on a fresh foundation state');
  }
  const random = new RandomSession(foundation.rngState);
  const deathDawnElapsedDay = chooseDeathDay(random, content);
  const king: KingHealthState = {
    alive: true,
    deathDawnElapsedDay,
    diedAtHours: null,
    phase: 'stable',
    phaseTrace: [{ elapsedDay: 0, phase: 'stable', timeHours: 0 }],
    prognosis: 'roughly-eight-weeks',
    prognosisTrace: [{ elapsedDay: 0, prognosis: 'roughly-eight-weeks', timeHours: 0 }],
  };
  const system = {
    actionHistory: [],
    invalidTargets: [],
    king,
    lords: lordResources(content),
    orders: [],
    policies: [],
    reactions: [],
    resourceLedger: [],
    territories: territories(content),
    version: 1,
  } as unknown as Wp020SystemState;
  let state = {
    ...foundation,
    rngState: random.exportState(),
    systems: { ...foundation.systems, time: system },
  } as Wp020GameState;
  for (let day = 1; day <= content.constants.clock.crisisDays; day += 1) {
    state = scheduleItem(state, {
      dueTimeHours: day * content.constants.clock.hoursPerDay,
      kind: TIME_EVENT_KINDS.dawnEconomy,
      payload: { elapsedDay: day },
      priority: DAWN_PRIORITY.EXPIRY_DECAY_INCOME_AND_RECOVERY,
    }).state as Wp020GameState;
  }
  for (const event of PHASE_EVENTS) {
    state = scheduleItem(state, {
      dueTimeHours: event.day * content.constants.clock.hoursPerDay,
      kind: TIME_EVENT_KINDS.phase,
      payload: { elapsedDay: event.day, phase: event.phase },
      priority: DAWN_PRIORITY.HEALTH_PHASE_TRANSITION,
    }).state as Wp020GameState;
  }
  for (const day of PROGNOSIS_DAYS) {
    state = scheduleItem(state, {
      dueTimeHours: day * content.constants.clock.hoursPerDay,
      kind: TIME_EVENT_KINDS.prognosis,
      payload: { elapsedDay: day },
      priority: DAWN_PRIORITY.HEALTH_PHASE_TRANSITION + 50,
    }).state as Wp020GameState;
  }
  state = scheduleItem(state, {
    dueTimeHours: deathDawnElapsedDay * content.constants.clock.hoursPerDay,
    kind: TIME_EVENT_KINDS.death,
    payload: { elapsedDay: deathDawnElapsedDay },
    priority: DAWN_PRIORITY.KINGS_DEATH_CHECK,
    storedDraws: { deathDawnElapsedDay },
  }).state as Wp020GameState;
  if (state.diagnostics.enabled) {
    state = {
      ...state,
      diagnostics: {
        ...state.diagnostics,
        randomDraws: [...state.diagnostics.randomDraws, ...random.trace()].slice(
          -state.diagnostics.limit,
        ),
      },
    };
  }
  return state;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const PROGNOSIS_IDS = [
  'roughly-eight-weeks',
  'perhaps-a-fortnight',
  'unlikely-to-survive-week',
  'days',
  'any-hour',
] as const;

const RESOURCE_KINDS = ['claim', 'gold', 'influence', 'levies', 'prestige'] as const;
const ORDER_STATUSES = ['active', 'cancelled', 'failed', 'resolved'] as const;
const REACTION_STATUSES = ['expired', 'opened', 'queued', 'resolved'] as const;

function isCanonicalHour(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && isCanonicalSimulationHours(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function validateUniqueStrings(
  value: unknown,
  path: string,
  issues: ValidationFailure[],
): value is string[] {
  if (!Array.isArray(value)) {
    issues.push({ message: 'must be an array', path });
    return false;
  }
  if (!value.every(isNonEmptyString) || new Set(value).size !== value.length) {
    issues.push({ message: 'must contain unique non-empty strings', path });
    return false;
  }
  return true;
}

function validateTimedConditions(value: unknown, path: string, issues: ValidationFailure[]): void {
  if (!Array.isArray(value)) {
    issues.push({ message: 'must be an array', path });
    return;
  }
  const ids = new Set<string>();
  for (const [index, condition] of value.entries()) {
    const conditionPath = `${path}[${index}]`;
    if (!isRecord(condition)) {
      issues.push({ message: 'must be an object', path: conditionPath });
      continue;
    }
    if (!CONDITION_IDS.includes(condition.id as (typeof CONDITION_IDS)[number])) {
      issues.push({ message: 'must use a canonical condition id', path: `${conditionPath}.id` });
    } else if (ids.has(condition.id as string)) {
      issues.push({
        message: 'condition id must be unique in its scope',
        path: `${conditionPath}.id`,
      });
    } else {
      ids.add(condition.id as string);
    }
    if (!isCanonicalHour(condition.startedAtHours)) {
      issues.push({
        message: 'must be a canonical non-negative hour',
        path: `${conditionPath}.startedAtHours`,
      });
    }
    if (
      condition.expiresAtHours !== null &&
      (!isCanonicalHour(condition.expiresAtHours) ||
        (isCanonicalHour(condition.startedAtHours) &&
          condition.expiresAtHours <= condition.startedAtHours))
    ) {
      issues.push({
        message: 'must be null or later than its start',
        path: `${conditionPath}.expiresAtHours`,
      });
    }
  }
}

function validateHealthTrace(
  value: unknown,
  path: string,
  valueKey: 'phase' | 'prognosis',
  allowed: readonly string[],
  current: unknown,
  issues: ValidationFailure[],
): void {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push({ message: 'must be a non-empty array', path });
    return;
  }
  let previousDay = -1;
  for (const [index, entry] of value.entries()) {
    const entryPath = `${path}[${index}]`;
    if (!isRecord(entry)) {
      issues.push({ message: 'must be an object', path: entryPath });
      continue;
    }
    if (!Number.isSafeInteger(entry.elapsedDay) || (entry.elapsedDay as number) <= previousDay) {
      issues.push({
        message: 'must be a strictly increasing non-negative elapsed day',
        path: `${entryPath}.elapsedDay`,
      });
    } else {
      previousDay = entry.elapsedDay as number;
    }
    if (!allowed.includes(entry[valueKey] as string)) {
      issues.push({ message: `must be a canonical ${valueKey}`, path: `${entryPath}.${valueKey}` });
    }
    if (
      !isCanonicalHour(entry.timeHours) ||
      (Number.isSafeInteger(entry.elapsedDay) &&
        entry.timeHours !== (entry.elapsedDay as number) * 24)
    ) {
      issues.push({ message: 'must match the elapsed dawn', path: `${entryPath}.timeHours` });
    }
  }
  const first = value[0];
  if (!isRecord(first) || first.elapsedDay !== 0 || first.timeHours !== 0) {
    issues.push({ message: 'must begin at elapsed day zero', path: `${path}[0]` });
  }
  const last = value.at(-1);
  if (!isRecord(last) || last[valueKey] !== current) {
    issues.push({ message: `last entry must match current ${valueKey}`, path });
  }
}

export function validateWp020System(value: unknown): ValidationFailure[] {
  const issues: ValidationFailure[] = [];
  if (!isRecord(value)) return [{ message: 'must be an object', path: '$.systems.time' }];
  if (value.version !== 1) issues.push({ message: 'must equal 1', path: '$.systems.time.version' });
  if (!isRecord(value.king))
    issues.push({ message: 'must be an object', path: '$.systems.time.king' });
  if (!isRecord(value.lords))
    issues.push({ message: 'must be an object', path: '$.systems.time.lords' });
  if (!isRecord(value.territories)) {
    issues.push({ message: 'must be an object', path: '$.systems.time.territories' });
  }
  for (const field of [
    'orders',
    'actionHistory',
    'invalidTargets',
    'reactions',
    'resourceLedger',
    'policies',
  ]) {
    if (!Array.isArray(value[field])) {
      issues.push({ message: 'must be an array', path: `$.systems.time.${field}` });
    }
  }
  validateUniqueStrings(value.invalidTargets, '$.systems.time.invalidTargets', issues);
  if (Array.isArray(value.policies)) {
    if (
      !value.policies.every((policy) =>
        POLICY_IDS.includes(policy as (typeof POLICY_IDS)[number]),
      ) ||
      new Set(value.policies).size !== value.policies.length
    ) {
      issues.push({
        message: 'must contain unique canonical policy ids',
        path: '$.systems.time.policies',
      });
    }
  }
  if (isRecord(value.king)) {
    if (
      !Number.isSafeInteger(value.king.deathDawnElapsedDay) ||
      (value.king.deathDawnElapsedDay as number) < 49 ||
      (value.king.deathDawnElapsedDay as number) > 56
    ) {
      issues.push({
        message: 'must be an elapsed dawn from 49 through 56',
        path: '$.systems.time.king.deathDawnElapsedDay',
      });
    }
    if (typeof value.king.alive !== 'boolean') {
      issues.push({ message: 'must be boolean', path: '$.systems.time.king.alive' });
    }
    if (!PHASE_IDS.includes(value.king.phase as (typeof PHASE_IDS)[number])) {
      issues.push({ message: 'must be a canonical phase', path: '$.systems.time.king.phase' });
    }
    if (!PROGNOSIS_IDS.includes(value.king.prognosis as (typeof PROGNOSIS_IDS)[number])) {
      issues.push({
        message: 'must be a canonical prognosis',
        path: '$.systems.time.king.prognosis',
      });
    }
    validateHealthTrace(
      value.king.phaseTrace,
      '$.systems.time.king.phaseTrace',
      'phase',
      PHASE_IDS,
      value.king.phase,
      issues,
    );
    validateHealthTrace(
      value.king.prognosisTrace,
      '$.systems.time.king.prognosisTrace',
      'prognosis',
      PROGNOSIS_IDS,
      value.king.prognosis,
      issues,
    );
    if (value.king.alive === true && value.king.diedAtHours !== null) {
      issues.push({
        message: 'living King cannot have a death time',
        path: '$.systems.time.king.diedAtHours',
      });
    }
    if (value.king.alive === false && !isCanonicalHour(value.king.diedAtHours)) {
      issues.push({
        message: 'dead King requires a canonical death time',
        path: '$.systems.time.king.diedAtHours',
      });
    }
  }
  if (isRecord(value.lords)) {
    for (const lordId of Object.keys(value.lords)) {
      if (!LORD_IDS.includes(lordId as (typeof LORD_IDS)[number])) {
        issues.push({
          message: 'must be a canonical lord id',
          path: `$.systems.time.lords.${lordId}`,
        });
      }
    }
    for (const lordId of LORD_IDS) {
      const lord = value.lords[lordId];
      const path = `$.systems.time.lords.${lordId}`;
      if (!isRecord(lord)) {
        issues.push({ message: 'is required', path });
        continue;
      }
      for (const field of [
        'gold',
        'lockedGold',
        'influence',
        'prestige',
        'claim',
        'committedTroops',
      ]) {
        if (!Number.isSafeInteger(lord[field]) || (lord[field] as number) < 0) {
          issues.push({ message: 'must be a non-negative integer', path: `${path}.${field}` });
        }
      }
      if (
        typeof lord.gold === 'number' &&
        typeof lord.lockedGold === 'number' &&
        lord.lockedGold > lord.gold
      ) {
        issues.push({ message: 'cannot exceed current Gold', path: `${path}.lockedGold` });
      }
      for (const field of ['influence', 'prestige', 'claim']) {
        if (typeof lord[field] === 'number' && (lord[field] as number) > 100) {
          issues.push({ message: 'must not exceed 100', path: `${path}.${field}` });
        }
      }
      if (
        !Number.isSafeInteger(lord.goldFractionMillionths) ||
        (lord.goldFractionMillionths as number) < 0 ||
        (lord.goldFractionMillionths as number) >= 1_000_000
      ) {
        issues.push({
          message: 'must be an integer fraction below one Gold',
          path: `${path}.goldFractionMillionths`,
        });
      }
      validateTimedConditions(lord.conditions, `${path}.conditions`, issues);
    }
  }
  if (isRecord(value.territories)) {
    for (const territoryId of Object.keys(value.territories)) {
      if (!TERRITORY_IDS.includes(territoryId as (typeof TERRITORY_IDS)[number])) {
        issues.push({
          message: 'must be a canonical territory id',
          path: `$.systems.time.territories.${territoryId}`,
        });
      }
    }
    for (const territoryId of TERRITORY_IDS) {
      const territory = value.territories[territoryId];
      const path = `$.systems.time.territories.${territoryId}`;
      if (!isRecord(territory)) {
        issues.push({ message: 'is required', path });
        continue;
      }
      if (
        !Number.isSafeInteger(territory.availableLevies) ||
        (territory.availableLevies as number) < 0
      ) {
        issues.push({ message: 'must be a non-negative integer', path: `${path}.availableLevies` });
      }
      if (
        territory.levyCapacity !== null &&
        (!Number.isSafeInteger(territory.levyCapacity) ||
          (territory.levyCapacity as number) < 0 ||
          (territory.availableLevies as number) > (territory.levyCapacity as number))
      ) {
        issues.push({ message: 'must bound available levies', path: `${path}.levyCapacity` });
      }
      if (
        !Number.isSafeInteger(territory.levyRecoveryMillionths) ||
        (territory.levyRecoveryMillionths as number) < 0 ||
        (territory.levyRecoveryMillionths as number) >= 1_000_000
      ) {
        issues.push({
          message: 'must be an integer fraction below one levy',
          path: `${path}.levyRecoveryMillionths`,
        });
      }
      if (territory.territoryId !== territoryId) {
        issues.push({ message: 'must match its record key', path: `${path}.territoryId` });
      }
      for (const field of ['legalLordId', 'physicalControllerId'] as const) {
        if (
          territory[field] !== null &&
          !LORD_IDS.includes(territory[field] as (typeof LORD_IDS)[number])
        ) {
          issues.push({ message: 'must be null or a canonical lord id', path: `${path}.${field}` });
        }
      }
      if (
        !Number.isSafeInteger(territory.fortification) ||
        (territory.fortification as number) < 0
      ) {
        issues.push({ message: 'must be a non-negative integer', path: `${path}.fortification` });
      }
      if (!isNonEmptyString(territory.traitId)) {
        issues.push({ message: 'must be a non-empty string', path: `${path}.traitId` });
      }
      validateTimedConditions(territory.conditions, `${path}.conditions`, issues);
    }
  }
  if (Array.isArray(value.actionHistory)) {
    for (const [index, use] of value.actionHistory.entries()) {
      const path = `$.systems.time.actionHistory[${index}]`;
      if (!isRecord(use)) {
        issues.push({ message: 'must be an object', path });
        continue;
      }
      if (!ACTION_IDS.includes(use.actionId as (typeof ACTION_IDS)[number])) {
        issues.push({ message: 'must be a canonical action id', path: `${path}.actionId` });
      }
      if (!PHASE_IDS.includes(use.phase as (typeof PHASE_IDS)[number])) {
        issues.push({ message: 'must be a canonical phase', path: `${path}.phase` });
      }
      if (use.targetId !== null && !isNonEmptyString(use.targetId)) {
        issues.push({ message: 'must be null or a non-empty string', path: `${path}.targetId` });
      }
      if (!isCanonicalHour(use.timeHours)) {
        issues.push({
          message: 'must be a canonical non-negative hour',
          path: `${path}.timeHours`,
        });
      }
    }
  }
  if (Array.isArray(value.orders)) {
    const activeSlots = new Set<number>();
    const sequenceIds = new Set<number>();
    for (const [index, order] of value.orders.entries()) {
      if (!isRecord(order)) {
        issues.push({ message: 'must be an object', path: `$.systems.time.orders[${index}]` });
        continue;
      }
      const path = `$.systems.time.orders[${index}]`;
      if (!ORDER_STATUSES.includes(order.status as (typeof ORDER_STATUSES)[number])) {
        issues.push({ message: 'must be a supported lifecycle status', path: `${path}.status` });
      }
      if (!ACTION_IDS.includes(order.actionId as (typeof ACTION_IDS)[number])) {
        issues.push({ message: 'must be a canonical action id', path: `${path}.actionId` });
      }
      if (!isRecord(order.payload) || order.payload.actionId !== order.actionId) {
        issues.push({
          message: 'must be an object matching the Order action',
          path: `${path}.payload`,
        });
      }
      if (!validateUniqueStrings(order.cancellationLoss, `${path}.cancellationLoss`, issues)) {
        // The helper records the precise issue.
      }
      if (!isNonEmptyString(order.fallback)) {
        issues.push({ message: 'must be a non-empty string', path: `${path}.fallback` });
      }
      if (
        !isCanonicalHour(order.startedAtHours) ||
        !isCanonicalHour(order.completedAtHours) ||
        order.completedAtHours < order.startedAtHours
      ) {
        issues.push({ message: 'must have monotonic timestamps', path });
      }
      if (
        !Number.isSafeInteger(order.scheduledSequenceId) ||
        (order.scheduledSequenceId as number) < 1
      ) {
        issues.push({
          message: 'must be a positive sequence id',
          path: `${path}.scheduledSequenceId`,
        });
      } else if (sequenceIds.has(order.scheduledSequenceId as number)) {
        issues.push({ message: 'must be unique', path: `${path}.scheduledSequenceId` });
      } else {
        sequenceIds.add(order.scheduledSequenceId as number);
      }
      if (order.slot !== 0 && order.slot !== 1) {
        issues.push({ message: 'must be slot 0 or 1', path: `${path}.slot` });
      }
      if (order.status === 'active') {
        if (activeSlots.has(order.slot as number)) {
          issues.push({
            message: 'active slot must be unique',
            path: `$.systems.time.orders[${index}].slot`,
          });
        } else activeSlots.add(order.slot as number);
        if (order.endedAtHours !== null) {
          issues.push({
            message: 'active Order cannot have an end time',
            path: `${path}.endedAtHours`,
          });
        }
      } else if (
        !isCanonicalHour(order.endedAtHours) ||
        (isCanonicalHour(order.startedAtHours) && order.endedAtHours < order.startedAtHours)
      ) {
        issues.push({
          message: 'historical Order requires a monotonic canonical end time',
          path: `${path}.endedAtHours`,
        });
      }
    }
  }
  if (Array.isArray(value.reactions)) {
    const ids = new Set<string>();
    const sequenceIds = new Set<number>();
    for (const [index, reaction] of value.reactions.entries()) {
      const path = `$.systems.time.reactions[${index}]`;
      if (!isRecord(reaction)) {
        issues.push({ message: 'must be an object', path });
        continue;
      }
      if (!isNonEmptyString(reaction.id) || ids.has(reaction.id)) {
        issues.push({ message: 'must be a unique non-empty string', path: `${path}.id` });
      } else ids.add(reaction.id);
      if (!isNonEmptyString(reaction.kind)) {
        issues.push({ message: 'must be a non-empty string', path: `${path}.kind` });
      }
      validateUniqueStrings(reaction.choiceIds, `${path}.choiceIds`, issues);
      if (!Number.isSafeInteger(reaction.priority)) {
        issues.push({ message: 'must be an integer', path: `${path}.priority` });
      }
      if (
        !Number.isSafeInteger(reaction.scheduledSequenceId) ||
        (reaction.scheduledSequenceId as number) < 1 ||
        sequenceIds.has(reaction.scheduledSequenceId as number)
      ) {
        issues.push({
          message: 'must be a unique positive sequence id',
          path: `${path}.scheduledSequenceId`,
        });
      } else sequenceIds.add(reaction.scheduledSequenceId as number);
      if (![0, 1, 2].includes(reaction.resumeSpeed as number)) {
        issues.push({ message: 'must be a supported speed', path: `${path}.resumeSpeed` });
      }
      if (!REACTION_STATUSES.includes(reaction.status as (typeof REACTION_STATUSES)[number])) {
        issues.push({ message: 'must be a supported lifecycle status', path: `${path}.status` });
      }
      if (reaction.deadlineHours !== null && !isCanonicalHour(reaction.deadlineHours)) {
        issues.push({
          message: 'must be null or a canonical non-negative hour',
          path: `${path}.deadlineHours`,
        });
      }
      if (reaction.status === 'opened' || reaction.status === 'resolved') {
        if (!isCanonicalHour(reaction.openedAtHours)) {
          issues.push({
            message: 'opened or resolved reaction requires an open time',
            path: `${path}.openedAtHours`,
          });
        }
      } else if (reaction.openedAtHours !== null) {
        issues.push({
          message: 'must be null unless the reaction opened',
          path: `${path}.openedAtHours`,
        });
      }
      if (reaction.status === 'resolved') {
        if (
          !isRecord(reaction.outcome) ||
          !isNonEmptyString(reaction.outcome.choiceId) ||
          (Array.isArray(reaction.choiceIds) &&
            !reaction.choiceIds.includes(reaction.outcome.choiceId))
        ) {
          issues.push({
            message: 'resolved reaction requires a valid selected outcome',
            path: `${path}.outcome`,
          });
        }
      } else if (reaction.outcome !== null) {
        issues.push({
          message: 'must be null unless the reaction is resolved',
          path: `${path}.outcome`,
        });
      }
    }
  }
  if (Array.isArray(value.resourceLedger)) {
    for (const [index, entry] of value.resourceLedger.entries()) {
      const path = `$.systems.time.resourceLedger[${index}]`;
      if (!isRecord(entry)) {
        issues.push({ message: 'must be an object', path });
        continue;
      }
      if (!Number.isSafeInteger(entry.amount))
        issues.push({ message: 'must be an integer', path: `${path}.amount` });
      if (!isCanonicalHour(entry.atHours))
        issues.push({ message: 'must be a canonical non-negative hour', path: `${path}.atHours` });
      if (entry.chronicleKey !== null && !isNonEmptyString(entry.chronicleKey))
        issues.push({
          message: 'must be null or a non-empty string',
          path: `${path}.chronicleKey`,
        });
      if (
        !Number.isSafeInteger(entry.fractionMillionths) ||
        (entry.fractionMillionths as number) < 0
      )
        issues.push({
          message: 'must be a non-negative integer',
          path: `${path}.fractionMillionths`,
        });
      if (!LORD_IDS.includes(entry.lordId as (typeof LORD_IDS)[number]))
        issues.push({ message: 'must be a canonical lord id', path: `${path}.lordId` });
      if (!isNonEmptyString(entry.reasonId))
        issues.push({ message: 'must be a non-empty string', path: `${path}.reasonId` });
      if (!RESOURCE_KINDS.includes(entry.resource as (typeof RESOURCE_KINDS)[number]))
        issues.push({ message: 'must be a supported resource kind', path: `${path}.resource` });
      if (
        entry.territoryId !== null &&
        !TERRITORY_IDS.includes(entry.territoryId as (typeof TERRITORY_IDS)[number])
      )
        issues.push({
          message: 'must be null or a canonical territory id',
          path: `${path}.territoryId`,
        });
    }
  }
  return issues;
}

interface BackboneEvent {
  readonly dueTimeHours: number;
  readonly kind: string;
  readonly payload: Record<string, unknown>;
  readonly priority: number;
  readonly traceValue?: string;
}

function validateWp020Backbone(
  state: FoundationGameState,
  content: GameContent,
  time: Record<string, unknown>,
  issues: ValidationFailure[],
): void {
  if (!isRecord(time.king)) return;
  const hoursPerDay = content.constants.clock.hoursPerDay;
  const events: BackboneEvent[] = [];
  for (let day = 1; day <= content.constants.clock.crisisDays; day += 1) {
    events.push({
      dueTimeHours: day * hoursPerDay,
      kind: TIME_EVENT_KINDS.dawnEconomy,
      payload: { elapsedDay: day },
      priority: DAWN_PRIORITY.EXPIRY_DECAY_INCOME_AND_RECOVERY,
    });
  }
  for (const event of PHASE_EVENTS) {
    events.push({
      dueTimeHours: event.day * hoursPerDay,
      kind: TIME_EVENT_KINDS.phase,
      payload: { elapsedDay: event.day, phase: event.phase },
      priority: DAWN_PRIORITY.HEALTH_PHASE_TRANSITION,
      traceValue: event.phase,
    });
  }
  const prognosisEvents = [
    { day: 42, prognosis: 'perhaps-a-fortnight' },
    { day: 49, prognosis: 'unlikely-to-survive-week' },
    { day: 53, prognosis: 'days' },
    { day: 55, prognosis: 'any-hour' },
  ] as const;
  for (const event of prognosisEvents) {
    events.push({
      dueTimeHours: event.day * hoursPerDay,
      kind: TIME_EVENT_KINDS.prognosis,
      payload: { elapsedDay: event.day },
      priority: DAWN_PRIORITY.HEALTH_PHASE_TRANSITION + 50,
      traceValue: event.prognosis,
    });
  }

  const openedReaction = Array.isArray(time.reactions)
    ? time.reactions.find((reaction) => isRecord(reaction) && reaction.status === 'opened')
    : undefined;
  const timeReactionPriority = isRecord(openedReaction) ? openedReaction.priority : null;
  const hasNonTimeDecision = state.pendingDecisions.some(
    (decision) => decision.kind !== 'time.reaction-choice',
  );
  const consumed = new Set<BackboneEvent>();
  const backboneKinds = new Set<string>([
    TIME_EVENT_KINDS.dawnEconomy,
    TIME_EVENT_KINDS.phase,
    TIME_EVENT_KINDS.prognosis,
  ]);

  for (const expected of events) {
    const candidates = state.scheduledEvents.filter(
      (event) =>
        event.kind === expected.kind &&
        isRecord(event.payload) &&
        event.payload.elapsedDay === expected.payload.elapsedDay,
    );
    const path = `$.scheduledEvents[${expected.kind}:${String(expected.payload.elapsedDay)}]`;
    const atCurrentTime = expected.dueTimeHours === state.timeHours;
    const requiredAtCurrentTime =
      atCurrentTime &&
      typeof timeReactionPriority === 'number' &&
      expected.priority > timeReactionPriority;
    const required = expected.dueTimeHours > state.timeHours || requiredAtCurrentTime;
    const definitelyConsumed =
      expected.dueTimeHours < state.timeHours ||
      (atCurrentTime && !hasNonTimeDecision && !requiredAtCurrentTime);

    if (required && candidates.length !== 1) {
      issues.push({ message: 'canonical future backbone item is required exactly once', path });
    } else if (definitelyConsumed && candidates.length !== 0) {
      issues.push({ message: 'resolved backbone item cannot remain scheduled', path });
    }
    for (const candidate of candidates) {
      if (
        candidate.dueTimeHours !== expected.dueTimeHours ||
        candidate.priority !== expected.priority ||
        stableJson(candidate.payload) !== stableJson(expected.payload) ||
        stableJson(candidate.storedDraws) !== '{}'
      ) {
        issues.push({ message: 'must match the canonical backbone item exactly', path });
      }
    }
    if (expected.dueTimeHours < state.timeHours || (atCurrentTime && candidates.length === 0)) {
      consumed.add(expected);
    }
  }

  for (const [index, event] of state.scheduledEvents.entries()) {
    if (
      backboneKinds.has(event.kind) &&
      !events.some(
        (expected) =>
          expected.kind === event.kind &&
          expected.dueTimeHours === event.dueTimeHours &&
          expected.priority === event.priority &&
          stableJson(expected.payload) === stableJson(event.payload) &&
          stableJson(event.storedDraws) === '{}',
      )
    ) {
      issues.push({
        message: 'unexpected or malformed WP-020 backbone item',
        path: `$.scheduledEvents[${index}]`,
      });
    }
  }

  const expectedPhaseTrace = [
    { elapsedDay: 0, phase: 'stable', timeHours: 0 },
    ...events
      .filter((event) => event.kind === TIME_EVENT_KINDS.phase && consumed.has(event))
      .sort((left, right) => left.dueTimeHours - right.dueTimeHours)
      .map((event) => ({
        elapsedDay: event.dueTimeHours / hoursPerDay,
        phase: event.traceValue,
        timeHours: event.dueTimeHours,
      })),
  ];
  const expectedPrognosisTrace = [
    { elapsedDay: 0, prognosis: 'roughly-eight-weeks', timeHours: 0 },
    ...events
      .filter((event) => event.kind === TIME_EVENT_KINDS.prognosis && consumed.has(event))
      .sort((left, right) => left.dueTimeHours - right.dueTimeHours)
      .map((event) => ({
        elapsedDay: event.dueTimeHours / hoursPerDay,
        prognosis: event.traceValue,
        timeHours: event.dueTimeHours,
      })),
  ];
  if (
    stableJson(time.king.phaseTrace) !== stableJson(expectedPhaseTrace) ||
    time.king.phase !== expectedPhaseTrace.at(-1)?.phase
  ) {
    issues.push({
      message: 'must match resolved canonical health-phase events',
      path: '$.systems.time.king.phaseTrace',
    });
  }
  if (
    stableJson(time.king.prognosisTrace) !== stableJson(expectedPrognosisTrace) ||
    time.king.prognosis !== expectedPrognosisTrace.at(-1)?.prognosis
  ) {
    issues.push({
      message: 'must match resolved canonical prognosis events',
      path: '$.systems.time.king.prognosisTrace',
    });
  }
}

function validateWp020Timestamps(
  time: Record<string, unknown>,
  currentTimeHours: number,
  issues: ValidationFailure[],
): void {
  const rejectFuture = (value: unknown, path: string): void => {
    if (typeof value === 'number' && value > currentTimeHours) {
      issues.push({ message: 'cannot be later than current simulation time', path });
    }
  };
  if (isRecord(time.lords)) {
    for (const lordId of LORD_IDS) {
      const lord = time.lords[lordId];
      if (!isRecord(lord) || !Array.isArray(lord.conditions)) continue;
      for (const [index, condition] of lord.conditions.entries()) {
        if (isRecord(condition)) {
          rejectFuture(
            condition.startedAtHours,
            `$.systems.time.lords.${lordId}.conditions[${index}].startedAtHours`,
          );
        }
      }
    }
  }
  if (isRecord(time.territories)) {
    for (const territoryId of TERRITORY_IDS) {
      const territory = time.territories[territoryId];
      if (!isRecord(territory) || !Array.isArray(territory.conditions)) continue;
      for (const [index, condition] of territory.conditions.entries()) {
        if (isRecord(condition)) {
          rejectFuture(
            condition.startedAtHours,
            `$.systems.time.territories.${territoryId}.conditions[${index}].startedAtHours`,
          );
        }
      }
    }
  }
  if (Array.isArray(time.actionHistory)) {
    for (const [index, use] of time.actionHistory.entries()) {
      if (isRecord(use)) {
        rejectFuture(use.timeHours, `$.systems.time.actionHistory[${index}].timeHours`);
      }
    }
  }
  if (Array.isArray(time.resourceLedger)) {
    for (const [index, entry] of time.resourceLedger.entries()) {
      if (isRecord(entry)) {
        rejectFuture(entry.atHours, `$.systems.time.resourceLedger[${index}].atHours`);
      }
    }
  }
  if (Array.isArray(time.orders)) {
    for (const [index, order] of time.orders.entries()) {
      if (!isRecord(order)) continue;
      rejectFuture(order.startedAtHours, `$.systems.time.orders[${index}].startedAtHours`);
      if (order.endedAtHours !== null) {
        rejectFuture(order.endedAtHours, `$.systems.time.orders[${index}].endedAtHours`);
      }
      if (
        order.status === 'active' &&
        typeof order.completedAtHours === 'number' &&
        order.completedAtHours < currentTimeHours
      ) {
        issues.push({
          message: 'active Order completion cannot be historical',
          path: `$.systems.time.orders[${index}].completedAtHours`,
        });
      }
    }
  }
  if (Array.isArray(time.reactions)) {
    for (const [index, reaction] of time.reactions.entries()) {
      if (isRecord(reaction) && reaction.openedAtHours !== null) {
        rejectFuture(reaction.openedAtHours, `$.systems.time.reactions[${index}].openedAtHours`);
      }
    }
  }
}

export function importWp020GameState(
  serialized: string,
  options: { readonly buildVersion?: string; readonly content: GameContent },
): ImportResult<Wp020GameState> {
  const imported = importFoundationGameState(serialized, options);
  if (!imported.ok) return imported;
  const time = imported.state.systems.time;
  const issues = validateWp020System(time);
  if (issues.length === 0 && isRecord(time)) {
    validateWp020Backbone(imported.state, options.content, time, issues);
    validateWp020Timestamps(time, imported.state.timeHours, issues);
  }
  if (issues.length === 0 && isRecord(time) && Array.isArray(time.orders)) {
    for (const [index, order] of time.orders.entries()) {
      if (!isRecord(order)) continue;
      const event = imported.state.scheduledEvents.find(
        (candidate) => candidate.sequenceId === order.scheduledSequenceId,
      );
      if (order.status === 'active') {
        if (
          event === undefined ||
          event.dueTimeHours !== order.completedAtHours ||
          event.kind !== `time.action.${String(order.actionId)}` ||
          stableJson(event.payload) !== stableJson(order.payload) ||
          event.priority !== DAWN_PRIORITY.PLAYER_ORDERS_AND_AI_INTENTS
        ) {
          issues.push({
            message: 'active Order must retain its exact scheduled completion',
            path: `$.systems.time.orders[${index}].scheduledSequenceId`,
          });
        }
      } else if (event !== undefined) {
        issues.push({
          message: 'historical Order cannot retain a scheduled completion',
          path: `$.systems.time.orders[${index}].scheduledSequenceId`,
        });
      }
    }
  }
  if (issues.length === 0 && isRecord(time) && Array.isArray(time.reactions)) {
    for (const [index, reaction] of time.reactions.entries()) {
      if (!isRecord(reaction)) continue;
      const path = `$.systems.time.reactions[${index}]`;
      const event = imported.state.scheduledEvents.find(
        (candidate) => candidate.sequenceId === reaction.scheduledSequenceId,
      );
      const decision = imported.state.pendingDecisions.find(
        (candidate) => candidate.id === reaction.id && candidate.kind === 'time.reaction-choice',
      );
      if (reaction.status === 'queued') {
        if (
          event === undefined ||
          event.kind !== TIME_EVENT_KINDS.reaction ||
          event.priority !== reaction.priority ||
          !isRecord(event.payload) ||
          event.payload.reactionId !== reaction.id
        ) {
          issues.push({
            message: 'queued reaction must retain its exact scheduled opening',
            path: `${path}.scheduledSequenceId`,
          });
        }
        if (decision !== undefined) {
          issues.push({
            message: 'queued reaction cannot already be pending',
            path: `${path}.status`,
          });
        }
      } else {
        if (event !== undefined) {
          issues.push({
            message: 'non-queued reaction cannot retain an opening event',
            path: `${path}.scheduledSequenceId`,
          });
        }
        if (reaction.status === 'opened') {
          if (
            decision === undefined ||
            decision.openedBySequenceId !== reaction.scheduledSequenceId ||
            stableJson(decision.choiceIds) !== stableJson(reaction.choiceIds) ||
            imported.state.speed !== 0
          ) {
            issues.push({
              message: 'opened reaction must match the mandatory paused decision',
              path: `${path}.status`,
            });
          }
        } else if (decision !== undefined) {
          issues.push({ message: 'closed reaction cannot remain pending', path: `${path}.status` });
        }
      }
    }
    for (const [index, decision] of imported.state.pendingDecisions.entries()) {
      if (
        decision.kind === 'time.reaction-choice' &&
        !time.reactions.some(
          (reaction) =>
            isRecord(reaction) && reaction.id === decision.id && reaction.status === 'opened',
        )
      ) {
        issues.push({
          message: 'reaction decision must have an opened reaction record',
          path: `$.pendingDecisions[${index}]`,
        });
      }
    }
  }
  if (issues.length === 0 && isRecord(time) && isRecord(time.territories)) {
    for (const definition of options.content.territories) {
      const territory = time.territories[definition.id];
      if (
        isRecord(territory) &&
        (territory.legalLordId !== definition.legalLordId ||
          territory.levyCapacity !== definition.levyCapacity ||
          territory.fortification !== definition.fortification ||
          territory.traitId !== definition.traitId)
      ) {
        issues.push({
          message: 'authored territory identity must match validated content',
          path: `$.systems.time.territories.${definition.id}`,
        });
      }
    }
  }
  if (issues.length === 0 && isRecord(time) && isRecord(time.king)) {
    const deathEvents = imported.state.scheduledEvents.filter(
      (event) => event.kind === TIME_EVENT_KINDS.death,
    );
    const deathDay = time.king.deathDawnElapsedDay;
    const expectedDeathTime = (deathDay as number) * options.content.constants.clock.hoursPerDay;
    if (time.king.alive === true) {
      const event = deathEvents[0];
      if (
        deathEvents.length !== 1 ||
        event === undefined ||
        event.dueTimeHours !== expectedDeathTime ||
        event.priority !== DAWN_PRIORITY.KINGS_DEATH_CHECK ||
        !isRecord(event.payload) ||
        event.payload.elapsedDay !== deathDay ||
        event.storedDraws.deathDawnElapsedDay !== deathDay
      ) {
        issues.push({
          message: 'living King must retain the exact stored death-dawn event',
          path: '$.systems.time.king.deathDawnElapsedDay',
        });
      }
    } else {
      if (deathEvents.length !== 0 || time.king.diedAtHours !== expectedDeathTime) {
        issues.push({
          message: 'dead King must match the consumed stored death dawn',
          path: '$.systems.time.king.diedAtHours',
        });
      }
      if (imported.state.status !== 'succession') {
        issues.push({ message: 'dead King requires succession status', path: '$.status' });
      }
    }
  }
  return issues.length === 0
    ? { ok: true, state: imported.state as unknown as Wp020GameState }
    : {
        error: {
          code: 'INVALID_STATE',
          issues,
          message: 'Save state failed WP-020 domain validation',
        },
        ok: false,
      };
}
