<!-- OBJETIVO: padronizar a preparação, condução e encerramento de uma turma. -->
# Roteiro operacional

## Antes da atividade

1. Definir facilitador, responsável técnico, público, rede e identificação dos grupos. Usar nomes únicos, como `Grupo 01`, reduz coleta de dados pessoais e colisões.
2. Selecionar e registrar a referência do código e as regras da turma. Não alterar arquivos durante a sessão.
3. Resolver bloqueios aplicáveis em [pendencias.md](pendencias.md), principalmente Gunicorn no Docker e certificados próprios no HTTPS.
4. Validar [execução](execucao.md) ou [Docker](instrucoes_Docker.md) e testar acesso em outro dispositivo da rede prevista.
5. Conferir relógio/fuso do servidor e espaço/permissão em `dados/`.
6. Preservar registros anteriores em destino restrito. Se for iniciar CSV novo, fazer isso com aplicação parada, após a cópia.
7. Preparar o debate final e a duração total da dinâmica. Os 720 segundos da Fase 1 não incluem toda a condução do tabletop; a Fase 2 não tem encerramento automático por um prazo configurado na API atual.

## Ensaio de aceite

Registrar para cada item: data, versão/referência, ambiente, executor, resultado e evidência sem dados sensíveis.

| Caso | Resultado esperado |
| --- | --- |
| Identificação com nomes distintos | Estados separados no painel |
| Isolar → SOC → linha do tempo | Três objetivos concluídos; Fase 1 encerrada |
| Formatar | Fase 1 encerrada; avanço à Fase 2 bloqueado |
| Inatividade além do limite | Penalidade avaliada na próxima consulta/ação |
| Abrir investigação elegível | Três suspeitos e catálogo exibidos |
| Consultar uma combinação inédita | Redução de 25 pontos |
| Repetir a combinação | Sem nova cobrança; repetição pela API rejeitada |
| Marcar e salvar anotação | Conteúdo reaparece na tentativa atual |
| Acusar corretamente ou incorretamente | Caso encerrado, resultado exibido e saldo sem bônus |
| Reiniciar investigação concluída | Novo token e novo caso; sorteio pode repetir infectado |
| Painel / exportação | Duas fases separadas e CSV disponível após decisões |
| Animações e áudio | Sem interação indevida durante cenas; sem erro no console |
| Reiniciar processo em ambiente de ensaio | Sessões perdidas; CSV preservado |

Não validar reset ou reinício do servidor durante uma turma em andamento.

## Durante a atividade

- Orientar que os comandos são simulados e explicar o objetivo pedagógico.
- Manter o processo/contêiner em execução e acompanhar `/facilitador`.
- Acompanhar abas das duas fases; o painel atualiza aproximadamente a cada dois segundos.
- Não usar `Resetar` para apenas limpar visualização: ele exclui os participantes da memória.
- `Encerrar` atua na Fase 1 iniciada; não encerra automaticamente investigações abertas.
- Se houver falha de rede, verificar host, porta e logs antes de reiniciar. Reiniciar elimina a continuidade das partidas.

## Encerramento

1. Confirmar que os grupos concluíram e conduzir o debate sobre decisões, evidências e prioridades.
2. Exportar o CSV e, se necessário, preservar os relatórios/anotações visíveis antes de resetar. O CSV não contém tudo.
3. Guardar as evidências no destino institucional aprovado; não adicionar registros reais ao Git.
4. Encerrar o serviço e retirar regras de acesso temporárias conforme o processo local.
5. Registrar problemas e melhorias em issues sem expor participantes.

## Diagnóstico rápido

| Sintoma | Conferir |
| --- | --- |
| Porta 5000 não responde no modo Python | Certificados presentes podem ter ativado HTTPS/443 |
| Contêiner termina ao iniciar | Gunicorn ausente; consultar logs |
| Host acessa Docker, cliente não | Compose publica só `127.0.0.1`; conferir firewall e VLAN |
| Nome `.local` não resolve | IP configurado, mDNS, UDP/5353 e segmentação; testar IP ou DNS administrado |
| Certificado rejeitado | Nome/IP no certificado, validade e confiança da CA; não orientar ignorar o aviso |
| Dois grupos compartilham placar | Mesmo nome/PID; nomes devem ser únicos |
| Fase 2 volta à página inicial | Cookie, Fase 1 concluída e ausência da ação de formatação |
| Pontos não sobem ao acusar | Comportamento atual: não há bônus final |
| Estado desapareceu | Reset, reinício ou múltiplos processos/réplicas |
| CSV não existe | Ainda não houve decisão registrada, volume incorreto ou permissão de escrita |
