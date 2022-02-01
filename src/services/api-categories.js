/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import axiosRequest from './axios-request'
import config from '../config'

export const getCategories = async (homeId) => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.get(`${BASE_URL}/homex/categories/get-by?field=home_id&value=${homeId}&relations=items`)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const createCategory = async (data) => {
  const BASE_URL = config.api.host;

  const result = await axiosRequest.post(`${BASE_URL}/homex/categories/create`, data)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const updateCategory = async (categoryId, data) => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.put(`${BASE_URL}/homex/categories/update/${categoryId}`, data)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const removeCategory = async (categoryId) => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.delete(`${BASE_URL}/homex/categories/remove/${categoryId}`)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}