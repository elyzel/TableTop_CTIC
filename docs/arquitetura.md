<!-- Crie o arquivo docs/ARQUITETURA.md e cole todo este conteúdo. -->

# Arquitetura e execução — TableTop CTIC

## 1. Objetivo

O TableTop CTIC é uma aplicação web para treinamento de resposta a incidentes de segurança da informação.

O participante interage com uma área de trabalho simulada e toma decisões diante de uma máquina potencialmente contaminada. O facilitador acompanha as decisões e os resultados em um painel.

O exercício trabalha três objetivos essenciais:

- Conter o equipamento.
- Comunicar o SOC.
- Preservar e documentar informações do incidente.

O phishing, o download, a execução de arquivos, os alertas do Bitdefender e o isolamento são simulações visuais. Essas ações não modificam o computador do participante nem executam comandos reais de contenção.

## 2. Arquitetura atual

A aplicação utiliza uma arquitetura cliente-servidor:

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| Interface | HTML, CSS e JavaScript | Apresentar a simulação, receber cliques e consultar a API |
| Servidor | Python e Flask | Processar decisões, controlar estado, tempo, objetivos e pontuação |
| Configuração | JSON | Definir fases, ações, textos, limites e condições dos finais |
| Estado da partida | Memória do processo Python | Armazenar participantes e progresso |
| Registro de decisões | CSV | Registrar decisões e pontuações em disco |

O navegador envia e recebe dados por HTTP, usando JSON nas chamadas da API.

Durante o jogo, a interface do participante consulta o estado a cada dois segundos. O painel do facilitador consulta o placar no mesmo intervalo.

## 3. Estrutura de arquivos

| Caminho | Descrição |
|---|---|
| `app.py` | Inicialização do Flask, rotas, estado e regras do exercício |
| `cenario.json` | Configuração das fases, ações, objetivos e finais |
| `templates/participante.html` | Interface e animações do participante |
| `templates/facilitador.html` | Painel de acompanhamento e comandos do facilitador |
| `dados/log_decisoes.csv` | Histórico das decisões |
| `docs/ARQUITETURA.md` | Este documento |

## 4. Fluxo de funcionamento

1. O participante informa seu nome.
2. O servidor cria ou recupera a entrada correspondente.
3. A interface apresenta a introdução e a sequência simulada de phishing.
4. Ao terminar a introdução, o navegador solicita o início dos cronômetros.
5. O participante seleciona e executa ações.
6. O servidor calcula pontos, bônus, flags e possíveis mudanças de fase.
7. A interface consulta e apresenta o estado atualizado.
8. O servidor encerra a partida quando uma condição de encerramento é atingida.
9. O participante recebe o resultado e o histórico de decisões.

O nome informado identifica a partida no servidor. Nomes iguais compartilham a mesma entrada; não há autenticação individual.

### 4.1 Fases

| Fase | Limite | Situação |
|---|---:|---|
| `alerta` | 240 segundos | Alerta inicial após a execução simulada do arquivo |
| `reiniciou` | 180 segundos | Retorno do comportamento suspeito após reinicialização |
| `atraso` | 180 segundos | Sinais de impacto em outros recursos |
| `contido` | 240 segundos | Equipamento isolado, aguardando continuidade da resposta |
| `preservar` | 180 segundos | Preservação e documentação do incidente |

O limite total configurado é de **720 segundos — 12 minutos**, contado após a introdução. A partida pode terminar antes desse limite.

### 4.2 Encerramento

A partida pode terminar por:

- Conclusão dos três objetivos essenciais, independentemente da ordem.
- Execução da ação Formatar Máquina.
- Estouro de uma fase cujo destino seja `FIM`.
- Esgotamento do tempo total.
- Comando Encerrar todos no painel do facilitador.

Os cinco finais configurados são avaliados na ordem definida em `cenario.json`:

1. Vazamento de dados.
2. Contenção exemplar.
3. Contenção parcial.
4. Resposta incompleta.
5. Propagação na rede.

Esses resultados são classificações didáticas do exercício.

## 5. Estado e persistência

O progresso dos participantes fica no dicionário `participantes`, dentro do processo Python.

Consequências dessa implementação:

- Reiniciar a aplicação perde as partidas em andamento.
- O CSV permanece em disco após o reinício.
- O CSV não é utilizado para restaurar partidas.
- O comando Resetar limpa os participantes da memória, mas mantém o CSV.
- A execução deve utilizar um único processo para manter um estado compartilhado entre os participantes.

O navegador armazena o identificador da partida em `localStorage` e a ordem das ações em `sessionStorage`.

### 5.1 Controle de tempo

A verificação dos limites ocorre nas requisições de consulta de estado e execução de ações.

Não existe uma tarefa de segundo plano que avance as fases continuamente. Se o participante deixar de consultar a aplicação, a avaliação do tempo fica pendente até uma nova requisição.

A consulta do painel do facilitador não executa essa verificação.

## 6. Principais rotas

| Método | Rota | Finalidade |
|---|---|---|
| GET | `/` | Interface do participante |
| GET | `/facilitador` | Painel do facilitador |
| POST | `/api/entrar` | Criar ou recuperar participante |
| POST | `/api/iniciar` | Iniciar os cronômetros |
| GET | `/api/estado/<pid>` | Consultar estado e verificar tempo |
| POST | `/api/executar` | Executar uma ação |
| GET | `/api/painel` | Consultar o placar |
| POST | `/api/encerrar` | Encerrar partidas iniciadas |
| POST | `/api/resetar` | Limpar participantes da memória |
| GET | `/api/csv` | Baixar o histórico de decisões |

## 7. Como executar no Windows

### 7.1 Pré-requisitos

- Python 3 com o comando `py` disponível.
- Módulo `pip` disponível.
- Navegador com JavaScript habilitado.
- Acesso à fonte de pacotes Python para instalar o Flask.

Abra o PowerShell na pasta principal do projeto, onde estão `app.py` e `cenario.json`.

Os comandos seguintes devem ser executados nessa pasta, e não dentro de `docs`.

### 7.2 Verificar o Python

```powershell
py --version
py -m pip --version
```

### 7.3 Criar um ambiente virtual

```powershell
py -m venv .venv
```

Crie um ambiente próprio no computador de destino. Um ambiente virtual copiado de outra máquina pode conter caminhos e executáveis incompatíveis.

### 7.4 Instalar a dependência

```powershell
.\.venv\Scripts\python.exe -m pip install Flask
```

O projeto analisado não fixa a versão do Flask em um arquivo de dependências. Esse comando instala a versão disponibilizada pela fonte de pacotes configurada no computador.

### 7.5 Iniciar a aplicação

```powershell
.\.venv\Scripts\python.exe app.py
```

Não é necessário ativar o ambiente virtual, pois o comando utiliza diretamente o Python de `.venv`.

Mantenha o terminal aberto enquanto o exercício estiver em execução.

### 7.6 Acessar no próprio servidor

Participante:

```text
http://127.0.0.1:5000/
```

Facilitador:

```text
http://127.0.0.1:5000/facilitador
```

### 7.7 Acessar de outro computador

A aplicação está configurada para escutar em todas as interfaces de rede, na porta TCP 5000.

No servidor, consulte os endereços de rede:

```powershell
ipconfig
```

Identifique o IPv4 da interface utilizada pelos participantes e substitua `IP_DO_SERVIDOR` nos endereços:

```text
http://IP_DO_SERVIDOR:5000/
http://IP_DO_SERVIDOR:5000/facilitador
```

Os computadores precisam ter conectividade com o servidor, e as regras de firewall devem permitir o acesso à porta TCP 5000.

O endereço `0.0.0.0` exibido na configuração representa a escuta em todas as interfaces; utilize o IP do servidor no navegador.

### 7.8 Encerrar o servidor

No terminal em que a aplicação está sendo executada, pressione:

```text
Ctrl + C
```

Ao encerrar o processo, o estado das partidas em memória será perdido.

## 8. Como alterar o cenário

Edite `cenario.json` para ajustar:

- Título e tempo total.
- Objetivos.
- Eventos e limites das fases.
- Ações, pontos e consequências.
- Condições e textos dos finais.

Valide a sintaxe do arquivo após editar:

```powershell
.\.venv\Scripts\python.exe -m json.tool cenario.json
```

O servidor relê o cenário quando a função de carregamento é chamada pelas rotas. Isso permite que alterações sejam percebidas sem reiniciar, mas não migra o estado das partidas existentes.

Recomenda-se alterar o cenário antes de iniciar a sessão. Mudanças em identificadores, fases ou objetivos durante partidas podem gerar inconsistências.

Algumas regras estão em `app.py`, e não no JSON, como:

- Bônus de tempo de três pontos.
- Penalidade de cinco pontos por tempo total esgotado.
- Verificação de conclusão dos objetivos.
- Fórmula do indicador de risco.

Animações, dicas e comportamento visual ficam em `templates/participante.html`.

## 9. Limitações atuais

- O painel e as APIs administrativas não possuem autenticação ou autorização.
- Qualquer cliente com acesso às rotas administrativas pode solicitar encerramento, reset ou exportação.
- O acesso utiliza HTTP, sem TLS configurado na aplicação.
- O servidor iniciado por `app.py` é o servidor de desenvolvimento do Flask.
- O estado não é compartilhado entre processos e não possui recuperação após reinício.
- Algumas consequências são textos estáticos e podem contradizer ações anteriores.
- O projeto não possui integração real com a plataforma Bitdefender.

A configuração atual é adequada para avaliação em ambiente de exercício controlado. Autenticação administrativa, persistência de partidas e definição de versões das dependências são melhorias recomendadas antes de ampliar o uso.

## 10. Manutenção desta documentação

Este documento corresponde aos arquivos do projeto analisados em **23/10/2026**.

Revise seu conteúdo sempre que houver alterações nas rotas, na estrutura de arquivos, nas regras do cenário, nas dependências ou no procedimento de execução.

<!--
ARQUIVO: docs/ARQUITETURA.md
ACRESCENTE este bloco ao final do documento.
-->

<!--
BLOCO 9
ARQUIVO: docs/ARQUITETURA.md

Se você adicionou a seção:
"## 11. Continuação do exercício — Fase 2"

SUBSTITUA essa seção inteira, até o fim do documento,
pelo conteúdo abaixo.

Caso essa seção ainda não exista, acrescente ao final.
-->

## 11. Fase 2 — O interrogatório

Atualização: 23/10/2026.

A Fase 2 foi substituída integralmente por uma investigação
com três servidores suspeitos de um mesmo cluster.

O participante dispõe de oito perguntas compartilhadas entre
os três servidores e uma acusação por tentativa.

### 11.1 Estrutura acrescentada

| Arquivo | Responsabilidade |
|---|---|
| `fase2.py` | Rotas, sorteio, orçamento, evidências, pontuação e reinícios |
| `interrogatorio.json` | Catálogo de perguntas e perfis de resposta |
| `templates/fase2.html` | Página que inicializa a atividade |
| `static/interrogatorio.css` | Estilos da investigação e da abertura |
| `static/interrogatorio.js` | Interface, narração, caderno e resultado |
| `static/fase1_ajustes.js` | Ajustes de narração e abertura da Fase 1 |

O registro em `app.py` permanece:

`instalar_fase2(app, participantes, lock, log)`

Não foram adicionadas dependências externas.

### 11.2 Fluxo

1. Concluir a Fase 1.
2. Selecionar Avançar para Fase 2.
3. Assistir à abertura do caso.
4. Escolher um servidor na parede de suspeitos.
5. Fazer perguntas e consultar seu prontuário.
6. Comparar evidências no caderno.
7. Registrar marcações e anotações.
8. Fazer uma única acusação.
9. Consultar o resultado e o caderno corrigido.

Ao consumir a oitava pergunta, a interface abre a escolha
da acusação. O participante ainda pode consultar o caderno.

Vitória permite avançar para o encerramento.
Uma nova tentativa pode ser iniciada pelo resultado.

### 11.3 Sorteio e evidências

O servidor sorteia qual dos três suspeitos está infectado.

Cada inocente recebe duas pistas falsas com justificativas.
As demais métricas numéricas saudáveis recebem pequenas
variações de até aproximadamente 10%, com arredondamento.

O infectado possui oito desvios relevantes e quatro
perguntas com resultados neutros.

Antes da acusação, o navegador recebe somente as respostas
já consultadas, sem a classificação das evidências nem
a identidade do infectado.

O gabarito completo é enviado após o encerramento do caso.

O catálogo é carregado ao iniciar a aplicação.
Reinicie o servidor após editar `interrogatorio.json`.

### 11.4 Caderno

O caderno apresenta:

- Exames consultados.
- Referência saudável.
- Respostas dos três servidores.
- Interrogação nas células ainda não consultadas.
- Marcações Frio, Morno e Quente.
- Anotações por suspeito, com botão para salvar.

As marcações não recebem correção durante a investigação.

No resultado, o caderno revela:

- Desvios reais do infectado.
- Pistas falsas com justificativas.
- Resultados sem desvio relevante.
- Marcações feitas pelo participante.
- Evidências não consultadas.

### 11.5 Pontuação

| Regra | Pontos |
|---|---:|
| Saldo inicial | 1.000 |
| Cada pergunta | −50 |
| Acerto da acusação | +500 |
| Quente em desvio real do infectado | +25 |
| Quente em resultado normal de inocente | −10 |
| Frio em resultado normal | +10 |
| Morno em pista falsa justificada | +10 |

As demais combinações não alteram a pontuação das marcações.
O resultado final nunca fica abaixo de zero.

As constantes ficam no início de `fase2.py`.

Tentar novamente cria novo sorteio, restaura as oito perguntas
e reinicia o saldo em 1.000 pontos, sem acumular a tentativa anterior.

A pontuação da Fase 1 é preservada e apresentada separadamente.

### 11.6 Aberturas e narração

A primeira abertura de cada fase não oferece Pular animação.

Após concluir a abertura, o participante pode pulá-la nas
tentativas seguintes.

O registro utiliza o nome do participante e permanece na
memória do servidor, separado do estado da partida.

- Reinício individual mantém esse registro.
- Resetar todos limpa o registro.
- Reiniciar o processo Python também limpa o registro.

A narração das duas fases aparece em uma faixa preta inferior,
com texto digitado progressivamente.

Clicar na fala completa o texto atual.
Essa interação não pula a abertura inteira.

A preferência por movimento reduzido desativa a digitação
na narração e reduz as animações da Fase 2.

As ilustrações dos racks utilizam SVG, sem imagens externas.

### 11.7 Rotas

| Método | Rota | Finalidade |
|---|---|---|
| GET | `/fase2` | Página do interrogatório |
| POST | `/api/fase2` | Estado, abertura, perguntas, marcações, anotações, acusação e reinício |
| POST | `/api/animacoes` | Consultar aberturas já assistidas |
| POST | `/api/participante/reiniciar` | Reiniciar individualmente a partir da Fase 1 |

As ações da Fase 2 incluem um identificador de tentativa.
Requisições de uma tentativa anterior são recusadas.

A API exige uma Fase 1 finalizada para acessar o caso.

### 11.8 Integração e registros

A interface expõe:

`iniciarInterrogatorio(containerEl, opcoes)`

O callback `onAtividadeConcluida` recebe:

- `vitoria`
- `pontos`
- `perguntasUsadas`

O callback é disparado uma vez por tentativa apresentada
na instância atual da interface.

A página também publica o evento:

`tabletop:atividadeConcluida`

Perguntas e acusações são registradas no CSV existente.
O campo `total` representa o saldo ou resultado da Fase 2.
O saldo inicial de 1.000 não é uma linha separada no CSV.

Marcações e anotações permanecem no estado em memória.
Elas não são exportadas individualmente para o CSV atual.

### 11.9 Limitações mantidas

O painel do facilitador continua apresentando a Fase 1.

Encerrar todos continua encerrando somente a Fase 1.
Resetar todos remove os estados das duas fases e o histórico
das aberturas assistidas.

A aplicação continua utilizando identificação por nome,
sem autenticação individual ou administrativa.

O estado continua em memória e é perdido ao reiniciar o servidor.

O exercício funciona por meio do Flask; não deve ser aberto
diretamente como um HTML local.

As consultas são simulações. Não há execução de comandos
no sistema operacional nem comunicação com os endereços
fictícios apresentados no caso.