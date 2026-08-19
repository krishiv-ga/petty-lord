import { uniformFloat64 } from 'pure-rand/distribution/uniformFloat64';
import { uniformInt } from 'pure-rand/distribution/uniformInt';
import { xoroshiro128plusFromState } from 'pure-rand/generator/xoroshiro128plus';
import type { JsonValue } from '../state/json';
import { cloneJson } from '../state/json';
import type { RandomDrawTrace } from '../state/types';

const RANDOM_STATE_VERSION = 1;
const RANDOM_ALGORITHM = 'xoroshiro128plus';

interface SerializedRandomState {
  algorithm: typeof RANDOM_ALGORITHM;
  state: number[];
  version: typeof RANDOM_STATE_VERSION;
}

function hashSeed64(seed: string): bigint {
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < seed.length; index += 1) {
    const codeUnit = seed.charCodeAt(index);
    hash ^= BigInt(codeUnit & 0xff);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
    hash ^= BigInt(codeUnit >>> 8);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash;
}

function stateFromSeed(seed: string): number[] {
  const hash = hashSeed64(seed);
  const low = Number(hash & 0xffff_ffffn) | 0;
  const high = Number((hash >> 32n) & 0xffff_ffffn) | 0;
  return [high, low, ~high, ~low];
}

function encodeState(state: readonly number[]): string {
  return JSON.stringify({
    algorithm: RANDOM_ALGORITHM,
    state: [...state],
    version: RANDOM_STATE_VERSION,
  } satisfies SerializedRandomState);
}

function decodeState(serialized: string): SerializedRandomState {
  let candidate: unknown;
  try {
    candidate = JSON.parse(serialized);
  } catch {
    throw new TypeError('PRNG state is not valid JSON');
  }
  if (
    candidate === null ||
    typeof candidate !== 'object' ||
    !('version' in candidate) ||
    candidate.version !== RANDOM_STATE_VERSION ||
    !('algorithm' in candidate) ||
    candidate.algorithm !== RANDOM_ALGORITHM ||
    !('state' in candidate) ||
    !Array.isArray(candidate.state) ||
    candidate.state.length === 0 ||
    !candidate.state.every((entry) => Number.isInteger(entry))
  ) {
    throw new TypeError('PRNG state has an unsupported shape or algorithm');
  }
  return candidate as SerializedRandomState;
}

export function createRandomState(seed: string): string {
  return encodeState(xoroshiro128plusFromState(stateFromSeed(seed)).getState());
}

export function validateRandomState(serialized: string): void {
  const decoded = decodeState(serialized);
  xoroshiro128plusFromState(decoded.state);
}

export class RandomSession {
  readonly #generator;
  readonly #trace: RandomDrawTrace[] = [];

  constructor(serializedState: string) {
    const decoded = decodeState(serializedState);
    this.#generator = xoroshiro128plusFromState(decoded.state);
  }

  #record(label: string, result: JsonValue): void {
    this.#trace.push({ label, result: cloneJson(result), stateAfter: this.exportState() });
  }

  integer(label: string, minimumInclusive: number, maximumInclusive: number): number {
    if (
      !Number.isSafeInteger(minimumInclusive) ||
      !Number.isSafeInteger(maximumInclusive) ||
      minimumInclusive > maximumInclusive
    ) {
      throw new RangeError('integer bounds must be ordered safe integers');
    }
    const result = uniformInt(this.#generator, minimumInclusive, maximumInclusive);
    this.#record(label, result);
    return result;
  }

  float(label: string): number {
    const result = uniformFloat64(this.#generator);
    this.#record(label, result);
    return result;
  }

  chance(label: string, probability: number): boolean {
    if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
      throw new RangeError('chance probability must be between 0 and 1 inclusive');
    }
    const result = uniformFloat64(this.#generator) < probability;
    this.#record(label, result);
    return result;
  }

  select<T>(label: string, values: readonly T[]): T {
    if (values.length === 0) {
      throw new RangeError('cannot select from an empty collection');
    }
    const index = this.integer(`${label}.index`, 0, values.length - 1);
    return values[index] as T;
  }

  shuffle<T>(label: string, values: readonly T[]): T[] {
    const shuffled = [...values];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const replacementIndex = this.integer(`${label}[${index}]`, 0, index);
      const current = shuffled[index] as T;
      shuffled[index] = shuffled[replacementIndex] as T;
      shuffled[replacementIndex] = current;
    }
    return shuffled;
  }

  exportState(): string {
    return encodeState(this.#generator.getState());
  }

  trace(): RandomDrawTrace[] {
    return cloneJson(this.#trace);
  }
}

export interface SnapshotDrawResult<T extends JsonValue> {
  randomState: string;
  storedDraws: Record<string, JsonValue>;
  trace: RandomDrawTrace[];
  value: T;
  wasStored: boolean;
}

export function drawOrUseSnapshot<T extends JsonValue>(
  randomState: string,
  storedDraws: Record<string, JsonValue>,
  key: string,
  draw: (random: RandomSession) => T,
): SnapshotDrawResult<T> {
  if (Object.hasOwn(storedDraws, key)) {
    return {
      randomState,
      storedDraws: cloneJson(storedDraws),
      trace: [],
      value: cloneJson(storedDraws[key] as T),
      wasStored: true,
    };
  }
  const random = new RandomSession(randomState);
  const value = draw(random);
  return {
    randomState: random.exportState(),
    storedDraws: { ...cloneJson(storedDraws), [key]: cloneJson(value) },
    trace: random.trace(),
    value,
    wasStored: false,
  };
}
