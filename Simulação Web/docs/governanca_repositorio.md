<!-- OBJETIVO: recomendar o conjunto documental e os registros necessários à formalização no GitHub. -->
# Formalização e manutenção no GitHub

## Conjunto essencial

Para este projeto, o conjunto mínimo deve permitir compreender o propósito, instalar, operar, manter e conhecer os limites de segurança. Os arquivos abaixo já estão preparados nesta revisão, mas responsáveis, classificação e aprovação ainda precisam ser definidos.

| Documento | Finalidade | Quem deve manter |
| --- | --- | --- |
| `README.md` na raiz | Propósito, início rápido e índice | Mantenedor técnico e responsável funcional |
| `docs/README.md` | Controle e navegação documental | Responsável documental |
| `docs/arquitetura.md` | Componentes, fluxos, infraestrutura e limites | Desenvolvimento / infraestrutura |
| `docs/execucao.md` | Instalação Python, HTTPS, nomes e rede | Infraestrutura |
| `docs/instrucoes_Docker.md` | Implantação em contêiner | Infraestrutura |
| `docs/regras_exercicio.md` | Regras, tempos, pontuação e critérios | Responsável pedagógico / SSI |
| `docs/api.md` | Contrato das interfaces | Desenvolvimento |
| `docs/operacao.md` | Procedimento da atividade e aceite | Facilitador / operação |
| `docs/dados.md` | Registros, preservação e recuperação | Operação / SSI |
| `SECURITY.md` na raiz | Limites e comunicação privada de problemas | SSI / mantenedor |
| `CONTRIBUTING.md` na raiz | Fluxo de alterações e revisão | Mantenedor |
| `docs/pendencias.md` | Limitações visíveis e correções necessárias | Mantenedor; transferir ações para issues |
| `docs/adr/0001-estado-em-memoria.md` | Restrição estrutural e justificativa atual | Responsável técnico |
| `docs/validacao.md` | Evidência e limites desta revisão | Executor da validação |

Nesta tabela, `docs/` significa `Simulação Web/docs/`. Evite duplicar esses documentos em uma segunda pasta `docs` na raiz sem necessidade.

## Itens recomendados para a próxima etapa

| Prioridade | Arquivo / registro | Conteúdo e condição para adoção |
| --- | --- | --- |
| Antes de publicação | `LICENSE` | Licença escolhida e aprovada pela instituição; não copiar uma licença sem decidir direitos de uso |
| Antes de publicação | Classificação e titularidade | Definir repositório público/privado, titular, colaboradores autorizados e conteúdo permitido |
| Antes de novos commits | `.gitignore` | Excluir ambientes virtuais, caches, chaves e dados gerados; não remove arquivos já rastreados |
| Próximas releases | `CHANGELOG.md` | Alterações reais, compatibilidade e referência de versão; não inventar histórico |
| Próximas releases | Evidência de aceite por versão | Ambiente, data, referência, executor, casos e resultados observados |
| Manutenção recorrente | `.github/pull_request_template.md` | Problema, solução, testes, documentação e impacto em dados |
| Manutenção recorrente | `.github/ISSUE_TEMPLATE/` | Formulários de erro e melhoria sem dados sensíveis |
| Quando responsáveis definidos | `.github/CODEOWNERS` | Pessoas/equipes reais responsáveis; não usar usuários inventados |
| Quando necessário | Novos ADRs | Decisões sobre persistência, autenticação, TLS, implantação e pontuação |
| Expansão institucional | Plano de evolução | Escopo, responsáveis e critérios para ampliar uso; pode ficar em issues/milestones |

`CHANGELOG`, licença, templates e CODEOWNERS não foram criados nesta revisão, pois dependem de histórico confirmado ou de decisões de titularidade e responsáveis. As sugestões de `.github` também não configuram automaticamente proteções no GitHub.

## Versionar e não versionar

| Armazenar no repositório | Manter fora do repositório |
| --- | --- |
| Código, JSONs fictícios, templates e recursos necessários | Chaves privadas e segredos de qualquer ambiente |
| Documentação revisada e diagramas Mermaid | CSVs de participantes, notas e resultados identificáveis |
| Dockerfile e Compose sem segredos | Certificados específicos, CA privada e arquivos de confiança de ambiente |
| Dependências aprovadas e instruções reproduzíveis | `.venv`, caches, binários temporários e cópias ZIP do projeto |
| Exemplos anonimizados e resultados de teste sem dados sensíveis | Inventário interno sensível e evidências de incidentes reais |

Um exemplo de política de exclusão a revisar para este repositório:

```gitignore
# OBJETIVO: evitar novos arquivos de ambiente, dados e chaves no versionamento.
.venv/
venv/
__pycache__/
*.py[cod]
.env
.env.*
!.env.example
Simulação Web/certs/
Simulação Web/para_distribuir/
Simulação Web/dados/*.csv
*.key
*.zip
```

Essa sugestão não foi aplicada. Antes de retirar arquivos já rastreados, preservar o ambiente operacional e definir a limpeza do índice/histórico. O exemplo não é garantia de ausência de segredos: revisar o conteúdo de cada commit.

## Critério de formalização

1. Designar responsável técnico, responsável pelo exercício e aprovador, com substitutos quando necessário.
2. Resolver as pendências bloqueadoras para o modo de execução escolhido.
3. Definir classificação, licença, controle de acesso e canal de segurança.
4. Executar o ensaio de aceite e guardar referência do commit e resultados.
5. Revisar os documentos por pull request e registrar a aprovação no próprio fluxo institucional.
6. Publicar uma versão identificável com notas de alteração; configurar revisão e proteção da branch principal.

Essas etapas são propostas de governança, não obrigações normativas atribuídas a uma norma específica. A existência dos arquivos não comprova aprovação ou conformidade institucional.

## Aplicar este pacote

O ZIP de entrega contém apenas os Markdown novos/alterados, com os caminhos do projeto preservados. Faça uma cópia ou branch de trabalho e extraia o pacote na pasta **pai** de `TableTop_CTIC`, aceitando substituir os Markdown existentes. Como alternativa, copie o conteúdo da pasta `TableTop_CTIC` do ZIP para a raiz do checkout correspondente.

Revise `git diff` e os arquivos novos; faça commit apenas dos Markdown desta revisão. O pacote original já contém alterações locais: não use `git add .` sem revisar o restante. Não há envio automático ao GitHub nesta entrega.
