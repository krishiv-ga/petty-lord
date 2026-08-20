import type { ActionId, PhaseId } from '../../../../contracts/ids';
import type { ActionUseRecord, Wp020GameState } from '../../time/types';
import { getWp020, setWp020 } from '../../time/types';

export interface UsageQuery {
  readonly actionId: ActionId;
  readonly nowHours: number;
  readonly targetId?: string | null;
  readonly windowDays?: number;
}

export function matchingUses(state: Wp020GameState, query: UsageQuery): readonly ActionUseRecord[] {
  const minimum =
    query.windowDays === undefined
      ? Number.NEGATIVE_INFINITY
      : query.nowHours - query.windowDays * 24;
  return getWp020(state).actionHistory.filter(
    (use) =>
      use.actionId === query.actionId &&
      (query.windowDays === undefined || use.timeHours > minimum) &&
      (query.targetId === undefined || use.targetId === query.targetId),
  );
}

export function targetCooldownAvailable(state: Wp020GameState, query: UsageQuery): boolean {
  return matchingUses(state, query).length === 0;
}

export function phaseLimitAvailable(
  state: Wp020GameState,
  actionId: ActionId,
  targetId: string | null,
  phase: PhaseId,
): boolean {
  return !getWp020(state).actionHistory.some(
    (use) => use.actionId === actionId && use.targetId === targetId && use.phase === phase,
  );
}

export function oncePerRunAvailable(state: Wp020GameState, actionId: ActionId): boolean {
  return !getWp020(state).actionHistory.some((use) => use.actionId === actionId);
}

export function diminishingMultiplier(
  state: Wp020GameState,
  query: UsageQuery,
  multipliers: readonly number[],
): number {
  const count = matchingUses(state, query).length;
  return multipliers[Math.min(count, multipliers.length - 1)] ?? 0;
}

export function recordActionUse(
  state: Wp020GameState,
  actionId: ActionId,
  targetId: string | null,
): Wp020GameState {
  const system = getWp020(state);
  return setWp020(state, {
    ...system,
    actionHistory: [
      ...system.actionHistory,
      { actionId, phase: system.king.phase, targetId, timeHours: state.timeHours },
    ],
  });
}

export function conditionEscalation(
  activeConditionIds: readonly string[],
  sequence: readonly string[],
): string | null {
  for (let index = sequence.length - 1; index >= 0; index -= 1) {
    if (activeConditionIds.includes(sequence[index] as string)) {
      return sequence[index + 1] ?? null;
    }
  }
  return sequence[0] ?? null;
}

export function expiredConditionIds(
  conditions: readonly { readonly expiresAtHours: number | null; readonly id: string }[],
  nowHours: number,
): readonly string[] {
  return conditions
    .filter(
      (condition) => condition.expiresAtHours !== null && condition.expiresAtHours <= nowHours,
    )
    .map((condition) => condition.id);
}
