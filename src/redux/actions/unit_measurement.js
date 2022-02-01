/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

export const SET_UNITS_MEASUREMENTS = 'SET_UNITS_MEASUREMENTS';

export const setUnitsMeasurements = (data) => ({
  type: SET_UNITS_MEASUREMENTS,
  payload: data
});
