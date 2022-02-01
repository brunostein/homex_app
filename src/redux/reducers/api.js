/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import {
  SET_API_DATA, RESET_API_DATA, 
} from '../actions/api';

const initialState = {
  api: null
}

const apiReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_API_DATA:
      return {...state, api: action.payload };
    case RESET_API_DATA:
      return {...state, api: null };
    default:
      return state;
  }
};

export default apiReducer;
