import { createStore } from 'zustand/vanilla';

type BootstrapState = {
  readonly ready: boolean;
};

export const bootstrapStore = createStore<BootstrapState>(() => ({ ready: true }));
