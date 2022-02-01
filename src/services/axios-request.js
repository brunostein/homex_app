/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import axios from 'axios'
import { refreshToken, signIn } from './api-accounts'
import { getState, dispatchState } from '../helpers/app-helper'
import { setNeedNewAuth } from '../redux/actions/user'
import { setApiData, resetApiData } from '../redux/actions/api'

const axiosApiInstance = axios.create();

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    try {
      let apiData = getState('api').api;

      // SIGNIN API
      if (!config.url.match(/accounts\/signin/) && apiData === null) {
        console.log("AUTHENTICATE API");
        
        let res = await signIn();
        if (res !== null && res.success !== undefined && res.success === true) {
          dispatchState(setApiData(res.data));
          apiData = getState('api').api;
        }
      }

      config.headers = { 
        'Content-Type': 'application/json',
      }

      if (apiData !== null) {
        config.headers['Authorization'] = `${apiData.token_type} ${apiData.access_token}`;
      }
      return config;
    } catch (err) {
      console.log("Interceptor set Access Token error" + err);
    }
  },
  error => {
    Promise.reject(error)
});

// Response interceptor for API calls
axiosApiInstance.interceptors.response.use((response) => {
  return response
}, async function (error) {
  try {
    const originalRequest = error.config;

    if (error.response !== undefined && 
      error.response.status === 401) {
        
      if (originalRequest.url.match(/accounts\/refresh-token/) || originalRequest.url.match(/accounts\/signin/)) {
        console.log("ERROR 401 refresh-token or signIn: " + originalRequest.url);
        dispatchState(resetApiData());
        dispatchState(setNeedNewAuth(true));
        return;
      } else {
      
        console.log("REFRESH TOKEN");

        // REFRESH TOKEN
        const apiData = getState('api').api;

        let res = await refreshToken();

        if (res !== undefined && res.success === true && res.data.access_token !== undefined) {      
          dispatchState(setApiData(res.data));
          axios.defaults.headers.common['Authorization'] = 'JWT ' + res.data.access_token;
          return axiosApiInstance(originalRequest);
        } else {
          dispatchState(resetApiData());
          dispatchState(setNeedNewAuth(true));
        }
      }
    }
  } catch (err) {
    console.log("Interceptor Refresh Token error" + err);
  }

  return Promise.reject(error);
});

export default axiosApiInstance;
