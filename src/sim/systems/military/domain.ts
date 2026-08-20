import type { FoundationDomainExtensions, FoundationGameState } from '../../../contracts/state';
import type { JsonValue } from '../../state/json';
import type { GameState } from '../../state/types';
import type { MilitaryState } from './types';

export type MilitaryDomainExtensions = Omit<FoundationDomainExtensions, 'systems'> & {
  readonly systems: {
    readonly knowledge: JsonValue;
    readonly politics: JsonValue;
    readonly time: JsonValue;
    readonly war: MilitaryState;
  };
};

export type MilitaryGameState = GameState<MilitaryDomainExtensions>;

export function installMilitaryState(
  state: FoundationGameState,
  military: MilitaryState,
): MilitaryGameState {
  return {
    ...state,
    systems: { ...state.systems, war: military },
  } as MilitaryGameState;
}

export function replaceMilitaryState(
  state: MilitaryGameState,
  military: MilitaryState,
): MilitaryGameState {
  return { ...state, systems: { ...state.systems, war: military } };
}
