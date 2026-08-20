import { describe, expect, it } from 'vitest';
import { resolveBattle } from '../../../src/sim/systems/military/battle';

describe('deterministic abstract battle', () => {
  it('uses exact canonical factors, defender tie rule and bounded persistent casualties', () => {
    const input = {
      allocations: [
        {
          garrisonEligible: true,
          ownerId: 'greyfen' as const,
          sourceId: 'levy:greyfen',
          sourceKind: 'levy' as const,
          troops: 300,
        },
      ],
      commanderMultiplier: 1,
      fortificationMultiplier: 1,
      fortune: 1,
      terrainMultiplier: 1,
    };
    const tie = resolveBattle(input, input, false);
    expect(tie.winner).toBe('defender');
    expect(tie.attacker.casualties).toBe(84);
    expect(tie.defender.casualties).toBe(54);
    expect(tie.attacker.survivors + tie.attacker.casualties).toBe(300);
    expect(tie.defender.survivors + tie.defender.casualties).toBe(300);
    expect(tie.reasons).toContain('defender wins equal or higher effective power');
    expect(resolveBattle(input, input, false)).toEqual(tie);
  });

  it('clamps fortune and casualties instead of generating or returning troops', () => {
    const attacker = {
      allocations: [
        {
          garrisonEligible: true,
          ownerId: 'edric' as const,
          sourceId: 'levy:edric',
          sourceKind: 'levy' as const,
          troops: 600,
        },
      ],
      commanderMultiplier: 1.1,
      fortificationMultiplier: 1,
      fortune: 1.08,
      terrainMultiplier: 1,
    };
    const defender = {
      allocations: [
        {
          garrisonEligible: false,
          ownerId: 'mara' as const,
          sourceId: 'levy:mara',
          sourceKind: 'levy' as const,
          troops: 100,
        },
      ],
      commanderMultiplier: 1,
      fortificationMultiplier: 1.1,
      fortune: 0.92,
      terrainMultiplier: 1,
    };
    const result = resolveBattle(attacker, defender, true);
    expect(result.winner).toBe('attacker');
    expect(result.attacker.casualties).toBeGreaterThanOrEqual(48);
    expect(result.attacker.casualties).toBeLessThanOrEqual(108);
    expect(result.defender.casualties).toBeLessThanOrEqual(45);
    expect(() => resolveBattle({ ...attacker, fortune: 1.081 }, defender, true)).toThrow(
      'fortune must not exceed 1.08',
    );
  });
});
