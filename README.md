# TableTop CTIC — Máquina contaminada

Exercício web de resposta a incidentes de segurança, voltado à aprendizagem por decisões e investigação. Maria executa um arquivo apresentado como documento; os participantes precisam conter o incidente, comunicar o SOC e preservar informações.

A aplicação contém duas atividades: **Fase 1 — Máquina contaminada**, com ações e consequências; e **Fase 2 — O interrogatório**, com investigação de três servidores fictícios. O alerta do BitDefender e as ações de contenção são representações na interface. Não há integração automática com o GravityZone no código analisado.

## Começar

A aplicação está em `Simulação Web/`. No PowerShell, a partir da raiz do repositório:

```powershell
# OBJETIVO: instalar as dependências em ambiente virtual e iniciar o projeto.
Set-Location "Simulação Web"
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

Com `certs/cert.pem` e `certs/key.pem` presentes, o programa tenta iniciar em **HTTPS/443**. Sem esses arquivos, inicia em **HTTP/5000**. Consulte o [guia de execução](Simulação%20Web/docs/execucao.md) antes do primeiro uso, especialmente para gerar certificados próprios.

O Docker usa outro caminho: Gunicorn em **HTTP/5000**, com acesso inicialmente restrito ao próprio servidor. Existe uma dependência ausente no pacote recebido; a correção necessária está no [guia Docker](Simulação%20Web/docs/instrucoes_Docker.md).

## Documentação

| Assunto | Documento |
| --- | --- |
| Índice e controle documental | [docs/README.md](Simulação%20Web/docs/README.md) |
| Componentes, fluxos e implantação | [Arquitetura](Simulação%20Web/docs/arquitetura.md) |
| Python, HTTPS, nomes e rede | [Execução](Simulação%20Web/docs/execucao.md) |
| Contêiner e volume de dados | [Docker](Simulação%20Web/docs/instrucoes_Docker.md) |
| Regras e pontuação das atividades | [Regras do exercício](Simulação%20Web/docs/regras_exercicio.md) |
| Rotas e mensagens da API | [API](Simulação%20Web/docs/api.md) |
| Preparação, condução e encerramento | [Operação](Simulação%20Web/docs/operacao.md) |
| Memória, CSV e cópia de segurança | [Dados](Simulação%20Web/docs/dados.md) |
| Limitações e pendências | [Pendências técnicas](Simulação%20Web/docs/pendencias.md) |
| O que formalizar no GitHub | [Governança do repositório](Simulação%20Web/docs/governanca_repositorio.md) |
| Decisão estrutural atual | [ADR 0001](Simulação%20Web/docs/adr/0001-estado-em-memoria.md) |
| Verificações desta revisão | [Validação](Simulação%20Web/docs/validacao.md) |

## Limites de uso

O projeto identifica participantes pelo nome e não possui autenticação de participante ou de facilitador. Pessoas com o mesmo nome compartilham estado. O painel, a exportação e as rotas de encerramento e reset não têm proteção administrativa. A aplicação deve ser operada em rede controlada, conforme [SECURITY.md](SECURITY.md).

As partidas ficam em memória e são perdidas ao reiniciar o processo. O CSV registra parte das interações e não restaura sessões. Não utilizar múltiplos processos ou réplicas com a arquitetura atual.

## Situação documental

Revisão em 30/10/2026, baseada no pacote `TableTop_CTIC(2).zip`. O texto descreve o código recebido; propostas futuras estão identificadas. Esta revisão não constitui homologação, aprovação institucional ou declaração de licença de uso.
