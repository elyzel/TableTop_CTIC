<!-- OBJETIVO: inventariar o contrato atual das rotas para manutenção e diagnóstico. -->
# API e páginas

Base: mesmo host/protocolo/porta da interface. Corpos de POST utilizam JSON com `Content-Type: application/json`. Não há autenticação nem autorização por papel nas rotas atuais. Este contrato é descritivo e não possui versionamento de API.

## Rotas

| Método | Caminho | Entrada principal | Efeito / saída |
| --- | --- | --- | --- |
| GET | `/` | — | HTML do participante |
| GET | `/facilitador` | — | HTML do painel |
| GET | `/fase2` | Cookie `tt_participante` | HTML se elegível; redireciona para `/` caso contrário |
| POST | `/api/entrar` | `nome` | Cria/recupera nome e retorna `pid`; nome vazio gera 400 |
| POST | `/api/iniciar` | `pid` | Inicia cronômetros se ainda não iniciados |
| GET | `/api/estado/<pid>` | PID no caminho | Estado da Fase 1; também avalia tempo |
| POST | `/api/executar` | `pid`, `acao` | Aplica ação inédita da Fase 1 e registra evento |
| GET | `/api/orientacao/fase1` | — | Dados visuais das ações, sem executar decisões |
| GET | `/api/painel` | — | Lista do placar da Fase 1 |
| POST | `/api/encerrar` | — | Encerra Fase 1 de participantes iniciados ainda ativos |
| POST | `/api/resetar` | — | Remove participantes das duas fases e limpa `vistos`; mantém CSV |
| GET | `/api/csv` | — | Download do CSV ou 404 se ainda ausente |
| POST | `/api/animacoes` | `pid` | Estado de visualização das aberturas |
| POST | `/api/participante/reiniciar` | `pid` | Remove participante após Fase 1 concluída e apaga cookie |
| POST | `/api/fase2` | `pid`, `acao` e campos abaixo | Estado e operações da investigação |
| GET | `/api/fase2/painel` | — | Placar e situação da investigação |

Os recursos em `/static/...` são servidos pelo Flask. A Fase 1 trunca o nome a 40 caracteres; não há garantia de unicidade por pessoa.

## Operações da Fase 2

Na primeira chamada, use `estado` para criar/obter o caso. As outras operações precisam do `tentativa` retornado pela tentativa atual. Todas exigem participante existente, Fase 1 encerrada e ausência de formatação.

| `acao` | Campos adicionais ao `pid` | Condição / efeito |
| --- | --- | --- |
| `estado` | Nenhum | Cria o caso se ausente e retorna a visão pública |
| `intro` | `tentativa` | Confirma abertura e libera interação |
| `perguntar` | `tentativa`, `suspeito`, `pergunta` | Consulta combinação inédita após abertura; custa 25 |
| `marcar` | `tentativa`, `suspeito`, `pergunta`, `marca` | Evidência já consultada; marca vazia, `frio`, `morno` ou `quente` |
| `anotar` | `tentativa`, `suspeito`, `texto` | Salva até 1.000 caracteres após abertura |
| `acusar` | `tentativa`, `suspeito` | Encerra e apresenta resultado/gabarito |
| `reiniciar` | `tentativa` | Exige acusação concluída; cria novo caso |

`acao` omitida equivale a `estado`. Os IDs de pergunta devem ser obtidos do catálogo retornado pela própria API.

### Exemplo de sequência de corpos

```json
{"nome":"Grupo 01"}
```

Enviar a `/api/entrar`, guardar o `pid` retornado e realizar o fluxo da Fase 1 pela interface. Depois da conclusão:

```json
{"pid":"Grupo 01","acao":"estado"}
```

Enviar a `/api/fase2`; obter o token. Para confirmar a abertura:

```json
{"pid":"Grupo 01","acao":"intro","tentativa":"TOKEN_RETORNADO"}
```

Não executar exemplos de reset/encerramento contra uma turma ativa.

## Respostas e erros relevantes

- Fase 1: estado `nao_iniciado`, `jogando` ou `finalizado`; PID ausente pode gerar 404. Ação inválida, repetida ou incompatível com o estado gera 400.
- Fase 2: 400 para campos inválidos; 404 para participante ausente; 403 para bloqueio por formatação; 409 para etapa incompatível, pergunta repetida, caso encerrado ou tentativa antiga.
- Os erros não são uniformes em todo o backend. Parte da validação da Fase 1 é menos defensiva que a da Fase 2; não presumir que toda entrada malformada recebe erro 4xx.
- Respostas de API e da página `/fase2` recebem `Cache-Control: no-store` pelo hook da Fase 2.
- O cookie é `HttpOnly`, `SameSite=Lax` e `Secure` quando a requisição é HTTPS. Ele contém o identificador, sem prova criptográfica de identidade.
- O token `tentativa` evita operar sobre um caso antigo; não substitui autenticação.

## Registros

Decisões da Fase 1 e consultas/acusação da Fase 2 gravam CSV. Marcações e notas não constituem trilha completa em disco. Veja [dados](dados.md).
