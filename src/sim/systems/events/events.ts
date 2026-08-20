import type { EventId, PhaseId } from '../../../contracts/ids';
import { RandomSession } from '../../random/random';
import type {
  AuthoredEffect,
  AuthoredEventChoice,
  AuthoredEventDefinition,
  AuthoredFollowUpDecision,
  EventContentView,
} from '../knowledge/authored';

type EventDefinition = AuthoredEventDefinition;
type EventChoice = AuthoredEventChoice;
type EventEffect = AuthoredEffect;

export interface EventEngineState {
  readonly ambientChoicesResolved: number;
  readonly cooldownUntilHours: Readonly<Record<string, number>>;
  readonly lastInterruptionAtHours: number | null;
  readonly pendingEventId: EventId | null;
  readonly pendingFollowUpId: string | null;
  readonly resolvedEventAtHours: Readonly<Record<string, number>>;
  readonly resolvedEventIds: readonly EventId[];
  readonly resolvedFollowUpIds: readonly string[];
  readonly storedChoiceDraws: Readonly<Record<string, number>>;
  readonly storedWindowSelections: Readonly<Record<string, EventId>>;
}

export const EMPTY_EVENT_ENGINE_STATE: EventEngineState = Object.freeze({
  ambientChoicesResolved: 0,
  cooldownUntilHours: {},
  lastInterruptionAtHours: null,
  pendingEventId: null,
  pendingFollowUpId: null,
  resolvedEventAtHours: {},
  resolvedEventIds: [],
  resolvedFollowUpIds: [],
  storedChoiceDraws: {},
  storedWindowSelections: {},
});

export interface EventSelectionResult {
  readonly event: EventDefinition | null;
  readonly randomStateAfter: string;
  readonly state: EventEngineState;
  readonly suppressedReason: string | null;
  readonly wasStored: boolean;
}

function requirementsPass(
  requirements: readonly string[],
  satisfied: ReadonlySet<string>,
): boolean {
  return requirements.every((requirement) => satisfied.has(requirement));
}

function inWindow(event: EventDefinition, elapsedDay: number): boolean {
  return (
    event.elapsedDayWindow === null ||
    (elapsedDay >= event.elapsedDayWindow[0] && elapsedDay <= event.elapsedDayWindow[1])
  );
}

function weightedEvent(random: RandomSession, events: readonly EventDefinition[]): EventDefinition {
  const total = events.reduce((sum, event) => sum + event.weight, 0);
  const draw = random.integer('events.weighted-selection', 1, total);
  let cursor = 0;
  for (const event of events) {
    cursor += event.weight;
    if (draw <= cursor) return event;
  }
  throw new Error('Weighted event selection failed');
}

export function selectAmbientEventAtDawn(input: {
  readonly atHours: number;
  readonly content: EventContentView;
  readonly deathCheckPassedAlive: boolean;
  readonly elapsedDay: number;
  readonly majorDecisionOrBattleThisDawn: boolean;
  readonly phase: PhaseId;
  readonly randomState: string;
  readonly satisfiedRequirementIds: ReadonlySet<string>;
  readonly state: EventEngineState;
}): EventSelectionResult {
  const suppressed = (reason: string): EventSelectionResult => ({
    event: null,
    randomStateAfter: input.randomState,
    state: input.state,
    suppressedReason: reason,
    wasStored: false,
  });
  if (!input.deathCheckPassedAlive) return suppressed('king-died-this-dawn');
  if (input.majorDecisionOrBattleThisDawn) return suppressed('major-resolution-this-dawn');
  if (input.state.pendingEventId !== null || input.state.pendingFollowUpId !== null) {
    return suppressed('event-decision-pending');
  }
  if (input.state.ambientChoicesResolved >= 6) return suppressed('ambient-cap-reached');
  if (
    input.state.lastInterruptionAtHours !== null &&
    input.atHours - input.state.lastInterruptionAtHours < 24
  ) {
    return suppressed('one-choice-per-24h');
  }
  const ambientSlot = (
    [
      [6, 10],
      [14, 18],
      [22, 26],
      [30, 34],
      [38, 42],
      [45, 49],
    ] as const
  ).find(([start, end]) => input.elapsedDay >= start && input.elapsedDay <= end);
  if (ambientSlot === undefined) return suppressed('outside-ambient-slot');
  const windowKey = `ambient-${String(ambientSlot[0]).padStart(2, '0')}-${ambientSlot[1]}`;
  const storedId = input.state.storedWindowSelections[windowKey];
  if (storedId !== undefined) {
    if (input.state.resolvedEventIds.includes(storedId)) {
      return suppressed('event-slot-already-resolved');
    }
    const stored = input.content.events.find((event) => event.id === storedId) ?? null;
    return {
      event: stored,
      randomStateAfter: input.randomState,
      state: stored === null ? input.state : { ...input.state, pendingEventId: stored.id },
      suppressedReason: stored === null ? 'stored-event-missing' : null,
      wasStored: true,
    };
  }
  const eligible = input.content.events
    .filter(
      (event) =>
        event.kind === 'ambient' &&
        event.phaseIds.includes(input.phase) &&
        inWindow(event, input.elapsedDay) &&
        !input.state.resolvedEventIds.includes(event.id) &&
        (input.state.cooldownUntilHours[event.id] ?? 0) <= input.atHours &&
        requirementsPass(event.requirementIds, input.satisfiedRequirementIds),
    )
    .sort((left, right) => left.displayOrder - right.displayOrder);
  if (eligible.length === 0) return suppressed('no-eligible-event');
  const random = new RandomSession(input.randomState);
  const event = weightedEvent(random, eligible);
  return {
    event,
    randomStateAfter: random.exportState(),
    state: {
      ...input.state,
      pendingEventId: event.id,
      storedWindowSelections: {
        ...input.state.storedWindowSelections,
        [windowKey]: event.id,
      },
    },
    suppressedReason: null,
    wasStored: false,
  };
}

export function queueMandatoryEvent(input: {
  readonly atHours: number;
  readonly content: EventContentView;
  readonly eventId: EventId;
  readonly phase: PhaseId;
  readonly state: EventEngineState;
}): { readonly event: EventDefinition; readonly state: EventEngineState } {
  const event = input.content.events.find((entry) => entry.id === input.eventId);
  if (event === undefined || event.kind !== 'mandatory' || !event.phaseIds.includes(input.phase)) {
    throw new Error(`Mandatory event ${input.eventId} is not legal in ${input.phase}`);
  }
  if (input.state.resolvedEventIds.includes(event.id)) {
    throw new Error(`Mandatory event ${input.eventId} has already resolved`);
  }
  if (input.state.pendingEventId !== null || input.state.pendingFollowUpId !== null) {
    throw new Error('Another event choice is already pending');
  }
  return {
    event,
    state: { ...input.state, lastInterruptionAtHours: input.atHours, pendingEventId: event.id },
  };
}

export interface EventDecisionProjection {
  readonly choiceIds: readonly string[];
  readonly dueAtHours: number;
  readonly eventId: EventId;
  readonly mandatory: boolean;
  readonly openedAtHours: number;
}

export function projectEventDecision(
  event: EventDefinition,
  openedAtHours: number,
): EventDecisionProjection {
  return {
    choiceIds: event.choices.map((choice) => choice.id),
    dueAtHours: openedAtHours,
    eventId: event.id,
    mandatory: event.kind === 'mandatory',
    openedAtHours,
  };
}

type FollowUpDecision = AuthoredFollowUpDecision;

function findFollowUp(content: EventContentView, decisionId: string): FollowUpDecision | null {
  return (
    content.events
      .flatMap((event) => event.followUpDecisions ?? [])
      .find((decision) => decision.id === decisionId) ?? null
  );
}

export function queueFollowUpDecision(input: {
  readonly atHours: number;
  readonly content: EventContentView;
  readonly decisionId: string;
  readonly state: EventEngineState;
}): { readonly decision: EventDecisionProjection; readonly state: EventEngineState } {
  const followUp = findFollowUp(input.content, input.decisionId);
  if (followUp === null) throw new Error(`Unknown event follow-up ${input.decisionId}`);
  const parent = input.content.events.find((event) =>
    event.followUpDecisions?.some((decision) => decision.id === followUp.id),
  );
  if (parent === undefined) throw new Error(`Follow-up ${followUp.id} has no parent event`);
  if (input.state.resolvedFollowUpIds.includes(followUp.id)) {
    throw new Error(`Event follow-up ${followUp.id} has already resolved`);
  }
  const parentResolvedAtHours = input.state.resolvedEventAtHours[parent.id];
  if (parentResolvedAtHours === undefined) {
    throw new Error(`Event follow-up ${followUp.id} has no resolved parent event`);
  }
  const dueAtHours = parentResolvedAtHours + followUp.delayDays * 24;
  if (input.atHours < dueAtHours) throw new Error(`Event follow-up ${followUp.id} is not due yet`);
  if (input.state.pendingEventId !== null || input.state.pendingFollowUpId !== null) {
    throw new Error('Another event choice is already pending');
  }
  return {
    decision: {
      choiceIds: followUp.choices.map((choice) => choice.id),
      dueAtHours,
      eventId: parent.id,
      mandatory: true,
      openedAtHours: input.atHours,
    },
    state: {
      ...input.state,
      lastInterruptionAtHours: input.atHours,
      pendingFollowUpId: followUp.id,
    },
  };
}

function choiceIsLegal(
  choice: EventChoice,
  input: {
    readonly gold: number;
    readonly influence: number;
    readonly satisfiedRequirementIds: ReadonlySet<string>;
  },
): boolean {
  return (
    choice.goldCost <= input.gold &&
    choice.influenceCost <= input.influence &&
    requirementsPass(choice.requirementIds, input.satisfiedRequirementIds)
  );
}

function drawChoiceOutcome(random: RandomSession, choice: EventChoice): number | null {
  const outcome = choice.randomOutcome;
  if (outcome === undefined) return null;
  if (outcome.distribution === 'uniform-integer') {
    return random.integer(
      `event.${choice.id}.outcome`,
      outcome.values[0] ?? 0,
      outcome.values[1] ?? 0,
    );
  }
  if (outcome.distribution === 'coin-flip') {
    return random.select(`event.${choice.id}.outcome`, outcome.values);
  }
  const weights = outcome.weights ?? [];
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const draw = random.integer(`event.${choice.id}.weighted`, 1, total);
  let cursor = 0;
  for (let index = 0; index < outcome.values.length; index += 1) {
    cursor += weights[index] ?? 0;
    if (draw <= cursor) return outcome.values[index] ?? null;
  }
  return null;
}

function resolveChoiceEffects(
  choice: EventChoice,
  outcomeValue: number | null,
): readonly EventEffect[] {
  if (choice.randomOutcome === undefined) return choice.effects;
  if (outcomeValue === null)
    throw new Error(`Random event choice ${choice.id} lacks a stored outcome`);
  if (choice.id === 'e06-send-levies') {
    return choice.effects.map((effect) =>
      effect.referenceId === 'stored-uniform-zero-to-twenty'
        ? { ...effect, value: -outcomeValue }
        : effect,
    );
  }
  if (choice.id === 'e09-ignore') {
    return choice.effects.map((effect) => ({ ...effect, value: outcomeValue }));
  }
  if (choice.id === 'e12-sponsor') {
    return choice.effects
      .filter((effect) => effect.referenceId !== 'only-on-high-result' || outcomeValue === 5)
      .map((effect) =>
        effect.referenceId === 'stored-fifty-percent-high-otherwise-two'
          ? { ...effect, value: outcomeValue }
          : effect,
      );
  }
  if (choice.id === 'e14-blame-renard') {
    const success = outcomeValue === 1;
    return choice.effects.filter((effect) =>
      success
        ? effect.referenceId === 'stored-fifty-percent-success'
        : effect.referenceId !== 'stored-fifty-percent-success',
    );
  }
  throw new Error(`Random event choice ${choice.id} lacks typed outcome resolution`);
}

export interface ResolveEventChoiceResult {
  readonly appliedChoiceId: string;
  readonly effects: readonly EventEffect[];
  readonly fallbackUsed: boolean;
  readonly outcomeValue: number | null;
  readonly randomStateAfter: string;
  readonly resources: { readonly gold: number; readonly influence: number };
  readonly state: EventEngineState;
  readonly wasStored: boolean;
}

export function resolveEventChoice(input: {
  readonly atHours: number;
  readonly choiceId: string;
  readonly content: EventContentView;
  readonly randomState: string;
  readonly resources: { readonly gold: number; readonly influence: number };
  readonly satisfiedRequirementIds: ReadonlySet<string>;
  readonly state: EventEngineState;
}): ResolveEventChoiceResult {
  const event = input.content.events.find((entry) => entry.id === input.state.pendingEventId);
  if (event === undefined) throw new Error('No valid event is pending');
  const requested = event.choices.find((choice) => choice.id === input.choiceId);
  const requestedLegal =
    requested !== undefined &&
    choiceIsLegal(requested, {
      ...input.resources,
      satisfiedRequirementIds: input.satisfiedRequirementIds,
    });
  const choice = requestedLegal
    ? requested
    : event.choices.find(
        (candidate) =>
          candidate.goldCost === 0 &&
          candidate.influenceCost === 0 &&
          choiceIsLegal(candidate, {
            ...input.resources,
            satisfiedRequirementIds: input.satisfiedRequirementIds,
          }),
      );
  if (choice === undefined) throw new Error(`Event ${event.id} has no legal safe fallback`);
  const drawKey = `${event.id}:${choice.id}`;
  const stored = input.state.storedChoiceDraws[drawKey];
  const random = new RandomSession(input.randomState);
  const outcomeValue = stored ?? drawChoiceOutcome(random, choice);
  const wasStored = stored !== undefined;
  const isAmbient = event.kind === 'ambient';
  return {
    appliedChoiceId: choice.id,
    effects: resolveChoiceEffects(choice, outcomeValue),
    fallbackUsed: !requestedLegal,
    outcomeValue,
    randomStateAfter: wasStored ? input.randomState : random.exportState(),
    resources: {
      gold: input.resources.gold - choice.goldCost,
      influence: input.resources.influence - choice.influenceCost,
    },
    state: {
      ...input.state,
      ambientChoicesResolved: input.state.ambientChoicesResolved + (isAmbient ? 1 : 0),
      cooldownUntilHours: {
        ...input.state.cooldownUntilHours,
        [event.id]: input.atHours + event.cooldownDays * 24,
      },
      lastInterruptionAtHours: input.atHours,
      pendingEventId: null,
      resolvedEventAtHours: {
        ...input.state.resolvedEventAtHours,
        [event.id]: input.atHours,
      },
      resolvedEventIds: [...new Set([...input.state.resolvedEventIds, event.id])],
      storedChoiceDraws:
        outcomeValue === null
          ? input.state.storedChoiceDraws
          : { ...input.state.storedChoiceDraws, [drawKey]: outcomeValue },
    },
    wasStored,
  };
}

export function resolveFollowUpChoice(input: {
  readonly atHours: number;
  readonly choiceId: string;
  readonly content: EventContentView;
  readonly randomState: string;
  readonly resources: { readonly gold: number; readonly influence: number };
  readonly satisfiedRequirementIds: ReadonlySet<string>;
  readonly state: EventEngineState;
}): Omit<ResolveEventChoiceResult, 'state'> & { readonly state: EventEngineState } {
  const followUp =
    input.state.pendingFollowUpId === null
      ? null
      : findFollowUp(input.content, input.state.pendingFollowUpId);
  if (followUp === null) throw new Error('No valid event follow-up is pending');
  const requested = followUp.choices.find((choice) => choice.id === input.choiceId);
  const requestedLegal =
    requested !== undefined &&
    choiceIsLegal(requested, {
      ...input.resources,
      satisfiedRequirementIds: input.satisfiedRequirementIds,
    });
  const choice = requestedLegal
    ? requested
    : followUp.choices.find(
        (candidate) =>
          candidate.goldCost === 0 &&
          candidate.influenceCost === 0 &&
          choiceIsLegal(candidate, {
            ...input.resources,
            satisfiedRequirementIds: input.satisfiedRequirementIds,
          }),
      );
  if (choice === undefined) throw new Error(`Follow-up ${followUp.id} has no legal safe fallback`);
  const drawKey = `${followUp.id}:${choice.id}`;
  const stored = input.state.storedChoiceDraws[drawKey];
  const random = new RandomSession(input.randomState);
  const outcomeValue = stored ?? drawChoiceOutcome(random, choice);
  return {
    appliedChoiceId: choice.id,
    effects: resolveChoiceEffects(choice, outcomeValue),
    fallbackUsed: !requestedLegal,
    outcomeValue,
    randomStateAfter: stored === undefined ? random.exportState() : input.randomState,
    resources: {
      gold: input.resources.gold - choice.goldCost,
      influence: input.resources.influence - choice.influenceCost,
    },
    state: {
      ...input.state,
      lastInterruptionAtHours: input.atHours,
      pendingFollowUpId: null,
      resolvedFollowUpIds: [...input.state.resolvedFollowUpIds, followUp.id],
      storedChoiceDraws:
        outcomeValue === null
          ? input.state.storedChoiceDraws
          : { ...input.state.storedChoiceDraws, [drawKey]: outcomeValue },
    },
    wasStored: stored !== undefined,
  };
}
