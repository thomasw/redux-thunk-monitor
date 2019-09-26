# redux-thunk-monitor

[![build status](https://img.shields.io/travis/thomasw/redux-thunk-monitor/master.svg?style=flat-square)](https://travis-ci.org/thomasw/redux-thunk-monitor)
[![npm version](https://img.shields.io/npm/v/redux-thunk-monitor.svg?style=flat-square)](https://www.npmjs.com/package/redux-thunk-monitor)
[![npm downloads](https://img.shields.io/npm/dm/redux-thunk-monitor.svg?style=flat-square)](https://www.npmjs.com/package/redux-thunk-monitor)

redux-thunk-monitor provides an automatic, generic way to record redux-thunk loading/error disposition in your application state. Relevant consumers can read loading/error data directly from state rather than explicitly monitoring and passing this information around to descendants.

## Installation

```
npm install --save redux-thunk-monitor
```

Install the reducer at the key 'thunks':

```js
import { thunkMonitorReducer } from "redux-thunk-monitor";
import { combineReducers } from "redux";

const reducer = combineReducers({
  // your stuff,
  thunks: thunkMonitorReducer
});
```

Currently, the key is not configureable. The reducer must be installed at the top level `thunks` key.

Install the middleware:

```js
import { thunk } from "redux-thunk";
import { thunkMonitor } from "redux-thunk-monitor";

const store = createStore(rootReducer, applyMiddleware(thunk, thunkMonitor));
```

**State persistence**: It's highly unlikely that preserving loading status in an app's persisted state would be useful. Monitored thunks are presumably destroyed when the application is terminated. Take care to exclude the `thunks` key from any state persistence/rehydration mechanisms you have in place.

## Usage

Monitoring a given thunk simply requires assigning an id. You can do this in your action creators:

```js
import { monitorThunk } from "redux-thunk-monitor";

export function getProfile() {
  async function getProfileAsync(dispatch, getState) {
    const userProfile = await apiClient.get_profile();
    // ...
  }

  monitorThunk(getProfileAsync, "userLoading");

  return getProfileAsync;
}
```

If you want to monitor the loading state for a series of unique objects and don't want loading one to trigger a loading state for the others, be sure to make your monitor id unique to each object:

```js
export function getTodo(id) {
  async function getTodoAsync(dispatch, getState) {
    const userProfile = await apiClient.get_todo(id);
    // ...
  }

  monitorThunk(getTodoAsync, `todoLoading:${id}`);

  return getTodoAsync;
}
```

Note that any exceptions the thunk raises are preserved. Logic as follows will continue to work as though the thunk was unmonitored:

```js
try {
  await dispatch(getProfile());
} catch (e) {
  dispatch(logOut());
}

dispatch(getProfile()).catch(() => dispatch(logOut()));
```

Once an action is monitored, components can check on the id's loading or error state using the library's state selectors:

```js
import React from "react";
import { connect } from "react-redux";
import {
  getLoadingCount,
  isLoaded,
  isLoading,
  getError,
  hasError
} from "redux-thunk-monitor";

export function MyLoader(props) {
  if (props.isLoaded) return <p>Loaded</p>;
  if (props.isLoading) return <p>Loading {props.loadingCount}</p>;
  if (props.hasError) return <p>Failure. {renderError(props.error)}</p>;
}

function stateToProps(state) {
  return {
    loadingCount: getLoadingCount(state, "UserLoading"),
    isLoaded: isLoaded(state, "userLoading"),
    isLoading: isLoading(state, "userLoading"),
    hasError: hasError(state, "userLoading"),
    error: getError(state, "userLoading")
  };
}

export default connect(stateToProps)(MyLoader);
```

If any invocation of a specified monitor id is running anywhere in the app, `isLoading(...)` will return True. For example, if multiple parts of your app trigger simultaneous loading requests for the current user's profile, `isLoading(state, "userLoading")` will return True as long as any of those thunks is executing.

If this is not the desired behavior, ensure that each invocation is using a unique monitor id:

```js
isLoading(state, "todoItem:264e1ac1-2ed3-4c39-b184-3bb61525919c");
```

Error state is cleared automatically whenever any executing instance of a monitored thunk succeeds.

```js
await dispatch(getUserProfile()); // fails
getError(state, "userProfile"); // { message: "....", ...error.data}
hasError(state, "userProfile"); // true
await dispatch(getUserProfile()); // succeeds
hasError(state, "userProfile"); // false
```

### Error data via state

When an exception is encountered, redux-thunk-monitor looks for a data attribute on the exception and records that value to the state. You can use this functionality to, for example, automatically record server-sider form validation errors in the application state.

```js
import { monitorThunk } from "redux-thunk-monitor";

function ApiError(error) {
  const apiError = Error("API Failure");
  // apiError.data will be stored in the state when redux-thunk-monitor
  // records the error
  apiError.data = getApiErrorData(error);
  return apiError;
}

function normalizeApiError(error) {
  if (!isApiError(error)) throw error;
  throw ApiError(error);
}

export function getProfile() {
  async function getProfileAsync(dispatch, getState) {
    const profile = await apiClient.get_profile().catch(normalizeApiError);
  }

  monitorThunk(getProfileAsync, "userLoading");

  return getProfileAsync;
}
```

This behavior is not currently configurable.
