/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import axiosRequest from './axios-request'
import { getState } from '../helpers/app-helper'
import config from '../config'

export const refreshToken = async () => {

  const BASE_URL = config.api.host;
  const apiData = getState('api').api;
  
  const postData = {
    username: apiData.username,
    refresh_token: apiData.refresh_token
  }

  const result = await axiosRequest.post(`${BASE_URL}/accounts/refresh-token`, postData)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result
}

export const signIn = async () => {
  const BASE_URL = config.api.host;
  const postData = {
    username: config.api.user,
    password: config.api.pass
  };
  const result = await axiosRequest.post(`${BASE_URL}/accounts/signin`, postData)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}
