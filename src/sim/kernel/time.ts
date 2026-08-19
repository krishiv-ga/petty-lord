/**
 * Canonical simulation time is stored to micro-hour precision. This is far below UI pacing needs
 * while making equivalent fractional command chunking converge on identical due timestamps.
 */
export const SIMULATION_HOUR_SCALE = 1_000_000;

export function normalizeSimulationHours(value: number): number {
  if (!Number.isFinite(value)) {
    return value;
  }
  const normalized = Math.round(value * SIMULATION_HOUR_SCALE) / SIMULATION_HOUR_SCALE;
  return Object.is(normalized, -0) ? 0 : normalized;
}

export function isCanonicalSimulationHours(value: number): boolean {
  return Number.isFinite(value) && normalizeSimulationHours(value) === value;
}
