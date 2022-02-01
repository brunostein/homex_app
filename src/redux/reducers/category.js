/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import {SET_CATEGORIES} from '../actions/category';

const initialState = {
  categories: [],
  lastRefresh: null
}

const categoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CATEGORIES:
      return {...state, categories: action.payload};
    default:
      return state;
  }
};

export default categoryReducer;
