/*
OBJETIVO:
Apresentar uma bolinha azul brilhante por servidor.
As bolinhas ficam vermelhas em sequência, mantendo as anteriores
vermelhas durante a narração seguinte.

ARQUIVO: static/interrogatorio.js
SUBSTITUA TODO O CONTEÚDO.

Preserva:
- Identidades: rack, torre e NAS.
- Servidores alinhados.
- Perguntas, pontuação e regras recebidas do servidor.
- Prontuário com resposta mais recente no topo.
- Caderno completo, marcações, rascunhos e foco.
- Acusação, encerramento e relatório pós-créditos.

A sequência das luzes é visual e não identifica o infectado sorteado.
*/

(() => {
  'use strict';

  const CINEMA = {
    DIGITACAO_MS: 32,
    FADE_MS: 1600,
    TITULO_LEITURA_MS: 2500,
    ESCURO_MS: 1800,
    LUZ_AZUL_MS: 2500,
    REVELACAO_MS: 6000,
    VERMELHO_MS: 2200,
    ALERTA_POR_SERVIDOR_MS: 1200,
    LEITURA_MINIMA_MS: 8000,
    LEITURA_POR_PALAVRA_MS: 450
  };

  let svgId = 0;

  /* ---------- Desenhos dos servidores ---------- */

  function maquina(tipo, rotulo, cor) {
    const id = 'imaquina-' + (++svgId);

    const modelo = ['rack', 'torre', 'nas'].includes(tipo)
      ? tipo
      : 'rack';

    const led = /^#[0-9a-f]{6}$/i.test(String(cor))
      ? cor
      : '#aeb5bd';

    const texto = String(rotulo ?? '').replace(
      /[&<>"']/g,
      ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[ch]
    );

    if (modelo !== 'rack') {
      let corpo;

      if (modelo === 'torre') {
        const grades = Array.from({length: 13}, (_, i) => `
          <path
            d="M69 ${174 + i * 10}H170"
            stroke="#596b78"
            stroke-width="3"
          />
        `).join('');

        corpo = `
          <path
            d="M47 43L76 20H221L193 43Z"
            fill="#65727e" stroke="#a0aab1"
          />
          <path
            d="M193 43L221 20V350L193 378Z"
            fill="#111b25" stroke="#65727e"
          />
          <rect
            x="44" y="43" width="150" height="335" rx="7"
            fill="url(#${id})"
            stroke="#a0aab1" stroke-width="3"
          />
          <rect
            x="57" y="60" width="124" height="37" rx="3"
            fill="#10161e" stroke="#637180"
          />
          <path
            d="M66 77H157"
            stroke="#6a7d89" stroke-width="3"
          />
          <rect
            x="59" y="110" width="121" height="34" rx="3"
            fill="#1a2631" stroke="#536675"
          />
          <circle cx="163" cy="127" r="6" fill="${led}"/>
          <rect
            x="68" y="120" width="9" height="12"
            rx="1" fill="#8a9ca7"
          />
          <rect
            x="87" y="120" width="9" height="12"
            rx="1" fill="#8a9ca7"
          />
          <rect
            x="58" y="160" width="123" height="160" rx="5"
            fill="#0d151d" stroke="#526878"
          />

          ${grades}

          <circle
            cx="119" cy="238" r="38"
            fill="none" stroke="#7e95a5" opacity=".35"
          />
          <rect
            x="60" y="376" width="22" height="11"
            fill="#101214"
          />
          <rect
            x="158" y="376" width="22" height="11"
            fill="#101214"
          />
          <text
            x="119" y="351" text-anchor="middle"
            fill="#d8e1e8"
            font-family="monospace" font-size="10"
          >${texto}</text>
        `;
      } else {
        const baias = Array.from({length: 4}, (_, i) => {
          const x = 36 + i * 45;

          return `
            <g>
              <rect
                x="${x}" y="164" width="37" height="139" rx="5"
                fill="#101820" stroke="#718491"
              />
              <rect
                x="${x + 7}" y="175"
                width="23" height="93" rx="3"
                fill="#263744"
              />
              <path
                d="M${x + 11} 189h15m-15 12h15m-15 12h15m-15 12h15m-15 12h15m-15 12h15"
                stroke="#596c79" stroke-width="2"
              />
              <rect
                x="${x + 7}" y="275"
                width="23" height="8" rx="2"
                fill="#8a9ca7"
              />
              <circle
                cx="${x + 18}" cy="293" r="3"
                fill="${led}"
              />
            </g>
          `;
        }).join('');

        corpo = `
          <path
            d="M20 143L44 119H253L230 143Z"
            fill="#65727e" stroke="#a0aab1"
          />
          <path
            d="M230 143L253 119V315L230 340Z"
            fill="#111b25" stroke="#65727e"
          />
          <rect
            x="20" y="143" width="210" height="197" rx="9"
            fill="url(#${id})"
            stroke="#a0aab1" stroke-width="3"
          />

          ${baias}

          <circle cx="220" cy="158" r="3" fill="${led}"/>
          <rect
            x="36" y="337" width="29" height="13"
            rx="2" fill="#101214"
          />
          <rect
            x="187" y="337" width="29" height="13"
            rx="2" fill="#101214"
          />
          <text
            x="125" y="326" text-anchor="middle"
            fill="#d8e1e8"
            font-family="monospace" font-size="10"
          >${texto}</text>
        `;
      }

      return `
        <svg
          viewBox="0 0 260 410"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
          data-maquina="${modelo}"
        >
          <defs>
            <linearGradient id="${id}">
              <stop stop-color="#586673"/>
              <stop offset=".4" stop-color="#202a34"/>
              <stop offset="1" stop-color="#070e15"/>
            </linearGradient>
          </defs>

          <ellipse
            cx="135" cy="389" rx="110" ry="14"
            fill="#000" opacity=".7"
          />

          <g transform="${
            modelo === 'nas'
              ? 'translate(0 37)'
              : 'translate(0 0)'
          }">
            ${corpo}
          </g>
        </svg>
      `;
    }

    const unidades = Array.from({length: 8}, (_, i) => {
      const y = 48 + i * 37;

      return `
        <g transform="translate(32 ${y})">
          <rect
            width="166" height="31" rx="3"
            fill="#26303b" stroke="#66717d"
          />
          <rect
            x="8" y="6" width="81" height="18"
            rx="2" fill="#12181e"
          />
          <path
            d="M12 10h70m-70 4h70m-70 4h70"
            stroke="#48525d" stroke-width="2"
          />
          <rect
            x="99" y="5" width="40" height="21"
            fill="#3b4652" stroke="#83909c"
          />
          <path
            d="M109 7v17m10-17v17m10-17v17"
            stroke="#10181f" stroke-width="3"
          />
          <circle cx="150" cy="10" r="2" fill="${led}"/>
          <circle cx="150" cy="20" r="2" fill="${led}"/>
          <circle cx="4" cy="15" r="1.5" fill="#b6bdc4"/>
        </g>
      `;
    }).join('');

    return `
      <svg
        viewBox="0 0 260 410"
        preserveAspectRatio="xMidYMid meet"
        data-maquina="rack"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="${id}">
            <stop stop-color="#586673"/>
            <stop offset=".4" stop-color="#202a34"/>
            <stop offset="1" stop-color="#070e15"/>
          </linearGradient>
        </defs>

        <ellipse
          cx="135" cy="389" rx="110" ry="14"
          fill="#000" opacity=".7"
        />

        <path
          d="M25 32L52 11H235L212 32Z"
          fill="#6a737b" stroke="#9da6ac"
        />
        <path
          d="M212 32L235 11V355L212 384Z"
          fill="#121a23" stroke="#46515d"
        />

        <rect
          x="20" y="30" width="194" height="350" rx="4"
          fill="url(#${id})"
          stroke="#a0aab1" stroke-width="3"
        />
        <rect
          x="28" y="40" width="176" height="321"
          fill="#10161e" stroke="#637180"
        />

        ${unidades}

        <rect
          x="29" y="42" width="175" height="317"
          fill="#b7d0e0" opacity=".055"
        />
        <path
          d="M36 45L194 45L36 344"
          fill="#c6e2f0" opacity=".045"
        />
        <rect
          x="201" y="163" width="6" height="50"
          rx="2" fill="#bac2c8"
        />
        <path
          d="M221 60q25 35 0 70t0 70t0 70"
          fill="none" stroke="#456985" stroke-width="3"
        />
        <rect
          x="39" y="370" width="20" height="17"
          fill="#101214"
        />
        <rect
          x="173" y="370" width="20" height="17"
          fill="#101214"
        />
        <text
          x="75" y="354" fill="#b8c3ce"
          font-family="monospace" font-size="9"
        >${texto}</text>
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
          <strong>CASO 02 · O servidor suspeito</strong>
          <span data-el="contador"></span>
          <div class="interrog-tokens" data-el="tokens"></div>
        </div>

        <div class="interrog-row">
          <button type="button" data-el="ajuda" disabled>
            Como jogar
          </button>
          <button type="button" data-el="caderno" disabled>
            Caderno
          </button>
          <button type="button" data-el="acusar" disabled>
            Acusar
          </button>
          <a href="/">Fase 1</a>
        </div>
      </header>

      <main class="interrog-main">
        <p data-el="erro" role="alert" hidden></p>
        <div data-el="conteudo"></div>
      </main>

      <section class="interrog-intro" data-el="intro" hidden>
        <h1 class="interrog-title">
          Fase 2<br>A sua máquina não é a única contaminada...
        </h1>

        <div class="interrog-room">
          ${maquina('rack', 'PORTAL-DMZ-01', '#aeb5bd')}
          ${maquina('torre', 'FIN-API-02', '#aeb5bd')}
          ${maquina('nas', 'DOCS-WEB-03', '#aeb5bd')}
          ${maquina('rack', 'PORTAL-DMZ-01', '#aeb5bd')}
          ${maquina('torre', 'FIN-API-02', '#aeb5bd')}
        </div>

        <div class="interrog-luzes" aria-hidden="true">
          <span class="interrog-porta"></span>
          <span class="interrog-porta"></span>
          <span class="interrog-porta"></span>
          <span class="interrog-porta"></span>
          <span class="interrog-porta"></span>
        </div>

        <div class="interrog-led"></div>

        <button
          type="button"
          class="interrog-skip"
          data-el="pular"
          hidden
        >
          Pular animação
        </button>
      </section>

      <div
        class="interrog-narr"
        data-el="narracao"
        hidden
      ></div>

      <dialog
        class="interrog-dialog"
        data-el="dialogo"
        aria-labelledby="interrog-dialog-title"
      >
        <div data-el="modal"></div>
      </dialog>
    `;

    const el = nome => container.querySelector(
      `[data-el="${nome}"]`
    );

    const labels = {
      '': 'Sem marca',
      frio: '❄ Frio — dentro da referência',
      morno: '🌡 Morno — fora da referência, com justificativa',
      quente: '🔥 Quente — fora da referência, sem justificativa'
    };

    const CURTOS = {
      frio: '❄ Frio',
      morno: '🌡 Morno',
      quente: '🔥 Quente'
    };

    const ICONES = {
      frio: '❄',
      morno: '🌡',
      quente: '🔥'
    };

    const REGRA = {
      frio: 'Dentro da referência saudável.',
      morno:
        'Fugiu da referência, mas a observação traz um motivo registrado.',
      quente: 'Fugiu da referência e nada explica.'
    };

    const MANUAL_COMPLETO = false;

    let d;
    let ocupado = false;
    let terminarTexto = null;
    let cancelarIntro = null;
    let abaCaderno = null;
    let celulaGeral = null;

    const notificados = new Set();
    const rascunhos = new Map();

    /* ---------- Utilitários e comunicação ---------- */

    function criar(tag, texto, classe) {
      const n = document.createElement(tag);

      if (texto !== undefined) n.textContent = texto;
      if (classe) n.className = classe;

      return n;
    }

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
      const resposta = await fetch('/api/fase2', {
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

      const dado = await resposta.json();

      if (!resposta.ok) {
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
        `Perguntas feitas: ${d.perguntas_usadas ?? 0} · Pontos: ${d.pontos}`;

      el('tokens').textContent =
        'Você decide quando acusar. Cada nova consulta custa pontos.';

      el('acusar').disabled = d.finalizado || !d.intro;
      el('caderno').disabled = !d.intro;
      el('ajuda').disabled = !d.intro || d.finalizado;
    }

    /* ---------- Narração ---------- */

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
          TTAnimacao.cancelar(timer);

          n.textContent = texto;
          if (alvo) alvo.textContent = texto;

          terminarTexto = null;
          resolve();
        };

        terminarTexto = fim;

        timer = TTAnimacao.intervalo(() => {
          n.textContent = texto.slice(0, ++i);
          window.TTUI?.toque(texto[i - 1]);

          if (alvo) alvo.textContent = n.textContent;
          if (i >= texto.length) fim();
        }, CINEMA.DIGITACAO_MS);
      });
    }

    el('narracao').onclick = () => terminarTexto?.();

    function foto(s, grande = false) {
      const n = criar(
        'div',
        undefined,
        'interrog-photo'
          + (grande ? ' interrog-portrait' : '')
      );

      n.innerHTML = maquina(
        s.visual,
        s.hostname,
        s.cor
      );

      return n;
    }

    /* ---------- Janelas ---------- */

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

    /* ---------- Parede ---------- */

    function parede() {
      const area = el('conteudo');
      area.replaceChildren();

      area.append(
        criar('div', '◒', 'interrog-lamp'),
        criar('h1', 'Três servidores. Um canal para fora.'),
        criar(
          'p',
          'Escolha quem interrogar. Compare as evidências e faça ' +
          'uma acusação quando estiver pronto. Menos consultas ' +
          'com uma conclusão correta preservam mais pontos.'
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
          foto(s),
          criar('strong', s.apelido),
          criar('small', `${s.hostname} · ${s.ip}`),
          criar('small', s.funcao),
          criar(
            'small',
            `${s.so} · ${s.setor}`,
            'interrog-meta'
          ),
          criar('small', `CASO 02 / FICHA ${i + 1}`),
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

    /* ---------- Prontuário ---------- */

    function prontuario(sid) {
      const n = criar(
        'section',
        undefined,
        'interrog-paper'
      );

      const s = d.suspeitos.find(
        item => item.id === sid
      );

      n.append(
        criar('h2', 'Prontuário do paciente'),
        criar('p', `${s.apelido} · ${s.hostname}`)
      );

      const painel = criar(
        'div',
        undefined,
        'interrog-prontuario-scroll'
      );

      painel.tabIndex = 0;
      painel.setAttribute('role', 'region');

      painel.setAttribute(
        'aria-label',
        `Respostas de ${s.apelido}, da mais recente para a mais antiga`
      );

      Object.assign(painel.style, {
        maxHeight: '52vh',
        minHeight: '200px',
        overflowY: 'scroll',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
        scrollbarGutter: 'stable',
        overflowWrap: 'anywhere',
        paddingRight: '12px'
      });

      const respostas = d.respostas[sid] || {};

      const perguntas = new Map(
        d.perguntas.map(q => [q.id, q])
      );

      const ordem = [...new Set([
        ...(d.ordem_respostas?.[sid] || []),
        ...Object.keys(respostas)
      ])].reverse();

      if (!ordem.length) {
        painel.append(
          criar('p', 'Nenhum exame consultado.')
        );
      }

      ordem.forEach(qid => {
        const q = perguntas.get(qid);
        const r = respostas[qid];

        if (!q || !r) return;

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

        painel.append(linha);
      });

      n.append(painel);

      requestAnimationFrame(() => {
        if (painel.isConnected) {
          painel.scrollTop = 0;
        }
      });

      return n;
    }

    function fichaTecnica(s) {
      const ficha = criar(
        'dl',
        undefined,
        'interrog-ficha'
      );

      ficha.setAttribute(
        'aria-label',
        'Ficha técnica de ' + s.apelido
      );

      [
        ['Hostname', s.hostname],
        ['IP', s.ip],
        ['Função', s.funcao],
        ['Sistema', s.so],
        ['Setor', s.setor],
        ['Criticidade', s.criticidade]
      ].forEach(([rotulo, valor]) => {
        const item = criar('div');

        item.append(
          criar('dt', rotulo),
          criar('dd', valor)
        );

        ficha.append(item);
      });

      return ficha;
    }

    /* ---------- Perguntas ---------- */

    function interrogar(sid) {
      const s = d.suspeitos.find(
        item => item.id === sid
      );

      const area = el('conteudo');
      area.replaceChildren();

      area.append(
        botao('← Voltar à parede', parede),
        criar('h1', s.apelido),
        fichaTecnica(s)
      );

      const cols = criar(
        'div',
        undefined,
        'interrog-columns'
      );

      const retrato = criar('section');

      retrato.append(
        foto(s, true),
        criar(
          'p',
          'Você pode consultar todas as perguntas disponíveis. ' +
          `Cada pergunta inédita custa ${d.custo_pergunta} pontos. ` +
          'As respostas já consultadas continuam no prontuário, ' +
          'com a mais recente no topo.',
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
            if (!(await transacao('perguntar', {
              suspeito: sid,
              pergunta: q.id
            }))) return;

            interrogar(sid);
            ocupado = true;

            try {
              await digitar(
                d.respostas[sid][q.id].fala
              );
            } finally {
              ocupado = false;
            }
          }
        );

        b.disabled = feita || d.finalizado;
        menu.append(b);
      });

      area.append(menu);
    }

    /* ---------- Referências, marcações e rascunhos ---------- */

    const examesVisiveis = () => d.perguntas.filter(q =>
      MANUAL_COMPLETO
      || d.suspeitos.some(
        s => d.respostas[s.id]?.[q.id]
      )
    );

    const nomeCurto = s => s.apelido.replace(
      /^(O|A) /,
      ''
    );

    function legenda() {
      const box = criar(
        'div',
        undefined,
        'interrog-legenda'
      );

      ['frio', 'morno', 'quente'].forEach(m => {
        const item = criar(
          'div',
          undefined,
          'interrog-legenda-item ' + m
        );

        item.append(
          criar('strong', CURTOS[m]),
          criar('span', REGRA[m])
        );

        box.append(item);
      });

      return box;
    }

    function controleMarcas(sid, q, redesenhar) {
      const s = d.suspeitos.find(
        item => item.id === sid
      );

      const chave = sid + ':' + q.id;
      const atual = d.marcas[chave] || '';

      const grupo = criar(
        'div',
        undefined,
        'interrog-marcas'
      );

      grupo.setAttribute('role', 'group');

      grupo.setAttribute(
        'aria-label',
        `Classificar ${q.exame} de ${s.apelido}`
      );

      ['frio', 'morno', 'quente'].forEach(m => {
        const b = botao(CURTOS[m], async () => {
          const nova = atual === m ? '' : m;

          if (await transacao('marcar', {
            suspeito: sid,
            pergunta: q.id,
            marca: nova
          })) {
            redesenhar(chave + ':' + m);
          }
        });

        b.className = 'interrog-marca ' + m;
        b.title = REGRA[m];
        b.dataset.foco = chave + ':' + m;
        b.disabled = d.finalizado;

        b.setAttribute(
          'aria-pressed',
          String(atual === m)
        );

        grupo.append(b);
      });

      return grupo;
    }

    function resumoOutros(sid, q) {
      const outros = d.suspeitos
        .filter(s => s.id !== sid)
        .map(s => {
          const feita = !!d.respostas[s.id]?.[q.id];
          const marca = d.marcas[s.id + ':' + q.id];

          return `${nomeCurto(s)} ${
            marca ? ICONES[marca] : feita ? '·' : '?'
          }`;
        });

      return criar(
        'small',
        'Outros servidores: ' + outros.join(' · '),
        'interrog-outros'
      );
    }

    function campoNota(s) {
      const chave = d.tentativa + ':' + s.id;

      const caixa = criar(
        'div',
        undefined,
        'interrog-nota'
      );

      const label = criar(
        'label',
        'Anotações: ' + s.apelido
      );

      const txt = criar('textarea');

      txt.maxLength = 1000;
      txt.value = rascunhos.get(chave) ?? d.notas[s.id] ?? '';

      txt.setAttribute(
        'aria-label',
        'Anotações sobre ' + s.apelido
      );

      const salvar = botao(
        'Salvar anotação',
        async () => {
          if (await transacao('anotar', {
            suspeito: s.id,
            texto: txt.value
          })) {
            rascunhos.delete(chave);
            salvar.textContent = 'Anotação salva';
          }
        }
      );

      txt.addEventListener('input', () => {
        rascunhos.set(chave, txt.value);
        salvar.textContent = 'Salvar anotação';
      });

      label.append(txt);
      caixa.append(label, salvar);

      return caixa;
    }

    /* ---------- Manual ---------- */

    function paginaManual() {
      const sec = criar('section');
      const linhas = examesVisiveis();

      sec.append(
        criar('h3', '📗 Manual de referência saudável'),
        criar(
          'p',
          'É o comportamento esperado de um servidor deste cluster, ' +
          'igual para os três. Compare cada resposta com ele. ' +
          'O manual cresce conforme você consulta.',
          'interrog-dica'
        ),
        legenda()
      );

      if (!linhas.length) {
        sec.append(criar(
          'p',
          'Nenhum exame consultado ainda. As linhas aparecerão ' +
          'conforme você interrogar os servidores.'
        ));

        return sec;
      }

      const scroll = criar(
        'div',
        undefined,
        'interrog-scroll'
      );

      const table = criar('table');
      const tr = criar('tr');

      [
        'Exame',
        'Pergunta feita',
        'Referência saudável',
        'Consultado em'
      ].forEach(t => tr.append(criar('th', t)));

      const head = criar('thead');
      head.append(tr);
      table.append(head);

      const body = criar('tbody');

      linhas.forEach(q => {
        const quantidade = d.suspeitos.filter(
          s => d.respostas[s.id]?.[q.id]
        ).length;

        const row = criar('tr');

        row.append(
          criar('th', q.exame),
          criar('td', q.pergunta),
          criar('td', q.referencia),
          criar(
            'td',
            `${quantidade} de ${d.suspeitos.length}`
          )
        );

        body.append(row);
      });

      table.append(body);
      scroll.append(table);
      sec.append(scroll);

      return sec;
    }

    /* ---------- Caderno por servidor ---------- */

    function paginaServidor(sid, redesenhar) {
      const s = d.suspeitos.find(
        item => item.id === sid
      );

      const sec = criar('section');

      sec.append(
        criar('h3', `📒 Caderno — ${s.apelido}`),
        criar(
          'p',
          `${s.hostname} · ${s.ip} · ${s.so}`,
          'interrog-dica'
        )
      );

      const scroll = criar(
        'div',
        undefined,
        'interrog-scroll'
      );

      const linhas = examesVisiveis();

      if (!linhas.length) {
        scroll.append(criar(
          'p',
          'Nenhum exame consultado ainda. ' +
          'Interrogue um servidor para começar o caderno.'
        ));
      }

      linhas.forEach(q => {
        const r = d.respostas[sid]?.[q.id];

        const linha = criar(
          'div',
          undefined,
          'interrog-linha'
        );

        const ref = criar('div');

        ref.append(
          criar('strong', q.exame),
          criar('small', 'Referência: ' + q.referencia)
        );

        const resp = criar('div');

        if (r) {
          resp.append(
            criar(
              'div',
              `${r.valor} ${r.unidade}`.trim(),
              'interrog-valor'
            ),
            criar('small', '“' + r.fala + '”'),
            criar('small', r.observacao),
            controleMarcas(sid, q, redesenhar)
          );
        } else {
          resp.append(criar(
            'span',
            '? — Ainda não consultado neste servidor'
          ));
        }

        resp.append(resumoOutros(sid, q));
        linha.append(ref, resp);
        scroll.append(linha);
      });

      sec.append(scroll);

      if (!d.finalizado) {
        sec.append(campoNota(s));
      }

      return sec;
    }

    /* ---------- Visão Geral ---------- */

    function paginaGeral(redesenhar) {
      const sec = criar('section');

      sec.append(
        criar('h3', '🗂️ Visão geral dos três servidores'),
        criar(
          'p',
          'Cruze as marcas. Toque em uma célula para ' +
          'ver o detalhe e classificar.',
          'interrog-dica'
        )
      );

      const linhas = examesVisiveis();

      const scroll = criar(
        'div',
        undefined,
        'interrog-scroll'
      );

      if (!linhas.length) {
        scroll.append(criar(
          'p',
          'As linhas aparecerão conforme você consultar os servidores.'
        ));
      } else {
        const table = criar(
          'table',
          undefined,
          'interrog-matriz'
        );

        const tr = criar('tr');

        [
          'Exame',
          'Referência',
          ...d.suspeitos.map(s => s.apelido),
          'Padrão'
        ].forEach(t => tr.append(criar('th', t)));

        const head = criar('thead');
        head.append(tr);
        table.append(head);

        const body = criar('tbody');

        linhas.forEach(q => {
          const row = criar('tr');

          row.append(
            criar('th', q.exame),
            criar('td', q.referencia)
          );

          const quentes = [];

          d.suspeitos.forEach(s => {
            const r = d.respostas[s.id]?.[q.id];
            const m = d.marcas[s.id + ':' + q.id] || '';
            const cel = criar('td');

            if (!r) {
              cel.append(criar('span', '?'));
              row.append(cel);
              return;
            }

            if (m === 'quente') {
              quentes.push(s);
            }

            const b = botao(
              `${m ? ICONES[m] : '·'} ${r.valor} ${r.unidade}`.trim(),
              () => {
                celulaGeral = {
                  sid: s.id,
                  qid: q.id
                };

                redesenhar();
              }
            );

            b.className =
              'interrog-celula'
              + (m ? ' ' + m : '');

            b.setAttribute(
              'aria-label',
              `${s.apelido}, ${q.exame}: ${r.valor} ${r.unidade}. ` +
              `${m ? labels[m] : 'Sem marca'}. Ver detalhe.`
            );

            b.setAttribute(
              'aria-pressed',
              String(
                celulaGeral?.sid === s.id
                && celulaGeral?.qid === q.id
              )
            );

            cel.append(b);
            row.append(cel);
          });

          row.append(criar(
            'td',
            quentes.length === 1
              ? `Só ${nomeCurto(quentes[0])} destoa`
              : quentes.length > 1
                ? `${quentes.length} servidores em 🔥`
                : ''
          ));

          body.append(row);
        });

        const total = criar('tr');

        total.append(
          criar('th', '🔥 Total por servidor'),
          criar('td')
        );

        d.suspeitos.forEach(s => {
          const quantidade = Object.entries(d.marcas).filter(
            ([chave, valor]) =>
              chave.startsWith(s.id + ':')
              && valor === 'quente'
          ).length;

          total.append(
            criar('td', String(quantidade))
          );
        });

        total.append(criar('td'));
        body.append(total);

        table.append(body);
        scroll.append(table);
      }

      sec.append(scroll);

      if (celulaGeral) {
        const s = d.suspeitos.find(
          item => item.id === celulaGeral.sid
        );

        const q = d.perguntas.find(
          item => item.id === celulaGeral.qid
        );

        const r = d.respostas[
          celulaGeral.sid
        ]?.[celulaGeral.qid];

        if (s && q && r) {
          const det = criar(
            'div',
            undefined,
            'interrog-detalhe'
          );

          det.append(
            criar('strong', `${s.apelido} · ${q.exame}`),
            criar('small', 'Referência: ' + q.referencia),
            criar(
              'div',
              `${r.valor} ${r.unidade}`.trim(),
              'interrog-valor'
            ),
            criar('small', '“' + r.fala + '”'),
            criar('small', r.observacao),
            controleMarcas(s.id, q, redesenhar)
          );

          sec.append(det);
        }
      }

      if (!d.finalizado) {
        const grade = criar(
          'div',
          undefined,
          'interrog-notas-grid'
        );

        grade.append(
          ...d.suspeitos.map(campoNota)
        );

        sec.append(
          criar('h3', '📝 Anotações de todos os servidores'),
          grade
        );
      }

      return sec;
    }

    /* ---------- Janela do caderno ---------- */

    function caderno(corrigido = false, destino = null) {
      if (corrigido) {
        cadernoCorrigido(destino);
        return;
      }

      const box = abrir('Caderno de evidências');

      box.append(
        botao('Fechar caderno', fechar)
      );

      const secoes = [
        {id: 'manual', rotulo: '📗 Manual'},
        ...d.suspeitos.map(s => ({
          id: s.id,
          rotulo: '📒 ' + s.apelido
        })),
        {id: 'geral', rotulo: '🗂️ Geral'}
      ];

      if (!secoes.some(item => item.id === abaCaderno)) {
        abaCaderno = d.suspeitos[0].id;
      }

      const abas = criar(
        'div',
        undefined,
        'interrog-abas'
      );

      abas.setAttribute('role', 'tablist');
      abas.setAttribute('aria-label', 'Áreas do caderno');

      const corpo = criar('div');
      box.append(abas, corpo);

      function desenhar(manterRolagem = false, foco = null) {
        const antigo = corpo.querySelector(
          '.interrog-scroll'
        );

        const topo = antigo ? antigo.scrollTop : 0;

        abas.replaceChildren(
          ...secoes.map(sec => {
            const ativa = sec.id === abaCaderno;

            const b = botao(sec.rotulo, () => {
              abaCaderno = sec.id;
              desenhar();
            });

            b.className =
              'interrog-aba'
              + (ativa ? ' ativa' : '');

            b.setAttribute('role', 'tab');
            b.setAttribute(
              'aria-selected',
              String(ativa)
            );

            return b;
          })
        );

        const redesenhar = f => desenhar(true, f);

        corpo.replaceChildren(
          abaCaderno === 'manual'
            ? paginaManual()
            : abaCaderno === 'geral'
              ? paginaGeral(redesenhar)
              : paginaServidor(
                abaCaderno,
                redesenhar
              )
        );

        const novo = corpo.querySelector(
          '.interrog-scroll'
        );

        if (manterRolagem && novo) {
          novo.scrollTop = topo;
        }

        if (foco) {
          corpo.querySelector(
            `[data-foco="${foco}"]`
          )?.focus();
        }
      }

      desenhar();

      if (!d.finalizado) {
        box.append(
          botao('Escolher acusação', acusacao)
        );
      }
    }

    /* ---------- Caderno corrigido ---------- */

    function cadernoCorrigido(destino = null) {
      const box = destino || abrir('Caderno corrigido');

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

      const descricao = {
        anomalia: 'Desvio real do infectado',
        justificada: 'Pista falsa com justificativa',
        normal: 'Sem desvio relevante'
      };

      const esperada = {
        anomalia: 'quente',
        justificada: 'morno',
        normal: 'frio'
      };

      d.perguntas.forEach(q => {
        const row = criar('tr');

        row.append(
          criar('th', q.exame),
          criar('td', q.referencia)
        );

        d.suspeitos.forEach(s => {
          const cel = criar('td');
          const r = d.respostas[s.id]?.[q.id];
          const verdade = d.gabarito[s.id][q.id];
          const marca = d.marcas[s.id + ':' + q.id] || '';
          const ex = r || verdade;

          cel.append(
            criar('div', `${ex.valor} ${ex.unidade}`),
            criar('small', ex.observacao),
            criar('strong', descricao[verdade.tipo])
          );

          if (r) {
            const certa =
              marca === esperada[verdade.tipo];

            cel.append(
              criar(
                'small',
                'Sua marca: ' + labels[marca]
              ),
              criar(
                'small',
                certa
                  ? '✔ Marca coerente com a regra.'
                  : 'Pela regra, o esperado era: '
                    + labels[esperada[verdade.tipo]]
              )
            );
          } else {
            cel.append(criar(
              'small',
              'Não consultado durante a investigação.'
            ));
          }

          row.append(cel);
        });

        body.append(row);
      });

      table.append(body);
      scroll.append(table);
      box.append(scroll);
    }

    /* ---------- Acusação ---------- */

    function acusacao() {
      if (d.finalizado || !d.intro) return;

      terminarTexto?.();

      const box = abrir(
        'Uma acusação. Escolha com cuidado.'
      );

      box.append(criar(
        'p',
        `Você fez ${d.perguntas_usadas} consultas. ` +
        'Pode continuar investigando ou confirmar agora. ' +
        'A acusação é definitiva nesta tentativa.'
      ));

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

          if (await transacao('acusar', {
            suspeito: select.value
          })) {
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

    /* ---------- Resultado técnico e encerramento ---------- */

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
          'Servidor infectado: ' +
          d.infectado.apelido + ' · ' +
          d.infectado.hostname
        ),
        criar(
          'p',
          `${d.infectado.hostname} mantinha um bot/RAT em ` +
          'comunicação com o C2 fictício 203.0.113.77 — ' +
          'atualizacao-cdn.example.'
        ),
        criar(
          'p',
          'Linha do tempo do caso: ontem, 03:09 — credencial ' +
          'de serviço utilizada; 03:12 — reinício não autorizado; ' +
          'a partir de 03:14 — comunicações a cada 60 segundos; ' +
          '02:50 a 04:50 — lacuna nos logs. Os logins administrativos ' +
          'interativos permaneceram habituais.'
        ),
        criar(
          'p',
          `Pontuação da Fase 2: ${r.pontos} pontos. ` +
          `Saldo após as consultas: ${r.base}. ` +
          `Ajuste por acusação: ${r.bonus_acerto}. ` +
          `Ajuste por marcações: ${r.bonus_marcas}. ` +
          `Perguntas realizadas: ${r.perguntas_usadas}.`
        ),
        criar(
          'p',
          `Fase 1: ${d.pontos_fase1} pts · ` +
          `Fase 2: ${r.pontos} pts · ` +
          `Total: ${d.pontos_fase1 + r.pontos} pts.`
        )
      );

      const perdidas = d.perguntas.filter(q =>
        d.gabarito[d.infectado.id][q.id].tipo === 'anomalia'
        && !d.respostas[d.infectado.id]?.[q.id]
      );

      box.append(
        criar(
          'p',
          perdidas.length
            ? 'Desvios do infectado não consultados: '
              + perdidas.map(q => q.exame).join(', ') + '.'
            : 'Você consultou todos os desvios disponíveis do infectado.'
        ),
        criar('h2', 'O que você aprendeu')
      );

      const ul = criar('ul');

      [
        'Suspeito é o que foge do padrão, para cima ou para baixo.',
        'Beaconing é uma comunicação repetida em intervalos regulares ' +
          'entre um agente e um destino de controle; precisa ser contextualizada.',
        'Ausência de atividade e lacunas sem justificativa também merecem investigação.',
        'Uma anomalia com justificativa legítima não comprova contaminação; ' +
          'ausência de alerta do EDR também não comprova limpeza.',
        'RAT permite controle remoto de uma máquina. Botnet reúne dispositivos ' +
          'sob controle coordenado, frequentemente por uma infraestrutura C2.'
      ].forEach(texto => {
        ul.append(criar('li', texto));
      });

      box.append(ul);

      const acoes = criar(
        'div',
        undefined,
        'interrog-row'
      );

      acoes.append(
        botao('Tentar novamente', async () => {
          if (!(await transacao('reiniciar'))) return;
          await abertura();
        })
      );

      if (r.vitoria) {
        acoes.append(
          botao('Avançar para o encerramento', () => {
            if (
              typeof window.iniciarEncerramento !== 'function'
              || typeof window.mostrarRelatorioFinal !== 'function'
            ) {
              erro(new Error(
                'Confira o carregamento de encerramento.js ' +
                'e relatorio_final.js e atualize a página.'
              ));

              return;
            }

            const resumoFinal = JSON.parse(
              JSON.stringify(d)
            );

            window.iniciarEncerramento({
              pontos:
                resumoFinal.pontos_fase1
                + resumoFinal.resultado.pontos,

              onConcluir: ({destino, fechar}) =>
                window.mostrarRelatorioFinal({
                  destino,
                  pid: opcoes.pid,
                  fase2: resumoFinal,
                  onVoltar: fechar
                })
            });
          })
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

    /* ---------- Abertura com portas luminosas ---------- */

    function posicionarPortas(intro) {
      const svgs = [
        ...intro.querySelectorAll('.interrog-room > svg')
      ];

      const portas = [
        ...intro.querySelectorAll('.interrog-porta')
      ];

      const base = intro.getBoundingClientRect();

      // Coordenadas relativas ao desenho de cada servidor.
      // No NAS, y: 220 coloca a luz sobre a frente da caixa.
      const pontos = {
        rack: {x: 117, y: 145},
        torre: {x: 119, y: 127},
        nas: {x: 125, y: 220}
      };

      svgs.forEach((svg, i) => {
        if (!portas[i]) return;

        const matriz = svg.getScreenCTM();

        if (!matriz) return;

        const ancora =
          pontos[svg.dataset.maquina] || pontos.rack;

        const ponto = svg.createSVGPoint();

        ponto.x = ancora.x;
        ponto.y = ancora.y;

        const tela = ponto.matrixTransform(matriz);

        portas[i].style.left =
          (tela.x - base.left) + 'px';

        portas[i].style.top =
          (tela.y - base.top) + 'px';
      });
    }

    async function abertura() {
      await TTAnimacao.iniciar('Abertura da Fase 2');
      const intro = el('intro');
      const controle = new AbortController();

      intro.className = 'interrog-intro';
      intro.hidden = false;

      const reposicionar = () => posicionarPortas(intro);

      reposicionar();
      window.addEventListener('resize', reposicionar);

      el('conteudo').replaceChildren();
      el('pular').hidden = !d.pode_pular;

      cancelarIntro = () => {
        terminarTexto?.();
        controle.abort();
      };

      const espera = ms => TTAnimacao.esperar(ms, controle.signal);

      async function fala(texto) {
        await digitar(texto);

        const palavras = texto.trim().split(/\s+/).length;

        await espera(Math.max(
          CINEMA.LEITURA_MINIMA_MS,
          palavras * CINEMA.LEITURA_POR_PALAVRA_MS
        ));
      }

      try {
        await espera(80);

        intro.classList.add('titulo');

        await espera(
          CINEMA.FADE_MS + CINEMA.TITULO_LEITURA_MS
        );

        intro.classList.remove('titulo');

        await espera(
          CINEMA.FADE_MS + CINEMA.ESCURO_MS
        );

        // As cinco bolinhas aparecem azuis.
        intro.classList.add('azul');
        await espera(CINEMA.LUZ_AZUL_MS);

        // O ambiente clareia mostrando os servidores.
        intro.classList.add('revelar');
        await espera(CINEMA.REVELACAO_MS);

        intro.classList.add('vermelho');

        const portas = [
          ...intro.querySelectorAll('.interrog-porta')
        ];

        portas.forEach(porta => {
          porta.classList.remove('interrog-alerta');
        });

        // Cada porta permanece vermelha após a sua vez.
        for (const porta of portas) {
          porta.classList.add('interrog-alerta');

          await espera(
            CINEMA.ALERTA_POR_SERVIDOR_MS
          );
        }

        await fala(
          'A máquina inicial foi apenas o primeiro sinal...'
        );

        await fala(
          'Alerta na rede. Três servidores, um canal aberto para fora. ' +
          'Um deles está infectado. Investigue com cuidado: cada consulta ' +
          'tem um custo, e as evidências precisam fazer sentido juntas.'
        );
      } catch (e) {
        if (!controle.signal.aborted) throw e;
      } finally {
        window.removeEventListener('resize', reposicionar);
        TTAnimacao.encerrar();
        intro.querySelectorAll('.interrog-alerta').forEach(n => {
          n.classList.remove('interrog-alerta');
        });

        intro.hidden = true;
        cancelarIntro = null;
        el('narracao').hidden = true;
      }

      if (await transacao('intro')) {
        parede();
        await mostrarOrientacao();
      }
    }

    /* ---------- Orientações e inicialização ---------- */

    async function mostrarOrientacao() {
      if (
        !d
        || !d.intro
        || d.finalizado
        || ocupado
      ) return;

      parede();
      ocupado = true;

      try {
        await window.TTUI.tutorialFase2(container);
      } finally {
        container.querySelector(
          'dialog[open]'
        )?.close();

        ocupado = false;
        parede();
      }
    }

    el('ajuda').onclick = mostrarOrientacao;
    el('pular').onclick = () => cancelarIntro?.();
    el('caderno').onclick = () => caderno(d.finalizado);
    el('acusar').onclick = acusacao;

    if (!opcoes.pid) {
      erro(new Error(
        'Participante não identificado. Volte à Fase 1.'
      ));

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
/* TT_CONTROLE_ANIMACAO_V1 */
