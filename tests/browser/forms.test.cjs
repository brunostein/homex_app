const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
process.loadEnvFile('.env');

test('forms: validation, keyboard, home edit, category suggestions, quantities and sharing on mobile', { timeout: 120000 }, async () => {
  const base = process.env.EXPO_PUBLIC_API_URL;
  assert.ok(base && ['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Use a local API for this test.');
  const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let token; let userToken;
  const users = [];
  const password = 'forms-test-password';
  const email = `forms-${Date.now()}@homex.local`;
  async function api(path, method = 'GET', data) {
    const response = await fetch(`${base}${path}`, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(userToken ? { 'X-Homex-User-Token': userToken } : {}) },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    const result = await response.json();
    assert.equal(result.success, true, result.msg);
    return result.data;
  }
  const field = name => page.getByRole('textbox', { name, exact: true });
  const button = name => page.getByRole('button', { name, exact: true });
  const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  try {
    token = (await api('/accounts/signin', 'POST', { username: process.env.EXPO_PUBLIC_API_USER, password: process.env.EXPO_PUBLIC_API_PASSWORD })).access_token;
    users.push(await api('/homex/users/create', 'POST', { fullName: 'Teste formulários', email, password }));
    users.push(await api('/homex/users/create', 'POST', { fullName: 'Pessoa convidada', email: `guest-${email}`, password }));
    userToken = (await api('/homex/users/signin', 'POST', { email, password })).user_token;
    await page.goto(process.env.HOMEX_WEB_URL || 'http://127.0.0.1:8092');
    await field('Email').fill('email-invalido');
    await page.getByLabel('Senha', { exact: true }).fill(password);
    await button('Mostrar senha').click();
    assert.equal(await page.getByLabel('Senha', { exact: true }).evaluate(element => element.type), 'text');
    await button('Ocultar senha').click();
    await button('Entrar').click();
    await page.getByRole('alert').filter({ hasText: 'Confira o email informado.' }).waitFor();
    await field('Email').fill(email);
    await button('Entrar').click();
    await button('Nova casa').click();
    await button('Criar casa').click();
    await page.getByText('Dê um nome para sua casa.', { exact: true }).waitFor();
    await field('Nome').fill('Casa dos formulários');
    await field('Nome').press('Enter');
    await field('Descrição').waitFor();
    assert.equal(await field('Descrição').evaluate(element => element === document.activeElement), true);
    await field('Descrição').fill('Um lugar para organizar a rotina.');
    await noOverflow();
    await button('Criar casa').click();
    await page.getByText('Casa dos formulários', { exact: true }).waitFor();
    await page.getByText('Editar', { exact: true }).click();
    assert.equal(await field('Nome').inputValue(), 'Casa dos formulários');
    await field('Nome').fill('Minha casa organizada');
    await button('Salvar alterações').click();
    await page.getByText('Minha casa organizada', { exact: true }).waitFor();
    await page.getByLabel('Opções de Minha casa organizada', { exact: true }).click();
    await page.getByRole('menuitem', { name: 'Compartilhar', exact: true }).click();
    await field('Email').fill(users[1].email);
    await button('Compartilhar casa').click();
    await page.getByText('Casa compartilhada com sucesso!', { exact: true }).waitFor();
    await page.getByText('Pessoa convidada', { exact: true }).waitFor();
    await noOverflow();
    await button('Voltar').click();
    await page.getByRole('button', { name: 'Abrir casa', exact: true }).click();
    await button('Inventário da casa').click();
    await button('Nova categoria').click();
    await button('Criar categoria').click();
    await page.getByText('Informe o nome da categoria.', { exact: true }).waitFor();
    await button('Usar sugestão Alimentos').click();
    assert.equal(await field('Nome').inputValue(), 'Alimentos');
    await noOverflow();
    await button('Criar categoria').click();
    await page.getByText('Alimentos', { exact: true }).filter({ visible: true }).waitFor();
    await page.getByLabel('Adicionar item em Alimentos', { exact: true }).click();
    await button('Adicionar item').last().click();
    await page.getByText('Informe o nome do item.', { exact: true }).waitFor();
    await field('Item').fill('Arroz');
    assert.equal(await button('Diminuir quantidade').isDisabled(), true);
    await button('Aumentar quantidade').click();
    assert.equal(await field('Quantidade').inputValue(), '1');
    await field('Quantidade').fill('5');
    await noOverflow();
    await button('Adicionar item').last().click();
    await page.getByText('Arroz', { exact: true }).waitFor();
    const home = (await api(`/homex/users/get/${users[0].id}?relations=homes`)).homes[0];
    const categories = await api(`/homex/categories/get-by?field=home_id&value=${home.id}&relations=items`);
    assert.equal(categories[0].items[0].amount, 5);
    assert.deepEqual(errors, []);
  } finally {
    for (const user of users) await api(`/homex/users/remove/${user.id}`, 'DELETE');
    await browser.close();
  }
});
