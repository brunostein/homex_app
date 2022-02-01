/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

export const SET_API_DATA = 'SET_API_DATA';
export const RESET_API_DATA = 'RESET_API_DATA';

export const setApiData = (data) => ({
  type: SET_API_DATA,
  payload: data
});

export const resetApiData = () => ({
  type: RESET_API_DATA
});
