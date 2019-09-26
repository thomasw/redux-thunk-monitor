// @flow
type setLoadingAction = { type: "THUNKMONITOR/SET_LOADING", id: string };
type setLoadedAction = { type: "THUNKMONITOR/SET_LOADED", id: string };
type setErrorAction = { type: "THUNKMONITOR/SET_ERROR", id: string, error: {} };

export type ThunkMonitorAction =
  | setLoadingAction
  | setLoadedAction
  | setErrorAction;

export type Dispatch = any => any;
export type GetState = () => any;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type MonitoredThunk = {
  (dispatch: Dispatch, getState: GetState): any,
  monitorId: string
};

export function setLoading(id: string): ThunkMonitorAction {
  return {
    type: "THUNKMONITOR/SET_LOADING",
    id
  };
}

export function setLoaded(id: string): ThunkMonitorAction {
  return {
    type: "THUNKMONITOR/SET_LOADED",
    id
  };
}

export function setError(id: string, error: {}): ThunkMonitorAction {
  return {
    type: "THUNKMONITOR/SET_ERROR",
    id,
    error
  };
}

export function monitorThunk(
  action: ThunkAction,
  monitorId: string
): MonitoredThunk {
  const monitoredThunk: MonitoredThunk = action;
  monitoredThunk.monitorId = monitorId;
  return monitoredThunk;
}
