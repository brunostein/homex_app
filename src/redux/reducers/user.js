/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import {SET_LOGGED_USER, SET_NEED_NEW_AUTH, RESET_LOGGED_USER} from '../actions/user';

const initialState = {
  user: null,
  needNewAuth: false
}

const userLoggedReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOGGED_USER:
      if (state.user !== null) {
        return {...state, user: Object.assign(state.user, action.payload)};
      }
      return {...state, user: action.payload};
    case SET_NEED_NEW_AUTH:
      return {...state, needNewAuth: action.payload};
    case RESET_LOGGED_USER:
      return initialState;
    default:
      return state;
  }
};

export default userLoggedReducer;
