# Daily Ledger

# ESPECIFICAÇÃO COMPLETA FINANÇAS

## 1. OBJETIVO DO PROJETO

Desenvolva um aplicativo financeiro pessoal chamado **Escalie Finanças**.

O aplicativo será utilizado exclusivamente por mim, com o objetivo de acompanhar diariamente meu lucro, meus gastos e meu saldo financeiro líquido.

Não quero um sistema contábil complexo, um ERP ou uma plataforma empresarial cheia de funcionalidades desnecessárias. Quero uma ferramenta pessoal, muito bem construída, visualmente premium, detalhada, rápida e extremamente prática, especialmente no celular.

A principal pergunta que o aplicativo deve responder é:

**Estou gastando mais dinheiro do que estou lucrando? Quanto realmente sobrou para mim hoje?**

Toda a experiência deve ser desenvolvida para permitir que eu registre meus gastos rapidamente e informe meu lucro total ao final do dia.

## 2. IDENTIDADE VISUAL E DESIGN

Crie uma interface premium, moderna e profissional, com uma identidade visual baseada em preto e roxo.

### Paleta de cores

* Fundo principal: preto profundo, próximo de #08080C.
* Fundo dos cards: #121119.
* Fundo secundário: #191622.
* Roxo principal: #8B5CF6.
* Roxo de destaque: #A78BFA.
* Roxo escuro: #5B21B6.
* Verde para resultados positivos: #22C55E.
* Vermelho para resultados negativos: #EF4444.
* Texto principal: #F5F3FF.
* Texto secundário: #A1A1AA.
* Bordas: roxo muito discreto ou cinza escuro.

Utilize o roxo para elementos de navegação, botões principais, ícones, indicadores selecionados e gráficos.

O verde deve indicar lucro líquido positivo. O vermelho deve indicar prejuízo líquido, gastos excessivos ou valores negativos. O resultado neutro, quando for zero, deve utilizar uma cor neutra.

### Direção estética

A interface precisa transmitir organização, controle financeiro e qualidade de um aplicativo premium.

Utilize:

* Cards bem construídos, com hierarquia visual clara.
* Cantos arredondados consistentes.
* Ícones modernos e coerentes.
* Tipografia legível e profissional.
* Números financeiros grandes e fáceis de identificar.
* Gráficos com acabamento elegante.
* Sombras e brilhos roxos muito sutis, somente quando contribuírem para a interface.
* Animações leves para atualização de valores e transições.
* Espaçamento consistente entre elementos.
* Estados visuais claros para botões, campos, seleções e mensagens.

Não utilize gradientes exagerados, excesso de efeitos neon, aparência genérica de template de IA, excesso de informações na mesma área ou elementos decorativos que prejudiquem a leitura.

O resultado precisa parecer um aplicativo financeiro real, cuidadosamente projetado e pronto para uso diário.

## 3. PRIORIDADE ABSOLUTA: EXPERIÊNCIA MOBILE

O aplicativo deve ser desenvolvido com abordagem mobile-first.

A utilização principal acontecerá pelo celular, portanto não basta reduzir uma interface de computador para uma tela pequena.

Requisitos obrigatórios:

* Layout adaptável a diferentes tamanhos de celular.
* Interface confortável para uso com uma mão.
* Botões e áreas de toque suficientemente grandes.
* Campos de valores com excelente legibilidade.
* Formulários curtos e objetivos.
* Navegação inferior no celular, com ícones e rótulos.
* Conteúdo sem rolagem horizontal.
* Cards organizados verticalmente em telas pequenas.
* Modais e formulários que respeitem a altura disponível quando o teclado estiver aberto.
* Botões de ação posicionados de forma acessível.
* Respeito às áreas seguras da tela.
* Feedback visual imediato após salvar ou excluir um registro.
* Layout desktop responsivo sem comprometer a experiência mobile.

### Teclado numérico

Esse requisito é especialmente importante.

Ao tocar no campo de valor de um gasto, o aplicativo deve abrir o teclado numérico apropriado para valores monetários no celular.

Utilize o tipo de entrada adequado, como `inputmode="decimal"`, e uma máscara monetária brasileira que permita digitar valores de forma natural.

Exemplos:

* 10,50
* 25,90
* 150,00
* 1.250,00

O sistema deve interpretar corretamente vírgulas e separadores de milhares, sem trocar ou perder os centavos.

O teclado não deve esconder o campo em edição nem o botão de salvar.

Utilize `type="text"` com entrada decimal e formatação controlada quando necessário, evitando depender exclusivamente de `type="number"`, que pode apresentar comportamentos inconsistentes com vírgulas e valores monetários no celular.

A moeda padrão será o real brasileiro (BRL), exibido no formato R$ 1.250,00.

## 4. ESTRUTURA PRINCIPAL DO APLICATIVO

Organize o aplicativo nas seguintes áreas:

1. Dashboard.
2. Gastos.
3. Histórico.
4. Análises.
5. Configurações.

No celular, utilize uma barra de navegação inferior compacta e elegante. No desktop, a navegação pode ser apresentada em uma barra lateral.

O Dashboard deve ser a tela inicial e concentrar os principais números financeiros.

Não crie funcionalidades complexas que não tenham relação direta com o objetivo principal.

## 5. DASHBOARD PRINCIPAL

O Dashboard é a parte mais importante do aplicativo.

Ao abrir o aplicativo, quero identificar imediatamente minha situação financeira do dia.

### Cabeçalho

Exiba:

* Nome do aplicativo: Escalie Finanças.
* Data atual.
* Saudação curta e discreta, se contribuir para a interface.
* Ação rápida para registrar um gasto.
* Acesso ao histórico.

A data exibida deve respeitar o fuso horário local, evitando que registros sejam atribuídos ao dia errado.

### Card principal: resultado líquido do dia

Este será o elemento visual de maior destaque.

Exiba:

**RESULTADO LÍQUIDO DE HOJE**

O cálculo será:

Resultado líquido = lucro informado − gastos registrados.

Regras visuais:

* Resultado positivo: valor em verde.
* Resultado negativo: valor em vermelho.
* Resultado igual a zero: valor em cor neutra.
* Lucro ainda não informado: exibir “Lucro não informado”, sem tratar a ausência como lucro confirmado de R$ 0,00.
* Gastos existentes antes do preenchimento do lucro: mostrar o total gasto e indicar que o resultado final ainda está pendente.

Exemplos:

Se eu informar R$ 300,00 de lucro e tiver R$ 80,00 de gastos, o resultado será +R$ 220,00.

Se eu informar R$ 100,00 de lucro e tiver R$ 180,00 de gastos, o resultado será −R$ 80,00.

Se eu informar R$ 200,00 de lucro e tiver R$ 200,00 de gastos, o resultado será R$ 0,00.

O valor deve ser atualizado automaticamente sempre que eu adicionar, editar ou excluir um gasto ou alterar o lucro do dia.

### Cards financeiros complementares

Abaixo do resultado líquido, exiba três cards:

**1. Lucro do dia**

* Total de lucro informado para a data selecionada.
* Indicador de que o valor está informado ou pendente.

**2. Gastos do dia**

* Soma de todos os gastos registrados naquela data.
* Valor em destaque.
* Acesso rápido à lista de gastos.

**3. Saldo líquido**

* Diferença entre lucro e gastos.
* Verde para saldo positivo.
* Vermelho para saldo negativo.
* Neutro quando igual a zero.

O resultado líquido e o saldo líquido representam o mesmo cálculo. Portanto, não devem ser somados entre si nem tratados como indicadores financeiros diferentes. O card principal pode destacar o resultado e o card complementar pode apresentar a mesma informação em formato compacto.

### Indicador de consumo do lucro

Adicione um indicador visual mostrando quanto do lucro foi consumido pelos gastos.

Fórmula:

Percentual consumido = gastos ÷ lucro × 100.

Exemplos:

* Lucro de R$ 200 e gastos de R$ 50: 25% do lucro consumido.
* Lucro de R$ 200 e gastos de R$ 200: 100% consumido.
* Lucro de R$ 200 e gastos de R$ 250: 125% consumido.

Utilize uma barra visual que progrida conforme o percentual aumenta.

Quando os gastos ultrapassarem o lucro, a barra deverá sinalizar o excesso em vermelho, sem limitar o cálculo a 100%.

Se o lucro não tiver sido informado ou for zero, não exiba um percentual calculado artificialmente. Apresente “Informe o lucro para calcular” ou uma mensagem equivalente.

### Resumo do dia

Inclua uma seção compacta contendo:

* Quantidade de gastos registrados.
* Maior gasto do dia.
* Categoria com maior volume de despesas, se houver dados.
* Horário do último lançamento, quando disponível.

Esses indicadores devem ser calculados a partir dos registros reais.

## 6. REGISTRO DE GASTOS DURANTE O DIA

Preciso conseguir adicionar cada gasto assim que ele acontecer.

Crie um botão de destaque chamado **“+ Adicionar gasto”**.

Ao tocar nele, abra um formulário rápido, em um modal ou painel inferior no celular, com os seguintes campos:

### Campos do gasto

**Valor**

* Obrigatório.
* Campo monetário.
* Teclado numérico decimal no celular.
* Não aceitar valores negativos ou zero.

**Descrição**

* Opcional, mas recomendada.
* Exemplos: alimentação, ferramenta, assinatura, anúncio, transporte, compra, despesa pessoal.

**Categoria**

* Seleção rápida.
* Categorias iniciais sugeridas:

  * Alimentação.
  * Transporte.
  * Moradia.
  * Assinaturas.
  * Ferramentas e softwares.
  * Publicidade e anúncios.
  * Compras.
  * Saúde.
  * Lazer.
  * Outros.

**Data**

* Preenchida automaticamente com a data atual.
* Permitir alteração para corrigir lançamentos de dias anteriores.

**Horário**

* Preenchido automaticamente.
* Registrar o horário real do lançamento.
* Permitir edição somente quando necessário para corrigir um registro.

### Funcionamento

Quero registrar um gasto com o menor número possível de toques.

O campo de valor deve receber foco de maneira apropriada, sem atrapalhar a navegação.

O botão principal será “Salvar gasto”.

Após salvar:

* Persistir o registro.
* Atualizar imediatamente os totais do dia.
* Atualizar o resultado líquido, se o lucro já estiver informado.
* Atualizar gráficos e indicadores relacionados.
* Exibir confirmação discreta de sucesso.
* Limpar o formulário para o próximo lançamento quando isso fizer sentido.

Se eu abrir o formulário e desistir, não deve ser criado nenhum gasto.

Não exigir descrição para cada lançamento, pois isso deixaria o registro diário mais lento.

## 7. REGISTRO DO LUCRO NO FINAL DO DIA

O lucro será informado principalmente no final do dia.

Não quero precisar registrar cada entrada de dinheiro individualmente. Quero inserir um único valor consolidado que represente o lucro daquele dia.

Crie uma seção no Dashboard chamada **“Fechamento do dia”**.

Ela deve apresentar:

* Data do fechamento.
* Lucro total informado.
* Gastos totais registrados.
* Resultado líquido calculado.
* Situação do dia: positivo, negativo ou equilibrado.

### Botão principal

**“Informar lucro do dia”**

Ao tocar, abrir um formulário simples com:

* Campo obrigatório para o valor total do lucro.
* Data de referência.
* Botão “Salvar lucro”.

O valor informado deve ser o lucro consolidado do dia, e não uma entrada adicional a ser somada repetidamente.

### Regra essencial contra duplicidade

Cada dia deve possuir apenas um registro consolidado de lucro.

Se eu informar R$ 300,00 e depois perceber que o valor correto era R$ 350,00, o sistema deverá atualizar o registro daquele dia de R$ 300,00 para R$ 350,00.

Nunca somar os dois valores automaticamente.

Se eu já tiver informado o lucro e tocar novamente em “Informar lucro do dia”, abrir o valor existente para edição, com uma identificação clara de que estou atualizando o fechamento.

O registro de lucro deverá aceitar valores iguais a zero, porque um dia pode terminar sem lucro. Não permitir valores negativos nesse campo; gastos e prejuízos serão calculados separadamente.

### Fechamento com gastos pendentes

Se eu tiver registrado gastos, mas ainda não tiver informado o lucro, o aplicativo deverá mostrar que o fechamento está pendente.

Não assumir que a falta de informação significa que o lucro foi zero.

Depois de informar o lucro, atualizar automaticamente todos os cálculos do dia.

Também deve ser possível consultar e corrigir o lucro de dias anteriores sem alterar os dados dos outros dias.

## 8. LISTA DE GASTOS

Crie uma tela dedicada chamada “Gastos”.

Ela deverá mostrar:

* Total gasto no dia selecionado.
* Quantidade de lançamentos.
* Lista dos gastos.
* Descrição.
* Categoria.
* Valor.
* Horário.
* Data.

A lista deverá ser organizada do gasto mais recente para o mais antigo.

Inclua:

* Filtro por data.
* Filtro por categoria.
* Busca por descrição.
* Ação para editar um gasto.
* Ação para excluir um gasto.
* Confirmação antes da exclusão.

Quando um gasto for editado ou excluído, recalcular automaticamente o resultado do dia correspondente e atualizar os indicadores e gráficos.

Não excluir registros silenciosamente.

## 9. HISTÓRICO FINANCEIRO

Crie uma tela de histórico com visão diária.

Cada dia deverá aparecer como um item ou card contendo:

* Data.
* Lucro informado.
* Total de gastos.
* Resultado líquido.
* Situação do fechamento.

Use cores de forma consistente:

* Verde: resultado positivo.
* Vermelho: resultado negativo.
* Neutro: resultado zero.
* Cinza ou roxo discreto: fechamento pendente.

Ao selecionar um dia, abrir uma visão detalhada daquele período, com:

* Lucro informado.
* Relação de todos os gastos.
* Total de gastos.
* Resultado líquido.
* Percentual do lucro consumido, quando calculável.

Permitir navegar entre dias anteriores e consultar datas específicas.

O histórico deverá ser ordenado por data, da mais recente para a mais antiga.

Dias sem movimentação não devem ser confundidos com dias fechados com lucro zero.

## 10. ANÁLISES E GRÁFICOS

Crie uma área de análises visualmente rica, mas objetiva.

Incluir filtros para:

* Hoje.
* Últimos 7 dias.
* Últimos 30 dias.
* Este mês.
* Período personalizado.

Exibir:

### Gráfico de resultado diário

Mostrar a evolução do resultado líquido por dia, com valores positivos e negativos claramente diferenciados.

### Gráfico de lucro versus gastos

Comparar o lucro informado e os gastos de cada dia.

Não representar lucro pendente como lucro zero confirmado.

### Gráfico de despesas por categoria

Mostrar onde estou gastando mais dinheiro.

### Indicadores do período

* Lucro total informado.
* Gastos totais.
* Resultado líquido acumulado.
* Média de gastos por dia com dados.
* Média de resultado líquido por dia com fechamento informado.
* Quantidade de dias positivos.
* Quantidade de dias negativos.
* Quantidade de dias equilibrados.
* Quantidade de fechamentos pendentes.

### Taxa de consumo do lucro no período

Calcular o total de gastos dividido pelo total de lucro informado no período, quando o denominador for maior que zero.

Identificar claramente que se trata da relação entre gastos e lucro informado.

Não somar os percentuais diários para gerar a taxa geral.

Todos os gráficos e indicadores devem ser alimentados pelos dados reais do aplicativo. Não utilizar valores fictícios ou exemplos permanentes no dashboard.

Se ainda não houver dados suficientes, mostrar estados vazios bem projetados, explicando brevemente como começar.

## 11. LÓGICA FINANCEIRA E REGRAS DE CÁLCULO

Essa parte é obrigatória e deve ser implementada corretamente.

Cada dia terá:

* Zero ou um registro consolidado de lucro.
* Zero ou vários registros de gastos.

Fórmula principal:

Resultado líquido do dia = lucro consolidado informado − soma dos gastos do dia.

Exemplo 1:

* Lucro: R$ 500,00.
* Gastos: R$ 150,00.
* Resultado líquido: R$ 350,00.
* Situação: positiva.

Exemplo 2:

* Lucro: R$ 200,00.
* Gastos: R$ 280,00.
* Resultado líquido: −R$ 80,00.
* Situação: negativa.

Exemplo 3:

* Lucro: R$ 100,00.
* Gastos: R$ 100,00.
* Resultado líquido: R$ 0,00.
* Situação: equilibrada.

Exemplo 4:

* Lucro não informado.
* Gastos: R$ 75,00.
* Resultado final: pendente.
* Gastos registrados: R$ 75,00.
* Não classificar o dia como prejuízo definitivo até que o lucro seja informado.

Para períodos com vários dias, somar os lucros informados, somar os gastos registrados e calcular a diferença entre os totais.

Mostrar separadamente os dias sem fechamento para que a análise não esconda informações incompletas.

Utilizar cálculos monetários precisos, preferencialmente armazenando valores em centavos inteiros ou em um tipo numérico apropriado, evitando erros de ponto flutuante.

Armazenar datas e horários de maneira consistente e exibir as datas de acordo com o fuso horário local do usuário.

## 12. PERSISTÊNCIA E ARQUITETURA

Os dados não podem desaparecer quando eu fechar ou atualizar o aplicativo.

Escolha a arquitetura mais adequada ao ambiente atual do projeto e utilize o backend persistente disponível.

Se o projeto estiver sendo desenvolvido no Lovable Cloud, utilize os recursos persistentes e seguros disponibilizados por ele.

Se estiver utilizando Supabase, configure tabelas e regras de acesso adequadas.

Não introduza uma infraestrutura complexa sem necessidade.

### Estrutura lógica sugerida

Tabela de gastos:

* id.
* amount_cents.
* description.
* category.
* transaction_date.
* transaction_time, quando necessário.
* created_at.
* updated_at.

Tabela de fechamentos diários:

* id.
* closing_date.
* profit_cents.
* created_at.
* updated_at.

A tabela de fechamentos deve possuir uma restrição de unicidade por usuário e data, garantindo um único lucro consolidado por dia.

Os gastos devem permanecer em registros individuais, permitindo edição, exclusão e análise por categoria.

Como o aplicativo será inicialmente utilizado por uma única pessoa, mantenha o fluxo simples, mas não exponha dados financeiros publicamente.

Se houver autenticação, os registros deverão pertencer ao usuário autenticado, com controle de acesso no backend.

Não colocar chaves privadas ou credenciais sensíveis no frontend.

Não armazenar os dados financeiros exclusivamente em variáveis de estado ou em armazenamento local do navegador como solução definitiva.

## 13. CONFIGURAÇÕES

Crie uma tela simples para:

* Consultar a moeda utilizada.
* Configurar categorias de gastos, se viável.
* Definir preferências de apresentação.
* Consultar informações sobre os dados registrados.
* Solicitar exportação dos dados em CSV, se possível sem aumentar excessivamente a complexidade.

A moeda inicial será BRL.

Não criar configurações desnecessárias nem opções que compliquem o uso diário.

## 14. ESTADOS DA INTERFACE E CONFIABILIDADE

Implemente corretamente:

* Carregamento inicial.
* Salvamento em andamento.
* Confirmação de sucesso.
* Mensagens de erro compreensíveis.
* Validação de valores.
* Estados vazios.
* Tratamento de falha de conexão.
* Proteção contra envio duplicado por toques repetidos.
* Atualização dos dados após edição e exclusão.

Não mostrar um lançamento como salvo antes de a persistência ser confirmada.

Se ocorrer uma falha, informar o usuário e permitir tentar novamente sem criar registros duplicados.

Todas as ações visíveis devem funcionar. Não deixar botões decorativos ou telas que pareçam prontas, mas não tenham implementação real.

## 15. ORGANIZAÇÃO DO CÓDIGO

Utilize componentes reutilizáveis e uma estrutura organizada.

Separe adequadamente:

* Componentes de interface.
* Formatação monetária.
* Regras e cálculos financeiros.
* Acesso e persistência dos dados.
* Gráficos e indicadores.
* Formulários de gastos.
* Formulário de fechamento diário.

Se o projeto utilizar React e TypeScript, mantenha tipagem consistente e evite duplicar regras financeiras em diferentes componentes.

O objetivo é permitir futuras alterações sem precisar reconstruir todo o aplicativo.

Não realizar refatorações desnecessárias nem adicionar dependências pesadas sem justificativa.

## 16. TESTES OBRIGATÓRIOS

Antes de concluir, verificar os seguintes cenários:

1. Adicionar um gasto de R$ 50,00.
2. Adicionar outro gasto de R$ 25,50.
3. Confirmar que o total de gastos é R$ 75,50.
4. Informar lucro de R$ 200,00 e confirmar resultado de R$ 124,50.
5. Atualizar o lucro para R$ 250,00 e confirmar resultado de R$ 174,50, sem duplicar o lucro.
6. Adicionar gastos superiores ao lucro e confirmar que o resultado fica vermelho.
7. Excluir um gasto e confirmar que os totais são recalculados.
8. Editar um gasto e confirmar a atualização do dashboard.
9. Fechar e reabrir o aplicativo e confirmar que os dados persistem.
10. Consultar um dia anterior sem misturar seus gastos com o dia atual.
11. Confirmar que um dia sem lucro informado aparece como pendente.
12. Confirmar que um lucro de R$ 0,00 informado é diferente de um fechamento pendente.
13. Testar a digitação de valores decimais no celular.
14. Testar o layout com o teclado numérico aberto.
15. Testar a atualização do dashboard após salvar um registro.
16. Testar o comportamento com dias positivos, negativos e equilibrados.

## 17. ORDEM DE EXECUÇÃO

Desenvolva o projeto nesta ordem:

1. Estrutura visual, identidade e navegação.
2. Dashboard funcional.
3. Cadastro, edição e exclusão de gastos.
4. Registro e edição do lucro consolidado diário.
5. Histórico financeiro.
6. Análises e gráficos.
7. Persistência, validações e tratamento de erros.
8. Testes funcionais e ajustes mobile.

Priorize primeiro o funcionamento correto do fluxo principal. Depois refine os detalhes visuais sem alterar a lógica financeira.

Não substituir funcionalidades reais por dados simulados.

Não adicionar módulos de vendas, clientes, estoque, investimentos, contas bancárias, pagamentos ou automações que não foram solicitados.

## 18. RESULTADO ESPERADO

Entregar um aplicativo chamado **Escalie Finanças**, com visual premium em preto e roxo, excelente experiência no celular e funcionamento confiável.

Ao longo do dia, devo conseguir adicionar gastos em poucos segundos.

No fim do dia, devo informar um único valor de lucro consolidado.

O sistema deverá calcular automaticamente meu resultado líquido, destacar visualmente quando estou no positivo ou no negativo e manter um histórico completo para que eu possa identificar se meus gastos estão consumindo todo o dinheiro que ganho.

**O foco é controle financeiro diário, clareza dos números, facilidade de uso e qualidade de execução.**

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6141e4f2-6094-4452-a8f0-52986aab3678).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```


## Backend e publicação

O aplicativo usa Supabase/Lovable Cloud para autenticação e persistência financeira. Antes de usar:

1. Configure `VITE_SUPABASE_URL` e uma chave pública (`VITE_SUPABASE_PUBLISHABLE_KEY` no Lovable Cloud ou `VITE_SUPABASE_ANON_KEY`).
2. No SQL Editor do projeto Supabase/Lovable Cloud conectado, execute o arquivo `supabase/migrations/20261003000000_create_finance_tables.sql`.
3. Em Authentication, configure a URL pública do app e as URLs de redirecionamento. Se a confirmação de e-mail estiver habilitada, confirme o e-mail após o cadastro.
4. Faça deploy e teste cadastro, login, criação/edição/exclusão de gastos, fechamento diário e reabertura do app.

A migration ativa Row Level Security e restringe cada linha ao usuário autenticado. Nunca coloque `service_role` ou qualquer chave secreta no frontend. O código do repositório não consegue aplicar a migration nem cadastrar variáveis no projeto hospedado sem acesso administrativo ao ambiente conectado.
