import type { GameContent } from '../../../../contracts/content';
import type { ActionId } from '../../../../contracts/ids';
import type { ActionIntent, ActionPreview, ConsequenceSeverity } from '../../time/types';

type ActionDefinition = GameContent['actions'][number];

export function semanticActionIntent(
  genuinelyDestructive: boolean,
  ordinaryIntent: Exclude<ActionIntent, 'danger'> = 'confirm',
): ActionIntent {
  return genuinelyDestructive ? 'danger' : ordinaryIntent;
}

export function buildActionPreview(options: {
  readonly acceptanceCollateral?: readonly string[];
  readonly action: ActionDefinition;
  readonly available: boolean;
  readonly cancellationLoss?: readonly string[];
  readonly disabledReasons?: readonly string[];
  readonly durationHours: number;
  readonly fallback: string;
  readonly intentionalUnknowns?: readonly string[];
  readonly intent?: ActionIntent;
  readonly irreversible?: boolean;
  readonly knownConsequences?: readonly string[];
  readonly name?: string;
  readonly severity?: ConsequenceSeverity;
  readonly startCost: {
    readonly gold: number;
    readonly influence: number;
    readonly logisticsGold: number;
  };
  readonly troopsLocked?: number;
  readonly warnings?: readonly string[];
}): ActionPreview {
  return {
    acceptanceCollateral: options.acceptanceCollateral ?? [],
    actionId: options.action.id as ActionId,
    available: options.available,
    cancellationLoss: options.cancellationLoss ?? [],
    disabledReasons: options.disabledReasons ?? [],
    durationHours: options.durationHours,
    fallback: options.fallback,
    intentionalUnknowns: options.intentionalUnknowns ?? [],
    intent: options.intent ?? 'confirm',
    irreversible: options.irreversible ?? false,
    knownConsequences: options.knownConsequences ?? [],
    name: options.name ?? options.action.id,
    severity: options.severity ?? 'ordinary',
    startCost: options.startCost,
    troopsLocked: options.troopsLocked ?? 0,
    visibility: options.action.visibility,
    warnings: options.warnings ?? [],
  };
}
