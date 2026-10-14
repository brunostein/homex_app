# Home-X

Aplicativo de organização doméstica, agenda, receitas e listas de compras com Expo SDK 57, React Native 0.86 e React 19.

## Executar

Use Node.js 22.13 ou superior (arquivo `.nvmrc`) e npm.

```sh
npm ci
cp .env.example .env
npm run web
```

Sem backend configurado, o aplicativo abre a tela de login e informa a configuração necessária ao tentar entrar.

Preencha no `.env`:

- `EXPO_PUBLIC_API_URL`: URL base da API, sem barra final.
- `EXPO_PUBLIC_API_USER` e `EXPO_PUBLIC_API_PASSWORD`: conta de aplicação usada pelo endpoint `/accounts/signin`.

As variáveis `EXPO_PUBLIC_*` são incluídas no aplicativo e visíveis ao usuário. Use somente credenciais próprias para cliente público; segredos de servidor devem ficar no backend. O email e a senha pessoais são informados na tela de login.

O backend está no repositório irmão `../homex_api`. Para preparar os dois projetos localmente:

```sh
cd ../homex_api
npm ci
npm run setup:local -- ../homex_app
docker compose up -d --build
cd ../homex_app
npm run web -- --port 8092 --localhost --clear
```

A API local usa `http://127.0.0.1:5055/api/v1`. O setup preserva arquivos `.env` existentes; se já houver um, ajuste a URL e a conta de aplicação conforme o `.env` da API. Cadastre seu usuário pela opção `Criar conta` e entre com email e senha.

O backend não está incluído neste repositório. Ele precisa fornecer os endpoints existentes em `src/services`: autenticação de conta (`/accounts/signin`, `/accounts/refresh-token`) e recursos `/homex/users`, `/homex/homes`, `/homex/categories`, `/homex/items` e `/homex/units-measurements`. As respostas seguem o contrato `{ success, data, msg }` (o app também aceita `message`). Na web, a API deve permitir a origem do aplicativo por CORS.

No celular físico, use uma URL da API acessível pela rede; `localhost` aponta para o próprio celular. Após alterar `.env`, reinicie com `npm start -- --clear`; para exportar novamente, use `npm run export:web -- --clear`.

Para desenvolvimento móvel:

```sh
npm start
npm run android
npm run ios
```

Android e iOS exigem dispositivo/Expo Go compatível ou emulador; o simulador iOS exige macOS e Xcode. Para compilar um app nativo localmente, use `npx expo run:android` ou `npx expo run:ios` com as ferramentas nativas instaladas.

## Verificações

```sh
npm test
npm run check
npm run doctor
npm run export:web
npx expo export --platform android --platform ios --output-dir dist-native
```

Com a API local e os bancos reais, foi validado no navegador: cadastro, login, criação/edição de casa, categoria e item, alteração de quantidade e exclusão de item, sem erros de JavaScript.

A exportação valida a geração dos bundles. Testar login, cadastro, compartilhamento e inventário com dados reais exige o backend configurado; exportar não substitui testar em dispositivos.

O projeto usa apenas `package-lock.json`; mantenha as dependências com npm e instale bibliotecas nativas com `npx expo install`.

## Dependências

O `npm audit` ainda reporta avisos em dependências transitivas das ferramentas Expo/React Native (como `braces`, `node-forge` e `uuid`). Não aplique `npm audit fix --force`: a resolução sugerida regride para SDKs incompatíveis. Reavalie esses avisos ao atualizar o SDK.

Para verificar a regressão de cadastro com a API e o app local em execução:

```sh
npx playwright install chromium
npm run test:signup
```

O teste cobre a troca entre login/cadastro com campos preenchidos, campos obrigatórios, cadastro bem-sucedido, email duplicado e login. Cria um usuário temporário e o remove ao terminar. Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` para indicar um Chrome/Chromium já instalado.

Os formulários têm campos com rótulos fixos, validação próxima ao campo, mostrar/ocultar senha, navegação por teclado e estados de envio. O layout se adapta à largura da tela, com rolagem quando necessário.

Com a API e o aplicativo locais em execução, rode `npm run test:forms` para verificar os formulários em uma tela de 390 px: validação de email, visibilidade da senha, criação e edição de casa, compartilhamento, sugestões de categorias e quantidade dos itens. O teste usa dados temporários e os remove ao terminar.

As listagens de casas e inventário seguem as mesmas cores, cartões e tipografia dos formulários. Incluem busca por nome sem diferenciar acentos, filtros de casas próprias/compartilhadas e de itens em falta, categorias recolhíveis, estados de carregamento e confirmações de remoção.

Rode `npm run test:lists` com a API e o app locais em execução para verificar busca, filtros, acesso de leitura, atualização de quantidades, falha de conexão sem alterar os dados e exclusões confirmadas. O teste também verifica o layout no desktop e no celular e remove seus registros temporários ao terminar.

## Receitas

O menu Receitas reúne receitas pessoais, das suas casas e compartilhadas com você. Cada casa também oferece acesso ao seu caderno ao lado do Inventário. Cadastre nome, descrição, ingredientes, modo de preparo, tempo e porções; busque pelo nome ou pelos ingredientes e filtre suas receitas e as compartilhadas.

O autor pode editar, remover e compartilhar por email com outra pessoa cadastrada, sem precisar compartilhar a casa. Quem recebe pode consultar a receita. O autor pode revogar o acesso individual; o acesso concedido pela casa permanece enquanto a pessoa participar dela.

Depois de atualizar a API, entre novamente no aplicativo para obter a sessão individual necessária às receitas. Ela expira em sete dias. Os endpoints exigem o token da aplicação e o cabeçalho `X-Homex-User-Token`, gerenciado pelo aplicativo.

Com a API e o app locais ativos, execute `npm run test:recipes`. O teste cobre criação, edição, cancelamento, leitura entre duas contas, compartilhamento, revogação, exclusão, receitas pessoais e layout no celular e no desktop.

## Inventário, locais e compras

Dentro de cada casa, abra **Inventário da casa**, **Lista de compras** ou **Receitas**. Os registros existentes são preservados. Entre novamente se a sessão individual ainda não estiver disponível.

No inventário, use **Locais da casa** para cadastrar ambientes e subdivisões (Cozinha → Armário → Gaveta). Categoria é o tipo do item; local é onde ele está. As categorias existentes mantêm seus nomes. Um local com itens ou subdivisões deve ser esvaziado antes de removê-lo.

Ao editar um item, escolha seu local e, se desejar, ative **Controlar reposição**, preenchendo quantidades mínima e desejada. A desejada deve ser maior que a mínima. As quantidades são inteiras nesta versão. Busque também pelo nome do local.

Crie várias listas por casa, como Mercado e Ferragens. Adicione compras avulsas ou vinculadas ao inventário. Em **Gerar lista de compras**, escolha:

- **Estoque baixo**: itens com reposição ativada e saldo igual ou inferior ao mínimo; a sugestão repõe até a quantidade desejada.
- **Estoque zero**: todos os itens zerados, mesmo sem reposição configurada; sem quantidade desejada, a sugestão é uma unidade.

Selecione os itens e revise os totais antes de confirmar. A lista de destino pode ser nova ou existente. Compras pendentes dessa lista são consideradas; itens vinculados repetidos atualizam uma única entrada após revisão, sem somar automaticamente.

Ao comprar, escolha atualizar o inventário ou somente marcar comprado. Compras avulsas podem criar um item, com categoria e local, ou incrementar um já existente. Cada entrada de compra incrementa o estoque no máximo uma vez. Desmarcar uma compra não retira o estoque; para uma compra futura, adicione outra entrada. Remover listas também não altera o estoque.

O dono pode compartilhar a casa com **Somente leitura** ou **Pode editar inventário e compras**. Para alterar a permissão existente, informe novamente o email na tela de compartilhamento. Listas e locais herdam essas permissões; receitas continuam editáveis somente pelo autor.

Com o app e a API locais em execução, rode `npm run test:shopping`. O teste cobre locais, reposição, geração por estoque zero, revisão de pendências, compras com ou sem atualização do inventário e múltiplas listas, em larguras de celular e desktop.

Ao cadastrar uma lista, selecione **Inventário de origem** para carregar os produtos da casa. Filtre por categoria ou pesquise, marque os produtos e informe as quantidades a comprar antes de criar a lista. A lista e suas entradas são salvas juntas; isso ainda não altera o estoque. Cada casa possui seu próprio inventário.

## Agenda da casa

Na tela de cada casa, abra **Agenda da casa** para cadastrar compromissos com título, data, horário opcional, local e descrição. Sem horário, o compromisso aparece como **Dia inteiro**. Datas usam DD/MM/AAAA e horários HH:MM; a agenda conserva a data e o horário informados, sem converter fusos.

A listagem agrupa por dia e oferece busca e filtros Pendentes, Hoje, Todos e Concluídos. Compromissos passados permanecem nos pendentes até serem concluídos; você pode editar, concluir, reabrir e excluir com confirmação. A agenda segue as permissões da casa: leitura para consulta e edição para organizar os compromissos. Não há notificações ou recorrência nesta versão.

Com o app e a API locais em execução, use `npm run test:calendar` para validar o fluxo no navegador, incluindo permissões entre duas contas, campos de data e horário, busca e conclusão.

## Dashboard da casa

Ao abrir uma casa, o painel mostra eventos da semana (segunda a domingo, incluindo concluídos), itens com estoque zero, entradas de compras pendentes e total de itens cadastrados. Itens são contados por cadastro, não pela soma das quantidades. As compras são contadas por entrada pendente em todas as listas da casa.

Os cartões abrem a agenda da semana, o inventário filtrado ou as listas. Abaixo aparecem até cinco compromissos pendentes a partir de hoje, seguidos pelos atalhos para organizar a casa. O painel atualiza ao retornar de outra tela, pelo botão **Atualizar painel** ou pelo gesto de atualização. Em caso de falha, mantém os últimos valores identificados e oferece tentar novamente.

A data do dispositivo define a semana; uma consulta usa apenas os dados e as permissões da casa selecionada. Execute `npm run test:dashboard` com o app e a API locais ativos para validar contadores, navegação, atualização e acesso compartilhado.

## Menu da casa

O menu superior da casa reúne **Painel**, **Inventário da Casa**, **Lista de Compras**, **Receitas** e **Agenda**. Ele identifica a casa atual e destaca a seção aberta. No celular, deslize o menu horizontalmente para acessar os outros itens; no desktop, eles ficam lado a lado. O menu acompanha as telas de consulta e permite trocar de área sem voltar ao painel. Receitas pessoais e compartilhadas continuam acessíveis pelo menu geral.
