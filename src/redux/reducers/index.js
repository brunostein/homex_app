/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import apiReducer from './api';
import userLoggedReducer from './user';
import homeReducer from './home';
import categoryReducer from './category';
import {combineReducers} from 'redux';

const reducers = combineReducers({
  api: apiReducer,
  user: userLoggedReducer,
  home: homeReducer,
  category: categoryReducer
});

export default reducers;
