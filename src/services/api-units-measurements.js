/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import axiosRequest from './axios-request'
import config from '../config'

export const getUnitsMeasurements = async () => {
  const BASE_URL = config.api.host;
  const result = await axiosRequest.get(`${BASE_URL}/homex/units-measurements/get`)
    .then(({data}) => {
      return data;
  })
  .catch (err => {
    console.log(err);
  });
  return result;
}
