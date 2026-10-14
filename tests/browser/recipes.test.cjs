const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require('playwright');
process.loadEnvFile('.env');

test('recipes: house entry, form, editing, reading, sharing between two accounts and revocation', { timeout: 180000 }, async () => {
  const base = process.env.EXPO_PUBLIC_API_URL;
  assert.ok(base && ['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname));
  const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  const ownerPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const guestPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  for (const page of [ownerPage, guestPage]) page.on('pageerror', error => errors.push(error.message));
  const actors = [];
  let appToken;
  const password = 'recipe-browser-password';
  async function api(path, method = 'GET', data, actor) {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(appToken ? { Authorization: `Bearer ${appToken}` } : {}), ...(actor ? { 'X-Homex-User-Token': actor.user_token } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
    const result = await response.json(); assert.equal(result.success, true, result.msg); return result.data;
  }
  const button = (page, name) => page.getByRole('button', { name, exact: true });
  const field = (page, name) => page.getByRole('textbox', { name, exact: true });
  const login = async (page, actor) => {
    await page.goto(process.env.HOMEX_WEB_URL || 'http://127.0.0.1:8092');
    await field(page, 'Email').fill(actor.email); await page.getByLabel('Senha', { exact: true }).fill(password); await button(page, 'Entrar').click();
    await page.getByRole('heading', { name: 'Minhas casas', exact: true }).waitFor();
  };
  const noOverflow = async page => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const preview = async (page, name) => {
    if (!process.env.HOMEX_PREVIEW_DIR) return;
    await fs.mkdir(process.env.HOMEX_PREVIEW_DIR, { recursive: true });
    await page.screenshot({ path: `${process.env.HOMEX_PREVIEW_DIR}/${name}.png`, fullPage: true });
  };
  try {
    appToken = (await api('/accounts/signin', 'POST', { username: process.env.EXPO_PUBLIC_API_USER, password: process.env.EXPO_PUBLIC_API_PASSWORD })).access_token;
    for (const name of ['Marina', 'Beatriz']) {
      const email = `recipe-browser-${name}-${Date.now()}@homex.local`;
      const created = await api('/homex/users/create', 'POST', { fullName: name, email, password });
      actors.push(created);
      Object.assign(created, await api('/homex/users/signin', 'POST', { email, password }));
    }
    const [owner, guest] = actors;
    const home = await api('/homex/homes/create', 'POST', { name: 'Casa dos sabores', user_id: owner.id });
    await login(ownerPage, owner);
    await ownerPage.getByTestId(`home-card-${home.id}`).getByRole('button', { name: 'Abrir casa', exact: true }).click();
    await button(ownerPage, 'Receitas da casa').click();
    await button(ownerPage, 'Nova receita').click();
    await button(ownerPage, 'Salvar receita').click();
    await ownerPage.getByText('Dê um nome à receita.', { exact: true }).waitFor();
    await field(ownerPage, 'Nome da receita').fill('Bolo de cenoura da família');
    await field(ownerPage, 'Descrição').fill('A receita que deixa os domingos mais gostosos.');
    await field(ownerPage, 'Tempo de preparo').fill('45');
    await field(ownerPage, 'Porções').fill('6');
    await field(ownerPage, 'Ingredientes').fill('2 cenouras\n3 ovos\n1 xícara de farinha');
    await field(ownerPage, 'Modo de preparo').fill('Preaqueça o forno a 180 °C.\nMisture os ingredientes.\nAsse por 40 minutos.');
    await noOverflow(ownerPage);
    await button(ownerPage, 'Salvar receita').click();
    await ownerPage.getByRole('heading', { name: 'Bolo de cenoura da família', exact: true }).waitFor();
    await ownerPage.getByText('2 cenouras', { exact: true }).waitFor();
    await preview(ownerPage, 'receita-celular');
    await ownerPage.setViewportSize({ width: 1440, height: 1000 }); await noOverflow(ownerPage); await preview(ownerPage, 'receita-desktop');
    const recipe = (await api(`/homex/recipes?home_id=${home.id}`, 'GET', null, owner))[0];
    assert.equal(recipe.home_id, home.id);
    await button(ownerPage, 'Editar receita').click();
    assert.equal(await field(ownerPage, 'Nome da receita').inputValue(), recipe.title);
    await field(ownerPage, 'Nome da receita').fill('Alteração descartada');
    await button(ownerPage, 'Cancelar').click();
    await button(ownerPage, 'Editar receita').click();
    await field(ownerPage, 'Nome da receita').waitFor();
    assert.equal(await field(ownerPage, 'Nome da receita').inputValue(), recipe.title);
    await field(ownerPage, 'Nome da receita').fill('Bolo de cenoura especial');
    await button(ownerPage, 'Salvar alterações').click();
    await ownerPage.getByRole('heading', { name: 'Bolo de cenoura especial', exact: true }).waitFor();
    await button(ownerPage, 'Compartilhar receita').click();
    await field(ownerPage, 'Email').fill('pessoa-inexistente-receita@homex.local');
    await button(ownerPage, 'Compartilhar receita').click();
    await ownerPage.getByRole('alert').filter({ hasText: 'Essa pessoa ainda não tem conta' }).waitFor();
    await field(ownerPage, 'Email').fill(guest.email); await button(ownerPage, 'Compartilhar receita').click();
    await ownerPage.getByText('Receita compartilhada com sucesso!', { exact: true }).waitFor();
    await ownerPage.getByText('Beatriz', { exact: true }).waitFor();
    await preview(ownerPage, 'compartilhamento');
    await login(guestPage, guest);
    await button(guestPage, 'Abrir menu').click(); await button(guestPage, 'Receitas').click();
    await guestPage.getByTestId(`recipe-${recipe.id}`).waitFor();
    await button(guestPage, 'Compartilhadas').click();
    await button(guestPage, 'Ver receita').click();
    await guestPage.getByRole('heading', { name: 'Bolo de cenoura especial', exact: true }).waitFor();
    assert.equal(await button(guestPage, 'Editar receita').count(), 0);
    assert.equal(await button(guestPage, 'Compartilhar receita').count(), 0);
    await guestPage.getByText('2 cenouras', { exact: true }).waitFor();
    await noOverflow(guestPage);
    await button(ownerPage, 'Remover acesso de Beatriz').click(); await button(ownerPage, 'Remover').click();
    await ownerPage.getByText('Acesso individual removido com sucesso.', { exact: true }).waitFor();
    await button(guestPage, 'Voltar').click();
    await guestPage.getByTestId(`recipe-${recipe.id}`).waitFor({ state: 'detached' });
    await field(ownerPage, 'Email').fill(guest.email); await button(ownerPage, 'Compartilhar receita').click();
    await ownerPage.getByText('Receita compartilhada com sucesso!', { exact: true }).waitFor();
    await button(ownerPage, 'Voltar').click(); await button(ownerPage, 'Voltar').click();
    await ownerPage.getByTestId(`recipe-${recipe.id}`).waitFor();
    await field(ownerPage, 'Buscar receitas').fill('CENOURAS');
    assert.equal(await ownerPage.getByTestId(`recipe-${recipe.id}`).count(), 1);
    await button(ownerPage, 'Limpar busca').click();
    await button(ownerPage, 'Opções de Bolo de cenoura especial').click();
    await ownerPage.getByRole('menuitem', { name: 'Remover', exact: true }).click(); await button(ownerPage, 'Remover').click();
    await ownerPage.getByTestId(`recipe-${recipe.id}`).waitFor({ state: 'detached' });
    await button(guestPage, 'Atualizar lista').click(); await guestPage.getByTestId(`recipe-${recipe.id}`).waitFor({ state: 'detached' });
    await button(ownerPage, 'Voltar').click(); await button(ownerPage, 'Voltar').click();
    await button(ownerPage, 'Abrir menu').click(); await button(ownerPage, 'Receitas').click();
    await button(ownerPage, 'Nova receita').click();
    await field(ownerPage, 'Nome da receita').fill('Sopa de legumes');
    await field(ownerPage, 'Ingredientes').fill('1 batata\n1 cenoura');
    await field(ownerPage, 'Modo de preparo').fill('Cozinhe os legumes até ficarem macios.');
    await button(ownerPage, 'Salvar receita').click();
    await ownerPage.getByRole('heading', { name: 'Sopa de legumes', exact: true }).waitFor();
    const personal = (await api('/homex/recipes', 'GET', null, owner))[0];
    assert.equal(personal.home_id, null); assert.equal(personal.title, 'Sopa de legumes');
    assert.deepEqual(errors, []);
  } catch (error) {
    console.error('OWNER:', await ownerPage.locator('body').innerText());
    console.error('RECIPIENT:', await guestPage.locator('body').innerText());
    await preview(ownerPage, 'falha');
    throw error;
  } finally {
    for (const actor of actors) await api(`/homex/users/remove/${actor.id}`, 'DELETE');
    await browser.close();
  }
});
