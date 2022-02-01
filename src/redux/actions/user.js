/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

export const SET_LOGGED_USER = 'SET_LOGGED_USER';
export const SET_NEED_NEW_AUTH = 'SET_NEED_NEW_AUTH';
export const RESET_LOGGED_USER = 'RESET_LOGGED_USER';

export const setLoggedUser = (data) => ({
  type: SET_LOGGED_USER,
  payload: data
});

export const setNeedNewAuth = (data) => ({
  type: SET_NEED_NEW_AUTH,
  payload: data
});

export const resetLoggedUser = () => ({
    type: RESET_LOGGED_USER
});
