import { validateWholeTroops } from './state';
import type { BattleResult, BattleSideInput, BattleSideResult } from './types';

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

function validateMultiplier(value: number, label: string, minimum = 0): void {
  if (!Number.isFinite(value) || value < minimum) {
    throw new RangeError(`${label} must be finite and at least ${minimum}`);
  }
}

function prepareSide(input: BattleSideInput): Omit<BattleSideResult, 'casualties' | 'survivors'> {
  const baseForce = input.allocations.reduce((total, allocation) => {
    validateWholeTroops(allocation.troops, `${allocation.sourceId} troops`);
    return total + allocation.troops;
  }, 0);
  validateMultiplier(input.commanderMultiplier, 'commander multiplier', 0.01);
  validateMultiplier(input.terrainMultiplier, 'terrain multiplier', 0.01);
  validateMultiplier(input.fortificationMultiplier, 'fortification multiplier', 0.01);
  validateMultiplier(input.fortune, 'fortune', 0.92);
  if (input.fortune > 1.08) throw new RangeError('fortune must not exceed 1.08');
  return {
    baseForce,
    commanderMultiplier: input.commanderMultiplier,
    effectivePower:
      baseForce *
      input.commanderMultiplier *
      input.terrainMultiplier *
      input.fortificationMultiplier *
      input.fortune,
    fortificationMultiplier: input.fortificationMultiplier,
    fortune: input.fortune,
    terrainMultiplier: input.terrainMultiplier,
  };
}

export function fortificationMultiplier(level: number): number {
  if (!Number.isSafeInteger(level) || level < 0) {
    throw new RangeError('fortification level must be a non-negative integer');
  }
  return 1 + 0.1 * level;
}

export function resolveBattle(
  attackerInput: BattleSideInput,
  defenderInput: BattleSideInput,
  seatChangesControl: boolean,
): BattleResult {
  const attackerBase = prepareSide(attackerInput);
  const defenderBase = prepareSide(defenderInput);
  if (attackerBase.baseForce === 0 || defenderBase.baseForce === 0) {
    throw new Error('battle requires non-zero forces on both sides');
  }
  const winner =
    attackerBase.effectivePower > defenderBase.effectivePower ? 'attacker' : 'defender';
  const winnerPower =
    winner === 'attacker' ? attackerBase.effectivePower : defenderBase.effectivePower;
  const loserPower =
    winner === 'attacker' ? defenderBase.effectivePower : attackerBase.effectivePower;
  const ratio = winnerPower / loserPower;
  const loserRate = clamp(0.28 + 0.08 * (ratio - 1), 0.28, 0.45);
  const winnerRate = clamp(0.18 - 0.04 * (ratio - 1), 0.08, 0.18);
  const attackerRate = winner === 'attacker' ? winnerRate : loserRate;
  const defenderRate = winner === 'defender' ? winnerRate : loserRate;
  const attackerCasualties = Math.min(
    attackerBase.baseForce,
    Math.round(attackerBase.baseForce * attackerRate),
  );
  const defenderCasualties = Math.min(
    defenderBase.baseForce,
    Math.round(defenderBase.baseForce * defenderRate),
  );
  const attacker: BattleSideResult = {
    ...attackerBase,
    casualties: attackerCasualties,
    survivors: attackerBase.baseForce - attackerCasualties,
  };
  const defender: BattleSideResult = {
    ...defenderBase,
    casualties: defenderCasualties,
    survivors: defenderBase.baseForce - defenderCasualties,
  };
  return {
    attacker,
    casualtyRatio: ratio,
    defender,
    major: seatChangesControl || attackerBase.baseForce + defenderBase.baseForce >= 250,
    reasons: [
      `attacker ${attackerBase.baseForce} × ${attackerBase.commanderMultiplier.toFixed(2)} commander × ${attackerBase.fortune.toFixed(3)} fortune`,
      `defender ${defenderBase.baseForce} × ${defenderBase.commanderMultiplier.toFixed(2)} commander × ${defenderBase.terrainMultiplier.toFixed(2)} terrain × ${defenderBase.fortificationMultiplier.toFixed(2)} fortification × ${defenderBase.fortune.toFixed(3)} fortune`,
      winner === 'attacker'
        ? 'attacker effective power is higher'
        : 'defender wins equal or higher effective power',
    ],
    winner,
  };
}
