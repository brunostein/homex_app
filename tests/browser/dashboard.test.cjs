const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require('playwright');
process.loadEnvFile('.env');
test('dashboard UI: correct counters, shortcuts, refresh, responsive layout and shared houses', { timeout: 120000 }, async () => {
  const base = process.env.EXPO_PUBLIC_API_URL;
  assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname));
  const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const users = []; const errors = []; page.on('pageerror', e => errors.push(e.message));
  let appToken; let userToken;
  async function api(path, method = 'GET', data) {
    const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(appToken ? { Authorization: `Bearer ${appToken}` } : {}), ...(userToken ? { 'X-Homex-User-Token': userToken } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
    const result = await r.json(); assert.equal(result.success, true, JSON.stringify(result)); return result.data;
  }
  const b = (name, target = page) => target.getByRole('button', { name, exact: true });
  const preview = async name => { if (!process.env.HOMEX_PREVIEW_DIR) return; await fs.mkdir(process.env.HOMEX_PREVIEW_DIR, { recursive: true }); await page.screenshot({ path: `${process.env.HOMEX_PREVIEW_DIR}/${name}.png`, fullPage: true }); };
  const metric = async (name, value, target = page) => { const locator = target.getByTestId(`dashboard-${name}`); await locator.waitFor(); await target.waitForFunction(({ id, value }) => document.querySelector(`[data-testid="${id}"]`)?.textContent === value, { id: `dashboard-${name}`, value: String(value) }); };
  const password = 'dashboard-ui-password';
  const login = async (target, user) => { await target.goto(process.env.HOMEX_WEB_URL || 'http://127.0.0.1:8092'); await target.getByRole('textbox', { name: 'Email', exact: true }).fill(user.email); await target.getByLabel('Senha', { exact: true }).fill(password); await b('Entrar', target).click(); };
  try {
    appToken = (await api('/accounts/signin', 'POST', { username: process.env.EXPO_PUBLIC_API_USER, password: process.env.EXPO_PUBLIC_API_PASSWORD })).access_token;
    for (const name of ['Marina', 'Beatriz']) users.push(await api('/homex/users/create', 'POST', { fullName: name, email: `dashboard-ui-${name}-${Date.now()}@homex.local`, password }));
    userToken = (await api('/homex/users/signin', 'POST', { email: users[0].email, password })).user_token;
    const home = await api('/homex/homes/create', 'POST', { name: 'Casa do Sol', user_id: users[0].id });
    const empty = await api('/homex/homes/create', 'POST', { name: 'Casa vazia', user_id: users[0].id });
    const root = `/homex/households/${home.id}`;
    const category = await api('/homex/categories/create', 'POST', { name: 'Alimentos', home_id: home.id });
    const rice = await api('/homex/items/create', 'POST', { name: 'Arroz', category_id: category.id, amount: 0 });
    const beans = await api('/homex/items/create', 'POST', { name: 'Feijão', category_id: category.id, amount: 5 });
    const list = await api(root + '/shopping-lists', 'POST', { name: 'Mercado', items: [{ item_id: rice.id, quantity: 3 }] });
    await login(page, users[0]);
    const today = await page.evaluate(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
    const start = new Date(today + 'T00:00:00Z'); start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 6) % 7);
    const outside = new Date(start); outside.setUTCDate(outside.getUTCDate() - 1);
    const future = new Date(start); future.setUTCDate(future.getUTCDate() + 7);
    const event = await api(root + '/events', 'POST', { title: 'Revisão do ar-condicionado', event_date: today, event_time: '14:30', location: 'Sala' });
    const done = await api(root + '/events', 'POST', { title: 'Limpeza concluída', event_date: start.toISOString().slice(0, 10) });
    await api(`${root}/events/${done.id}/completion`, 'PATCH', { completed: true });
    const past = await api(root + '/events', 'POST', { title: 'Fora da semana', event_date: outside.toISOString().slice(0, 10) });
    const next = await api(root + '/events', 'POST', { title: 'Visita na próxima semana', event_date: future.toISOString().slice(0, 10) });
    await page.getByTestId(`home-card-${home.id}`).getByRole('button', { name: 'Abrir casa', exact: true }).click();
    await metric('week', 2); await metric('zero', 1); await metric('purchases', 1); await metric('inventory', 2);
    const menu = page.getByTestId('house-navigation');
    await menu.waitFor();
    assert.equal(await menu.getByRole('button', { name: 'Painel da casa', exact: true }).getAttribute('aria-current'), 'page');
    await menu.getByRole('button', { name: 'Inventário da casa', exact: true }).click();
    await page.getByTestId(`item-${beans.id}`).waitFor();
    assert.equal(await page.getByTestId('house-navigation').getByRole('button', { name: 'Inventário da casa', exact: true }).getAttribute('aria-current'), 'page');
    await b('Lista de compras').click(); await page.getByTestId(`shopping-list-${list.id}`).waitFor();
    await b('Receitas da casa').click(); await page.getByRole('heading', { name: 'Receitas', exact: true }).waitFor();
    await b('Agenda da casa').click(); await page.getByTestId(`calendar-event-${event.id}`).waitFor();
    await b('Painel da casa').click(); await metric('inventory', 2);

    await page.getByTestId(`dashboard-event-${event.id}`).waitFor(); await page.getByTestId(`dashboard-event-${next.id}`).waitFor(); assert.equal(await page.getByTestId(`dashboard-event-${done.id}`).count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true); await preview('dashboard-celular');
    await page.setViewportSize({ width: 1440, height: 1000 }); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true); await preview('dashboard-desktop');
    await b('Ver itens com estoque zero').click(); await page.getByTestId(`item-${rice.id}`).waitFor(); assert.equal(await page.getByTestId(`item-${beans.id}`).count(), 0);
    await b('Aumentar Arroz').click(); await page.getByTestId(`item-${rice.id}`).waitFor({ state: 'detached' }); await b('Voltar').click(); await metric('zero', 0);
    await b('Ver todos os itens do inventário').click(); await page.getByTestId(`item-${rice.id}`).waitFor(); await page.getByTestId(`item-${beans.id}`).waitFor(); await b('Voltar').click();
    await b('Ver eventos da semana').click(); await page.getByTestId(`calendar-event-${event.id}`).waitFor(); await page.getByTestId(`calendar-event-${done.id}`).waitFor(); assert.equal(await page.getByTestId(`calendar-event-${past.id}`).count(), 0); assert.equal(await page.getByTestId(`calendar-event-${next.id}`).count(), 0);
    await b('Concluir Revisão do ar-condicionado').click(); await page.getByText('Compromisso concluído.', { exact: true }).waitFor(); await b('Voltar').click(); await metric('week', 2); await page.getByTestId(`dashboard-event-${event.id}`).waitFor({ state: 'detached' });
    await b('Ver compras pendentes').click(); await page.getByTestId(`shopping-list-${list.id}`).waitFor(); await b('Voltar').click(); await metric('inventory', 2);
    await page.route('**/dashboard?*', route => route.abort()); await b('Atualizar painel').click(); await page.getByRole('alert').waitFor(); assert.equal(await page.getByTestId('dashboard-inventory').innerText(), '2'); await page.unroute('**/dashboard?*'); await b('Tentar atualizar painel').click(); await page.getByRole('alert').waitFor({ state: 'detached' });
    await api(`/homex/homes/share/${home.id}`, 'POST', { email: users[1].email });
    const reader = await browser.newPage({ viewport: { width: 390, height: 844 } }); reader.on('pageerror', e => errors.push(e.message)); await login(reader, users[1]); await reader.getByTestId(`home-card-${home.id}`).getByRole('button', { name: 'Abrir casa', exact: true }).click(); await metric('inventory', 2, reader); await metric('zero', 0, reader); await b('Ver eventos da semana', reader).click(); await reader.getByTestId(`calendar-event-${done.id}`).waitFor(); assert.equal(await b('Novo compromisso', reader).count(), 0); await reader.close();
    await b('Voltar').click(); await page.getByTestId(`home-card-${empty.id}`).getByRole('button', { name: 'Abrir casa', exact: true }).click(); await metric('inventory', 0); await metric('week', 0); await metric('zero', 0); await metric('purchases', 0); await page.getByText('Nenhum compromisso por vir.', { exact: true }).waitFor();
    assert.deepEqual(errors, []);
  } catch (error) { console.error(await page.locator('body').innerText()); await preview('falha-dashboard'); throw error; }
  finally { for (const user of users) await api(`/homex/users/remove/${user.id}`, 'DELETE'); await browser.close(); }
});
