/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import axiosRequest from './axios-request'
import config from '../config'

export const signIn = async (email, password) => {
  const BASE_URL = config.api.host;
  const postData = {
    email,
    password
  };

  const result = await axiosRequest.post(`${BASE_URL}/homex/users/signin?relations=homes,homes_shared`, postData)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const getUserById = async (userId) => {
  const BASE_URL = config.api.host;

  const result = await axiosRequest.get(`${BASE_URL}/homex/users/get/${userId}?relations=homes,homes_shared`)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const signUp = async (userData) => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.post(`${BASE_URL}/homex/users/create`, userData)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}
