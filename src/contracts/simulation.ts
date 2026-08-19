export type {
  DomainModule,
  DomainTransition,
  KernelCommand,
  KernelRegistry,
  KernelResult,
  ScheduledResolver,
  ScheduleInput,
  SimulationEffect,
} from '../sim/kernel';
export {
  advanceScheduler,
  applyCommand,
  createKernelRegistry,
  DAWN_PRIORITY,
  scheduleItem,
} from '../sim/kernel';
export type { GameState } from '../sim/state';
