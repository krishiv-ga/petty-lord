import type { GameContent } from '../../../contracts/content';
import type { DomainMessageKind, FoundationScheduledResolver } from '../../../contracts/domains';
import type { FoundationDomainExtensions } from '../../../contracts/state';
import { expiredConditionIds } from '../actions/core/antiSpam';
import { applyDailyEconomy } from '../economy/economy';
import { phaseForElapsedDay, prognosisForElapsedDay } from '../king/health';
import { timeEffect } from './effects';
import type { Wp020GameState } from './types';
import { getWp020, setWp020 } from './types';

function elapsedDay(payload: unknown): number {
  if (
    payload === null ||
    typeof payload !== 'object' ||
    !('elapsedDay' in payload) ||
    !Number.isSafeInteger(payload.elapsedDay)
  ) {
    throw new TypeError('time event requires an integer elapsedDay');
  }
  return payload.elapsedDay as number;
}

export function createTimeResolvers(
  content: GameContent,
): Record<
  DomainMessageKind<'time'>,
  FoundationScheduledResolver<'time', FoundationDomainExtensions>
> {
  const dawnEconomy: FoundationScheduledResolver<'time', FoundationDomainExtensions> = ({
    state,
  }) => {
    const wpState = state as unknown as Wp020GameState;
    const day = Math.floor(state.timeHours / 24);
    const system = getWp020(wpState);
    const expired = [
      ...Object.entries(system.lords).flatMap(([scopeId, lord]) =>
        expiredConditionIds(lord.conditions, state.timeHours).map((conditionId) => ({
          conditionId,
          scopeId,
        })),
      ),
      ...Object.entries(system.territories).flatMap(([scopeId, territory]) =>
        expiredConditionIds(territory.conditions, state.timeHours).map((conditionId) => ({
          conditionId,
          scopeId,
        })),
      ),
    ];
    const next = applyDailyEconomy(wpState, content);
    return {
      effects: [
        ...expired.map(({ conditionId, scopeId }) =>
          timeEffect('time.condition-expired', { conditionId, scopeId }),
        ),
        timeEffect('time.dawn-completed', {
          elapsedDay: day,
          stage: 'economy-recovery',
        }),
      ],
      state: next,
    };
  };

  const phase: FoundationScheduledResolver<'time', FoundationDomainExtensions> = ({
    item,
    state,
  }) => {
    const wpState = state as unknown as Wp020GameState;
    const day = elapsedDay(item.payload);
    const nextPhase = phaseForElapsedDay(day);
    const system = getWp020(wpState);
    if (system.king.phase === nextPhase) return { effects: [], state };
    const next = setWp020(wpState, {
      ...system,
      king: {
        ...system.king,
        phase: nextPhase,
        phaseTrace: [
          ...system.king.phaseTrace,
          { elapsedDay: day, phase: nextPhase, timeHours: state.timeHours },
        ],
      },
    });
    return {
      chronicle: [
        {
          data: { elapsedDay: day, phase: nextPhase },
          id: `health-phase-${nextPhase}-${day}`,
          kind: 'time.health-phase',
          message: `The King's health enters ${nextPhase}.`,
        },
      ],
      effects: [timeEffect('time.health-phase-changed', { elapsedDay: day, phase: nextPhase })],
      state: next,
    };
  };

  const prognosis: FoundationScheduledResolver<'time', FoundationDomainExtensions> = ({
    item,
    state,
  }) => {
    const wpState = state as unknown as Wp020GameState;
    const day = elapsedDay(item.payload);
    const system = getWp020(wpState);
    if (!system.king.alive) return { effects: [], state };
    const report = prognosisForElapsedDay(day);
    const next = setWp020(wpState, {
      ...system,
      king: {
        ...system.king,
        prognosis: report,
        prognosisTrace: [
          ...system.king.prognosisTrace,
          { elapsedDay: day, prognosis: report, timeHours: state.timeHours },
        ],
      },
    });
    return {
      chronicle: [
        {
          data: { elapsedDay: day, prognosis: report },
          id: `prognosis-${day}`,
          kind: 'time.prognosis',
          message: `The royal physician reports: ${report}.`,
        },
      ],
      effects: [timeEffect('time.prognosis-reported', { elapsedDay: day, prognosis: report })],
      state: next,
    };
  };

  const death: FoundationScheduledResolver<'time', FoundationDomainExtensions> = ({
    item,
    state,
  }) => {
    const wpState = state as unknown as Wp020GameState;
    const day = elapsedDay(item.payload);
    const system = getWp020(wpState);
    if (!system.king.alive) throw new Error('King death cannot resolve twice');
    if (day !== system.king.deathDawnElapsedDay) throw new Error('Stored death dawn mismatch');
    const next = setWp020(
      { ...wpState, status: 'succession' },
      {
        ...system,
        king: { ...system.king, alive: false, diedAtHours: state.timeHours },
      },
    );
    return {
      chronicle: [
        {
          data: { elapsedDay: day },
          id: `king-death-${day}`,
          kind: 'time.king-death',
          message: 'The King is dead. The succession is now resolved.',
        },
      ],
      effects: [timeEffect('time.king-died', { elapsedDay: day })],
      state: next,
    };
  };

  return {
    'time.dawn-economy': dawnEconomy,
    'time.health-phase': phase,
    'time.king-death': death,
    'time.prognosis': prognosis,
  };
}
