import { revalidateCapitalGarrison } from '../capital/capital';
import { revalidateHereditaryGarrisons } from '../occupation/occupation';
import { expireContractedForces, releaseReturningForces } from './availability';
import type { MilitaryState } from './types';

export interface MilitaryExpiryResult {
  readonly affectedCommitmentIds: string[];
  readonly expiredForceIds: string[];
  readonly state: MilitaryState;
}

export function processMilitaryExpiry(state: MilitaryState, atHours: number): MilitaryExpiryResult {
  const expired = expireContractedForces(state, atHours);
  let next = revalidateHereditaryGarrisons(expired.state, atHours);
  next = revalidateCapitalGarrison(next, atHours);
  return { ...expired, state: next };
}

export function processReturningForces(state: MilitaryState, atHours: number): MilitaryState {
  return releaseReturningForces(state, atHours);
}
