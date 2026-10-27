<!--
OBJETIVO: orientar a instalação e a execução do TableTop CTIC com Docker
na máquina de destino, sem instalar Docker na máquina de origem.
ARQUIVO NOVO: docs/Instalacao_Docker.md
CRIE O ARQUIVO E COLE TODO ESTE CONTEÚDO.
-->

# TableTop CTIC — Instalação com Docker

## 1. Objetivo

Executar o TableTop CTIC em um computador utilizando Docker.

A máquina de origem é utilizada somente para preparar e copiar os arquivos. A construção da imagem e a execução da aplicação acontecem na máquina de destino.

> [!important] Quem precisa instalar Docker?
> Somente o computador que hospedará a aplicação.
> Os participantes acessam o jogo pelo navegador, sem instalar Docker, Python ou Flask.

## 2. Ambiente considerado

- Máquina de origem: computador que contém o projeto atualizado.
- Máquina de destino: computador Windows com Docker Desktop.
- Tipo de contêiner: Linux.
- Porta da aplicação: TCP 5000.
- Acesso: navegador local ou computadores da rede autorizada.

Não é necessário instalar Python diretamente na máquina de destino. O Dockerfile instala o ambiente Python dentro da imagem.

## 3. Arquivos necessários

Copie para a máquina de destino a pasta atualizada do projeto.

Os seguintes arquivos devem estar presentes:

| Arquivo ou pasta | Finalidade |
|---|---|
| `app.py` | Aplicação Flask e regras da Fase 1 |
| `fase2.py` | Regras e APIs da Fase 2 |
| `cenario.json` | Configuração do cenário |
| `interrogatorio.json` | Perguntas e respostas da investigação |
| `static/` | JavaScript, CSS e demais recursos |
| `templates/` | Páginas HTML |
| `Dockerfile` | Instruções para construir a imagem |
| `requirements.txt` | Dependências Python |
| `.dockerignore` | Exclusões da construção |
| `compose.yaml` | Configuração de execução |

Os quatro arquivos de configuração Docker devem ficar na mesma pasta de `app.py`.

Este procedimento pressupõe que o projeto já contém o Dockerfile, o requirements.txt e o .dockerignore preparados para a aplicação.

Não é necessário copiar:

- `venv/`
- `.venv/`
- `.git/`
- `__pycache__/`

> [!tip] Confira as extensões
> O arquivo deve se chamar `Dockerfile`, sem extensão.
> Evite nomes como `Dockerfile.txt` e `compose.yaml.txt`.
> No Explorador de Arquivos, habilite a exibição das extensões.

## 4. Instalar o WSL na máquina de destino

Se o Docker Desktop já estiver instalado e funcionando com contêineres Linux, avance para a verificação do Docker.

Caso contrário, abra o PowerShell como administrador.

### 4.1. Verificar o WSL

```powershell
# OBJETIVO: verificar se o WSL está instalado.
wsl --version
```

### 4.2. Instalar, se necessário

```powershell
# OBJETIVO: instalar os componentes do WSL.
wsl --install
```

Reinicie o computador após a instalação.

Se uma distribuição Linux solicitar a criação de usuário e senha, conclua essa configuração.

### 4.3. Atualizar o WSL

```powershell
# OBJETIVO: atualizar os componentes do WSL.
wsl --update
```

Documentação oficial:

- [Instalação do WSL — Microsoft](https://learn.microsoft.com/pt-br/windows/wsl/install)

## 5. Instalar o Docker Desktop

Baixe o instalador pelo endereço oficial:

- [Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/)

Durante a instalação:

1. Utilize o mecanismo WSL 2.
2. Conclua a instalação.
3. Reinicie o computador, caso solicitado.
4. Abra o Docker Desktop.
5. Aguarde a inicialização do mecanismo.
6. Confirme que o Docker está utilizando contêineres Linux.

> [!note] Virtualização
> A virtualização precisa estar habilitada no equipamento.
> Se houver erro relacionado à virtualização, confira essa configuração no Gerenciador de Tarefas e, se necessário, na BIOS/UEFI.

## 6. Verificar o Docker

Abra um novo PowerShell e execute:

```powershell
# OBJETIVO: verificar o Docker, o Compose e a comunicação com o mecanismo.
docker --version
docker compose version
docker info
```

Resultado esperado:

- O Docker apresenta sua versão.
- O Docker Compose apresenta sua versão.
- `docker info` retorna as informações do mecanismo.

Se aparecer erro de conexão, abra o Docker Desktop e aguarde sua inicialização.

## 7. Copiar o projeto para o destino

Copie a pasta completa do projeto atualizado para um diretório do computador de destino.

Exemplo:

`C:\Projetos\TableTop_CTIC`

Não é necessário utilizar exatamente esse caminho. Ele será usado nos comandos seguintes como exemplo.

> [!important] Internet na primeira construção
> A máquina de destino precisa acessar os repositórios utilizados para baixar a imagem Python e as dependências.
> Se a rede exigir proxy, configure o Docker conforme os parâmetros institucionais.

## 8. Configurar o acesso pela rede

Para permitir acesso a partir de outros computadores, utilize o seguinte conteúdo em `compose.yaml`:

```yaml
# OBJETIVO: construir e executar o TableTop na máquina de destino,
# permitindo acesso pela rede e preservando o CSV em um volume.
# ARQUIVO: compose.yaml
# SUBSTITUA TODO O CONTEÚDO.

services:
  tabletop:
    image: tabletop-ctic:1.0.0

    build:
      context: .
      dockerfile: Dockerfile

    ports:
      - "5000:5000"

    volumes:
      - tabletop_dados:/app/dados

    restart: unless-stopped

    init: true

volumes:
  tabletop_dados:
```

A porta 5000 do computador será encaminhada para a porta 5000 do contêiner.

Não coloque o IP da máquina de origem nessa configuração.

> [!note] Teste exclusivamente local
> Para permitir acesso somente no próprio servidor, utilize
> `"127.0.0.1:5000:5000"` no lugar de `"5000:5000"`.

## 9. Acessar a pasta do projeto

No PowerShell:

```powershell
# OBJETIVO: acessar a pasta do projeto no computador de destino.
Set-Location "C:\Projetos\TableTop_CTIC"
```

Confira os arquivos principais:

```powershell
# OBJETIVO: confirmar a presença dos arquivos necessários.
Get-Item app.py, fase2.py, cenario.json, interrogatorio.json, Dockerfile, requirements.txt, compose.yaml, .dockerignore
```

Se algum arquivo não for encontrado, confira o caminho e a cópia do projeto.

## 10. Validar a configuração

```powershell
# OBJETIVO: validar o arquivo Docker Compose.
docker compose config
```

O comando deve apresentar a configuração interpretada sem erros.

Se houver erro de YAML, confira:

- Indentação com espaços.
- Nomes dos campos.
- Aspas na configuração das portas.
- Nome e extensão do arquivo.

## 11. Construir e iniciar

Se houver uma execução antiga por `python app.py`, encerre-a com `Ctrl + C` para liberar a porta 5000.

Depois, execute:

```powershell
# OBJETIVO: construir a imagem e iniciar a aplicação em segundo plano.
docker compose up -d --build
```

```powershell
docker compose up -d --force-recreate tabletop
```

Na primeira execução, o Docker irá:

1. Baixar a imagem base do Python.
2. Instalar as dependências.
3. Copiar os arquivos da aplicação.
4. Criar o volume dos dados.
5. Iniciar o servidor.

Aguarde o término do comando.

## 12. Verificar o contêiner

```powershell
# OBJETIVO: consultar o estado do serviço.
docker compose ps
```

O serviço `tabletop` deve aparecer em execução.

Se o Dockerfile contém a verificação de saúde, o estado poderá aparecer como `healthy` após alguns instantes.

Para consultar os últimos registros:

```powershell
# OBJETIVO: visualizar os registros recentes da aplicação.
docker compose logs --tail 100 tabletop
```

Para acompanhar continuamente:

```powershell
# OBJETIVO: acompanhar os registros em tempo real.
docker compose logs -f tabletop
```

Pressione `Ctrl + C` para sair da visualização dos registros.

Isso não encerra o contêiner iniciado em segundo plano.

## 13. Testar no próprio servidor

Abra no navegador:

| Recurso | Endereço |
|---|---|
| Participante | http://localhost:5000 |
| Facilitador | http://localhost:5000/facilitador |
| Exportação do CSV | http://localhost:5000/api/csv |

O CSV poderá apresentar “Sem dados ainda” enquanto nenhuma decisão tiver sido registrada.

Faça uma partida de teste antes de liberar o acesso aos participantes.

## 14. Identificar o IP do servidor

No computador de destino:

```powershell
# OBJETIVO: identificar o endereço IPv4 utilizado na rede.
ipconfig
```

Localize o IPv4 da interface conectada à rede dos participantes.

Exemplo:

`192.168.1.50`

Nesse exemplo, os acessos serão:

| Recurso | Endereço |
|---|---|
| Participante | http://192.168.1.50:5000 |
| Facilitador | http://192.168.1.50:5000/facilitador |

Nos computadores dos participantes, não utilize `localhost`: esse nome aponta para o próprio computador de quem está acessando.

## 15. Liberar a porta no Windows, se necessário

Se a aplicação funcionar no servidor, mas não em outro computador, confira o firewall.

Para permitir acesso pela sub-rede local, abra o PowerShell como administrador:

```powershell
# OBJETIVO: permitir acesso à porta TCP 5000 pela sub-rede local,
# nos perfis de rede Domínio e Privado.
New-NetFirewallRule -DisplayName "TableTop CTIC - TCP 5000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5000 -Profile Domain,Private -RemoteAddress LocalSubnet
```

Se os participantes estiverem em outra VLAN ou sub-rede, ajuste o escopo da regra e confira as permissões de comunicação entre as redes.

> [!important] Escopo de acesso
> O painel do facilitador ainda não possui autenticação administrativa.
> Disponibilize a aplicação na rede prevista para a atividade e não publique diretamente a porta 5000 na internet.

## 16. Validação antes da atividade

- [ ] O contêiner inicia sem erros.
- [ ] A página abre no servidor.
- [ ] A página abre em outro computador da rede.
- [ ] A identificação do participante funciona.
- [ ] As animações e os sons funcionam.
- [ ] O cursor demonstrativo aparece durante a animação.
- [ ] O cursor e as ações do participante são bloqueados nos momentos previstos.
- [ ] Os controles de áudio e de pular animação funcionam quando disponíveis.
- [ ] As decisões da Fase 1 são registradas.
- [ ] Executar “Formatar Máquina” impede o avanço.
- [ ] O reinício da Fase 1 funciona.
- [ ] A Fase 2 abre nas tentativas permitidas.
- [ ] O prontuário apresenta as respostas em ordem de consulta.
- [ ] O painel do facilitador apresenta os resultados.
- [ ] O CSV pode ser exportado após o registro das decisões.

## 17. Parar a aplicação

```powershell
# OBJETIVO: parar o serviço.
docker compose stop
```

## 18. Iniciar novamente

```powershell
# OBJETIVO: iniciar o contêiner existente.
docker compose start
```

> [!warning] Partidas em memória
> As partidas em andamento, os participantes e os pontos ficam na memória do processo.
> Quando o processo é encerrado ou reiniciado, essas informações são perdidas.
> O CSV permanece no volume, mas não restaura automaticamente as partidas.

## 19. Atualizar o projeto

Quando houver alterações no código:

1. Copie os arquivos atualizados para a pasta do projeto no destino.
2. Abra o PowerShell nessa pasta.
3. Reconstrua a imagem.
4. Atualize o navegador com `Ctrl + F5`.

```powershell
# OBJETIVO: construir a versão atualizada e recriar o serviço quando necessário.
docker compose up -d --build
```

Faça atualizações antes da atividade ou após seu encerramento, pois a recriação do contêiner pode apagar as partidas em memória.

## 20. Remover o contêiner preservando o CSV

```powershell
# OBJETIVO: remover o contêiner e a rede do projeto,
# preservando o volume de dados.
docker compose down
```

Não acrescente `--volumes` ou `-v` se quiser preservar os dados.

Ao utilizar novamente o mesmo projeto Compose, o volume existente será reutilizado.

## 21. Exportar o registro das decisões

Após a atividade, acesse:

`http://IP_DO_SERVIDOR:5000/api/csv`

Substitua `IP_DO_SERVIDOR` pelo endereço real da máquina de destino e salve o arquivo disponibilizado.

> [!note] Conteúdo do volume
> O volume preserva o CSV gerado no contêiner.
> Ele não inclui automaticamente um CSV antigo que estava na máquina de origem.
> Copiar a imagem para outro computador também não transporta esse volume.

## 22. Configuração de processos

O Dockerfile preparado para este projeto utiliza:

- Um processo Gunicorn: `--workers 1`.
- Oito threads: `--threads 8`.

Mantenha um único processo enquanto as partidas forem armazenadas em memória.

Não execute várias réplicas independentes para a mesma atividade sem adaptar o armazenamento das partidas.

## 23. Solução de problemas

| Problema | Verificação ou solução |
|---|---|
| Docker não conecta ao mecanismo | Abra o Docker Desktop e aguarde sua inicialização |
| WSL apresenta erro | Confira instalação, atualização e virtualização |
| `Dockerfile` não encontrado | Confirme a pasta atual e se o arquivo não está como `Dockerfile.txt` |
| Dependências não são baixadas | Confira internet, proxy e acesso aos repositórios |
| Porta 5000 ocupada | Encerre outra aplicação que esteja utilizando essa porta |
| Contêiner encerra após iniciar | Consulte `docker compose logs --tail 100 tabletop` |
| Funciona localmente, mas não pela rede | Confira publicação da porta, IP, firewall e comunicação entre redes |
| Alterações não aparecem | Execute `docker compose up -d --build` e atualize com `Ctrl + F5` |
| CSV ainda não existe | Execute uma ação na atividade para gerar um registro |
| Partidas desapareceram após reiniciar | O estado atual fica em memória; o CSV não restaura as partidas |

## 24. Referências oficiais

- [Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- [Instalação do WSL](https://learn.microsoft.com/pt-br/windows/wsl/install)
- [Docker Compose](https://docs.docker.com/compose/)
- [Volumes Docker](https://docs.docker.com/engine/storage/volumes/)