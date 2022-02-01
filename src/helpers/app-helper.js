/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import {store} from '../redux/store'

export const getState = (state = "") => {
  let appState = store.getState();
  
  if (appState !== null) {
    if (state !== "") {
      if (appState[state] !== undefined) {
        return appState[state];
      }
    } else {
      return appState;
    }
  }
  return null;
}

export const dispatchState = (dispatch) => {
  return store.dispatch(dispatch);
}
