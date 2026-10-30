<!-- OBJETIVO: orientar Docker conforme o Dockerfile e Compose recebidos, explicitando o bloqueio atual. -->
# Execução com Docker

## Pré-requisitos e bloqueio conhecido

O servidor precisa de Docker com suporte a contêineres Linux e do comando `docker compose`. Os participantes acessam por navegador. A primeira construção precisa obter `python:3.13-slim` e as dependências Python; em rede isolada, prepare e transfira a imagem previamente pelo processo da equipe.

**Correção necessária antes de construir:** o Dockerfile inicia `gunicorn`, mas `requirements.txt` contém apenas `flask` e `zeroconf`. A imagem pode ser construída e falhar na inicialização por ausência do executável. Inclua `gunicorn` como uma nova linha em `requirements.txt` e revise essa alteração em commit separado. Esta entrega altera documentação; a dependência não foi modificada automaticamente.

As versões das dependências não estão fixadas. A equipe deve validar e registrar as versões aprovadas antes de uma implantação reproduzível.

## Preparar e iniciar

No Windows, abra o Docker Desktop e aguarde o mecanismo Linux. No Linux, use a instalação administrada pela equipe. A partir da raiz do projeto:

```powershell
# OBJETIVO: acessar os arquivos de implantação e validar o mecanismo.
Set-Location "Simulação Web"
docker --version
docker compose version
docker info
docker compose config
```

No Linux, substitua `Set-Location` por `cd "Simulação Web"`. Os demais comandos Docker são iguais.

Depois da correção de dependência:

```bash
# OBJETIVO: construir e iniciar a aplicação em segundo plano.
docker compose up -d --build
docker compose ps
docker compose logs --tail 100 tabletop
```

O healthcheck faz uma requisição HTTP à página inicial. Ele não testa a gravação do CSV, a investigação ou o funcionamento das animações.

## Endereços e rede

| Item | Configuração recebida |
| --- | --- |
| Serviço | `tabletop` |
| Imagem local | `tabletop-ctic:1.0.0` |
| Bind interno | `0.0.0.0:5000` |
| Publicação no host | `127.0.0.1:5000:5000` |
| Participante no host | `http://localhost:5000/` |
| Facilitador no host | `http://localhost:5000/facilitador` |
| Volume | `tabletop_dados:/app/dados` |

A tag `1.0.0` vem do Compose; não comprova uma release homologada.

Para participantes de outros computadores, edite somente a publicação de porta em `compose.yaml`, sob `services.tabletop.ports`:

```yaml
# OBJETIVO: permitir acesso HTTP pela rede do host, sujeito ao firewall.
ports:
  - "5000:5000"
```

Isso publica em interfaces do host. Restrinja origens no firewall e valide a rede. Reaplique com `docker compose up -d`. Os participantes usarão `http://IP_DO_SERVIDOR:5000/`. Se precisar de HTTPS, um proxy TLS precisa ser configurado à parte; apenas trocar a URL para HTTPS ou mapear 443 para 5000 não ativa TLS.

O Gunicorn importa `app:app`, sem executar o bloco `if __name__ == "__main__"`. Portanto não usa os certificados locais, não anuncia mDNS e não usa a porta 443 definida nesse bloco.

## Persistência e operação

O volume nomeado mantém o CSV entre recriações, mas as partidas continuam em memória. Reiniciar o contêiner interrompe a atividade e perde as sessões. Mantenha um worker e uma instância; oito threads já estão configuradas.

```bash
# OBJETIVO: acompanhar os logs; Ctrl+C encerra apenas o acompanhamento.
docker compose logs -f tabletop
```

```bash
# OBJETIVO: parar e remover os contêineres da implantação, preservando o volume.
docker compose down
```

Evite `down -v`: ele remove o volume da implantação e seus registros. Mudanças de nome de projeto Compose ou de diretório podem criar outro volume; identifique o volume usado antes de atualizar.

```bash
# OBJETIVO: copiar o CSV existente para o diretório atual após a atividade.
docker compose cp tabletop:/app/dados/log_decisoes.csv ./log_decisoes_backup.csv
```

Se nenhuma decisão foi registrada, o CSV pode não existir. Armazene a cópia em destino restrito, fora do repositório. Consulte [dados](dados.md) para limites e recuperação.

## Atualização e retorno

1. Conclua a atividade e copie o CSV antes de reconstruir.
2. Guarde a referência do código e a identificação da imagem anterior.
3. Atualize os arquivos, valide `docker compose config` e reconstrua.
4. Execute o ensaio em [operação](operacao.md) antes da turma.
5. Se falhar, restaure a referência anterior, reconstrua ou use a imagem anterior preservada. Isso não recupera sessões perdidas.

Nenhuma construção Docker foi executada nesta revisão. A verificação efetiva deve confirmar dependências, permissões do volume, saúde e acesso de um segundo equipamento.
