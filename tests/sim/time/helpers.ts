import { canonicalGameContent } from '../../../src/contracts/content';
import type { FoundationDomainExtensions } from '../../../src/contracts/state';
import { createFoundationGameState } from '../../../src/contracts/state';
import type { KernelCommand, SimulationEffect } from '../../../src/sim/kernel';
import { applyCommand, createKernelRegistry } from '../../../src/sim/kernel';
import {
  createWp020DomainModule,
  createWp020GameState,
  type Wp020GameState,
} from '../../../src/sim/systems/time';

export const content = canonicalGameContent;

export function setup(seed = 'wp020-test'): {
  readonly registry: ReturnType<typeof createKernelRegistry<FoundationDomainExtensions>>;
  readonly state: Wp020GameState;
} {
  const foundation = createFoundationGameState({ content, seed });
  return {
    registry: createKernelRegistry<FoundationDomainExtensions>([createWp020DomainModule(content)]),
    state: createWp020GameState(foundation, content),
  };
}

export function run(
  state: Wp020GameState,
  registry: ReturnType<typeof createKernelRegistry<FoundationDomainExtensions>>,
  command: KernelCommand,
): { readonly effects: readonly SimulationEffect[]; readonly state: Wp020GameState } {
  const result = applyCommand(state, command, registry);
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
  return { effects: result.effects, state: result.state as unknown as Wp020GameState };
}

export function tryRun(
  state: Wp020GameState,
  registry: ReturnType<typeof createKernelRegistry<FoundationDomainExtensions>>,
  command: KernelCommand,
) {
  return applyCommand(state, command, registry);
}
