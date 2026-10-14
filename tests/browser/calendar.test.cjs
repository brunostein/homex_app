const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require('playwright');
process.loadEnvFile('.env');
test('calendar UI: validation, dates, CRUD, search, completion and shared access', { timeout: 120000 }, async () => {
  const base = process.env.EXPO_PUBLIC_API_URL;
  assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname));
  const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  let appToken; let userToken; const users = [];
  async function api(path, method = 'GET', data) {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(appToken ? { Authorization: `Bearer ${appToken}` } : {}), ...(userToken ? { 'X-Homex-User-Token': userToken } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
    const result = await response.json(); assert.equal(result.success, true, JSON.stringify(result)); return result.data;
  }
  const button = (name, target = page) => target.getByRole('button', { name, exact: true });
  const field = name => page.getByRole('textbox', { name, exact: true });
  const preview = async name => { if (!process.env.HOMEX_PREVIEW_DIR) return; await fs.mkdir(process.env.HOMEX_PREVIEW_DIR, { recursive: true }); await page.screenshot({ path: `${process.env.HOMEX_PREVIEW_DIR}/${name}.png`, fullPage: true }); };
  const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const password = 'calendar-ui-password';
  const login = async (target, user, home) => {
    await target.goto(process.env.HOMEX_WEB_URL || 'http://127.0.0.1:8092');
    await target.getByRole('textbox', { name: 'Email', exact: true }).fill(user.email); await target.getByLabel('Senha', { exact: true }).fill(password); await button('Entrar', target).click();
    await target.getByTestId(`home-card-${home.id}`).getByRole('button', { name: 'Abrir casa', exact: true }).click(); await button('Agenda da casa', target).click();
    await target.getByRole('heading', { name: 'Agenda da casa', exact: true }).waitFor();
  };
  try {
    appToken = (await api('/accounts/signin', 'POST', { username: process.env.EXPO_PUBLIC_API_USER, password: process.env.EXPO_PUBLIC_API_PASSWORD })).access_token;
    for (const name of ['Marina', 'Beatriz']) users.push(await api('/homex/users/create', 'POST', { fullName: name, email: `calendar-ui-${name}-${Date.now()}@homex.local`, password }));
    userToken = (await api('/homex/users/signin', 'POST', { email: users[0].email, password })).user_token;
    const home = await api('/homex/homes/create', 'POST', { name: 'Casa da rotina', user_id: users[0].id });
    await api(`/homex/homes/share/${home.id}`, 'POST', { email: users[1].email });
    const root = `/homex/households/${home.id}/events`;
    const older = await api(root, 'POST', { title: 'Visita antiga', event_date: '2020-01-10' });
    await login(page, users[0], home);
    await button('Novo compromisso').click(); await button('Salvar compromisso').click(); await page.getByText('Informe o título do compromisso.', { exact: true }).waitFor();
    await field('Título do compromisso').fill('Manutenção do ar-condicionado'); await field('Data').fill('31/02/2026'); await field('Horário').fill('24:00'); await button('Salvar compromisso').click();
    await page.getByText('Informe uma data válida no formato DD/MM/AAAA.', { exact: true }).waitFor(); await page.getByText('Use um horário entre 00:00 e 23:59.', { exact: true }).waitFor();
    const date = await page.evaluate(() => { const d = new Date(); return [String(d.getDate()).padStart(2, '0'), String(d.getMonth() + 1).padStart(2, '0'), d.getFullYear()].join('/'); });
    await field('Data').fill(date); await field('Horário').fill('14:30'); await field('Local do compromisso').fill('Sala de estar'); await field('Descrição do compromisso').fill('Receber o técnico e conferir os filtros.'); await noOverflow(); await button('Salvar compromisso').click();
    await page.getByText('Compromisso adicionado à agenda.', { exact: true }).waitFor();
    const event = (await api(root)).find(e => e.title === 'Manutenção do ar-condicionado'); assert.ok(event);
    await page.getByTestId(`calendar-event-${event.id}`).waitFor(); await button('Hoje').click(); assert.equal(await page.getByTestId(`calendar-event-${older.id}`).count(), 0);
    await field('Buscar na agenda').fill('MANUTENCAO'); await page.getByTestId(`calendar-event-${event.id}`).waitFor(); await button('Limpar busca').click();
    await button('Editar compromisso Manutenção do ar-condicionado').click(); assert.equal(await field('Data').inputValue(), date); assert.equal(await field('Horário').inputValue(), '14:30');
    await field('Título do compromisso').fill('Rascunho'); await button('Cancelar').click(); await button('Editar compromisso Manutenção do ar-condicionado').click(); assert.equal(await field('Título do compromisso').inputValue(), event.title);
    await field('Título do compromisso').fill('Revisão do ar-condicionado'); await field('Horário').fill(''); await button('Salvar compromisso').click(); await page.getByText('Compromisso atualizado.', { exact: true }).waitFor(); await page.getByText('Dia inteiro', { exact: true }).waitFor();
    await noOverflow(); await preview('agenda-celular'); await page.setViewportSize({ width: 1440, height: 1000 }); await noOverflow(); await preview('agenda-desktop');
    const reader = await browser.newPage({ viewport: { width: 390, height: 844 } }); reader.on('pageerror', e => errors.push(e.message)); await login(reader, users[1], home); await reader.getByTestId(`calendar-event-${event.id}`).waitFor();
    assert.equal(await button('Novo compromisso', reader).count(), 0); assert.equal(await button('Concluir Revisão do ar-condicionado', reader).count(), 0); await reader.close();
    await api(`/homex/homes/share/${home.id}`, 'POST', { email: users[1].email, permission: 'write' });
    const editor = await browser.newPage({ viewport: { width: 390, height: 844 } }); editor.on('pageerror', e => errors.push(e.message)); await login(editor, users[1], home); await button('Concluir Revisão do ar-condicionado', editor).click(); await editor.getByText('Compromisso concluído.', { exact: true }).waitFor(); await editor.close();
    await button('Atualizar lista').click(); await button('Concluídos').click(); await page.getByTestId(`calendar-event-${event.id}`).waitFor(); await button('Reabrir Revisão do ar-condicionado').click(); await page.getByText('Compromisso reaberto.', { exact: true }).waitFor(); await button('Pendentes').click();
    await button('Remover compromisso Revisão do ar-condicionado').click(); await button('Cancelar').click(); await page.getByTestId(`calendar-event-${event.id}`).waitFor();
    await button('Remover compromisso Revisão do ar-condicionado').click(); await button('Remover').click(); await page.getByTestId(`calendar-event-${event.id}`).waitFor({ state: 'detached' });
    assert.deepEqual(errors, []);
  } catch (error) { console.error(await page.locator('body').innerText()); await preview('falha-agenda'); throw error; }
  finally { for (const user of users) await api(`/homex/users/remove/${user.id}`, 'DELETE'); await browser.close(); }
});
