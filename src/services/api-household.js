import client from './axios-request';
import config from '../config';
export async function household(homeId, path, method = 'get', data) {
  const response = await client({ url: `${config.api.host}/homex/households/${homeId}/${path}`, method, data });
  if (!response.data.success) throw new Error(response.data.msg || 'Não foi possível concluir a operação.');
  return response.data.data;
}
export function locationPath(locations, id) {
  const names = []; const seen = new Set();
  while (id && !seen.has(id)) { seen.add(id); const location = locations.find(l => l.id === Number(id)); if (!location) break; names.unshift(location.name); id = location.parent_id; }
  return names.join(' → ');
}
