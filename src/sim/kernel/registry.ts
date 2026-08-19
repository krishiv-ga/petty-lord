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

export function createKernelRegistry<E extends DomainExtensions>(
  modules: readonly DomainModule<E>[],
): KernelRegistry<E> {
  const registry: KernelRegistry<E> = {
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
    registerUnique(registry.debugHandlers, module.debugHandlers ?? {}, 'debug handler');
    registerUnique(registry.decisionResolvers, module.decisionResolvers ?? {}, 'decision resolver');
    registerUnique(
      registry.initiativeCancellers,
      module.initiativeCancellers ?? {},
      'initiative canceller',
    );
    registerUnique(
      registry.initiativeStarters,
      module.initiativeStarters ?? {},
      'initiative starter',
    );
    registerUnique(
      registry.scheduledResolvers,
      module.scheduledResolvers ?? {},
      'scheduled resolver',
    );
  }
  return registry;
}
