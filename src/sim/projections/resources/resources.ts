import type { GameContent } from '../../../contracts/content';
import type { ConditionId, TerritoryId } from '../../../contracts/ids';
import { previewCommonAction } from '../../systems/actions/common';
import {
  activeConditions,
  dailyLevyRecoveryMillionths,
  isTerritoryOccupied,
  legalDailyIncomeMillionths,
} from '../../systems/economy';
import { remainingDaysAt } from '../../systems/king';
import type { ActionPreview, OrderPayload, Wp020GameState } from '../../systems/time';
import { FRACTION_SCALE, getWp020 } from '../../systems/time';

export interface ActiveConditionProjection {
  readonly expiresAtHours: number | null;
  readonly id: ConditionId;
  readonly scopeId: string;
}

export interface OrderProjection {
  readonly actionId: string;
  readonly cancellationLoss: readonly string[];
  readonly completesAtHours: number;
  readonly fallback: string;
  readonly progress: number;
  readonly sequenceId: number;
  readonly slot: 0 | 1;
  readonly status: string;
}

export interface PlayerResourceProjection {
  readonly actionPreview?: ActionPreview;
  readonly claim: number;
  readonly conditions: readonly ActiveConditionProjection[];
  readonly dailyGoldIncome: number;
  readonly dailyGoldReasons: readonly {
    readonly reasonId: 'territory-legal-income';
    readonly rate: number;
    readonly territoryId: TerritoryId;
  }[];
  readonly dailyLevyRecovery: number;
  readonly dailyLevyReasons: readonly {
    readonly reasonId: 'territory-levy-recovery';
    readonly rate: number;
    readonly territoryId: TerritoryId;
  }[];
  readonly gold: {
    readonly available: number;
    readonly committed: number;
    readonly current: number;
    readonly fractional: number;
  };
  readonly influence: number;
  readonly orders: readonly OrderProjection[];
  readonly phase: string;
  readonly prestige: number;
  readonly prognosis: string;
  readonly time: {
    readonly elapsedDays: number;
    readonly hours: number;
    readonly remainingDays: number;
  };
  readonly troops: {
    readonly available: number;
    readonly committed: number;
    readonly current: number;
  };
}

function orderProgress(atHours: number, started: number, completed: number): number {
  if (completed <= started) return 1;
  return Math.max(0, Math.min(1, (atHours - started) / (completed - started)));
}

export function projectPlayerResources(
  state: Wp020GameState,
  content: GameContent,
  actionPayload?: OrderPayload,
): PlayerResourceProjection {
  const system = getWp020(state);
  const player = system.lords.greyfen;
  const playerTerritories = (Object.keys(system.territories) as TerritoryId[])
    .map((territoryId) => system.territories[territoryId])
    .filter((territory) => territory.legalLordId === 'greyfen');
  const projectedTerritories = playerTerritories.map((territory) => ({
    ...territory,
    conditions: activeConditions(territory.conditions, state.timeHours),
  }));
  const goldReasons = projectedTerritories
    .map((territory) => ({
      reasonId: 'territory-legal-income' as const,
      rate: legalDailyIncomeMillionths(territory, content) / FRACTION_SCALE,
      territoryId: territory.territoryId,
    }))
    .filter((reason) => reason.rate > 0);
  const levyReasons = projectedTerritories
    .map((territory) => ({
      reasonId: 'territory-levy-recovery' as const,
      rate: dailyLevyRecoveryMillionths(territory) / FRACTION_SCALE,
      territoryId: territory.territoryId,
    }))
    .filter((reason) => reason.rate > 0);
  const dailyLevyRecovery = levyReasons.reduce((sum, reason) => sum + reason.rate, 0);
  const availableTroops = projectedTerritories.reduce(
    (sum, territory) => sum + (isTerritoryOccupied(territory) ? 0 : territory.availableLevies),
    0,
  );
  const conditions: ActiveConditionProjection[] = [
    ...activeConditions(player.conditions, state.timeHours).map((condition) => ({
      expiresAtHours: condition.expiresAtHours,
      id: condition.id,
      scopeId: 'greyfen',
    })),
    ...projectedTerritories.flatMap((territory) =>
      territory.conditions.map((condition) => ({
        expiresAtHours: condition.expiresAtHours,
        id: condition.id,
        scopeId: territory.territoryId,
      })),
    ),
  ];
  return {
    ...(actionPayload === undefined
      ? {}
      : { actionPreview: previewCommonAction(content, state, actionPayload) }),
    claim: player.claim,
    conditions,
    dailyGoldIncome: goldReasons.reduce((sum, reason) => sum + reason.rate, 0),
    dailyGoldReasons: goldReasons,
    dailyLevyRecovery,
    dailyLevyReasons: levyReasons,
    gold: {
      available: player.gold - player.lockedGold,
      committed: player.lockedGold,
      current: player.gold,
      fractional: player.goldFractionMillionths / FRACTION_SCALE,
    },
    influence: player.influence,
    orders: system.orders.map((order) => ({
      actionId: order.actionId,
      cancellationLoss: order.cancellationLoss,
      completesAtHours: order.completedAtHours,
      fallback: order.fallback,
      progress: orderProgress(
        order.endedAtHours ?? state.timeHours,
        order.startedAtHours,
        order.completedAtHours,
      ),
      sequenceId: order.scheduledSequenceId,
      slot: order.slot,
      status: order.status,
    })),
    phase: system.king.phase,
    prestige: player.prestige,
    prognosis: system.king.prognosis,
    time: {
      elapsedDays: Math.floor(state.timeHours / 24),
      hours: state.timeHours,
      remainingDays: remainingDaysAt(state.timeHours),
    },
    troops: {
      available: availableTroops,
      committed: player.committedTroops,
      current: availableTroops + player.committedTroops,
    },
  };
}
