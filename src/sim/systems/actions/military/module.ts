import type { LordId, TerritoryId } from '../../../../contracts/ids';
import { DAWN_PRIORITY } from '../../../kernel/priorities';
import type {
  DecisionResolver,
  DomainModule,
  InitiativeCanceller,
  InitiativeStarter,
  ScheduledResolver,
  SimulationEffect,
} from '../../../kernel/types';
import { finishCapitalCampaign, markCapitalCampaignPending } from '../../capital/capital';
import {
  hireMercenaryBand,
  markCommitmentsReturning,
  renewMercenaryContract,
} from '../../military/availability';
import {
  type MilitaryDomainExtensions,
  type MilitaryGameState,
  replaceMilitaryState,
} from '../../military/domain';
import { processMilitaryExpiry, processReturningForces } from '../../military/maintenance';
import type { ForceRequest, MilitaryState } from '../../military/types';
import { withdrawOccupation } from '../../occupation/occupation';
import {
  makeCampaignPublic,
  reactToCampaign,
  resolveCampaign,
  type StartCampaignInput,
  startCampaign,
} from '../../war/campaign';

const CAMPAIGN_KIND = 'war.campaign';
const REACTION_KIND = 'war.defender-reaction';
const RETURN_KIND = 'war.return-forces';
const EXPIRY_KIND = 'war.contract-expiry';
const WITHDRAW_KIND = 'war.withdraw-occupation';
const HIRE_MERCENARY_KIND = 'war.hire-mercenary';
const RENEW_MERCENARY_KIND = 'war.renew-mercenary';
const CONTRACT_WARNING_KIND = 'war.contract-expiry-warning';

function record(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function stringField(value: Record<string, unknown>, key: string): string {
  const field = value[key];
  if (typeof field !== 'string' || field.length === 0)
    throw new TypeError(`${key} must be a non-empty string`);
  return field;
}

function campaignPayload(value: unknown): {
  readonly campaignId: string;
  readonly stage: 'public' | 'resolve';
} {
  const payload = record(value, 'campaign payload');
  const stage = stringField(payload, 'stage');
  if (stage !== 'public' && stage !== 'resolve') throw new TypeError('campaign stage is invalid');
  return { campaignId: stringField(payload, 'campaignId'), stage };
}

function contractWarningPayload(value: unknown): {
  readonly expiresAtHours: number;
  readonly forceId: string;
} {
  const payload = record(value, 'contract warning payload');
  const expiresAtHours = payload.expiresAtHours;
  if (typeof expiresAtHours !== 'number' || !Number.isSafeInteger(expiresAtHours)) {
    throw new TypeError('expiresAtHours must be a whole number');
  }
  return { expiresAtHours, forceId: stringField(payload, 'forceId') };
}

function startInput(value: unknown): StartCampaignInput {
  const input = record(value, 'campaign input');
  for (const key of ['campaignId', 'attackerId', 'baseTerritoryId', 'targetTerritoryId', 'goal'])
    stringField(input, key);
  if (!Array.isArray(input.forces)) throw new TypeError('forces must be an array');
  if (input.capitalAuthorizationId !== null && typeof input.capitalAuthorizationId !== 'string') {
    throw new TypeError('capitalAuthorizationId must be a string or null');
  }
  if (
    input.defensiveAuthorizationId !== null &&
    typeof input.defensiveAuthorizationId !== 'string'
  ) {
    throw new TypeError('defensiveAuthorizationId must be a string or null');
  }
  return input as unknown as StartCampaignInput;
}

function effect(kind: string, payload: Record<string, unknown>): SimulationEffect {
  return { kind, payload: payload as never };
}

function nextReturnTime(state: MilitaryState): number | null {
  const times = Object.values(state.commitments).flatMap((commitment) =>
    commitment.kind === 'returning' && commitment.releaseAtHours !== null
      ? [commitment.releaseAtHours]
      : [],
  );
  return times.length === 0 ? null : Math.min(...times);
}

function politicalFallout(
  before: MilitaryState,
  after: MilitaryState,
  facts: ReadonlyArray<MilitaryState['history'][number]>,
  attackerId: LordId | null,
): Record<string, unknown> {
  const priorCapitalController = before.capital.controllerLordId;
  const capitalLossLordId =
    priorCapitalController && after.capital.controllerLordId !== priorCapitalController
      ? priorCapitalController
      : null;
  const capitalControlGained =
    attackerId !== null &&
    before.capital.controllerLordId !== attackerId &&
    after.capital.stableStatus === 'occupied' &&
    after.capital.controllerLordId === attackerId;
  const viabilityShockLordIds = [
    ...new Set(
      facts.flatMap((fact) =>
        fact.kind === 'lord-dispossessed' && fact.lordId ? [fact.lordId] : [],
      ),
    ),
  ].sort();
  return {
    capitalLossLordId,
    churchConductDelta: capitalControlGained ? -2 : 0,
    pledgeShockDeltas: capitalLossLordId ? { [capitalLossLordId]: -12 } : {},
    tags: capitalControlGained ? ['usurper'] : [],
    viabilityShockLordIds,
  };
}

const startCampaignInitiative: InitiativeStarter<MilitaryDomainExtensions> = ({
  command,
  random,
  state,
}) => {
  const started = startCampaign(
    state.systems.war,
    startInput(command.payload),
    state.timeHours,
    random,
  );
  let war = started.state;
  if (started.campaign.targetTerritoryId === 'capital') {
    war = markCapitalCampaignPending(war, started.campaign.id);
  }
  return {
    effects: [
      effect('war.campaign-started', {
        campaignId: started.campaign.id,
        consequences: started.consequences,
        goldDelta: -started.campaign.logisticsGold,
        logisticsGold: started.campaign.logisticsGold,
      }),
    ],
    schedule: [
      {
        dueTimeHours: started.campaign.publicAtHours,
        kind: CAMPAIGN_KIND,
        payload: { campaignId: started.campaign.id, stage: 'public' },
        priority: DAWN_PRIORITY.PLAYER_ORDERS_AND_AI_INTENTS,
        storedDraws: {
          attackerFortune: started.campaign.attackerFortune,
          defenderFortune: started.campaign.defenderFortune,
        },
      },
    ],
    state: replaceMilitaryState(state, war),
  };
};

const hireMercenaryInitiative: InitiativeStarter<MilitaryDomainExtensions> = ({
  command,
  state,
}) => {
  const payload = record(command.payload, 'hire mercenary payload');
  const actorId = stringField(payload, 'actorId') as LordId;
  const forceId = stringField(payload, 'forceId');
  const hired = hireMercenaryBand(state.systems.war, {
    atHours: state.timeHours,
    forceId,
    ownerId: actorId,
  });
  const force = hired.state.contractedForces[forceId];
  if (!force) throw new Error('hired mercenary band is missing');
  return {
    effects: [
      effect('war.mercenary-hired', {
        actorId,
        forceId,
        goldDelta: -hired.goldCost,
      }),
    ],
    schedule: [
      {
        dueTimeHours: force.expiresAtHours - 24,
        kind: CONTRACT_WARNING_KIND,
        payload: { expiresAtHours: force.expiresAtHours, forceId },
        priority: DAWN_PRIORITY.EXPIRY_DECAY_INCOME_AND_RECOVERY,
      },
      {
        dueTimeHours: force.expiresAtHours,
        kind: EXPIRY_KIND,
        payload: {},
        priority: DAWN_PRIORITY.EXPIRY_DECAY_INCOME_AND_RECOVERY,
      },
    ],
    state: replaceMilitaryState(state, hired.state),
  };
};

const renewMercenaryInitiative: InitiativeStarter<MilitaryDomainExtensions> = ({
  command,
  state,
}) => {
  const payload = record(command.payload, 'renew mercenary payload');
  const actorId = stringField(payload, 'actorId') as LordId;
  const forceId = stringField(payload, 'forceId');
  const force = state.systems.war.contractedForces[forceId];
  if (!force || force.ownerId !== actorId)
    throw new Error('actor does not own this mercenary band');
  const renewed = renewMercenaryContract(state.systems.war, forceId, state.timeHours);
  const renewedForce = renewed.state.contractedForces[forceId];
  if (!renewedForce) throw new Error('renewed mercenary band is missing');
  return {
    effects: [
      effect('war.mercenary-renewed', {
        actorId,
        forceId,
        goldDelta: -renewed.goldCost,
      }),
    ],
    schedule: [
      {
        dueTimeHours: renewedForce.expiresAtHours - 24,
        kind: CONTRACT_WARNING_KIND,
        payload: { expiresAtHours: renewedForce.expiresAtHours, forceId },
        priority: DAWN_PRIORITY.EXPIRY_DECAY_INCOME_AND_RECOVERY,
      },
      {
        dueTimeHours: renewedForce.expiresAtHours,
        kind: EXPIRY_KIND,
        payload: {},
        priority: DAWN_PRIORITY.EXPIRY_DECAY_INCOME_AND_RECOVERY,
      },
    ],
    state: replaceMilitaryState(state, renewed.state),
  };
};

const resolveCampaignSchedule: ScheduledResolver<MilitaryDomainExtensions> = ({ item, state }) => {
  const payload = campaignPayload(item.payload);
  if (payload.stage === 'public') {
    let war = makeCampaignPublic(state.systems.war, payload.campaignId);
    const campaign = war.campaigns[payload.campaignId];
    if (!campaign) throw new Error('public campaign is missing');
    const schedule = [
      {
        dueTimeHours: campaign.resolvesAtHours,
        kind: CAMPAIGN_KIND,
        payload: { campaignId: campaign.id, stage: 'resolve' },
        priority: DAWN_PRIORITY.BATTLES_OCCUPATIONS_AND_PUBLIC_FALLOUT,
        storedDraws: {
          attackerFortune: campaign.attackerFortune,
          defenderFortune: campaign.defenderFortune,
        },
      },
    ];
    if (campaign.defenderId === null && campaign.targetTerritoryId === 'capital') {
      war = reactToCampaign(war, campaign.id, 'defend', [], state.timeHours);
      return {
        effects: [effect('war.campaign-public', { campaignId: campaign.id })],
        schedule,
        state: replaceMilitaryState(state, war),
      };
    }
    return {
      decision: {
        choiceIds: [
          'defend',
          'yield',
          ...(campaign.goal === 'liberate' ? ['withdraw-occupation'] : []),
        ],
        id: `war-reaction:${campaign.id}`,
        kind: REACTION_KIND,
        payload: { campaignId: campaign.id },
      },
      effects: [effect('war.campaign-public', { campaignId: campaign.id })],
      schedule,
      state: replaceMilitaryState(state, war),
    };
  }
  const historyStart = state.systems.war.history.length;
  const result = resolveCampaign(state.systems.war, payload.campaignId, state.timeHours);
  const campaign = result.state.campaigns[payload.campaignId];
  if (!campaign) throw new Error('resolved campaign is missing');
  let war = result.state;
  if (campaign.targetTerritoryId === 'capital') war = finishCapitalCampaign(war, campaign.id);
  const returnAt = nextReturnTime(war);
  const facts = war.history.slice(historyStart);
  return {
    effects: [
      effect('war.campaign-resolved', {
        battle: result.battle,
        campaignId: campaign.id,
        facts,
        outcome: campaign.outcome,
        politicalFallout: politicalFallout(state.systems.war, war, facts, campaign.attackerId),
        prestigeDeltas: result.prestigeDeltas,
        reasons: campaign.reasons,
      }),
    ],
    ...(returnAt === null
      ? {}
      : {
          schedule: [
            {
              dueTimeHours: returnAt,
              kind: RETURN_KIND,
              payload: {},
              priority: DAWN_PRIORITY.EXPIRY_DECAY_INCOME_AND_RECOVERY,
            },
          ],
        }),
    state: replaceMilitaryState(state, war),
  };
};

const resolveDefenderReaction: DecisionResolver<MilitaryDomainExtensions> = ({
  command,
  decision,
  state,
}) => {
  const decisionPayload = record(decision.payload, 'defender decision');
  const campaignId = stringField(decisionPayload, 'campaignId');
  const choice = command.choiceId;
  if (choice !== 'defend' && choice !== 'yield' && choice !== 'withdraw-occupation') {
    throw new TypeError('unsupported defender reaction');
  }
  const commandPayload =
    command.payload === null ? {} : record(command.payload, 'reaction payload');
  const forcesValue = commandPayload.forces ?? [];
  if (!Array.isArray(forcesValue)) throw new TypeError('reaction forces must be an array');
  const yieldAssessmentId = commandPayload.yieldAssessmentId ?? null;
  if (yieldAssessmentId !== null && typeof yieldAssessmentId !== 'string') {
    throw new TypeError('yieldAssessmentId must be a string or null');
  }
  const war = reactToCampaign(
    state.systems.war,
    campaignId,
    choice,
    forcesValue as ForceRequest[],
    state.timeHours,
    yieldAssessmentId,
  );
  return {
    effects: [effect('war.defender-reacted', { campaignId, reaction: choice })],
    state: replaceMilitaryState(state, war),
  };
};

const cancelCampaign: InitiativeCanceller<MilitaryDomainExtensions> = ({ item, state }) => {
  const payload = campaignPayload(item.payload);
  const campaign = state.systems.war.campaigns[payload.campaignId];
  if (!campaign || payload.stage !== 'public' || campaign.status !== 'scheduled') {
    throw new Error('public campaigns cannot be cancelled as Orders');
  }
  let war = markCommitmentsReturning(
    state.systems.war,
    campaign.attackerCommitmentIds,
    state.timeHours + 24,
  );
  war = {
    ...war,
    campaigns: {
      ...war.campaigns,
      [campaign.id]: {
        ...campaign,
        outcome: 'cancelled',
        reasons: ['cancelled before public visibility; logistics are not refunded'],
        status: 'cancelled',
      },
    },
  };
  if (campaign.targetTerritoryId === 'capital') war = finishCapitalCampaign(war, campaign.id);
  return {
    effects: [effect('war.campaign-cancelled', { campaignId: campaign.id, logisticsRefund: 0 })],
    schedule: [
      {
        dueTimeHours: state.timeHours + 24,
        kind: RETURN_KIND,
        payload: {},
        priority: DAWN_PRIORITY.EXPIRY_DECAY_INCOME_AND_RECOVERY,
      },
    ],
    state: replaceMilitaryState(state, war),
  };
};

const resolveReturn: ScheduledResolver<MilitaryDomainExtensions> = ({ state }) => {
  const war = processReturningForces(state.systems.war, state.timeHours);
  const returnAt = nextReturnTime(war);
  return {
    ...(returnAt === null
      ? {}
      : {
          schedule: [
            {
              dueTimeHours: returnAt,
              kind: RETURN_KIND,
              payload: {},
              priority: DAWN_PRIORITY.EXPIRY_DECAY_INCOME_AND_RECOVERY,
            },
          ],
        }),
    state: replaceMilitaryState(state, war),
  };
};

const resolveExpiry: ScheduledResolver<MilitaryDomainExtensions> = ({ state }) => {
  const historyStart = state.systems.war.history.length;
  const result = processMilitaryExpiry(state.systems.war, state.timeHours);
  const returnAt = nextReturnTime(result.state);
  const facts = result.state.history.slice(historyStart);
  return {
    effects:
      result.expiredForceIds.length === 0
        ? []
        : [
            effect('war.contracts-expired', {
              affectedCommitmentIds: result.affectedCommitmentIds,
              facts,
              forceIds: result.expiredForceIds,
              politicalFallout: politicalFallout(state.systems.war, result.state, facts, null),
            }),
          ],
    ...(returnAt === null
      ? {}
      : {
          schedule: [
            {
              dueTimeHours: returnAt,
              kind: RETURN_KIND,
              payload: {},
              priority: DAWN_PRIORITY.EXPIRY_DECAY_INCOME_AND_RECOVERY,
            },
          ],
        }),
    state: replaceMilitaryState(state, result.state),
  };
};

const resolveContractWarning: ScheduledResolver<MilitaryDomainExtensions> = ({ item, state }) => {
  const payload = contractWarningPayload(item.payload);
  const force = state.systems.war.contractedForces[payload.forceId];
  if (
    !force ||
    force.troops === 0 ||
    force.expiresAtHours !== payload.expiresAtHours ||
    force.expiresAtHours <= state.timeHours
  ) {
    return { state };
  }
  return {
    effects: [
      effect('war.contract-expiry-warning', {
        expiresAtHours: force.expiresAtHours,
        forceId: force.id,
        ownerId: force.ownerId,
      }),
    ],
    state,
  };
};

const withdrawInitiative: InitiativeStarter<MilitaryDomainExtensions> = ({ command, state }) => {
  const payload = record(command.payload, 'withdraw occupation payload');
  const territoryId = stringField(payload, 'territoryId') as Exclude<TerritoryId, 'capital'>;
  const occupation = state.systems.war.territories[territoryId]?.occupation;
  const actorId = stringField(payload, 'actorId') as LordId;
  if (!occupation || occupation.occupierId !== actorId)
    throw new Error('actor does not control this occupation');
  if (
    Object.values(state.systems.war.campaigns).some(
      (campaign) =>
        campaign.targetTerritoryId === territoryId &&
        (campaign.status === 'public' || campaign.status === 'scheduled'),
    )
  ) {
    throw new Error('occupation cannot be withdrawn while its battle is pending');
  }
  const war = withdrawOccupation(state.systems.war, territoryId, state.timeHours);
  return {
    effects: [effect('war.occupation-withdrawn', { actorId, territoryId })],
    schedule: [
      {
        dueTimeHours: state.timeHours + 24,
        kind: RETURN_KIND,
        payload: {},
        priority: DAWN_PRIORITY.EXPIRY_DECAY_INCOME_AND_RECOVERY,
      },
    ],
    state: replaceMilitaryState(state, war),
  };
};

export const militaryWarModule: DomainModule<MilitaryDomainExtensions> = {
  decisionResolvers: { [REACTION_KIND]: resolveDefenderReaction },
  id: 'war',
  initiativeCancellers: { [CAMPAIGN_KIND]: cancelCampaign },
  initiativeStarters: {
    [CAMPAIGN_KIND]: startCampaignInitiative,
    [HIRE_MERCENARY_KIND]: hireMercenaryInitiative,
    [RENEW_MERCENARY_KIND]: renewMercenaryInitiative,
    [WITHDRAW_KIND]: withdrawInitiative,
  },
  scheduledResolvers: {
    [CAMPAIGN_KIND]: resolveCampaignSchedule,
    [CONTRACT_WARNING_KIND]: resolveContractWarning,
    [EXPIRY_KIND]: resolveExpiry,
    [RETURN_KIND]: resolveReturn,
  },
};

export function militaryStateFromGame(state: MilitaryGameState): MilitaryState {
  return state.systems.war;
}

export const MILITARY_HANDLER_KINDS = Object.freeze({
  campaign: CAMPAIGN_KIND,
  contractExpiry: EXPIRY_KIND,
  contractExpiryWarning: CONTRACT_WARNING_KIND,
  defenderReaction: REACTION_KIND,
  hireMercenary: HIRE_MERCENARY_KIND,
  renewMercenary: RENEW_MERCENARY_KIND,
  returnForces: RETURN_KIND,
  withdrawOccupation: WITHDRAW_KIND,
});
