/*
BLOCO 5
ARQUIVO NOVO: static/interrogatorio.js
COLE TODO O CONTEÚDO.
*/

(() => {
  'use strict';

  const CINEMA = {
    // Maior valor deixa a digitação mais lenta.
    DIGITACAO_MS: 32,

    // Entrada e saída gradual do título.
    FADE_MS: 1600,

    // Tempo do título após completar sua entrada.
    TITULO_LEITURA_MS: 6500,

    // Pausa escura antes da luz azul.
    ESCURO_MS: 1800,

    // Luz azul antes de revelar a sala.
    LUZ_AZUL_MS: 2500,

    // Revelação do ambiente.
    REVELACAO_MS: 6000,

    // Pausa após a mudança para vermelho.
    VERMELHO_MS: 2200,

    // Tempo mínimo de leitura APÓS terminar a digitação.
    LEITURA_MINIMA_MS: 5500,

    // Textos longos recebem tempo adicional por palavra.
    LEITURA_POR_PALAVRA_MS: 300
  };

  let svgId = 0;

  // Ilustração vetorial própria, sem imagens ou serviços externos.
  function rack() {
    const id = 'irack-' + (++svgId);

    const unidades = Array.from({ length: 8 }, (_, i) => {
      const y = 48 + i * 37;

      return `
        <g transform="translate(32 ${y})">
          <rect width="166" height="31" rx="3"
            fill="#26303b" stroke="#66717d"/>
          <rect x="8" y="6" width="81" height="18"
            rx="2" fill="#12181e"/>
          <path d="M12 10h70m-70 4h70m-70 4h70"
            stroke="#48525d" stroke-width="2"/>
          <rect x="99" y="5" width="40" height="21"
            fill="#3b4652" stroke="#83909c"/>
          <path d="M109 7v17m10-17v17m10-17v17"
            stroke="#10181f" stroke-width="3"/>
          <circle cx="150" cy="10" r="2" fill="#7cb6bc"/>
          <circle cx="150" cy="20" r="2" fill="#78946c"/>
          <circle cx="4" cy="15" r="1.5" fill="#b6bdc4"/>
        </g>
      `;
    }).join('');

    return `
      <svg viewBox="0 0 260 410"
        aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="${id}">
            <stop stop-color="#586673"/>
            <stop offset=".4" stop-color="#202a34"/>
            <stop offset="1" stop-color="#070e15"/>
          </linearGradient>
        </defs>

        <ellipse cx="135" cy="389" rx="110" ry="14"
          fill="#000" opacity=".7"/>

        <path d="M25 32L52 11H235L212 32Z"
          fill="#6a737b" stroke="#9da6ac"/>

        <path d="M212 32L235 11V355L212 384Z"
          fill="#121a23" stroke="#46515d"/>

        <rect x="20" y="30" width="194" height="350"
          rx="4" fill="url(#${id})"
          stroke="#a0aab1" stroke-width="3"/>

        <rect x="28" y="40" width="176" height="321"
          fill="#10161e" stroke="#637180"/>

        ${unidades}

        <rect x="29" y="42" width="175" height="317"
          fill="#b7d0e0" opacity=".055"/>

        <path d="M36 45L194 45L36 344"
          fill="#c6e2f0" opacity=".045"/>

        <rect x="201" y="163" width="6" height="50"
          rx="2" fill="#bac2c8"/>

        <path d="M221 60q25 35 0 70t0 70t0 70"
          fill="none" stroke="#456985" stroke-width="3"/>

        <rect x="39" y="370" width="20" height="17"
          fill="#101214"/>

        <rect x="173" y="370" width="20" height="17"
          fill="#101214"/>

        <text x="75" y="354" fill="#b8c3ce"
          font-family="monospace" font-size="9">
          CLUSTER • NODE
        </text>
      </svg>
    `;
  }

  window.iniciarInterrogatorio = async (
    container,
    opcoes = {}
  ) => {
    container.classList.add('interrog-app');

    container.innerHTML = `
      <header class="interrog-hud">
        <div>
          <strong>CASO 02 · O servidor doente</strong>
          <span data-el="contador"></span>
          <div class="interrog-tokens"
            data-el="tokens" aria-hidden="true"></div>
        </div>

        <div class="interrog-row">
          <button data-el="caderno" disabled>Caderno</button>
          <button data-el="acusar" disabled>Acusar</button>
          <a href="/">Fase 1</a>
        </div>
      </header>

      <main class="interrog-main">
        <p data-el="erro" role="alert" hidden></p>
        <div data-el="conteudo"></div>
      </main>

      <section class="interrog-intro"
        data-el="intro" hidden>

        <h1 class="interrog-title">
          Fase 2<br>
          A sua máquina não é a única contaminada...
        </h1>

        <div class="interrog-room">
          ${rack()}${rack()}${rack()}${rack()}${rack()}
        </div>

        <div class="interrog-led"></div>

        <button class="interrog-skip"
          data-el="pular" hidden>
          Pular animação
        </button>
      </section>

      <div class="interrog-narr"
        data-el="narracao" hidden></div>

      <dialog class="interrog-dialog"
        data-el="dialogo"
        aria-labelledby="interrog-dialog-title">
        <div data-el="modal"></div>
      </dialog>
    `;

    const el = nome => container.querySelector(
      `[data-el="${nome}"]`
    );

    const reduz = matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const marcas = ['', 'frio', 'morno', 'quente'];

    const labels = {
      '': 'Sem marca',
      frio: '❄ Frio — normal',
      morno: '🌡 Morno — estranho',
      quente: '🔥 Quente — suspeito'
    };

    let d;
    let atual = null;
    let ocupado = false;
    let terminarTexto = null;
    let cancelarIntro = null;

    const notificados = new Set();

    const criar = (tag, texto, classe) => {
      const n = document.createElement(tag);

      if (texto !== undefined) n.textContent = texto;
      if (classe) n.className = classe;

      return n;
    };

    function erro(e) {
      el('erro').textContent = e.message;
      el('erro').hidden = false;
    }

    function botao(texto, fn) {
      const b = criar('button', texto);

      b.type = 'button';
      b.onclick = fn;

      return b;
    }

    async function api(acao = 'estado', extra = {}) {
      const r = await fetch('/api/fase2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pid: opcoes.pid,
          acao,
          tentativa: d?.tentativa,
          ...extra
        })
      });

      const dado = await r.json();

      if (!r.ok) {
        throw new Error(
          dado.erro || 'Não foi possível concluir.'
        );
      }

      return dado;
    }

    async function transacao(acao, extra = {}) {
      if (ocupado) return false;

      ocupado = true;
      el('erro').hidden = true;

      try {
        d = await api(acao, extra);
        hud();
        return true;
      } catch (e) {
        erro(e);
        return false;
      } finally {
        ocupado = false;
      }
    }

    function hud() {
      el('contador').textContent =
        `Perguntas feitas: ${d.perguntas_usadas}` +
        ` · Pontos: ${d.pontos}`;

      el('tokens').textContent =
        'Consultas sem limite de orçamento';

      el('acusar').disabled = (
        d.finalizado || !d.intro
      );

      el('caderno').disabled = !d.intro;
    }

    function digitar(texto, alvo = null) {
      terminarTexto?.();

      const n = el('narracao');

      n.hidden = false;
      n.textContent = '';

      if (alvo) alvo.textContent = '';

      return new Promise(resolve => {
        let i = 0;
        let timer;

        const fim = () => {
          clearInterval(timer);

          n.textContent = texto;

          if (alvo) alvo.textContent = texto;

          terminarTexto = null;
          resolve();
        };

        terminarTexto = fim;

        if (reduz) {
          fim();
          return;
        }

        timer = setInterval(() => {
          n.textContent = texto.slice(0, ++i);

          if (alvo) alvo.textContent = n.textContent;

          if (i >= texto.length) fim();
        }, CINEMA.DIGITACAO_MS);
      });
    }

    // Clicar na fala completa a digitação, sem pular o caso.
    el('narracao').onclick = () => terminarTexto?.();

    function foto(grande = false) {
      const n = criar(
        'div',
        undefined,
        'interrog-photo' +
        (grande ? ' interrog-portrait' : '')
      );

      n.innerHTML = rack();

      return n;
    }

    function fechar() {
      el('dialogo').close();
    }

    function abrir(titulo) {
      if (el('dialogo').open) fechar();

      el('modal').replaceChildren();

      const h = criar('h2', titulo);
      h.id = 'interrog-dialog-title';

      el('modal').append(h);
      el('dialogo').showModal();

      return el('modal');
    }

    function parede() {
      atual = null;

      const area = el('conteudo');
      area.replaceChildren();

      area.append(
        criar('div', '◒', 'interrog-lamp'),
        criar('h1', 'Três servidores. Um canal para fora.')
      );

      area.append(
        criar(
          'p',
          'Escolha quem interrogar. Compare as evidências ' +
          'e faça uma acusação quando estiver pronto. ' +
          'Menos consultas com uma conclusão correta ' +
          'preservam mais pontos.'
        )
      );

      const wall = criar(
        'div',
        undefined,
        'interrog-wall'
      );

      d.suspeitos.forEach((s, i) => {
        const qtd = Object.keys(
          d.respostas[s.id] || {}
        ).length;

        const card = botao(
          '',
          () => interrogar(s.id)
        );

        card.className = 'interrog-card';

        card.append(
          foto(),
          criar('strong', s.apelido),
          criar('small', `${s.hostname} · ${s.ip}`),
          criar('small', s.funcao),
          criar('small', `CASO 02 / FICHA ${i + 1}`)
        );

        card.append(
          criar(
            'span',
            qtd
              ? `INTERROGADO · ${qtd} perguntas`
              : 'AINDA NÃO INTERROGADO',
            'interrog-stamp'
          )
        );

        wall.append(card);
      });

      area.append(wall);
    }

    function prontuario(sid) {
      const n = criar(
        'section',
        undefined,
        'interrog-paper'
      );

      const s = d.suspeitos.find(s => s.id === sid);

      n.append(
        criar('h2', 'Prontuário do paciente'),
        criar('p', `${s.apelido} · ${s.hostname}`)
      );

      const respostas = d.respostas[sid] || {};

      if (!Object.keys(respostas).length) {
        n.append(criar('p', 'Nenhum exame consultado.'));
      }

      d.perguntas.forEach(q => {
        const r = respostas[q.id];

        if (!r) return;

        const linha = criar(
          'div',
          undefined,
          'interrog-exam'
        );

        linha.append(
          criar('strong', q.exame),
          criar('code', `${r.valor} ${r.unidade}`),
          criar(
            'p',
            'Observação clínica: ' + r.observacao
          )
        );

        n.append(linha);
      });

      return n;
    }

    function interrogar(sid) {
      atual = sid;

      const s = d.suspeitos.find(
        s => s.id === sid
      );

      const area = el('conteudo');
      area.replaceChildren();

      area.append(
        botao('← Voltar à parede', parede),
        criar('h1', s.apelido)
      );

      const cols = criar(
        'div',
        undefined,
        'interrog-columns'
      );

      const retrato = criar('section');

      retrato.append(
        foto(true),
        criar(
          'p',
          'Escolha uma pergunta. Cada consulta ' +
          'consome uma das oito fichas.',
          'interrog-message'
        )
      );

      cols.append(retrato, prontuario(sid));
      area.append(cols);

      const menu = criar(
        'div',
        undefined,
        'interrog-menu'
      );

      d.perguntas.forEach(q => {
        const feita = !!d.respostas[sid]?.[q.id];

        const b = botao(
          (feita ? '✔ Perguntado · ' : '') + q.pergunta,
          async () => {
            const ok = await transacao(
              'perguntar',
              {
                suspeito: sid,
                pergunta: q.id
              }
            );

            if (!ok) return;

            interrogar(sid);
            ocupado = true;

            try {
              await digitar(
                d.respostas[sid][q.id].fala
              );
            } finally {
              ocupado = false;
            }

            if (!d.restantes) acusacao();
          }
        );

        b.disabled = (
          feita
          || !d.restantes
          || d.finalizado
        );

        menu.append(b);
      });

      area.append(menu);
    }

    function caderno(
      corrigido = false,
      destino = null
    ) {
      const box = destino || abrir(
        corrigido
          ? 'Caderno corrigido'
          : 'Caderno de evidências'
      );

      if (!destino) {
        box.append(
          botao('Fechar caderno', fechar)
        );
      }

      const scroll = criar(
        'div',
        undefined,
        'interrog-scroll'
      );

      const table = criar('table');
      const head = criar('thead');
      const tr = criar('tr');

      [
        'Exame',
        'Referência saudável',
        ...d.suspeitos.map(s => s.apelido)
      ].forEach(t => tr.append(criar('th', t)));

      head.append(tr);
      table.append(head);

      const body = criar('tbody');

      const linhas = d.perguntas.filter(
        q => corrigido || d.suspeitos.some(
          s => d.respostas[s.id]?.[q.id]
        )
      );

      if (!linhas.length) {
        box.append(
          criar(
            'p',
            'As linhas aparecerão conforme ' +
            'você consultar os servidores.'
          )
        );
      }

      linhas.forEach(q => {
        const row = criar('tr');

        row.append(
          criar('th', q.exame),
          criar('td', q.referencia)
        );

        d.suspeitos.forEach(s => {
          const cel = criar('td');
          const r = d.respostas[s.id]?.[q.id];

          const verdade = corrigido
            ? d.gabarito[s.id][q.id]
            : null;

          const chave = s.id + ':' + q.id;

          if (r || verdade) {
            const ex = r || verdade;

            cel.append(
              criar('div', `${ex.valor} ${ex.unidade}`),
              criar('small', ex.observacao)
            );

            if (corrigido) {
              const classificacoes = {
                anomalia: 'Desvio real do infectado',
                justificada: 'Pista falsa com justificativa',
                normal: 'Sem desvio relevante'
              };

              cel.append(
                criar(
                  'strong',
                  classificacoes[verdade.tipo]
                )
              );

              cel.append(
                criar(
                  'small',
                  r
                    ? (
                      'Sua marca: ' +
                      labels[d.marcas[chave] || '']
                    )
                    : (
                      'Não consultado durante ' +
                      'a investigação.'
                    )
                )
              );
            } else {
              const b = botao(
                labels[d.marcas[chave] || ''],
                async () => {
                  const indice = marcas.indexOf(
                    d.marcas[chave] || ''
                  );

                  const proxima = marcas[
                    (indice + 1) % marcas.length
                  ];

                  const ok = await transacao(
                    'marcar',
                    {
                      suspeito: s.id,
                      pergunta: q.id,
                      marca: proxima
                    }
                  );

                  if (ok) {
                    b.textContent = labels[proxima];

                    b.setAttribute(
                      'aria-label',
                      `${s.apelido}, ${q.exame}: ` +
                      `${labels[proxima]}. Alterar marcação.`
                    );
                  }
                }
              );

              b.disabled = d.finalizado;

              b.setAttribute(
                'aria-label',
                `${s.apelido}, ${q.exame}: ` +
                `${labels[d.marcas[chave] || '']}. ` +
                'Alterar marcação.'
              );

              cel.append(b);
            }
          } else {
            cel.append(
              criar('span', '? — Não consultado')
            );
          }

          row.append(cel);
        });

        body.append(row);
      });

      table.append(body);
      scroll.append(table);
      box.append(scroll);

      if (!corrigido && !d.finalizado) {
        d.suspeitos.forEach(s => {
          const label = criar(
            'label',
            'Anotações: ' + s.apelido
          );

          const txt = criar('textarea');

          txt.maxLength = 1000;
          txt.value = d.notas[s.id] || '';

          txt.setAttribute(
            'aria-label',
            'Anotações sobre ' + s.apelido
          );

          label.append(txt);
          box.append(label);

          const salvar = botao(
            'Salvar anotação',
            async () => {
              const ok = await transacao(
                'anotar',
                {
                  suspeito: s.id,
                  texto: txt.value
                }
              );

              if (ok) {
                salvar.textContent = 'Anotação salva';
              }
            }
          );

          box.append(salvar);
        });
      }

      if (!destino && !d.finalizado) {
        box.append(
          botao('Escolher acusação', acusacao)
        );
      }
    }

    function acusacao() {
      if (d.finalizado || !d.intro) return;

      terminarTexto?.();

      const box = abrir(
        'Uma acusação. Escolha com cuidado.'
      );

      box.append(
        criar(
          'p',
          `Você fez ${d.perguntas_usadas} consultas. ` +
          'Pode continuar investigando ou confirmar agora. ' +
          'A acusação é definitiva nesta tentativa.'
        )
      );

      const select = criar('select');

      select.setAttribute(
        'aria-label',
        'Servidor que será acusado'
      );

      const vazio = criar(
        'option',
        'Selecione o servidor'
      );

      vazio.value = '';
      select.append(vazio);

      d.suspeitos.forEach(s => {
        const o = criar(
          'option',
          s.apelido + ' · ' + s.hostname
        );

        o.value = s.id;
        select.append(o);
      });

      box.append(select);

      const confirmar = botao(
        'Confirmar acusação',
        async () => {
          if (!select.value) return;

          const ok = await transacao(
            'acusar',
            { suspeito: select.value }
          );

          if (ok) {
            fechar();
            resultado();
          }
        }
      );

      confirmar.disabled = true;

      select.onchange = () => {
        confirmar.disabled = !select.value;
      };

      const botoes = criar(
        'div',
        undefined,
        'interrog-row'
      );

      botoes.append(
        confirmar,
        botao('Consultar caderno', () => caderno()),
        botao('Voltar sem acusar', fechar)
      );

      box.append(botoes);
    }

    function resultado() {
      hud();
      el('narracao').hidden = true;

      const r = d.resultado;
      const area = el('conteudo');

      area.replaceChildren();

      const box = criar(
        'section',
        undefined,
        'interrog-result'
      );

      box.append(
        criar(
          'h1',
          r.vitoria
            ? 'Caso resolvido'
            : 'Acusação incorreta'
        ),
        criar(
          'h2',
          'Servidor infectado: ' + d.infectado.apelido
        )
      );

      box.append(
        criar(
          'p',
          `${d.infectado.hostname} mantinha um bot/RAT ` +
          'em comunicação com o C2 fictício ' +
          '203.0.113.77 — atualizacao-cdn.example.'
        )
      );

      box.append(
        criar(
          'p',
          'Linha do tempo do caso: ontem, 03:09 — ' +
          'credencial de serviço utilizada; ' +
          '03:12 — reinício não autorizado; ' +
          'a partir de 03:14 — comunicações a cada ' +
          '60 segundos; 02:50 a 04:50 — lacuna nos logs. ' +
          'Os logins administrativos interativos ' +
          'permaneceram habituais.'
        )
      );

      box.append(
        criar(
          'p',
          `Pontuação: ${r.pontos} = ` +
          `saldo das consultas (${r.base}) + ` +
          `acerto (${r.bonus_acerto}) + ` +
          `marcações (${r.bonus_marcas}). ` +
          `Perguntas feitas: ${r.perguntas_usadas}.`
        )
      );

      box.append(
        criar(
          'p',
          `Fase 1: ${d.pontos_fase1} pts · ` +
          `Fase 2: ${r.pontos} pts · ` +
          `Total: ${d.pontos_fase1 + r.pontos} pts.`
        )
      );

      const perdidas = d.perguntas.filter(
        q => (
          d.gabarito[d.infectado.id][q.id].tipo
          === 'anomalia'
        ) && !d.respostas[d.infectado.id]?.[q.id]
      );

      box.append(
        criar(
          'p',
          perdidas.length
            ? (
              'Desvios do infectado não consultados: ' +
              perdidas.map(q => q.exame).join(', ') +
              '.'
            )
            : (
              'Você consultou todos os desvios ' +
              'disponíveis do infectado.'
            )
        )
      );

      box.append(
        criar('h2', 'O que você aprendeu')
      );

      const ul = criar('ul');

      [
        'Suspeito é o que foge do padrão, para cima ou para baixo.',

        'Beaconing é uma comunicação repetida em intervalos ' +
        'regulares entre um agente e um destino de controle; ' +
        'precisa ser contextualizada.',

        'Ausência de atividade e lacunas sem justificativa ' +
        'também merecem investigação.',

        'Uma anomalia com justificativa legítima não comprova ' +
        'contaminação; ausência de alerta do EDR também ' +
        'não comprova limpeza.',

        'RAT permite controle remoto de uma máquina. ' +
        'Botnet reúne dispositivos sob controle coordenado, ' +
        'frequentemente por uma infraestrutura C2.'
      ].forEach(t => ul.append(criar('li', t)));

      box.append(ul);

      const acoes = criar(
        'div',
        undefined,
        'interrog-row'
      );

      acoes.append(
        botao(
          'Tentar novamente',
          async () => {
            if (!(await transacao('reiniciar'))) return;

            atual = null;
            await abertura();
          }
        )
      );

      if (r.vitoria) {
        acoes.append(
          botao(
            'Avançar para o encerramento',
            () => {
              area.replaceChildren(
                criar('h1', 'Fase 2 concluída'),
                criar(
                  'p',
                  'Caso resolvido. Total das duas fases: ' +
                  `${d.pontos_fase1 + r.pontos} pontos.`
                ),
                botao('Rever relatório', resultado)
              );
            }
          )
        );
      }

      box.append(
        acoes,
        criar(
          'h2',
          'Caderno corrigido — inclui evidências não consultadas'
        )
      );

      area.append(box);
      caderno(true, box);

      if (!notificados.has(d.tentativa)) {
        notificados.add(d.tentativa);

        opcoes.onAtividadeConcluida?.({
          vitoria: r.vitoria,
          pontos: r.pontos,
          perguntasUsadas: r.perguntas_usadas
        });
      }
    }

    async function abertura() {
      const intro = el('intro');
      const controle = new AbortController();

      intro.className = 'interrog-intro';
      intro.hidden = false;

      el('conteudo').replaceChildren();
      el('pular').hidden = !d.pode_pular;

      cancelarIntro = () => {
        terminarTexto?.();
        controle.abort();
      };

      const espera = ms => new Promise(
        (resolve, reject) => {
          if (controle.signal.aborted) {
            reject(new Error('pular'));
            return;
          }

          const id = setTimeout(() => {
            controle.signal.removeEventListener(
              'abort',
              abort
            );

            resolve();
          }, ms);

          function abort() {
            clearTimeout(id);
            reject(new Error('pular'));
          }

          controle.signal.addEventListener(
            'abort',
            abort,
            { once: true }
          );
        }
      );

      async function fala(texto) {
        await digitar(texto);

        const palavras = texto
          .trim()
          .split(/\s+/)
          .length;

        const leitura = Math.max(
          CINEMA.LEITURA_MINIMA_MS,
          palavras * CINEMA.LEITURA_POR_PALAVRA_MS
        );

        await espera(leitura);
      }

      try {
        await espera(80);

        intro.classList.add('titulo');

        await espera(
          (reduz ? 0 : CINEMA.FADE_MS)
          + CINEMA.TITULO_LEITURA_MS
        );

        intro.classList.remove('titulo');

        await espera(
          reduz
            ? 0
            : CINEMA.FADE_MS + CINEMA.ESCURO_MS
        );

        intro.classList.add('azul');

        await espera(
          reduz ? 0 : CINEMA.LUZ_AZUL_MS
        );

        intro.classList.add('revelar');

        await espera(
          reduz ? 0 : CINEMA.REVELACAO_MS
        );

        intro.classList.add('vermelho');

        await espera(
          reduz ? 0 : CINEMA.VERMELHO_MS
        );

        await fala(
          'A máquina inicial foi apenas o primeiro sinal...'
        );

        await fala(
          'Alerta na rede. Três servidores, um canal ' +
          'aberto para fora. Um deles está doente. ' +
          'Investigue com cuidado: cada consulta tem ' +
          'um custo, e as evidências precisam ' +
          'fazer sentido juntas.'
        );
      } catch (e) {
        if (!controle.signal.aborted) throw e;
      } finally {
        intro.hidden = true;
        cancelarIntro = null;
        el('narracao').hidden = true;
      }

      if (await transacao('intro')) {
        parede();
      }
    }

    el('pular').onclick = () => cancelarIntro?.();

    el('caderno').onclick = () => {
      caderno(d.finalizado);
    };

    el('acusar').onclick = acusacao;

    if (!opcoes.pid) {
      erro(
        new Error(
          'Participante não identificado. Volte à Fase 1.'
        )
      );
      return;
    }

    try {
      d = await api();
      hud();

      if (d.finalizado) {
        resultado();
      } else if (!d.intro) {
        await abertura();
      } else {
        parede();
      }
    } catch (e) {
      erro(e);

      el('conteudo').append(
        botao(
          'Atualizar página',
          () => location.reload()
        )
      );
    }
  };
})();