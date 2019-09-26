// @flow
import type { State } from "./reducer";

type GlobalState = {
  +thunks: State
};

export function getLoadingCount(state: GlobalState, id: string) {
  const requests = state.thunks.requests[id] || [];

  return requests.length;
}

export function isLoaded(state: GlobalState, id: string): boolean {
  const requests = state.thunks.requests[id] || [];
  return requests.length === 0;
}

export function isLoading(state: GlobalState, id: string): boolean {
  return !isLoaded(state, id);
}

export function getError(state: GlobalState, id: string): {} {
  return state.thunks.errors[id];
}

export function hasError(state: GlobalState, id: string): boolean {
  return !!getError(state, id);
}
