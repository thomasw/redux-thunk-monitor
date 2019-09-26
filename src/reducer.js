// @flow
import type { ThunkMonitorAction } from "./actions";

export type State = {
  +requests: {
    +[thunkId: string]: Array<string>
  },
  +errors: {
    +[thunkId: string]: {}
  }
};

const INITIAL_STATE: State = {
  requests: {},
  errors: {}
};

function setLoading(state: State, id: string): State {
  return {
    ...state,
    requests: {
      ...state.requests,
      [id]: [...(state.requests[id] || []), "loading"]
    },
    errors: {
      ...state.errors,
      // We reset any errors anytime we trigger a new loading state.
      [id]: undefined
    }
  };
}

function setLoaded(state: State, id: string): State {
  const requests = [...(state.requests[id] || [])];

  requests.pop();

  return {
    ...state,
    requests: {
      ...state.requests,
      [id]: requests
    }
  };
}

function setError(state: State, id: string, error: {}): State {
  return {
    ...state,
    errors: {
      ...state.errors,
      [id]: { ...error }
    }
  };
}

export function reducer(
  state: State = INITIAL_STATE,
  action: ThunkMonitorAction
): State {
  switch (action.type) {
    case "THUNKMONITOR/SET_LOADING":
      return setLoading(state, action.id);
    case "THUNKMONITOR/SET_LOADED":
      return setLoaded(state, action.id);
    case "THUNKMONITOR/SET_ERROR":
      return setError(state, action.id, action.error);
  }

  return state;
}
