<!-- OBJETIVO: organizar a documentação e distinguir funcionamento atual de propostas. -->
# Documentação do TableTop CTIC

## Controle documental

| Campo | Situação |
| --- | --- |
| Projeto | TableTop CTIC — Máquina contaminada |
| Revisão | 30/10/2026 |
| Base de análise | Arquivos de `TableTop_CTIC(2).zip` |
| Escopo | Documentação do estado recebido e recomendações de formalização |
| Responsável pela manutenção | A designar pelo CTIC/SSI |
| Aprovação institucional | Pendente; não inferida desta revisão |
| Classificação da informação | A definir antes da publicação |

A documentação descreve o comportamento observado por leitura do código. A [validação](validacao.md) informa o que foi e o que não foi executado. Cada mudança de código que alterar uma instrução, regra ou contrato deve atualizar o documento correspondente no mesmo pull request.

## Ordem de leitura

| Público / finalidade | Documento |
| --- | --- |
| Visão do projeto | [README da raiz](../../README.md) |
| Primeira instalação | [execucao.md](execucao.md) |
| Implantação em contêiner | [instrucoes_Docker.md](instrucoes_Docker.md) |
| Desenvolvimento e sustentação | [arquitetura.md](arquitetura.md), [api.md](api.md) |
| Conteúdo pedagógico | [regras_exercicio.md](regras_exercicio.md) |
| Facilitador | [operacao.md](operacao.md) |
| Administração de registros | [dados.md](dados.md) |
| Correções necessárias | [pendencias.md](pendencias.md) |
| Formalização no GitHub | [governanca_repositorio.md](governanca_repositorio.md) |
| Decisões estruturais | [ADR 0001](adr/0001-estado-em-memoria.md) |
| Evidência desta revisão | [validacao.md](validacao.md) |

## Regra de interpretação

“Atual” descreve o código recebido. “Recomendado”, “proposto” ou “pendente” descrevem trabalho futuro. Não há banco de dados, autenticação, integração EDR ou publicação automática implementados por esta revisão documental.

O [guia anterior](../Documentação%20-%20TableTop.md) foi convertido em índice para evitar instruções conflitantes. O `LEIAME.txt` é material anterior e não substitui o guia atual.
