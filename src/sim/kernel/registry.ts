import type { DomainExtensions } from '../state/types';
import type { DomainModule, KernelRegistry } from './types';

function registerUnique<T>(
  target: Map<string, T>,
  source: Record<string, T>,
  category: string,
): void {
  for (const [key, value] of Object.entries(source)) {
    if (target.has(key)) {
      throw new Error(`Duplicate ${category} registration for ${key}`);
    }
    target.set(key, value);
  }
}

function readonlyMap<K, V>(source: Map<K, V>): ReadonlyMap<K, V> {
  const view: ReadonlyMap<K, V> = {
    get size() {
      return source.size;
    },
    entries: () => source.entries(),
    forEach: (callback, thisArg) =>
      source.forEach((value, key) => {
        callback.call(thisArg, value, key, view);
      }),
    get: (key) => source.get(key),
    has: (key) => source.has(key),
    keys: () => source.keys(),
    values: () => source.values(),
    [Symbol.iterator]: () => source[Symbol.iterator](),
  };
  return Object.freeze(view);
}

export function createKernelRegistry<E extends DomainExtensions>(
  modules: readonly DomainModule<E>[],
): KernelRegistry<E> {
  const mutable = {
    debugHandlers: new Map(),
    decisionResolvers: new Map(),
    initiativeCancellers: new Map(),
    initiativeStarters: new Map(),
    scheduledResolvers: new Map(),
  };
  const moduleIds = new Set<string>();
  for (const module of modules) {
    if (moduleIds.has(module.id)) {
      throw new Error(`Duplicate domain module id ${module.id}`);
    }
    moduleIds.add(module.id);
    registerUnique(mutable.debugHandlers, module.debugHandlers ?? {}, 'debug handler');
    registerUnique(mutable.decisionResolvers, module.decisionResolvers ?? {}, 'decision resolver');
    registerUnique(
      mutable.initiativeCancellers,
      module.initiativeCancellers ?? {},
      'initiative canceller',
    );
    registerUnique(
      mutable.initiativeStarters,
      module.initiativeStarters ?? {},
      'initiative starter',
    );
    registerUnique(
      mutable.scheduledResolvers,
      module.scheduledResolvers ?? {},
      'scheduled resolver',
    );
  }
  return Object.freeze({
    debugHandlers: readonlyMap(mutable.debugHandlers),
    decisionResolvers: readonlyMap(mutable.decisionResolvers),
    initiativeCancellers: readonlyMap(mutable.initiativeCancellers),
    initiativeStarters: readonlyMap(mutable.initiativeStarters),
    scheduledResolvers: readonlyMap(mutable.scheduledResolvers),
  });
}
