<!-- OBJETIVO: orientar instalação, execução e acesso conforme as condições reais do projeto. -->
# Executar com Python

## Pré-requisitos

No servidor: Python com `pip` e suporte a `venv`, permissão de escrita em `dados/` e navegador para validação. A imagem Docker usa Python 3.13; para reduzir diferenças, adote essa linha como referência inicial. Outras versões não foram homologadas nesta revisão.

Os participantes precisam apenas de navegador e conectividade ao servidor. A primeira instalação exige acesso às dependências; após a preparação, os recursos da aplicação são servidos localmente. Verifique o funcionamento na rede isolada antes da atividade.

A pasta de trabalho é `Simulação Web/`, onde estão `app.py` e `requirements.txt`.

## Windows / PowerShell

A partir da raiz do projeto:

```powershell
# OBJETIVO: criar o ambiente isolado e instalar as dependências declaradas.
Set-Location "Simulação Web"
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pip check
```

```powershell
# OBJETIVO: iniciar a aplicação com o ambiente virtual.
.\.venv\Scripts\python.exe app.py
```

Não é necessário ativar scripts do PowerShell ou alterar a política de execução. `iniciar.bat` é um atalho alternativo, mas usa o `python` disponível no PATH e executa instalação de dependências a cada início. Para uma instalação previsível, prefira o ambiente virtual acima.

## Linux / shell

Instale primeiro Python, pip e suporte a `venv` pelo processo aprovado para sua distribuição. A partir da raiz:

```bash
# OBJETIVO: preparar as dependências antes de iniciar o projeto.
cd "Simulação Web"
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m pip check
.venv/bin/python app.py
```

A porta 443 pode exigir permissão adicional no Linux. Prefira o modo HTTP em laboratório sem certificados ou uma implantação com proxy TLS configurado pela equipe responsável. Não execute todo o aplicativo como root apenas para ocupar essa porta.

## Qual endereço usar?

| Condição na execução direta | Participante | Facilitador |
| --- | --- | --- |
| `cert.pem` e `key.pem` existem | `https://localhost/` | `https://localhost/facilitador` |
| Um ou ambos estão ausentes | `http://localhost:5000/` | `http://localhost:5000/facilitador` |

A presença dos arquivos é o critério usado no código. Arquivos inválidos, expirados ou incompatíveis não geram fallback garantido: podem impedir a inicialização ou gerar erro de certificado no navegador.

O pacote recebido inclui uma chave privada. Gere um par próprio antes de reutilizar o ambiente HTTPS. Para um ensaio HTTP local, com a aplicação parada, mova os certificados recebidos para um local restrito fora de `certs/`; não apague o único certificado de um ambiente em uso.

Encerre com `Ctrl+C`. Reiniciar o processo perde as partidas em memória, embora o CSV permaneça.

## HTTPS e nome local no Windows

1. Defina o IP reservado e o nome a utilizar. O valor recebido é `192.168.0.16` e o nome é `tabletop-ctic`.
2. Ajuste `IP_SERVIDOR` e `NOME_HOST` em `app.py`. Se mudar o IP/nome, ajuste também os valores literais em `gerar_certificado.bat` e `adicionar_hosts.bat`.
3. Instale o `mkcert` pelo processo de software aprovado e confira que está acessível no terminal. Ele é uma ferramenta do sistema, não uma dependência Python.
4. Execute `gerar_certificado.bat` no servidor. O script chama `mkcert -install`, gera `certs/cert.pem` e `certs/key.pem` e copia a CA pública para `para_distribuir/`.
5. Distribua a confiança da CA aos clientes somente pelo procedimento institucional. Nunca distribua a chave privada do servidor ou `rootCA-key.pem`.
6. Configure DNS interno ou a entrada `hosts` dos clientes para o IP do servidor. `adicionar_hosts.bat` pede elevação e não corrige automaticamente uma entrada existente.
7. Inicie o aplicativo e confira o certificado, o nome e a data de validade no navegador.

`tabletop-ctic.local` depende de mDNS, UDP/5353 e da capacidade da rede e dos clientes. A função `anunciar_mdns` usa o IP fixo configurado; não detecta mudanças automaticamente. Prefira DNS administrado quando disponível. Não presuma que o nome curto ou `.local` funcionará em outra VLAN.

## Acesso pela rede

Na execução direta, o bind é `0.0.0.0`; o IP mostrado no terminal não limita as interfaces de escuta. Use no cliente o IP/nome do servidor, nunca `localhost`.

No Windows, confira o endereço com `ipconfig`. Exemplo de teste no cliente:

```powershell
# OBJETIVO: verificar conectividade TCP com o servidor configurado para HTTPS.
Test-NetConnection -ComputerName 192.168.0.16 -Port 443
```

Se estiver em HTTP, teste a porta 5000. A regra de firewall deve liberar somente a porta efetivamente usada, para os perfis e origens da atividade. Exemplo para HTTPS na sub-rede local, em PowerShell administrativo:

```powershell
# OBJETIVO: permitir HTTPS apenas nos perfis e na origem previstos para o laboratório.
New-NetFirewallRule -DisplayName "TableTop CTIC - HTTPS restrito" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 443 -Profile Domain,Private -RemoteAddress LocalSubnet
```

Para HTTP, substitua a porta e o nome da regra. Para outra VLAN, defina o escopo de origem com a equipe de rede. `liberar_firewall.bat` usa `profile=any` e abre TCP/443 e UDP/5353; revise seu escopo antes de utilizá-lo. Não abra mDNS se estiver usando apenas DNS/hosts.

## Conferir a instalação

- Página inicial e painel abrem no servidor e em um cliente autorizado.
- Os recursos CSS/JS respondem sem 404.
- O nome resolve para o IP previsto e o certificado é confiável quando HTTPS está ativo.
- Uma partida completa passa pelas duas fases e aparece no painel.
- O CSV é gravado e exportado.

Use [operação](operacao.md) para o roteiro completo. O servidor embutido Flask é apropriado ao desenvolvimento/ensaio controlado; não há configuração pronta de serviço, proxy ou inicialização automática neste modo.
