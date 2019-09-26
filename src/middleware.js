// @flow
import { setLoading, setLoaded, setError } from "./actions";
import type { Dispatch, GetState, MonitoredThunk } from "./actions";

type Exception = {
  data?: {}
};
type Error = {
  +message?: string
};

function getErrorData(exc: Exception): Error {
  const errorHasData = exc.data && Object.keys(exc.data).length;
  const excData = (errorHasData && exc.data) || {};

  return { message: "Operation failure.", ...excData };
}

function recordError(
  exc: Exception,
  monitorId: string,
  dispatch: Dispatch
): void {
  dispatch(setError(monitorId, getErrorData(exc)));
}

function monitoredAction(action: MonitoredThunk) {
  const { monitorId } = action;
  const loadingAction = setLoading(monitorId);
  const loadedAction = setLoaded(monitorId);

  async function asyncMonitoredAction(dispatch: Dispatch, getState: GetState) {
    let result;

    dispatch(loadingAction);

    try {
      result = await action(dispatch, getState);
    } catch (exc) {
      recordError(exc, monitorId, dispatch);
      dispatch(loadedAction);
      throw exc;
    }

    dispatch(loadedAction);

    return result;
  }

  return asyncMonitoredAction;
}

const thunkMonitor = () => (next: any) => (action: any) => {
  if (action.monitorId) {
    action = monitoredAction(action);
  }

  return next(action);
};

export { thunkMonitor };
