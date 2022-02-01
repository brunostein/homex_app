/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import axiosRequest from './axios-request'
import config from '../config'

export const getUserHomes = async (userId) => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.get(`${BASE_URL}/homex/homes/get-by?field=user_id&value=${userId}`)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const getHomeById = async (homeId) => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.get(`${BASE_URL}/homex/homes/get/${homeId}?relations=shared_users`)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const shareHome = async (homeId, data) => {
  const BASE_URL = config.api.host;

  const result = await axiosRequest.post(`${BASE_URL}/homex/homes/share/${homeId}`, data)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const createHome = async (data) => {
  const BASE_URL = config.api.host;

  const result = await axiosRequest.post(`${BASE_URL}/homex/homes/create`, data)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const updateHome = async (homeId, data) => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.put(`${BASE_URL}/homex/homes/update/${homeId}`, data)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const removeHome = async (homeId) => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.delete(`${BASE_URL}/homex/homes/remove/${homeId}`)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}