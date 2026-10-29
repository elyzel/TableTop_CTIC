/*
OBJETIVO:
Apresentar o relatório consolidado das duas fases após os créditos.

ARQUIVO NOVO: static/relatorio_final.js
COLE TODO ESTE CONTEÚDO.

REVISÃO:
Fase 1: ações, eventos, pontos, bônus e objetivos.
Fase 2: perguntas por servidor, respostas, marcações e acusação.
Resumo: pontuação de cada fase e total das duas fases.

RECOMENDAÇÃO:
As perguntas são agrupadas por servidor, da mais recente para a antiga.
O relatório apresenta a marcação final escolhida para cada evidência.

VALIDAÇÃO:
Sintaxe, total consolidado, ordem de perguntas e falha da API
verificados com dados simulados. Confira a aparência no navegador.
*/

(() => {
  'use strict';

  window.mostrarRelatorioFinal = async ({
    destino,
    pid,
    fase2,
    onVoltar
  }) => {
    if (
      !destino
      || !fase2?.finalizado
      || !fase2.resultado
    ) {
      throw new Error(
        'A Fase 2 ainda não possui resultado final.'
      );
    }

    /* ---------- Funções auxiliares ---------- */

    function criar(tag, texto, classe) {
      const n = document.createElement(tag);

      if (texto !== undefined) {
        n.textContent = String(texto);
      }

      if (classe) {
        n.className = classe;
      }

      return n;
    }

    function numero(valor) {
      if (
        valor === null
        || valor === undefined
        || valor === ''
      ) return null;

      const n = Number(valor);
      return Number.isFinite(n) ? n : null;
    }

    function pontos(valor) {
      const n = numero(valor);
      return n === null ? 'Não informado' : `${n} pts`;
    }

    function sinal(valor) {
      const n = numero(valor);

      if (n === null) return '—';

      return `${n > 0 ? '+' : ''}${n}`;
    }

    function botao(texto, fn) {
      const b = criar('button', texto);
      b.type = 'button';
      b.onclick = fn;
      return b;
    }

    function tabela(cabecalhos, linhas) {
      const area = criar(
        'div',
        undefined,
        'ttfr-tabela'
      );

      const t = criar('table');
      const head = criar('thead');
      const hr = criar('tr');
      const body = criar('tbody');

      cabecalhos.forEach(texto => {
        const th = criar('th', texto);
        th.scope = 'col';
        hr.append(th);
      });

      head.append(hr);

      linhas.forEach(celulas => {
        const tr = criar('tr');

        celulas.forEach(valor => {
          const td = criar('td');

          if (
            valor
            && typeof valor === 'object'
            && valor.nodeType
          ) {
            td.append(valor);
          } else {
            td.textContent = String(valor ?? '—');
          }

          tr.append(td);
        });

        body.append(tr);
      });

      t.append(head, body);
      area.append(t);

      return area;
    }

    /* ---------- Estrutura e aparência ---------- */

    destino.hidden = false;
    destino.classList.add('ttf-relatorio');

    Object.assign(destino.style, {
      display: 'block',
      overflowY: 'auto',
      textAlign: 'left'
    });

    const estilo = criar('style', `
      .ttf .ttf-relatorio {
        padding: 40px 24px 60px;
        scrollbar-gutter: stable;
      }

      .ttf .ttf-relatorio .ttfr-corpo {
        max-width: 1100px;
        margin: auto;
      }

      .ttf .ttf-relatorio h1 {
        font-size: clamp(26px, 4vw, 42px);
      }

      .ttf .ttf-relatorio h2 {
        margin: 34px 0 12px;
        font-size: 24px;
      }

      .ttf .ttf-relatorio h3 {
        margin: 24px 0 10px;
      }

      .ttf .ttf-relatorio p {
        max-width: none;
        font-size: 16px;
      }

      .ttf .ttf-relatorio .ttfr-resumo {
        display: grid;
        grid-template-columns:
          repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
        margin: 24px 0;
      }

      .ttf .ttf-relatorio .ttfr-cartao {
        padding: 18px;
        background: #10283b;
        border: 1px solid #41637b;
        border-radius: 10px;
      }

      .ttf .ttf-relatorio .ttfr-cartao strong {
        display: block;
        font-size: 28px;
        margin-top: 8px;
      }

      .ttf .ttf-relatorio .ttfr-tabela {
        overflow-x: auto;
        margin: 14px 0 22px;
      }

      .ttf .ttf-relatorio table {
        width: 100%;
        min-width: 650px;
        border-collapse: collapse;
        font-size: 15px;
      }

      .ttf .ttf-relatorio th,
      .ttf .ttf-relatorio td {
        padding: 12px;
        border-bottom: 1px solid #35536a;
        text-align: left;
        vertical-align: top;
        overflow-wrap: anywhere;
      }

      .ttf .ttf-relatorio th {
        background: #10283b;
      }

      .ttf .ttf-relatorio td p {
        margin: 8px 0 0;
        font-size: 14px;
        color: #bbd0df;
      }

      .ttf .ttf-relatorio .ttfr-aviso {
        padding: 14px;
        border: 1px solid #bda468;
        background: #302a1a;
        border-radius: 8px;
      }

      .ttf .ttf-relatorio .ttfr-acoes {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 30px;
      }
    `);

    const corpo = criar(
      'div',
      undefined,
      'ttfr-corpo'
    );

    const titulo = criar(
      'h1',
      'Relatório final da simulação'
    );

    titulo.tabIndex = -1;

    const carregando = criar(
      'p',
      'Carregando o histórico da Fase 1...'
    );

    destino.replaceChildren(estilo, corpo);
    corpo.append(titulo, carregando);

    titulo.focus();

    /* ---------- Consulta ao histórico da Fase 1 ---------- */

    let fase1 = null;
    let falha = '';

    try {
      if (!pid) {
        throw new Error('Participante não identificado.');
      }

      const resposta = await fetch(
        `/api/estado/${encodeURIComponent(pid)}`,
        {
          cache: 'no-store',
          signal: AbortSignal.timeout(10000)
        }
      );

      if (!resposta.ok) {
        throw new Error(
          `Servidor respondeu HTTP ${resposta.status}.`
        );
      }

      fase1 = await resposta.json();

      if (fase1.status !== 'finalizado') {
        throw new Error(
          'A tentativa da Fase 1 não está finalizada.'
        );
      }

      if (
        numero(fase1.pontos)
        !== numero(fase2.pontos_fase1)
      ) {
        throw new Error(
          'O saldo da Fase 1 mudou. ' +
          'O histórico não será misturado com este resultado.'
        );
      }
    } catch (e) {
      fase1 = null;
      falha = e.message;
    }

    // O participante pode ter fechado o relatório durante a consulta.
    if (!destino.isConnected) return;

    carregando.remove();

    /* ---------- Resumo consolidado ---------- */

    const resultado = fase2.resultado;
    const p1 = numero(fase2.pontos_fase1);
    const p2 = numero(resultado.pontos);

    const resumo = criar(
      'div',
      undefined,
      'ttfr-resumo'
    );

    const totais = [
      ['Fase 1', p1],
      ['Fase 2', p2],
      [
        'Total das duas fases',
        p1 !== null && p2 !== null ? p1 + p2 : null
      ]
    ];

    totais.forEach(([rotulo, valor]) => {
      const card = criar(
        'div',
        rotulo,
        'ttfr-cartao'
      );

      card.append(criar('strong', pontos(valor)));
      resumo.append(card);
    });

    corpo.append(
      criar(
        'p',
        'Confira suas escolhas, as evidências consultadas ' +
        'e a pontuação registrada nas duas fases.'
      ),
      resumo
    );

    /* ---------- Relatório da Fase 1 ---------- */

    corpo.append(
      criar('h2', 'Fase 1 — Máquina contaminada')
    );

    if (fase1) {
      if (fase1.final?.titulo) {
        corpo.append(
          criar('h3', fase1.final.titulo)
        );
      }

      if (fase1.final?.texto) {
        corpo.append(
          criar('p', fase1.final.texto)
        );
      }

      const historico = fase1.historico || [];

      corpo.append(
        criar(
          'p',
          'Histórico de ações e eventos, na ordem registrada. ' +
          'A coluna Total da ação soma os pontos e o bônus daquela linha.'
        )
      );

      if (historico.length) {
        const linhas = historico.map(h => {
          const descricao = criar(
            'div',
            h.acao || 'Evento'
          );

          if (h.feedback) {
            descricao.append(
              criar('p', h.feedback)
            );
          }

          const base = numero(h.pontos);
          const bonus = numero(h.bonus);

          return [
            descricao,
            sinal(base),
            sinal(bonus),
            base !== null && bonus !== null
              ? sinal(base + bonus)
              : '—'
          ];
        });

        corpo.append(
          tabela(
            [
              'Ação / evento',
              'Pontos',
              'Bônus',
              'Total da ação'
            ],
            linhas
          )
        );
      } else {
        corpo.append(
          criar(
            'p',
            'Nenhuma ação registrada no histórico.'
          )
        );
      }

      if (fase1.objetivos) {
        const obj = fase1.objetivos;

        corpo.append(
          criar(
            'h3',
            `Objetivos concluídos: ${obj.concluidos}/${obj.total}`
          )
        );

        const lista = criar('ul');

        (obj.itens || []).forEach(item => {
          const estado = item.concluido
            ? 'Concluído'
            : 'Pendente';

          const nome =
            item.nome || item.id || item.flag;

          lista.append(
            criar('li', `${estado} — ${nome}`)
          );
        });

        corpo.append(lista);
      }
    } else {
      corpo.append(
        criar(
          'p',
          'Não foi possível recuperar o histórico da Fase 1. ' +
          falha +
          ' A pontuação acima foi preservada no resultado da Fase 2.',
          'ttfr-aviso'
        ),

        botao(
          'Tentar carregar novamente',
          () => window.mostrarRelatorioFinal({
            destino,
            pid,
            fase2,
            onVoltar
          })
        )
      );
    }

    /* ---------- Resultado da Fase 2 ---------- */

    corpo.append(
      criar(
        'h2',
        'Fase 2 — Investigação dos servidores'
      )
    );

    const acusado = (fase2.suspeitos || []).find(
      s => s.id === fase2.acusado
    );

    corpo.append(
      criar(
        'p',
        `Resultado: ${
          resultado.vitoria
            ? 'acusação correta'
            : 'acusação incorreta'
        }.`
      ),

      criar(
        'p',
        `Servidor acusado: ${
          acusado
            ? `${acusado.apelido} · ${acusado.hostname}`
            : 'Não informado'
        }.`
      )
    );

    if (fase2.infectado) {
      corpo.append(
        criar(
          'p',
          'Servidor infectado: ' +
          `${fase2.infectado.apelido} · ${fase2.infectado.hostname}.`
        )
      );
    }

    corpo.append(
      criar(
        'p',
        'Perguntas realizadas: ' +
        `${
          resultado.perguntas_usadas
          ?? fase2.perguntas_usadas
          ?? 'Não informado'
        }. ` +
        `Custo por pergunta: ${pontos(fase2.custo_pergunta)}.`
      ),

      tabela(
        ['Composição da pontuação', 'Pontos'],
        [
          [
            'Saldo após as consultas',
            pontos(resultado.base)
          ],
          [
            'Ajuste por acusação',
            sinal(resultado.bonus_acerto)
          ],
          [
            'Ajuste por marcações',
            sinal(resultado.bonus_marcas)
          ],
          [
            'Pontuação final da Fase 2',
            pontos(resultado.pontos)
          ]
        ]
      ),

      criar(
        'p',
        'As consultas abaixo estão agrupadas por servidor, ' +
        'da mais recente para a mais antiga. As marcações ' +
        'representam sua interpretação final das evidências.'
      )
    );

    /* ---------- Perguntas e escolhas por servidor ---------- */

    const marcas = {
      '': 'Sem marca',
      frio: 'Frio',
      morno: 'Morno',
      quente: 'Quente'
    };

    const perguntas = new Map(
      (fase2.perguntas || []).map(q => [q.id, q])
    );

    for (const servidor of fase2.suspeitos || []) {
      corpo.append(
        criar(
          'h3',
          `${servidor.apelido} · ${servidor.hostname}`
        )
      );

      const respostas =
        fase2.respostas?.[servidor.id] || {};

      const ordem = [...new Set([
        ...(fase2.ordem_respostas?.[servidor.id] || []),
        ...Object.keys(respostas)
      ])]
        .filter(qid => respostas[qid])
        .reverse();

      if (!ordem.length) {
        corpo.append(
          criar(
            'p',
            'Nenhuma pergunta realizada para este servidor.'
          )
        );
      } else {
        const linhas = ordem.map(qid => {
          const q = perguntas.get(qid);
          const r = respostas[qid];

          const descricao = criar(
            'div',
            q?.pergunta || q?.exame || qid
          );

          if (q?.exame) {
            descricao.append(
              criar('p', q.exame)
            );
          }

          const valor =
            `${r.valor ?? ''} ${r.unidade ?? ''}`.trim();

          const resposta = criar(
            'div',
            valor || r.fala || '—'
          );

          if (r.fala) {
            resposta.append(
              criar('p', r.fala)
            );
          }

          if (r.observacao) {
            resposta.append(
              criar('p', r.observacao)
            );
          }

          const marca = fase2.marcas?.[
            `${servidor.id}:${qid}`
          ] || '';

          const custo = numero(
            fase2.custo_pergunta
          );

          return [
            descricao,
            resposta,
            marcas[marca] || 'Sem marca',
            custo === null ? '—' : sinal(-custo)
          ];
        });

        corpo.append(
          tabela(
            [
              'Pergunta / exame',
              'Resposta / evidência',
              'Sua marcação',
              'Custo'
            ],
            linhas
          )
        );
      }

      const anotacao =
        fase2.notas?.[servidor.id];

      if (anotacao) {
        corpo.append(
          criar('p', `Sua anotação: ${anotacao}`)
        );
      }
    }

    /* ---------- Navegação ---------- */

    const acoes = criar(
      'div',
      undefined,
      'ttfr-acoes'
    );

    if (typeof onVoltar === 'function') {
      acoes.append(
        botao(
          'Rever resultado técnico da Fase 2',
          onVoltar
        )
      );
    }

    const voltar = criar(
      'a',
      'Voltar à Fase 1'
    );

    voltar.href = '/';

    acoes.append(voltar);
    corpo.append(acoes);
  };
})();