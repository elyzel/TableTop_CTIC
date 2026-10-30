<!-- OBJETIVO: tornar limitações e correções necessárias visíveis, sem apresentá-las como resolvidas. -->
# Pendências técnicas identificadas

Levantamento documental por leitura do pacote recebido, em 30/10/2026. Não substitui auditoria de segurança. As prioridades abaixo orientam o planejamento e não são uma classificação CVSS.

| Prioridade | Evidência | Impacto | Encaminhamento recomendado |
| --- | --- | --- | --- |
| Antes de executar Docker | `Dockerfile` chama Gunicorn; `requirements.txt` não o instala | Contêiner pode não iniciar | Incluir dependência e validar construção/início |
| Antes de publicar o repositório ou reutilizar TLS | `certs/key.pem` consta do pacote | Chave privada distribuída; possível reutilização indevida | Substituir par, excluir do versionamento e verificar histórico separadamente |
| Antes de ampliar exposição | Painel, CSV e comandos sem autenticação | Leitura e alteração de estado por quem acessa o serviço | Implantar autenticação/autorização e proteger APIs administrativas |
| Antes de múltiplos workers/réplicas | Dicionários e lock locais ao processo | Estado inconsistente | Manter processo único; planejar armazenamento compartilhado |
| Antes de turmas | Nome como PID | Colisão/compartilhamento de estado | Usar nomes únicos; futuramente IDs de sessão e identidade verificável |
| Antes de ensaio visual | `templates/fase2.html` inclui `encerramento.js` duas vezes | Possível inicialização/listeners duplicados | Revisar inclusão e testar encerramento |
| Manutenção próxima | `pontuacao()` retorna antes do bloco de bônus; constantes legadas | Confusão sobre regra ativa | Remover legado em alteração própria, preservando regra aprovada |
| Manutenção próxima | IP/nome fixos em Python e BAT | Configurações divergentes | Centralizar configuração e documentar valores por ambiente |
| Manutenção próxima | `requirements.txt` sem versões | Builds não reproduzíveis | Definir e registrar conjunto de dependências validado |
| Antes de uso recorrente | Não há restauração de sessões | Perda de atividade ao reiniciar | Definir necessidade de persistência e estratégia de recuperação |
| Antes de divulgar resultados | CSV sem neutralização de fórmula e sem turma/tentativa | Risco na abertura e dificuldade de correlação | Tratar exportação e evoluir esquema com migração documentada |
| Antes de aumentar público | Sem ensaio de carga documentado | Capacidade desconhecida | Testar simultaneidade no ambiente alvo |

O servidor embutido Flask, a abertura de firewall em todos os perfis pelo BAT e a distribuição de confiança de CA também exigem revisão no planejamento da implantação. Esses pontos estão detalhados no [guia de execução](execucao.md).

## Estado desta entrega

Somente Markdown foi alterado. Nenhum item desta lista deve ser considerado resolvido pela existência da documentação. Não houve alteração de código, dependências, certificados, portas ou regras do jogo.
