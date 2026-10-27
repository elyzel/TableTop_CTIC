<!--
OBJETIVO: consolidar a documentação da versão corrigida.
ARQUIVO: docs/arquitetura.md
SUBSTITUA TODO O CONTEÚDO.
-->

# TableTop CTIC — Arquitetura e execução

## 1. Visão geral

Aplicação web de treinamento de resposta a incidentes, com duas etapas:

- Fase 1: máquina contaminada.
- Fase 2: investigação de três servidores suspeitos.

Phishing, execução de arquivos, alertas e ações de resposta são simulações.
Nenhum comando de contenção é executado no computador do participante.

## 2. Componentes

| Arquivo | Responsabilidade |
|---|---|
| `app.py` | Servidor Flask, regras da Fase 1 e registro dos módulos |
| `fase2.py` | Regras, sorteio, pontuação e APIs da Fase 2 |
| `cenario.json` | Configuração da Fase 1 |
| `interrogatorio.json` | Catálogo de perguntas e respostas |
| `templates/participante.html` | Estrutura da interface da Fase 1 |
| `static/participante.css` | Aparência da Fase 1 |
| `static/participante.js` | Comportamento da Fase 1 |
| `static/fase1_ajustes.js` | Abertura, narração e controle de repetição |
| `templates/fase2.html` | Carregamento da interface da Fase 2 |
| `static/interrogatorio.js` | Interface do interrogatório |
| `static/interrogatorio.css` | Aparência da Fase 2 |
| `static/cinematica.css` | Títulos e legendas compartilhados |
| `static/apoio_ui.js` | Som e orientações interativas |
| `static/apoio_ui.css` | Aparência das orientações |
| `templates/facilitador.html` | Placares das duas fases |
| `dados/log_decisoes.csv` | Registro das decisões |

Os scripts são carregados depois da estrutura HTML.

Na Fase 1, a ordem é:
apoio_ui.js → participante.js → fase1_ajustes.js.

Na Fase 2, a ordem é:
apoio_ui.js → interrogatorio.js → inicialização da atividade.

## 3. Execução no Windows

Abra o PowerShell na pasta que contém `app.py`.

Na primeira instalação:

    py -m venv .venv
    .\.venv\Scripts\python.exe -m pip install Flask

Para iniciar:

    .\.venv\Scripts\python.exe app.py

Participante: http://127.0.0.1:5000/

Facilitador: http://127.0.0.1:5000/facilitador

Em outro computador, substitua 127.0.0.1 pelo IP do servidor.
A conectividade e o firewall precisam permitir a porta TCP 5000.

Para encerrar, pressione Ctrl+C no terminal.

## 4. Fase 1

O participante acompanha a introdução e toma decisões
sobre uma máquina potencialmente comprometida.

Objetivos essenciais:

- Conter.
- Comunicar o SOC.
- Preservar e documentar.

Antes do cronômetro, a orientação apresenta seleção de ícones,
descrição da ação e demonstração do botão Executar.

A demonstração não envia decisões ao servidor.
A rota `/api/orientacao/fase1` fornece somente os dados visuais das ações.

O cronômetro começa após a orientação, por `/api/iniciar`.

## 5. Fase 2

O servidor sorteia um infectado entre três suspeitos.
Cada inocente recebe duas pistas falsas com justificativas.

Não existe orçamento global de oito perguntas.
Cada pergunta pode ser consultada uma vez por servidor.
O catálogo atual permite 36 combinações.

As respostas ficam disponíveis no prontuário e no Caderno.
Reabrir uma resposta não consome pontos.

O participante decide quando fazer uma única acusação.

### Pontuação

| Regra | Pontos |
|---|---:|
| Saldo inicial | 1.000 |
| Consulta inédita | −25 |
| Acerto da acusação | +500 |
| Quente em desvio real | +15 |
| Frio em resultado normal | +5 |
| Morno em pista justificada | +5 |
| Quente em resultado normal de inocente | −10 |

Os bônus das marcações aparecem somente após a acusação.

A Fase 1 mantém sua pontuação independente.

## 6. Caderno

Após uma consulta, a célula correspondente permite alternar:

Sem marca → Frio → Morno → Quente → Sem marca.

As marcações representam a interpretação do participante.
O jogo apresenta a correção após a acusação.

Anotações precisam ser confirmadas em Salvar anotação.

## 7. Aberturas, orientação e som

A primeira abertura de cada fase não permite pular.
Após concluir a abertura, as tentativas seguintes permitem.

O histórico é preservado no reinício individual.
Resetar todos ou reiniciar o processo Python limpa esse histórico.

A orientação pode ser pulada independentemente da abertura.
Na Fase 2, o botão Como jogar permite revê-la.

O som começa habilitado.
Quando necessário, o navegador libera o áudio no primeiro gesto.
O botão Som de digitação permite silenciá-lo.

O título da Fase 2 é configurado no objeto `CINEMA`.
`TITULO_LEITURA_MS` controla a leitura do título.
`LEITURA_MINIMA_MS` controla a leitura após a digitação das falas.

## 8. Facilitador e armazenamento

O painel possui abas independentes para Fase 1 e Fase 2,
atualizadas aproximadamente a cada dois segundos.

Encerrar Fase 1 de todos atua somente na Fase 1.
Resetar todos remove participantes das duas fases e mantém o CSV.

Partidas, marcações e anotações ficam em memória.
O CSV não restaura automaticamente as partidas.

O projeto utiliza identificação por nome e não possui
autenticação individual ou administrativa.

## 9. Validação da consolidação

Foram verificadas:

- Sintaxe dos scripts.
- Renderização dos templates pelo Flask.
- APIs e pontuação das 36 consultas.
- Bloqueio de consultas repetidas.
- Bônus apresentados somente no resultado.
- Separação dos placares.
- Presença dos controles exigidos pela interface.
- Ordem de carregamento dos scripts.

A aparência das animações, o som e os destaques interativos
devem ser conferidos no navegador.