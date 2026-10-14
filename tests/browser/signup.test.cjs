const { test } = require('node:test');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
process.loadEnvFile('.env');
test('signup preserves fields and supports registration, duplicate email feedback and login', { timeout: 120000 }, async () => {
 const browser=await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const email=`signup-regression-${Date.now()}@homex.local`;const password='test-password';let userId;let token;
 const base=process.env.EXPO_PUBLIC_API_URL;
 if (!base || !['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname)) {
   await browser.close();
   throw new Error('Este teste exige uma API local configurada no .env.');
 }
 async function api(path,method='GET',data){return fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(data?{body:JSON.stringify(data)}:{})}).then(r=>r.json())}
 try{
 await page.goto(process.env.HOMEX_WEB_URL || 'http://127.0.0.1:8092');
 await page.getByRole('textbox',{name:'Email',exact:true}).fill(email);
 await page.getByLabel('Senha',{exact:true}).fill(password);
 await page.getByRole('button',{name:'Não tenho conta. Criar conta',exact:true}).click();
 assert.equal(await page.getByRole('textbox',{name:'Nome completo',exact:true}).inputValue(),'');
 assert.equal(await page.getByRole('textbox',{name:'Email',exact:true}).inputValue(),email);
 assert.equal(await page.getByLabel('Senha',{exact:true}).inputValue(),password);
 await page.getByRole('button',{name:'Cadastrar',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Preencha todos os campos.'}).waitFor();
 await page.getByRole('textbox',{name:'Nome completo',exact:true}).fill('Cadastro regressão');
 await page.getByRole('button',{name:'Cadastrar',exact:true}).click();
 await page.getByText('Conta criada com sucesso! Entre com seu email e senha.',{exact:true}).waitFor();
 const auth=await api('/accounts/signin','POST',{username:process.env.EXPO_PUBLIC_API_USER,password:process.env.EXPO_PUBLIC_API_PASSWORD});assert.equal(auth.success,true);token=auth.data.access_token;
 const signed=await api('/homex/users/signin','POST',{email,password});assert.equal(signed.success,true);userId=signed.data.id;
 await page.getByRole('button',{name:'Não tenho conta. Criar conta',exact:true}).click();
 await page.getByRole('button',{name:'Cadastrar',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Este email já está cadastrado.'}).waitFor();
 await page.getByRole('button',{name:'Já tenho conta. Entrar',exact:true}).click();
 await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await page.getByRole('heading',{name:'Minhas casas',exact:true}).waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS: prefilled login → signup retains correct fields; validation; successful signup notice; duplicate email error; login with newly created account. No JavaScript errors.');
 }catch(e){console.log('BODY:',await page.locator('body').innerText());throw e;}
 finally{if(userId)await api('/homex/users/remove/'+userId,'DELETE');await browser.close();}
});
