/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

export const SET_VIEW_HOME = 'SET_VIEW_HOME';
export const SET_USER_HOMES = 'SET_USER_HOMES';

export const setViewHome = (data) => ({
  type: SET_VIEW_HOME,
  payload: data
});

export const setUserHomes = (data) => ({
  type: SET_USER_HOMES,
  payload: data
});
