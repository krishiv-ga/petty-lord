import type { PhaseId } from '../../../contracts/ids';
import type { PrognosisId } from '../time/types';

export const PHASE_TRANSITION_DAYS = {
  14: 'ailing',
  28: 'gravely-ill',
  42: 'deathbed',
} as const satisfies Record<number, PhaseId>;

export function phaseForElapsedDay(elapsedDay: number): PhaseId {
  if (elapsedDay >= 42) return 'deathbed';
  if (elapsedDay >= 28) return 'gravely-ill';
  if (elapsedDay >= 14) return 'ailing';
  return 'stable';
}

export function prognosisForElapsedDay(elapsedDay: number): PrognosisId {
  if (elapsedDay >= 55) return 'any-hour';
  if (elapsedDay >= 53) return 'days';
  if (elapsedDay >= 49) return 'unlikely-to-survive-week';
  if (elapsedDay >= 42) return 'perhaps-a-fortnight';
  return 'roughly-eight-weeks';
}

export function remainingDaysAt(timeHours: number): number {
  return Math.max(0, 56 - Math.floor(timeHours / 24));
}
