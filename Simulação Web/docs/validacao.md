<!-- OBJETIVO: registrar a verificação documental e seus limites de forma auditável. -->
# Registro de validação documental

## Identificação

| Campo | Registro |
| --- | --- |
| Data | 30/10/2026 |
| Entrada | `TableTop_CTIC(2).zip` |
| Método | Leitura do código e verificações estáticas locais |
| Escopo de alteração | Somente arquivos Markdown |
| Aprovação institucional | Não realizada nesta revisão |

## Verificações realizadas

- Comparação dos dois Markdown originais de `docs/` com código, Dockerfile e Compose.
- Atualização do README da raiz e conversão do guia antigo em ponte para o índice atual.
- Conferência automática dos destinos dos links relativos dos Markdown entregues.
- Inventário estático das 16 rotas explícitas declaradas por `get`/`post` em `app.py` e `fase2.py`, comparado com `api.md`. Recursos estáticos automáticos do Flask não entram nessa contagem.
- Leitura e interpretação dos dois JSONs: tempo total de 720 segundos, 12 ações, cinco finais, 12 perguntas e 36 combinações possíveis na investigação.
- Conferência de destinos `proxima` e existência de pelo menos quatro perguntas elegíveis para pistas falsas.
- Inspeção da função ativa de pontuação da Fase 2: retorno de saldo antes do bloco legado, sem bônus final.
- Comparação SHA-256 dos 1.223 arquivos originais não Markdown, fora de `.git/`: conteúdo preservado integralmente no diretório de trabalho.
- Conferência do ZIP de entrega para incluir apenas os 16 Markdown revisados/novos nos caminhos correspondentes.

Os links foram verificados quanto à existência do arquivo de destino; links externos não foram consultados. Os diagramas usam Mermaid textual, sem renderização gráfica nesta revisão.

## Não executado

Não houve instalação de dependências, partida em navegador, teste de áudio/animação, construção Docker, teste em Windows, ensaio de rede, carga, certificado ou recuperação real de ambiente. Flask e Docker não estavam disponíveis no ambiente de revisão. Portanto este documento não declara aprovação funcional nem operacional da aplicação.

O código não foi alterado. O problema de dependência do Gunicorn, a inclusão duplicada de script, os certificados recebidos e os controles de acesso continuam como pendências em [pendencias.md](pendencias.md).

## Aceite pela equipe

Antes do uso, executar o roteiro em [operacao.md](operacao.md) e anexar evidências à versão/commit efetivamente utilizada. Registrar ambiente, responsável e resultado de cada caso. Referenciar este documento como revisão documental, sem reutilizá-lo como evidência de testes não executados.
