/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import {SET_UNITS_MEASUREMENTS} from '../actions/unit_measurement';

const initialState = {
  units_measurements: [],
  lastRefresh: null
}

const unitMeasurementReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_UNITS_MEASUREMENTS:
      return {...state, units_measurements: action.payload};
    default:
      return state;
  }
};

export default unitMeasurementReducer;
