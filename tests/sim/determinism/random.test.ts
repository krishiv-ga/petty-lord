import { describe, expect, it } from 'vitest';
import {
  createRandomState,
  drawOrUseSnapshot,
  RandomSession,
} from '../../../src/sim/random/random';

describe('seeded random adapter', () => {
  it('defines inclusive integers, half-open floats, chance, selection and shuffle deterministically', () => {
    const first = new RandomSession(createRandomState('adapter-seed'));
    const second = new RandomSession(createRandomState('adapter-seed'));
    const draw = (random: RandomSession) => ({
      chance: random.chance('chance', 0.4),
      float: random.float('float'),
      integer: random.integer('integer', -2, 2),
      selected: random.select('select', ['a', 'b', 'c']),
      shuffled: random.shuffle('shuffle', [1, 2, 3, 4]),
    });
    const firstDraw = draw(first);
    const secondDraw = draw(second);
    expect(firstDraw).toEqual(secondDraw);
    expect(firstDraw.integer).toBeGreaterThanOrEqual(-2);
    expect(firstDraw.integer).toBeLessThanOrEqual(2);
    expect(firstDraw.float).toBeGreaterThanOrEqual(0);
    expect(firstDraw.float).toBeLessThan(1);
    expect(first.exportState()).toBe(second.exportState());
    expect(first.trace().map((entry) => entry.label)).toEqual(
      second.trace().map((entry) => entry.label),
    );
  });

  it('stores a draw once so later resolution cannot reroll it', () => {
    const state = createRandomState('snapshot-seed');
    const first = drawOrUseSnapshot(state, {}, 'casualties', (random) =>
      random.integer('battle.casualties', 0, 20),
    );
    const second = drawOrUseSnapshot(first.randomState, first.storedDraws, 'casualties', (random) =>
      random.integer('battle.casualties', 0, 20),
    );
    expect(second.value).toBe(first.value);
    expect(second.wasStored).toBe(true);
    expect(second.randomState).toBe(first.randomState);
    expect(second.trace).toEqual([]);
  });

  it('preserves 64 bits of stable string-seed entropy', () => {
    expect(createRandomState('18l1cn2-169a')).not.toBe(createRandomState('1dsiqji-19fy'));
    expect(createRandomState('repeatable-seed')).toBe(createRandomState('repeatable-seed'));
  });
});
