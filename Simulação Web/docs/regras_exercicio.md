<!-- OBJETIVO: registrar as regras ativas, sem confundir código legado com pontuação vigente. -->
# Regras do exercício

## Escopo pedagógico

A atividade simula uma máquina contaminada e a investigação de três servidores. Isolar, formatar, executar antivírus e demais ações são representações didáticas: não executam essas operações nos computadores reais. A eventual configuração de um alerta real do BitDefender é uma atividade externa ao código.

## Fase 1

`cenario.json` é a fonte de conteúdo; `app.py` aplica as regras. O saldo inicial é zero. Cada ação só pode ser executada uma vez na tentativa. O cenário tem 12 ações, e três flags representam os objetivos essenciais:

| Objetivo | Flag | Ação associada |
| --- | --- | --- |
| Conter | `isolou` | Isolar da Rede |
| Comunicar | `comunicou_soc` | Abrir Chamado (SOC) |
| Preservar e documentar | `preservou` | Registrar Linha do Tempo |

Ao completar os três objetivos, o servidor encerra a Fase 1, independentemente da ordem. Registrar a linha do tempo isoladamente não encerra a fase no cenário atual.

### Tempos e inatividade

O tempo total é **720 segundos**, iniciado em `/api/iniciar` após o fluxo de abertura/orientação da interface.

| Estado interno | Limite | Consequência da inatividade |
| --- | ---: | --- |
| `alerta` | 240 s | −10, flag `ignorou`, segue para `atraso` |
| `reiniciou` | 180 s | −10, flag `ignorou`, segue para `atraso` |
| `atraso` | 180 s | −10, flag `ignorou`, termina |
| `contido` | 240 s | −2, segue para `preservar` |
| `preservar` | 180 s | −3, termina |

Esgotar o tempo total aplica −5 e `tempo_esgotado`. O teste usa tempo transcorrido maior que o limite e acontece nas requisições de estado/ação; não existe agendador de tempo contínuo.

Uma ação com efeito positivo recebe bônus de **+3** quando executada até a metade do limite do estado atual. Penalidades de inatividade não recebem bônus. A pontuação específica de cada ação depende do estado e está em `acoes` no JSON.

Exemplo: Isolar no alerta (+10), abrir chamado em contido (+10), registrar linha do tempo em preservar (+10) soma 30 pontos, podendo atingir 39 com os três bônus. Retirar somente o cabo não contém a máquina neste cenário, pois o Wi-Fi permanece ativo.

### Finais em ordem de prioridade

| Final | Condição atual |
| --- | --- |
| Vazamento de dados | Presença de `ignorou` |
| Contenção exemplar | Três objetivos, nenhuma das flags ruins e pontos ≥ 0 |
| Contenção parcial | Três objetivos, sem atender ao final anterior |
| Resposta incompleta | Presença de `isolou`, sem atender aos anteriores |
| Propagação na rede | Fallback |

As flags ruins consideradas no final exemplar são `perdeu_evidencia`, `apagou_evidencia`, `ignorou` e `tempo_esgotado`. Os finais são avaliados na ordem do JSON; vale o primeiro aplicável. A barra de risco é um indicador visual calculado por tempo, isolamento e flags ruins; não substitui os critérios dos finais.

## Entrada na Fase 2

É necessário encerrar a Fase 1. Quem executou “Formatar Máquina” fica impedido de avançar, mesmo que tenha outro resultado. A verificação procura o nome da ação no histórico: mudanças nesse texto exigem cuidado também em `fase2.py`.

Não há exigência de “Contenção exemplar” para avançar no código atual.

## Fase 2 — investigação

O servidor sorteia um infectado entre `s1`, `s2` e `s3`. Os dois inocentes recebem duas pistas falsas justificadas cada um; o infectado usa o perfil correspondente no catálogo. A seleção é feita com `SystemRandom` e não representa consulta a equipamentos reais.

O catálogo atual contém 12 perguntas e permite **36 combinações inéditas** de servidor/pergunta. Uma consulta repetida ao mesmo servidor é rejeitada; reabrir uma resposta já recebida não gera nova cobrança.

**Regra ativa:** `pontos = max(0, 1000 − 25 × consultas inéditas)`.

| Consultas | Saldo |
| ---: | ---: |
| 0 | 1.000 |
| 12 | 700 |
| 24 | 400 |
| 36 | 100 |

Não há limite global de oito perguntas. A constante `PERGUNTAS = 12` não restringe o total de consultas na API. O número efetivo de combinações é calculado pelo catálogo e pelos suspeitos.

Marcações frio/morno/quente e anotações auxiliam a interpretação. As anotações são limitadas a 1.000 caracteres por servidor. A acusação é única por tentativa e indica acerto ou erro, mas **não altera a pontuação ativa**. Os campos `bonus_acerto` e `bonus_marcas` retornam zero.

Existem constantes de bônus e um trecho antigo após um `return` em `pontuacao()`. Esse trecho é inacessível e não deve ser usado para explicar a regra atual. O saldo da Fase 1 é independente do saldo da Fase 2.

Depois da acusação, o gabarito é disponibilizado. Reiniciar a Fase 2 exige conclusão da tentativa e produz um novo sorteio/token. Reiniciar a Fase 1 remove o participante e sua investigação, mantendo o histórico de aberturas em `vistos`; reset global ou reinício do processo limpa esse histórico.

## Alterar conteúdo com segurança

- Não editar o cenário durante uma turma: a Fase 1 relê o arquivo e pode misturar regras.
- Conferir todo destino `proxima`: fase existente ou `FIM`.
- Manter `padrao` em cada ação, IDs únicos e consistência de flags.
- Manter a ordem intencional dos finais.
- O catálogo da investigação precisa de ao menos quatro perguntas elegíveis como `pista_falsa`, devido ao sorteio atual.
- Reiniciar o processo para recarregar alterações em `interrogatorio.json`, após concluir as partidas.
- Validar também os textos e cálculos do frontend quando as regras mudarem.
