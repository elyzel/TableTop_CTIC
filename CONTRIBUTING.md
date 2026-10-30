# Como contribuir

## Fluxo proposto

1. Registrar a necessidade em issue interna, sem dados sensíveis.
2. Criar uma branch curta a partir da versão de referência.
3. Implementar a mudança e atualizar a documentação afetada.
4. Abrir pull request com problema, solução, impacto e evidências de validação.
5. Solicitar revisão do mantenedor e incorporar os ajustes antes da integração.

Este fluxo é uma recomendação para adoção. Proteções de branch, revisores e permissões ainda precisam ser configurados no GitHub.

## Verificação por tipo de alteração

| Alteração | Verificação esperada |
| --- | --- |
| Cenário e pontuação | Conferir JSON, transições, objetivos e resultados das duas fases |
| Backend | Testar fluxo permitido, entradas inválidas e repetição de chamadas |
| Interface | Conferir navegador, animações, áudio, console e responsividade |
| Docker/rede | Construir, iniciar, conferir porta, saúde e permanência do CSV |
| Documentação | Conferir links, caminhos, comandos e coerência com o código |

Use o [roteiro operacional](Simulação%20Web/docs/operacao.md) e registre resultados sem afirmar que um teste não executado passou. Alterações estruturais relevantes devem ter um registro de decisão em `Simulação Web/docs/adr/`.

## Antes de abrir o pull request

- Remover da alteração chaves, logs reais, ambientes virtuais e arquivos temporários.
- Identificar mudanças destrutivas de dados e informar como voltar à versão anterior.
- Atualizar a documentação na mesma alteração do comportamento.
- Usar os nomes exatos dos arquivos e preservar UTF-8.

A licença e a política institucional de contribuição externa precisam ser definidas pelo responsável. A ausência de `LICENSE` não autoriza redistribuição irrestrita.
