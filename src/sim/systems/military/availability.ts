import type { LordId, TerritoryId } from '../../../contracts/ids';
import { hasCampaignBase, validateWholeTroops } from './state';
import type {
  ContractedForce,
  ForceAllocation,
  ForceRequest,
  MilitaryCommitment,
  MilitaryState,
} from './types';

export interface ArmyAvailability {
  readonly aid: number;
  readonly availableContracted: number;
  readonly availableLevies: number;
  readonly campaign: number;
  readonly garrison: number;
  readonly returning: number;
  readonly totalAvailable: number;
  readonly totalCommitted: number;
}

const totalAllocations = (allocations: readonly ForceAllocation[]): number =>
  allocations.reduce((total, allocation) => total + allocation.troops, 0);

export function commitmentTroops(commitment: MilitaryCommitment): number {
  return totalAllocations(commitment.allocations);
}

export function armyAvailability(state: MilitaryState, lordId: LordId): ArmyAvailability {
  const ownedCommitments = Object.values(state.commitments).filter((commitment) =>
    commitment.allocations.some((allocation) => allocation.ownerId === lordId),
  );
  const byKind = (kinds: readonly MilitaryCommitment['kind'][]): number =>
    ownedCommitments.reduce(
      (total, commitment) =>
        total +
        commitment.allocations
          .filter((allocation) => allocation.ownerId === lordId && kinds.includes(commitment.kind))
          .reduce((sum, allocation) => sum + allocation.troops, 0),
      0,
    );
  const availableContracted = Object.values(state.contractedForces)
    .filter(
      (force) =>
        force.ownerId === lordId && force.assignedCommitmentId === null && force.troops > 0,
    )
    .reduce((total, force) => total + force.troops, 0);
  const availableLevies = state.lords[lordId].availableLevies;
  const totalCommitted = byKind([
    'aid',
    'campaign',
    'capital-garrison',
    'occupation-garrison',
    'returning',
  ]);
  return {
    aid: byKind(['aid']),
    availableContracted,
    availableLevies,
    campaign: byKind(['campaign']),
    garrison: byKind(['capital-garrison', 'occupation-garrison']),
    returning: byKind(['returning']),
    totalAvailable: availableLevies + availableContracted,
    totalCommitted,
  };
}

export function addContractedForce(state: MilitaryState, force: ContractedForce): MilitaryState {
  if (force.id.length === 0) throw new Error('contracted force id must not be empty');
  if (!state.lords[force.ownerId]) throw new Error('contracted force owner is not a legal lord');
  validateWholeTroops(force.troops, `${force.id} troops`);
  validateWholeTroops(force.initialTroops, `${force.id} initial troops`);
  if (force.troops > force.initialTroops)
    throw new Error('contract troops exceed initial strength');
  if (state.contractedForces[force.id])
    throw new Error(`contracted force ${force.id} already exists`);
  if (force.assignedCommitmentId !== null) {
    throw new Error('new contracted force cannot begin assigned');
  }
  if (force.expiresAtHours <= force.hiredAtHours)
    throw new Error('contract expiry must follow hire');
  if (
    force.sourceKind === 'mercenary' &&
    (force.initialTroops !== 150 ||
      force.troops !== 150 ||
      force.expiresAtHours - force.hiredAtHours !== 7 * 24 ||
      force.renewalCostGold !== 20 ||
      !force.renewable)
  ) {
    throw new Error('mercenary bands must start at 150 troops for 7 days with 20 Gold renewal');
  }
  if (
    force.sourceKind === 'mercenary' &&
    Object.values(state.contractedForces).filter(
      (candidate) =>
        candidate.ownerId === force.ownerId &&
        candidate.sourceKind === 'mercenary' &&
        candidate.troops > 0,
    ).length >= 2
  ) {
    throw new Error(`${force.ownerId} cannot contract more than two mercenary bands`);
  }
  return {
    ...state,
    contractedForces: { ...state.contractedForces, [force.id]: force },
  };
}

export function hireMercenaryBand(
  state: MilitaryState,
  options: { readonly atHours: number; readonly forceId: string; readonly ownerId: LordId },
): { readonly goldCost: 40 | 50; readonly state: MilitaryState } {
  const maraDiscount =
    options.ownerId === 'mara' && state.territories.westmarch.controllerLordId === 'mara';
  const force: ContractedForce = {
    assignedCommitmentId: null,
    expiresAtHours: options.atHours + 7 * 24,
    hiredAtHours: options.atHours,
    id: options.forceId,
    initialTroops: 150,
    ownerId: options.ownerId,
    renewable: true,
    renewalCostGold: 20,
    sourceKind: 'mercenary',
    troops: 150,
  };
  return { goldCost: maraDiscount ? 40 : 50, state: addContractedForce(state, force) };
}

export function renewMercenaryContract(
  state: MilitaryState,
  forceId: string,
  atHours: number,
): { readonly goldCost: number; readonly state: MilitaryState } {
  const force = state.contractedForces[forceId];
  if (force?.sourceKind !== 'mercenary' || !force.renewable || force.troops === 0) {
    throw new Error(`mercenary contract ${forceId} cannot be renewed`);
  }
  if (atHours > force.expiresAtHours) throw new Error('expired mercenaries cannot be renewed');
  const renewed = { ...force, expiresAtHours: force.expiresAtHours + 7 * 24 };
  return {
    goldCost: force.renewalCostGold,
    state: {
      ...state,
      contractedForces: { ...state.contractedForces, [forceId]: renewed },
    },
  };
}

export function expireContractedForces(
  state: MilitaryState,
  atHours: number,
): {
  readonly affectedCommitmentIds: string[];
  readonly expiredForceIds: string[];
  readonly state: MilitaryState;
} {
  const expiring = Object.values(state.contractedForces).filter(
    (force) => force.troops > 0 && force.expiresAtHours <= atHours,
  );
  if (expiring.length === 0) return { affectedCommitmentIds: [], expiredForceIds: [], state };
  const expiredIds = new Set(expiring.map((force) => force.id));
  const affected = new Set<string>();
  const commitments = Object.fromEntries(
    Object.entries(state.commitments).map(([id, commitment]) => {
      const allocations = commitment.allocations.filter(
        (allocation) => !expiredIds.has(allocation.sourceId),
      );
      if (allocations.length !== commitment.allocations.length) affected.add(id);
      return [id, { ...commitment, allocations }];
    }),
  );
  const contractedForces = { ...state.contractedForces };
  for (const force of expiring) {
    contractedForces[force.id] = { ...force, assignedCommitmentId: null, troops: 0 };
  }
  return {
    affectedCommitmentIds: [...affected].sort(),
    expiredForceIds: [...expiredIds].sort(),
    state: { ...state, commitments, contractedForces },
  };
}

export function lockForceRequests(
  state: MilitaryState,
  campaignId: string,
  side: 'attacker' | 'defender',
  requests: readonly ForceRequest[],
): { readonly commitmentIds: string[]; readonly state: MilitaryState } {
  if (requests.length === 0) throw new Error('at least one force request is required');
  const seenLords = new Set<LordId>();
  const seenForces = new Set<string>();
  let next = state;
  const commitmentIds: string[] = [];
  for (const request of requests) {
    if (seenLords.has(request.lordId))
      throw new Error(`duplicate force request for ${request.lordId}`);
    seenLords.add(request.lordId);
    validateWholeTroops(request.levyTroops, 'requested levies');
    if (request.levyTroops % 25 !== 0)
      throw new Error('campaign levies must be committed in 25-troop increments');
    if (!hasCampaignBase(next, request.lordId, request.basingTerritoryId)) {
      throw new Error(
        `${request.lordId} has no valid campaign base at ${request.basingTerritoryId}`,
      );
    }
    const lord = next.lords[request.lordId];
    if (lord.dispossessed && !lord.alliedBasingTerritoryIds.includes(request.basingTerritoryId)) {
      throw new Error(`${request.lordId} is dispossessed and lacks allied basing rights`);
    }
    if (lord.availableLevies < request.levyTroops) {
      throw new Error(`${request.lordId} lacks available levies`);
    }
    const allocations: ForceAllocation[] = [];
    if (request.levyTroops > 0) {
      allocations.push({
        garrisonEligible: request.garrisonEligible,
        ownerId: request.lordId,
        sourceId: `levy:${request.lordId}`,
        sourceKind: 'levy',
        troops: request.levyTroops,
      });
    }
    for (const forceId of request.mercenaryIds) {
      if (seenForces.has(forceId))
        throw new Error(`contracted force ${forceId} is double committed`);
      seenForces.add(forceId);
      const force = next.contractedForces[forceId];
      if (!force || force.ownerId !== request.lordId || force.troops === 0) {
        throw new Error(`contracted force ${forceId} is unavailable`);
      }
      if (force.assignedCommitmentId !== null) {
        throw new Error(`contracted force ${forceId} is already committed`);
      }
      allocations.push({
        garrisonEligible: request.garrisonEligible,
        ownerId: request.lordId,
        sourceId: force.id,
        sourceKind: force.sourceKind,
        troops: force.troops,
      });
    }
    if (totalAllocations(allocations) === 0) throw new Error('campaign force cannot be empty');
    const commitmentId = `${campaignId}:${side}:${request.lordId}`;
    if (next.commitments[commitmentId])
      throw new Error(`commitment ${commitmentId} already exists`);
    const commitment: MilitaryCommitment = {
      allocations,
      campaignId,
      id: commitmentId,
      kind: 'campaign',
      releaseAtHours: null,
      territoryId: request.basingTerritoryId,
    };
    const contractedForces = { ...next.contractedForces };
    for (const forceId of request.mercenaryIds) {
      const force = contractedForces[forceId] as ContractedForce;
      contractedForces[forceId] = { ...force, assignedCommitmentId: commitmentId };
    }
    next = {
      ...next,
      commitments: { ...next.commitments, [commitmentId]: commitment },
      contractedForces,
      lords: {
        ...next.lords,
        [request.lordId]: { ...lord, availableLevies: lord.availableLevies - request.levyTroops },
      },
    };
    commitmentIds.push(commitmentId);
  }
  return { commitmentIds, state: next };
}

function distributeCasualties(
  allocations: readonly ForceAllocation[],
  casualties: number,
): number[] {
  const total = totalAllocations(allocations);
  validateWholeTroops(casualties, 'casualties');
  if (casualties > total) throw new Error('casualties exceed committed force');
  if (total === 0) return allocations.map(() => 0);
  const exact = allocations.map((allocation) => (casualties * allocation.troops) / total);
  const losses = exact.map(Math.floor);
  let remaining = casualties - losses.reduce((sum, loss) => sum + loss, 0);
  const order = exact
    .map((value, index) => ({ fraction: value - Math.floor(value), index }))
    .sort((left, right) => right.fraction - left.fraction || left.index - right.index);
  for (const entry of order) {
    if (remaining === 0) break;
    losses[entry.index] = (losses[entry.index] ?? 0) + 1;
    remaining -= 1;
  }
  return losses;
}

export function applyCommitmentCasualties(
  state: MilitaryState,
  commitmentIds: readonly string[],
  casualties: number,
): MilitaryState {
  const commitments = commitmentIds
    .map((id) => state.commitments[id])
    .filter((value) => value !== undefined);
  const indexed = commitments.flatMap((commitment) =>
    commitment.allocations.map((allocation, allocationIndex) => ({
      allocation,
      allocationIndex,
      commitmentId: commitment.id,
    })),
  );
  const losses = distributeCasualties(
    indexed.map((entry) => entry.allocation),
    casualties,
  );
  const nextCommitments = { ...state.commitments };
  const nextLords = { ...state.lords };
  const nextForces = { ...state.contractedForces };
  for (const commitment of commitments) {
    nextCommitments[commitment.id] = { ...commitment, allocations: [...commitment.allocations] };
  }
  indexed.forEach((entry, index) => {
    const loss = losses[index] ?? 0;
    const commitment = nextCommitments[entry.commitmentId] as MilitaryCommitment;
    const allocations = [...commitment.allocations];
    const allocation = allocations[entry.allocationIndex] as ForceAllocation;
    allocations[entry.allocationIndex] = { ...allocation, troops: allocation.troops - loss };
    nextCommitments[entry.commitmentId] = { ...commitment, allocations };
    if (allocation.sourceKind === 'levy' && allocation.ownerId !== null) {
      const lord = nextLords[allocation.ownerId];
      nextLords[allocation.ownerId] = {
        ...lord,
        permanentLevyCasualties: lord.permanentLevyCasualties + loss,
      };
    } else if (allocation.sourceKind === 'mercenary' || allocation.sourceKind === 'temporary') {
      const force = nextForces[allocation.sourceId];
      if (force) nextForces[allocation.sourceId] = { ...force, troops: force.troops - loss };
    }
  });
  return { ...state, commitments: nextCommitments, contractedForces: nextForces, lords: nextLords };
}

export function totalCommittedForce(
  state: MilitaryState,
  commitmentIds: readonly string[],
): ForceAllocation[] {
  return commitmentIds.flatMap((id) => state.commitments[id]?.allocations ?? []);
}

export function assignGarrison(
  state: MilitaryState,
  options: {
    readonly campaignId: string;
    readonly commitmentIds: readonly string[];
    readonly lordId: LordId;
    readonly requiredTroops: number;
    readonly territoryId: TerritoryId;
  },
): {
  readonly commitmentId: string;
  readonly state: MilitaryState;
  readonly troops: number;
} | null {
  const candidates = options.commitmentIds
    .flatMap((id) =>
      (state.commitments[id]?.allocations ?? []).map((allocation, allocationIndex) => ({
        allocation,
        allocationIndex,
        commitmentId: id,
      })),
    )
    .filter(
      (entry) =>
        entry.allocation.ownerId === options.lordId &&
        entry.allocation.garrisonEligible &&
        entry.allocation.sourceKind !== 'royal' &&
        entry.allocation.troops > 0,
    );
  if (
    candidates.reduce((sum, entry) => sum + entry.allocation.troops, 0) < options.requiredTroops
  ) {
    return null;
  }
  const selected: ForceAllocation[] = [];
  let remaining = options.requiredTroops;
  const ordered = [...candidates].sort((left, right) => {
    const leftLevy = left.allocation.sourceKind === 'levy' ? 0 : 1;
    const rightLevy = right.allocation.sourceKind === 'levy' ? 0 : 1;
    return leftLevy - rightLevy || left.commitmentId.localeCompare(right.commitmentId);
  });
  const nextCommitments = { ...state.commitments };
  const nextForces = { ...state.contractedForces };
  for (const entry of ordered) {
    if (remaining <= 0) break;
    const sourceCommitment = nextCommitments[entry.commitmentId] as MilitaryCommitment;
    const allocations = [...sourceCommitment.allocations];
    const current = allocations[entry.allocationIndex] as ForceAllocation;
    const take =
      current.sourceKind === 'levy' ? Math.min(current.troops, remaining) : current.troops;
    selected.push({ ...current, troops: take });
    allocations[entry.allocationIndex] = { ...current, troops: current.troops - take };
    nextCommitments[entry.commitmentId] = { ...sourceCommitment, allocations };
    remaining -= take;
  }
  const commitmentId = `${options.campaignId}:garrison:${options.territoryId}`;
  const kind = options.territoryId === 'capital' ? 'capital-garrison' : 'occupation-garrison';
  const garrison: MilitaryCommitment = {
    allocations: selected,
    campaignId: options.campaignId,
    id: commitmentId,
    kind,
    releaseAtHours: null,
    territoryId: options.territoryId,
  };
  for (const allocation of selected) {
    if (allocation.sourceKind === 'mercenary' || allocation.sourceKind === 'temporary') {
      const force = nextForces[allocation.sourceId];
      if (force) nextForces[allocation.sourceId] = { ...force, assignedCommitmentId: commitmentId };
    }
  }
  return {
    commitmentId,
    state: {
      ...state,
      commitments: { ...nextCommitments, [commitmentId]: garrison },
      contractedForces: nextForces,
    },
    troops: totalAllocations(selected),
  };
}

export function markCommitmentsReturning(
  state: MilitaryState,
  commitmentIds: readonly string[],
  releaseAtHours: number,
): MilitaryState {
  const commitments = { ...state.commitments };
  for (const id of commitmentIds) {
    const commitment = commitments[id];
    if (!commitment) continue;
    commitments[id] = { ...commitment, kind: 'returning', releaseAtHours };
  }
  return { ...state, commitments };
}

export function releaseReturningForces(state: MilitaryState, atHours: number): MilitaryState {
  const releasable = Object.values(state.commitments).filter(
    (commitment) =>
      commitment.kind === 'returning' &&
      commitment.releaseAtHours !== null &&
      commitment.releaseAtHours <= atHours,
  );
  if (releasable.length === 0) return state;
  const lords = { ...state.lords };
  const contractedForces = { ...state.contractedForces };
  const commitments = { ...state.commitments };
  for (const commitment of releasable) {
    for (const allocation of commitment.allocations) {
      if (allocation.sourceKind === 'levy' && allocation.ownerId !== null) {
        const lord = lords[allocation.ownerId];
        lords[allocation.ownerId] = {
          ...lord,
          availableLevies: lord.availableLevies + allocation.troops,
        };
      } else if (allocation.sourceKind === 'mercenary' || allocation.sourceKind === 'temporary') {
        const force = contractedForces[allocation.sourceId];
        if (force) contractedForces[allocation.sourceId] = { ...force, assignedCommitmentId: null };
      }
    }
    delete commitments[commitment.id];
  }
  return { ...state, commitments, contractedForces, lords };
}

export function invariantMilitaryAccounting(state: MilitaryState): string[] {
  const issues: string[] = [];
  const assignedSources = new Map<string, string>();
  for (const commitment of Object.values(state.commitments)) {
    for (const allocation of commitment.allocations) {
      if (allocation.troops < 0 || !Number.isSafeInteger(allocation.troops)) {
        issues.push(`${commitment.id} has invalid troop allocation`);
      }
      if (allocation.sourceKind === 'mercenary' || allocation.sourceKind === 'temporary') {
        const prior = assignedSources.get(allocation.sourceId);
        if (prior && allocation.troops > 0)
          issues.push(`${allocation.sourceId} appears in ${prior} and ${commitment.id}`);
        if (allocation.troops > 0) assignedSources.set(allocation.sourceId, commitment.id);
      }
    }
  }
  for (const force of Object.values(state.contractedForces)) {
    const actual = assignedSources.get(force.id) ?? null;
    if (force.assignedCommitmentId !== actual)
      issues.push(`${force.id} assignment mirror is inconsistent`);
  }
  for (const lord of Object.values(state.lords)) {
    if (lord.availableLevies < 0) issues.push(`${lord.lordId} has negative available levies`);
    if (lord.permanentLevyCasualties < 0) issues.push(`${lord.lordId} has negative casualties`);
  }
  return issues;
}
