import client from './axios-request';
import config from '../config';
import { getState, dispatchState } from '../helpers/app-helper';
import { setNeedNewAuth } from '../redux/actions/user';

async function request(path = '', method = 'get', data) {
  const token = getState('user').user?.user_token;
  if (!token) {
    dispatchState(setNeedNewAuth(true));
    throw new Error('Entre novamente para acessar suas receitas.');
  }
  const response = await client({ url: `${config.api.host}/homex/recipes${path}`, method, data, headers: { 'X-Homex-User-Token': token }, _userAuth: true });
  return response.data;
}
export const getRecipes = homeId => request(homeId ? `?home_id=${homeId}` : '');
export const getRecipe = id => request(`/${id}`);
export const createRecipe = data => request('', 'post', data);
export const updateRecipe = (id, data) => request(`/${id}`, 'put', data);
export const deleteRecipe = id => request(`/${id}`, 'delete');
export const shareRecipe = (id, email) => request(`/${id}/shares`, 'post', { email });
export const unshareRecipe = (id, userId) => request(`/${id}/shares/${userId}`, 'delete');
