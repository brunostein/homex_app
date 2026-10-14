/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

import axios from 'axios';
import config from '../config';
import { getState, dispatchState } from '../helpers/app-helper';
import { setNeedNewAuth } from '../redux/actions/user';
import { setApiData, resetApiData } from '../redux/actions/api';

// Authentication uses a separate client so its failures cannot recurse through interceptors.
const authClient = axios.create({ timeout: 15000 });
const axiosApiInstance = axios.create({ timeout: 15000 });
let signInPromise;
let refreshPromise;

const authenticate = async (refresh = false) => {
  const apiData = getState('api').api;
  const endpoint = refresh ? 'refresh-token' : 'signin';
  const payload = refresh
    ? { username: apiData?.username, refresh_token: apiData?.refresh_token }
    : { username: config.api.user, password: config.api.pass };
  const { data } = await authClient.post(`${config.api.host}/accounts/${endpoint}`, payload);
  if (!data?.success || !data.data?.access_token) {
    throw new Error('Não foi possível autenticar na API.');
  }
  dispatchState(setApiData(data.data));
  return data.data;
};

axiosApiInstance.interceptors.request.use(async request => {
  if (!config.api.host) {
    throw new Error('Configure EXPO_PUBLIC_API_URL no arquivo .env para conectar à API.');
  }
  const userToken = getState('user').user?.user_token;
  if (userToken) request.headers.set('X-Homex-User-Token', userToken);
  let apiData = getState('api').api;
  if (!apiData) {
    if (!signInPromise) {
      signInPromise = authenticate().finally(() => { signInPromise = undefined; });
    }
    apiData = await signInPromise;
  }
  request.headers.set('Content-Type', 'application/json');
  request.headers.set('Authorization', `${apiData.token_type || 'Bearer'} ${apiData.access_token}`);
  return request;
});

axiosApiInstance.interceptors.response.use(response => response, async error => {
  if (error.response?.status === 401 && error.response?.data?.code === 'USER_SESSION_REQUIRED') {
    dispatchState(setNeedNewAuth(true));
    return Promise.reject(error);
  }
  const originalRequest = error.config;
  if (error.response?.status !== 401 || !originalRequest) {
    return Promise.reject(error);
  }
  if (originalRequest._retry) {
    dispatchState(resetApiData());
    dispatchState(setNeedNewAuth(true));
    return Promise.reject(error);
  }
  originalRequest._retry = true;
  try {
    if (!refreshPromise) {
      refreshPromise = authenticate(true).finally(() => { refreshPromise = undefined; });
    }
    await refreshPromise;
    return axiosApiInstance(originalRequest);
  } catch (refreshError) {
    dispatchState(resetApiData());
    dispatchState(setNeedNewAuth(true));
    return Promise.reject(refreshError);
  }
});

export default axiosApiInstance;
