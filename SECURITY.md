# Segurança do TableTop CTIC

## Escopo atual

Aplicação de treinamento para rede controlada. A implementação atual não possui autenticação nem autorização administrativa. Nome, cookie `tt_participante` e token `tentativa` não comprovam identidade nem atribuem papéis.

Qualquer cliente com conectividade ao serviço pode tentar consultar resultados, exportar o CSV e chamar operações de encerramento ou reset. HTTPS protege o tráfego; não resolve esse controle de acesso.

## Comunicação de vulnerabilidades

O mantenedor deve definir e aprovar um canal institucional privado antes de divulgar o repositório. Até sua definição, relatar problemas diretamente ao responsável interno pelo projeto. Não incluir credenciais, dados de participantes ou evidências sensíveis em issues públicas.

Canal, responsáveis, prazo de resposta e versões suportadas: **a definir pelo mantenedor**. Este documento não cria SLA nem programa de recompensa.

## Cuidados com a publicação

- Não versionar chaves privadas, certificados de ambiente, CSVs de participantes ou configurações internas de rede.
- O pacote recebido contém `Simulação Web/certs/key.pem`: tratar essa chave como exposta às pessoas que receberam o pacote e substituí-la antes de reutilizar o ambiente. Verificar separadamente se chegou ao histórico Git.
- Se um segredo entrou no histórico, ignorar ou apagar apenas o arquivo atual não elimina as versões anteriores; substituir o segredo e planejar a limpeza do histórico com os responsáveis.
- Certificados de CA públicos não são chaves privadas, mas a distribuição e a instalação de confiança devem seguir o processo institucional.
- Não distribuir `rootCA-key.pem`. Não publicar diretamente o servidor Flask de desenvolvimento na internet.

Detalhes e prioridades: [pendências](Simulação%20Web/docs/pendencias.md). Procedimentos de rede e certificados: [execução](Simulação%20Web/docs/execucao.md).
