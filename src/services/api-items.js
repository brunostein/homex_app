/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import axiosRequest from './axios-request'
import config from '../config'

export const getItems = async (categoryId) => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.get(`${BASE_URL}/homex/items/get-by?field=category_id&value=${categoryId}`)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const createItem = async (data) => {
  const BASE_URL = config.api.host;

  const result = await axiosRequest.post(`${BASE_URL}/homex/items/create`, data)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const updateItem = async (itemId, data) => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.put(`${BASE_URL}/homex/items/update/${itemId}`, data)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}

export const removeItem = async (itemId) => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.delete(`${BASE_URL}/homex/items/remove/${itemId}`)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}