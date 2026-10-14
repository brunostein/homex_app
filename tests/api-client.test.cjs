const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const axios = require('axios');

function loadClient({ host = 'https://api.example.test', adapter, initialApi = null, initialUser = null }) {
  let api = initialApi;
  let needNewAuth = false;
  const module = { exports: {} };
  const dependencies = {
    axios: { ...axios, create: options => axios.create({ ...options, adapter }) },
    '../config': { api: { host, user: 'app', pass: 'test' } },
    '../helpers/app-helper': {
      getState: key => key === 'user' ? { user: initialUser } : { api },
      dispatchState: action => {
        if (action.type === 'api') api = action.payload;
        if (action.type === 'auth') needNewAuth = action.payload;
      },
    },
    '../redux/actions/api': {
      setApiData: payload => ({ type: 'api', payload }),
      resetApiData: () => ({ type: 'api', payload: null }),
    },
    '../redux/actions/user': { setNeedNewAuth: payload => ({ type: 'auth', payload }) },
  };
  const { code } = babel.transformSync(fs.readFileSync('src/services/axios-request.js', 'utf8'), {
    configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  vm.runInNewContext(code, { module, exports: module.exports, require: name => dependencies[name] });
  return { client: module.exports.default, state: () => ({ api, needNewAuth }) };
}
const token = { access_token: 'new-token', token_type: 'Bearer', username: 'app', refresh_token: 'refresh' };
const success = config => ({ config, status: 200, data: { success: true, data: token } });
function unauthorized(config) {
  throw new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, { status: 401, config });
}

test('missing API configuration fails before making a network request', async () => {
  let calls = 0;
  const { client } = loadClient({ host: '', adapter: async config => { calls++; return success(config); } });
  await assert.rejects(client.get('/homes'), /EXPO_PUBLIC_API_URL/);
  assert.equal(calls, 0);
});

test('concurrent requests share authentication and preserve request headers', async () => {
  let authCalls = 0;
  const { client } = loadClient({ adapter: async config => {
    if (config.url.endsWith('/accounts/signin')) {
      authCalls++;
      await new Promise(resolve => setImmediate(resolve));
    } else {
      assert.equal(config.headers.get('Authorization'), 'Bearer new-token');
      assert.equal(config.headers.get('X-Custom'), 'kept');
    }
    return success(config);
  } });
  await Promise.all([client.get('/homes', { headers: { 'X-Custom': 'kept' } }), client.get('/items', { headers: { 'X-Custom': 'kept' } })]);
  assert.equal(authCalls, 1);
});

test('401 refreshes credentials and retries with the new token', async () => {
  let requests = 0;
  const { client } = loadClient({ initialApi: { ...token, access_token: 'old' }, adapter: async config => {
    if (config.url.endsWith('/accounts/refresh-token')) return success(config);
    requests++;
    if (requests === 1) return unauthorized(config);
    assert.equal(config.headers.get('Authorization'), 'Bearer new-token');
    return success(config);
  } });
  await client.get('/homes');
  assert.equal(requests, 2);
});

test('a repeated 401 ends the session without an infinite retry', async () => {
  let requests = 0;
  const { client, state } = loadClient({ initialApi: token, adapter: async config => {
    if (config.url.endsWith('/accounts/refresh-token')) return success(config);
    requests++;
    return unauthorized(config);
  } });
  await assert.rejects(client.get('/homes'), /Unauthorized/);
  assert.equal(requests, 2);
  assert.equal(state().api, null);
  assert.equal(state().needNewAuth, true);
});

test('failed refresh rejects the request and requires login', async () => {
  const { client, state } = loadClient({ initialApi: token, adapter: async config => unauthorized(config) });
  await assert.rejects(client.get('/homes'), /Unauthorized/);
  assert.equal(state().needNewAuth, true);
});


test('expired user sessions require login without refreshing the application token', async () => {
  let calls = 0;
  const { client, state } = loadClient({ initialApi: token, adapter: async config => {
    calls++;
    throw new axios.AxiosError('Session expired', 'ERR_BAD_REQUEST', config, null, {
      status: 401, config, data: { code: 'USER_SESSION_REQUIRED' },
    });
  } });
  await assert.rejects(client.get('/recipes'), /Session expired/);
  assert.equal(calls, 1);
  assert.equal(state().needNewAuth, true);
  assert.equal(state().api.access_token, token.access_token);
});

test('authenticated requests carry the individual user session', async () => {
  const { client } = loadClient({ initialApi: token, initialUser: { user_token: 'individual-session' }, adapter: async config => {
    assert.equal(config.headers.get('X-Homex-User-Token'), 'individual-session');
    assert.equal(config.headers.get('Authorization'), 'Bearer new-token');
    return success(config);
  } });
  await client.get('/homex/categories/get');
});
