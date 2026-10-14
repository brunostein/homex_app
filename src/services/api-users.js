/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import axiosRequest from './axios-request'
import config from '../config'

export const signIn = async (email, password) => {
  const { data } = await axiosRequest.post(`${config.api.host}/homex/users/signin?relations=homes,homes_shared`, { email, password });
  return data;
};

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
  const { data } = await axiosRequest.post(`${config.api.host}/homex/users/create`, userData);
  return data;
};
