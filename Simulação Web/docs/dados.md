<!-- OBJETIVO: definir o que é persistido e orientar preservação e recuperação sem prometer restauração de sessões. -->
# Dados, registros e cópia de segurança

## Onde cada informação fica

| Informação | Local | Sobrevive ao reinício do processo? |
| --- | --- | --- |
| Participantes, fase, histórico e pontos da Fase 1 | Memória Python | Não |
| Sorteio, respostas consultadas, notas, marcas e resultado da Fase 2 | Memória Python | Não |
| Histórico de aberturas (`vistos`) | Memória Python | Não |
| Identificação `tt_pid` | `localStorage` do navegador | Pode permanecer, mas não recupera estado inexistente no servidor |
| Ordem de ícones `tt_ord` e opção de áudio `tt_audio` | `sessionStorage` | Restrita à sessão do navegador |
| Cookie `tt_participante` | Navegador | Identificação auxiliar, sem persistência de partida |
| Eventos gravados | `dados/log_decisoes.csv` | Sim, se o disco/volume for preservado |

## Formato do CSV

Separador `;`, gravação com `encoding="utf-8-sig"` e cabeçalho quando o arquivo ainda não existe.

| Coluna | Significado |
| --- | --- |
| `data_hora` | Data/hora local do processo, sem offset no texto |
| `participante` | Nome/PID informado |
| `fase` | Estado da Fase 1 ou rótulo `fase2_interrogatorio` / `fase2_resultado` |
| `acao` | Nome da ação, pergunta ou acusação |
| `pontos_acao` | Variação registrada para o evento |
| `bonus_tempo` | Bônus separado; na Fase 2 é zero |
| `tempo_s` | Tempo da fase atual na Fase 1; tempo desde a criação do caso na Fase 2 |
| `total` | Saldo da fase correspondente naquele evento |

Não somar `total` de linhas sucessivas nem misturar os saldos das duas fases. Na acusação, o `total` mantém o saldo da investigação e `pontos_acao` é zero na regra atual. A linha registra o suspeito acusado, mas não inclui um campo dedicado de vitória ou o gabarito.

Consultas, decisões e penalidades da Fase 1 são registradas; notas e marcações não são persistidas em CSV. Encerramento administrativo e reset não produzem trilha completa. Não existe identificador dedicado de turma/tentativa no esquema atual, portanto nomes repetidos em sessões sucessivas dificultam a separação posterior.

O arquivo é acumulativo e não é assinado nem protegido contra alteração pelo responsável pelo host. Não tratá-lo como evidência forense íntegra ou como registro completo das partidas.

## Preservação

1. Concluir a atividade para evitar copiar enquanto o arquivo está sendo escrito.
2. Exportar `/api/csv` ou copiar o arquivo diretamente. No Docker, usar o procedimento do [guia Docker](instrucoes_Docker.md).
3. Guardar a cópia com data, turma e referência do código em destino restrito definido pela instituição.
4. Conferir cabeçalho, quantidade de linhas e abertura em ferramenta apropriada.
5. Somente depois, com o serviço parado, mover o CSV ativo se a próxima turma precisar de arquivo separado.

`Resetar` limpa a memória e mantém o CSV. No Docker, o volume nomeado preserva o CSV; remover o volume elimina essa proteção. Uma cópia no mesmo disco/volume não protege contra perda do host.

Para retornar um CSV ao diretório de dados, pare o serviço, preserve o arquivo atual, copie a versão desejada e confira permissões e cabeçalho. Isso recupera apenas o registro, **não restaura sessões**, notas ou sorteios. Não substituir arquivos enquanto a aplicação escreve.

## Retenção e acesso

Prazo de retenção, responsáveis, permissões e descarte precisam ser aprovados pelo CTIC/SSI. Não há prazo institucional definido no código. Prefira identificadores de grupo em lugar de nomes pessoais quando o objetivo permitir.

Nomes são entradas do usuário. Ao abrir exportações em planilhas, trate células iniciadas por caracteres de fórmula como texto; a implementação não fornece neutralização específica para esse risco. Não publicar o CSV no GitHub.

Configure e verifique o fuso do ambiente de execução antes da turma. O contêiner não declara `TZ` no Compose recebido; não presumir que o horário coincidirá com o host.
