/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import {SET_VIEW_HOME, SET_USER_HOMES} from '../actions/home';

const initialState = {
  homes: null,
  viewHome: null,
  lastRefresh: null
}

const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_VIEW_HOME:
      return {...state, viewHome: action.payload};
    case SET_USER_HOMES:
      return {...state, homes: action.payload};
    default:
      return state;
  }
};

export default homeReducer;
