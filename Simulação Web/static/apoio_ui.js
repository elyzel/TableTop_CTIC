/*
OBJETIVO:
- Centralizar o ícone do navegador na área de trabalho.
- Mostrar "Clique no navegador" por 4 segundos.
- Ocultar o ícone quando começar a etapa de escolha das ações.
- Explicar que as respostas aparecem no prontuário, com a mais recente no topo.
- Preservar áudio, trilha de suspense, tutoriais e tela de resultados.
- Manter 6 segundos de leitura após a narração inicial do login.

ARQUIVO: static/apoio_ui.js
SUBSTITUA TODO O CONTEÚDO POR ESTE BLOCO.

REVISÃO:
A ordem efetiva das respostas continua sendo controlada por interrogatorio.js.
Mantenha nesse arquivo a alteração anterior que coloca a resposta mais recente
no topo. Aqui são atualizadas as orientações sobre esse comportamento.

RECOMENDAÇÃO:
Mantenha as correções anteriores de digitação e iluminação nos demais arquivos.

VALIDAÇÃO:
Sintaxe e duração do aviso verificadas.
Confira a aparência, os tutoriais e o áudio no navegador após atualizar o Docker.
*/

(() => {
  'use strict';

  if (window.TTUI) return;

  function iniciarApoio() {
    if (window.TTUI) return;

    let audio = null;
    let saida = null;
    let som = true;

    try {
      som = sessionStorage.getItem('tt_audio') !== 'off';
    } catch {}

    let ultimoSom = 0;
    let guiaAtivo = false;
    let musicaTimer = null;
    let musicaPasso = 0;
    let musicaVermelha = false;
    let musicaCena = null;
    let vitoriaTocada = false;
    let derrotaTocada = false;

    const vozes = new Set();
    const musicaVozes = new Set();

    const somBotao = document.createElement('button');
    somBotao.type = 'button';
    somBotao.className = 'tt-volume tt-volume-flutuante';

    const estilo = document.createElement('style');

    estilo.textContent = `
      #desktop-icons {
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      #desktop-browser[hidden] {
        display: none !important;
      }

      .tt-som {
        display: none !important;
      }

      #faseintro.on h1 {
        animation: tt-titulo-suspense 2.8s ease-in-out infinite;
      }

      @keyframes tt-titulo-suspense {
        0%, 100% {
          opacity: 1;
          filter: brightness(1);
          text-shadow: 0 0 12px #86aaff33;
        }

        50% {
          opacity: .62;
          filter: brightness(.8);
          text-shadow: 0 0 2px #86aaff11;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #faseintro.on h1 {
          animation: none;
        }
      }

      button:not(:disabled),
      a[href] {
        touch-action: manipulation;
      }

      button:not(:disabled) {
        cursor: pointer;
      }

      button > * {
        pointer-events: none;
      }

      #final {
        z-index: 700 !important;
      }

      #final button,
      .interrog-result button {
        position: relative;
        pointer-events: auto;
        min-height: 44px;
      }

      body[data-tt-modo="resultado"] #narr,
      body[data-tt-modo="resultado"] #notice,
      body[data-tt-modo="resultado"] #dica {
        display: none !important;
        pointer-events: none !important;
      }

      .tt-cinema {
        position: fixed;
        inset: 0;
        z-index: 90;
        pointer-events: none;
        opacity: 0;
        background: radial-gradient(
          ellipse at center,
          #0001 25%,
          #0009 100%
        );
        transition: opacity .55s ease;
        box-shadow:
          inset 0 32px 0 #000,
          inset 0 -32px 0 #000;
      }

      body[data-tt-modo="historia"] .tt-cinema {
        opacity: 1;
      }

      #desk {
        transition: transform .65s ease;
        transform-origin: center;
      }

      body[data-tt-modo="historia"] #desk {
        transform: scale(1.015);
      }

      .tt-sua-vez {
        position: fixed;
        left: 50%;
        top: 16px;
        transform: translate(-50%, -8px);
        z-index: 95;
        width: max-content;
        max-width: calc(100vw - 128px);
        box-sizing: border-box;
        padding: 12px 20px;
        border-radius: 10px;
        background: #102236;
        border: 1px solid #8bd9ff;
        color: #fff;
        font: 600 16px/1.4 "Segoe UI", sans-serif;
        text-align: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity .3s, transform .3s;
      }

      .tt-sua-vez.on {
        opacity: 1;
        transform: translate(-50%, 0);
      }

      body[data-tt-modo="interacao"] #desktop-browser.guia {
        outline: 2px solid #8bd9ff;
        outline-offset: 3px;
      }

      @media (prefers-reduced-motion: reduce) {
        .tt-cinema,
        .tt-sua-vez,
        #desk {
          transition: none !important;
        }

        body[data-tt-modo="historia"] #desk {
          transform: none;
        }
      }

      .tt-volume {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 44px;
        width: 44px;
        height: 44px;
        padding: 9px;
        border: 1px solid #73829a;
        border-radius: 8px;
        background: #151b25;
        color: #fff;
        cursor: pointer;
      }

      .tt-volume svg {
        width: 24px;
        height: 24px;
        pointer-events: none;
      }

      .tt-volume:focus-visible {
        outline: 3px solid #fff;
        outline-offset: 3px;
      }

      .tt-volume-flutuante {
        position: fixed;
        top: 12px;
        left: 12px;
        z-index: 800;
      }

      #taskbar .tt-volume {
        height: 40px;
      }

      .interrog-hud .interrog-row {
        flex-wrap: wrap;
      }

      #final .tt-tabela-area {
        overflow-x: auto;
      }

      #final table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }

      #final th,
      #final td {
        padding: 10px 8px;
        border-bottom: 1px solid #344151;
        text-align: left;
      }

      #final th:not(:first-child),
      #final td:not(:first-child) {
        text-align: right;
        white-space: nowrap;
      }

      #final .tt-feedback td {
        text-align: left;
        white-space: normal;
        color: #c9d3e3;
      }

      #final .tt-objetivos {
        padding-left: 22px;
        line-height: 1.8;
      }

      #final .tt-neutro {
        color: #c9d3e3;
      }

      #final .tt-acoes-final {
        margin-top: 24px !important;
      }
    `;

    document.head.append(estilo);

    /* ---------- Controle de áudio ---------- */

    function rotuloSom() {
      const label = som ? 'Silenciar áudio' : 'Ativar áudio';

      somBotao.title = label;
      somBotao.setAttribute('aria-label', label);
      somBotao.setAttribute('aria-pressed', String(som));

      somBotao.innerHTML = `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M11 5 6 9H3v6h3l5 4Z"/>
          ${
            som
              ? '<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'
              : '<path d="m16 9 6 6m0-6-6 6"/>'
          }
        </svg>
      `;
    }

    async function ativarAudio() {
      if (!som) return;

      try {
        const Contexto =
          window.AudioContext || window.webkitAudioContext;

        if (!Contexto) return;

        if (!audio) {
          audio = new Contexto();

          saida = audio.createGain();
          saida.gain.value = 1;
          saida.connect(audio.destination);
        }

        if (audio.state === 'suspended') {
          await audio.resume();
        }
      } catch {
        // O navegador pode aguardar a primeira interação.
      }
    }

    function nota(
      frequencia,
      duracao,
      volume = .04,
      atraso = 0,
      tipo = 'sine',
      musical = false
    ) {
      if (!som || !audio || audio.state !== 'running') return;

      const inicio = audio.currentTime + atraso;
      const o = audio.createOscillator();
      const g = audio.createGain();

      o.type = tipo;
      o.frequency.value = frequencia;

      g.gain.setValueAtTime(0, inicio);
      g.gain.linearRampToValueAtTime(volume, inicio + .015);

      g.gain.exponentialRampToValueAtTime(
        .0001,
        inicio + duracao
      );

      o.connect(g);
      g.connect(saida);

      const voz = {o, g};

      vozes.add(voz);

      if (musical) {
        musicaVozes.add(voz);
      }

      o.onended = () => {
        vozes.delete(voz);
        musicaVozes.delete(voz);
        o.disconnect();
        g.disconnect();
      };

      o.start(inicio);
      o.stop(inicio + duracao + .03);
    }

    function encerrarVozes(conjunto, suave = false) {
      if (!audio) return;

      for (const voz of [...conjunto]) {
        const agora = audio.currentTime;

        try {
          voz.g.gain.cancelScheduledValues(agora);

          voz.g.gain.setValueAtTime(
            suave ? voz.g.gain.value : 0,
            agora
          );

          voz.g.gain.linearRampToValueAtTime(
            0,
            agora + (suave ? .3 : .01)
          );

          voz.o.stop(
            agora + (suave ? .32 : .02)
          );
        } catch {
          // Uma nota pode já ter terminado.
        }
      }

      conjunto.clear();
    }

    function pararMusica(suave = true) {
      clearInterval(musicaTimer);

      musicaTimer = null;
      musicaCena = null;

      encerrarVozes(musicaVozes, suave);
    }

    /* ---------- Trilha de suspense ---------- */

    function acompanharAbertura() {
      const intro = document.querySelector('.interrog-intro');
      const titulo1 = document.getElementById('faseintro');

      const fase1 =
        titulo1
        && !titulo1.hidden
        && titulo1.classList.contains('on');

      const fase2 =
        intro
        && !intro.hidden
        && intro.classList.contains('azul');

      const cena = fase1
        ? 'fase1'
        : fase2
          ? 'fase2'
          : null;

      musicaVermelha =
        cena === 'fase2'
        && intro.classList.contains('vermelho');

      if (!cena || !som || document.hidden) {
        pararMusica();
        return;
      }

      if (audio?.state !== 'running') return;

      if (musicaTimer && musicaCena === cena) return;

      pararMusica();

      musicaCena = cena;
      musicaPasso = 0;

      const tocar = () => {
        // Trilha original sintetizada em ré menor.
        const acordes = [
          [146.83, 174.61, 220, 293.66],
          [116.54, 146.83, 174.61, 233.08],
          [130.81, 164.81, 196, 261.63],
          [110, 138.59, 164.81, 220]
        ];

        const acorde =
          acordes[Math.floor(musicaPasso / 8) % acordes.length];

        const indice =
          [0, 1, 2, 3, 2, 1, 3, 1][musicaPasso % 8];

        const intensidade = musicaVermelha ? .035 : .021;

        nota(
          acorde[indice] * 2,
          .75,
          intensidade,
          0,
          'triangle',
          true
        );

        if (musicaPasso % 8 === 0) {
          nota(
            acorde[0] / 2,
            2.8,
            intensidade,
            0,
            'sine',
            true
          );

          for (const f of acorde) {
            nota(
              f,
              2.2,
              intensidade / 5,
              0,
              'sine',
              true
            );
          }
        }

        if (musicaVermelha && musicaPasso % 2 === 0) {
          nota(
            acorde[indice] * 4,
            .45,
            .012,
            .16,
            'sine',
            true
          );
        }

        musicaPasso++;
      };

      tocar();
      musicaTimer = setInterval(tocar, 360);
    }

    function alternarAudio() {
      som = !som;

      try {
        sessionStorage.setItem(
          'tt_audio',
          som ? 'on' : 'off'
        );
      } catch {}

      rotuloSom();

      if (!som) {
        pararMusica(false);
        encerrarVozes(vozes);
      } else {
        void ativarAudio().then(acompanharAbertura);
      }
    }

    somBotao.onclick = alternarAudio;

    rotuloSom();
    document.body.append(somBotao);

    for (const evento of ['pointerdown', 'keydown', 'touchend']) {
      document.addEventListener(
        evento,
        () => {
          void ativarAudio().then(acompanharAbertura);
        },
        {capture: true, passive: true}
      );
    }

    document.addEventListener(
      'visibilitychange',
      acompanharAbertura
    );

    window.addEventListener('pagehide', () => {
      pararMusica(false);
      encerrarVozes(vozes);
    });

    void ativarAudio();

    function toque(letra) {
      if (
        !letra?.trim()
        || !audio
        || audio.currentTime - ultimoSom < .055
      ) return;

      ultimoSom = audio.currentTime;
      nota(520, .035, .018);
    }

    /* ---------- Sons de conclusão ---------- */

    function celebrar() {
      if (vitoriaTocada || derrotaTocada) return;

      vitoriaTocada = true;
      vinheta(true);
    }

    function vinheta(vitoria) {
      pararMusica(false);
      encerrarVozes(vozes);

      if (vitoria) {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          nota(
            f,
            i === 3 ? 1.4 : .35,
            .045,
            i * .27,
            'triangle'
          );
        });

        [523.25, 659.25, 783.99].forEach(f => {
          nota(f, 1.5, .023, 1.08);
        });
      } else {
        [392, 349.23, 311.13, 261.63].forEach((f, i) => {
          nota(
            f,
            i === 3 ? 1.5 : .65,
            .04,
            i * .42,
            'triangle'
          );
        });

        [130.81, 155.56, 196].forEach(f => {
          nota(f, 1.6, .02, 1.3);
        });
      }
    }

    document.addEventListener(
      'tabletop:atividadeConcluida',
      evento => {
        if (typeof evento.detail?.vitoria === 'boolean') {
          vinheta(evento.detail.vitoria);
        }
      }
    );

    /* ---------- Modos de apresentação e avisos ---------- */

    let modo = 'neutro';
    let avisoVezTimer = null;

    const cinema = document.createElement('div');
    cinema.className = 'tt-cinema';
    cinema.setAttribute('aria-hidden', 'true');

    const suaVez = document.createElement('div');
    suaVez.className = 'tt-sua-vez';
    suaVez.setAttribute('role', 'status');
    suaVez.setAttribute('aria-live', 'polite');

    document.body.append(cinema, suaVez);

    function definirModo(novo, mensagem = '', duracao = 2400) {
      if (modo === novo && !mensagem) return;

      modo = novo;
      document.body.dataset.ttModo = novo;

      const mesa = document.getElementById('desk');

      if (mesa) {
        mesa.inert = novo === 'historia';
      }

      clearTimeout(avisoVezTimer);

      suaVez.classList.remove('on');
      suaVez.textContent = '';

      if (novo === 'interacao' && mensagem) {
        suaVez.textContent = mensagem;
        suaVez.classList.add('on');

        avisoVezTimer = setTimeout(() => {
          suaVez.classList.remove('on');
          suaVez.textContent = '';
        }, duracao);
      }

      posicionarSom();
    }

    /* ---------- Integração cinematográfica da Fase 1 ---------- */

    function integrarCinemaFase1() {
      const faseAnterior = introFase;

      introFase = async () => {
        definirModo('historia');
        return faseAnterior();
      };

      introLogin = async () => {
        definirModo('historia');

        const login = document.getElementById('winlogin');

        login.hidden = false;

        document.getElementById('login-user').textContent = '';
        document.getElementById('login-pass').textContent = '';

        document.getElementById('login-status').textContent =
          'Iniciando sessão do usuário...';

        await sleep(50);

        login.classList.add('on');

        const texto =
          'Maria inicia mais um dia de trabalho. Tudo parece seguir a rotina...';

        narrar(texto);

        // Aguarda a conclusão da digitação antes da pausa de leitura.
        while (
          document.getElementById('narr').textContent !== texto
        ) {
          await sleep(30);
        }

        // Pausa de leitura após a narração completa.
        await sleep(6000);
        pararNarracao();

        await digitarTexto(
          document.getElementById('login-user'),
          'maria.silva',
          90
        );

        document.getElementById('login-status').textContent =
          'Digitando senha...';

        await sleep(300);

        await digitarTexto(
          document.getElementById('login-pass'),
          '••••••••••',
          90
        );

        document.getElementById('login-status').textContent =
          'Entrando no Windows...';

        await sleep(3000);

        document.getElementById('preto')
          .classList.add('on');

        await sleep(700);

        login.classList.remove('on');

        await sleep(350);

        login.hidden = true;

        document.getElementById('desk').hidden = false;

        await sleep(250);

        document.getElementById('preto')
          .classList.remove('on');

        await sleep(700);
      };

      prepararInteracaoPosLogin = async () => {
        pregame = 'aguarda_browser';

        pararNarracao();

        const navegador = document.getElementById('desktop-browser');

        navegador.hidden = false;
        navegador.classList.add('guia');

        definirModo(
          'interacao',
          'Clique no navegador',
          4000
        );

        mostrarNotice(
          'Uma nova mensagem acaba de chegar.',
          'info',
          '📧 NOVO E-MAIL RECEBIDO',
          10000
        );
      };

      const dicaAnterior = mostrarDica;

      mostrarDica = (texto, ...extras) => {
        if (
          /navegador|favorito\s+e-?mail/i.test(String(texto))
        ) return;

        dicaAnterior(texto, ...extras);
      };

      const phishingAnterior = phishingAutomatico;

      phishingAutomatico = async () => {
        definirModo('historia');

        try {
          return await phishingAnterior();
        } finally {
          if (modo === 'historia') {
            pararNarracao();
            definirModo('interacao');
          }
        }
      };

      const jogoAnterior = iniciarJogo;

      iniciarJogo = async () => {
        const navegador = document.getElementById('desktop-browser');

        // Oculta o ícone antes das orientações e da escolha das ações.
        navegador.hidden = true;
        navegador.classList.remove('guia');

        pararNarracao();
        definirModo('interacao');

        await jogoAnterior();

        if (
          pregame === 'jogo'
          && est?.status === 'jogando'
        ) {
          definirModo(
            'interacao',
            'Sua vez de agir — escolha sua resposta'
          );
        }
      };

      const comecarAnterior = comecar;

      comecar = async () => {
        try {
          return await comecarAnterior();
        } finally {
          if (!document.getElementById('inicio').hidden) {
            definirModo('neutro');
          }
        }
      };
    }

    /* ---------- Motor dos tutoriais interativos ---------- */

    async function tutorial(etapas, raiz = document) {
      if (guiaAtivo) return;

      guiaAtivo = true;

      return new Promise(resolve => {
        let indice = 0;
        let alvo = null;
        let fim = false;
        let transicao = false;
        let restaurarTab = null;
        let restaurarRole = null;

        const focoAnterior = document.activeElement;

        const moldura = document.createElement('div');
        moldura.className = 'tt-moldura';

        const painel = document.createElement('section');
        painel.className = 'tt-guia';
        painel.setAttribute('role', 'region');
        painel.setAttribute('aria-label', 'Orientação interativa');

        const titulo = document.createElement('strong');
        const texto = document.createElement('p');
        const extra = document.createElement('div');

        const acoes = document.createElement('div');
        acoes.className = 'tt-guia-acoes';

        const proximo = document.createElement('button');
        proximo.type = 'button';
        proximo.textContent = 'Entendi, continuar';

        const sair = document.createElement('button');
        sair.type = 'button';
        sair.textContent = 'Pular orientação';

        acoes.append(proximo, sair);
        painel.append(titulo, texto, extra, acoes);

        function removerAlvo() {
          if (!alvo) return;

          if (restaurarTab === null) {
            alvo.removeAttribute('tabindex');
          } else {
            alvo.setAttribute('tabindex', restaurarTab);
          }

          if (restaurarRole === null) {
            alvo.removeAttribute('role');
          } else {
            alvo.setAttribute('role', restaurarRole);
          }

          alvo = null;
        }

        function posicionar() {
          const atual = raiz.querySelector(etapas[indice].alvo);

          if (!atual) {
            moldura.hidden = true;
            return;
          }

          if (atual !== alvo) {
            removerAlvo();

            alvo = atual;
            restaurarTab = alvo.getAttribute('tabindex');
            restaurarRole = alvo.getAttribute('role');

            if (
              etapas[indice].modo !== 'continuar'
              && !alvo.matches('button,a,input,select,textarea')
            ) {
              alvo.tabIndex = 0;
              alvo.setAttribute('role', 'button');
            }
          }

          const r = alvo.getBoundingClientRect();

          moldura.hidden = false;

          Object.assign(moldura.style, {
            left: (r.left - 5) + 'px',
            top: (r.top - 5) + 'px',
            width: (r.width + 10) + 'px',
            height: (r.height + 10) + 'px'
          });

          painel.style.top = 'auto';
          painel.style.bottom = '16px';

          if (r.top > innerHeight * .55) {
            painel.style.bottom = 'auto';
            painel.style.top = '16px';
          }
        }

        function concluir() {
          if (fim) return;

          fim = true;

          clearInterval(timer);

          removerAlvo();
          painel.remove();
          moldura.remove();

          document.removeEventListener('click', capturar, true);
          document.removeEventListener('keydown', teclado, true);

          guiaAtivo = false;

          if (focoAnterior?.isConnected) {
            focoAnterior.focus();
          }

          resolve();
        }

        function mostrar() {
          if (indice >= etapas.length) {
            concluir();
            return;
          }

          const etapa = etapas[indice];

          const hospedeiro =
            document.querySelector('dialog[open]')
            || document.body;

          hospedeiro.append(moldura, painel);

          titulo.textContent =
            `Orientação ${indice + 1} de ${etapas.length}`;

          texto.textContent = etapa.texto;
          extra.replaceChildren();

          proximo.hidden = etapa.modo !== 'continuar';

          if (etapa.exemploMarcas) {
            const grupo = document.createElement('div');

            grupo.style.cssText =
              'display:flex;gap:6px;flex-wrap:wrap;margin:8px 0';

            const dica = document.createElement('small');

            dica.textContent =
              'Toque em uma marca para ver o que ela significa.';

            const marcas = [
              ['❄ Frio', 'Dentro da referência saudável.'],
              [
                '🌡 Morno',
                'Fugiu da referência, mas a observação traz um motivo registrado.'
              ],
              ['🔥 Quente', 'Fugiu da referência e nada explica.']
            ];

            const botoes = marcas.map(([rotulo, explicacao]) => {
              const b = document.createElement('button');

              b.type = 'button';
              b.textContent = rotulo;
              b.setAttribute('aria-pressed', 'false');

              b.onclick = () => {
                botoes.forEach(x => x.setAttribute(
                  'aria-pressed',
                  String(x === b)
                ));

                dica.textContent = explicacao;
              };

              grupo.append(b);
              return b;
            });

            const aviso = document.createElement('small');

            aviso.textContent =
              'Exemplo demonstrativo: não altera suas evidências.';

            extra.append(grupo, dica, aviso);
          }

          posicionar();

          alvo?.scrollIntoView({
            block: 'center',
            behavior: 'auto'
          });

          posicionar();

          if (etapa.modo === 'continuar') {
            proximo.focus();
          } else {
            alvo?.focus();
          }
        }

        function avancar() {
          if (fim) return;

          removerAlvo();

          indice++;
          transicao = false;

          mostrar();
        }

        function capturar(e) {
          if (
            fim
            || painel.contains(e.target)
            || somBotao.contains(e.target)
          ) return;

          if (transicao) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }

          const etapa = etapas[indice];
          const atual = raiz.querySelector(etapa.alvo);

          if (
            atual?.contains(e.target)
            && etapa.modo !== 'continuar'
          ) {
            if (etapa.modo === 'demonstracao') {
              e.preventDefault();
              e.stopImmediatePropagation();
            }

            transicao = true;

            setTimeout(avancar, 0);
            return;
          }

          e.preventDefault();
          e.stopImmediatePropagation();
        }

        function teclado(e) {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopImmediatePropagation();
            concluir();
            return;
          }

          if (e.key === 'Tab') {
            const itens = [
              ...(
                etapas[indice].modo !== 'continuar' && alvo
                  ? [alvo]
                  : []
              ),
              somBotao,
              ...painel.querySelectorAll(
                'button:not([hidden])'
              )
            ];

            const atual =
              itens.indexOf(document.activeElement);

            const proximoIndice = (
              atual
              + (e.shiftKey ? -1 : 1)
              + itens.length
            ) % itens.length;

            e.preventDefault();
            itens[proximoIndice]?.focus();
            return;
          }

          if (
            (e.key === 'Enter' || e.key === ' ')
            && document.activeElement === alvo
            && alvo?.matches('.ic')
          ) {
            e.preventDefault();
            alvo.click();
          } else if (
            (e.key === 'Enter' || e.key === ' ')
            && !somBotao.contains(e.target)
            && !painel.contains(e.target)
            && !alvo?.contains(e.target)
          ) {
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        }

        proximo.onclick = avancar;
        sair.onclick = concluir;

        document.addEventListener('click', capturar, true);
        document.addEventListener('keydown', teclado, true);

        const timer = setInterval(posicionar, 200);

        mostrar();
      });
    }

    /* ---------- API de apoio e orientações das fases ---------- */

    window.TTUI = {
      toque,

      tutorialFase1: () => tutorial([
        {
          alvo: '#grade .ic:not(.usado)',
          modo: 'clique',
          texto:
            'Clique no ícone destacado para conhecer a ação. ' +
            'Abrir a descrição não executa a ação.'
        },
        {
          alvo: '#detalhe',
          modo: 'continuar',
          texto:
            'Aqui aparecem o nome, a ilustração e a descrição da ação. ' +
            'Leia antes de decidir. Cancelar permite voltar aos ícones.'
        },
        {
          alvo: '#detalhe .exec',
          modo: 'demonstracao',
          texto:
            'Para aplicar uma decisão, use Executar. Clique agora ' +
            'apenas para conhecer o botão: nesta demonstração, ' +
            'nenhuma ação será enviada.'
        }
      ]),

      tutorialFase2: raiz => tutorial([
        {
          alvo: '.interrog-card',
          modo: 'clique',
          texto:
            'Clique no servidor destacado para abrir seu interrogatório. ' +
            'Escolher um servidor não consome pontos.'
        },
        {
          alvo: '.interrog-menu',
          modo: 'continuar',
          texto:
            'Aqui você escolhe as perguntas. Cada consulta inédita ' +
            'custa pontos. A resposta aparece no prontuário do servidor. ' +
            'A mais recente fica no topo e as anteriores ficam abaixo. ' +
            'Perguntas já feitas ficam bloqueadas para esse servidor.'
        },
        {
          alvo: '.interrog-prontuario-scroll',
          modo: 'continuar',
          texto:
            'Este é o prontuário. Cada nova resposta é acrescentada no topo. ' +
            'Use a rolagem para consultar as respostas anteriores.'
        },
        {
          alvo: '[data-el="caderno"]',
          modo: 'clique',
          texto:
            'Clique em Caderno para comparar os servidores ' +
            'e registrar sua interpretação.'
        },
        {
          alvo: '.interrog-scroll',
          modo: 'continuar',
          exemploMarcas: true,
          texto:
            'O caderno tem três áreas: o Manual, com a referência saudável; ' +
            'uma aba para cada servidor; e a aba Geral, que cruza os três. ' +
            'Compare cada resposta com a referência e marque Frio, Morno ' +
            'ou Quente com um clique. Experimente o exemplo abaixo.'
        },
        {
          alvo: '.interrog-dialog textarea',
          modo: 'continuar',
          texto:
            'Use as anotações para registrar hipóteses. Depois de escrever, ' +
            'clique em Salvar anotação. Ao terminar a investigação, ' +
            'o botão Acusar permite escolher um servidor.'
        }
      ], raiz)
    };

    /* ---------- Posicionamento do controle de áudio ---------- */

    function posicionarSom() {
      const inicio = document.getElementById('inicio');
      const final = document.getElementById('final');
      const mesa = document.getElementById('desk');
      const intro = document.querySelector('.interrog-intro');

      const cabecalho = document.querySelector(
        '.interrog-hud .interrog-row'
      );

      const barra = document.getElementById('taskbar');

      let destino = document.body;

      if (
        modo !== 'historia'
        && barra
        && mesa
        && !mesa.hidden
        && inicio?.hidden
        && final?.hidden
        && !document.getElementById('grade')?.hidden
      ) {
        destino = barra;
      } else if (
        cabecalho
        && (!intro || intro.hidden)
      ) {
        destino = cabecalho;
      }

      const classe = destino === document.body
        ? 'tt-volume tt-volume-flutuante'
        : 'tt-volume';

      if (somBotao.className !== classe) {
        somBotao.className = classe;
      }

      if (somBotao.parentElement !== destino) {
        if (destino === barra) {
          barra.insertBefore(
            somBotao,
            document.getElementById('relogio')
          );
        } else if (destino === cabecalho) {
          destino.prepend(somBotao);
        } else {
          destino.append(somBotao);
        }
      }

      acompanharAbertura();
    }

    /* ---------- Integração da Fase 1 e tela de resultados ---------- */

    function integrarFase1() {
      const antigo = document.getElementById('mudo');
      antigo?.remove();

      if (!document.getElementById('final')) return;

      bip = (f, d, tipo = 'sine') => {
        nota(f, d, .05, 0, tipo);
      };

      alternarSom = alternarAudio;

      const avisoOriginal = mostrarNotice;

      const titulos = {
        isolou:
          '✅ OBJETIVO CONCLUÍDO — CONTENÇÃO REALIZADA',

        comunicou_soc:
          '✅ OBJETIVO CONCLUÍDO — SOC ACIONADO',

        preservou:
          '✅ OBJETIVO CONCLUÍDO — DOCUMENTAÇÃO REGISTRADA'
      };

      mostrarNotice = (texto, tipo, titulo, ...extras) => {
        if (
          est?.status === 'jogando'
          && texto === est.evento
          && titulo?.includes('CONTENÇÃO')
        ) return;

        if (titulo?.includes('OBJETIVO CONCLUÍDO')) {
          if (titulo.includes('CONTENÇÃO')) {
            titulo = titulos.isolou;
          } else if (titulo.includes('COMUNICAÇÃO')) {
            titulo = titulos.comunicou_soc;
          } else if (titulo.includes('PRESERVAÇÃO')) {
            titulo = titulos.preservou;
          }
        }

        avisoOriginal(texto, tipo, titulo, ...extras);
      };

      mostrarFinal = () => {
        pregame = 'final';

        definirModo('resultado');

        clearInterval(poll);
        fechar();
        pararNarracao();

        for (const id of ['notice', 'dica', 'bd', 'flash']) {
          document.getElementById(id)
            ?.classList.remove('on');
        }

        const tela = document.getElementById('final');
        const caixa = tela.querySelector('.caixa');
        const resultado = est.final || {};

        const nomesFinais = {
          'Contenção exemplar':
            'Resposta exemplar',

          'Contenção parcial':
            'Resposta concluída com ressalvas'
        };

        const titulo = document.getElementById('f-t');

        titulo.textContent =
          nomesFinais[resultado.titulo]
          || resultado.titulo
          || 'Resultado da Fase 1';

        titulo.className =
          ['otimo', 'medio', 'ruim'].includes(resultado.tipo)
            ? 'f-' + resultado.tipo
            : '';

        document.getElementById('f-x').textContent =
          resultado.texto || '';

        document.getElementById('f-p').textContent =
          est.pontos;

        if (document.getElementById('pts')) {
          document.getElementById('pts').textContent =
            est.pontos;
        }

        let objetivos = document.getElementById(
          'tt-final-objetivos'
        );

        if (!objetivos) {
          objetivos = document.createElement('div');
          objetivos.id = 'tt-final-objetivos';

          document.getElementById('f-x').after(objetivos);
        }

        const nomes = {
          isolou: 'Contenção realizada',
          comunicou_soc: 'SOC acionado',
          preservou: 'Documentação registrada'
        };

        const obj = est.objetivos || {
          concluidos: 0,
          total: 0,
          itens: []
        };

        objetivos.innerHTML = `
          <p>
            <strong>
              Objetivos concluídos:
              ${esc(String(obj.concluidos))}/${esc(String(obj.total))}
            </strong>
          </p>

          <ul class="tt-objetivos">
            ${
              (obj.itens || []).map(item => `
                <li>
                  ${item.concluido ? '✓' : 'Pendente —'}
                  ${esc(nomes[item.flag] || item.nome)}
                </li>
              `).join('')
            }
          </ul>
        `;

        const historico = document.getElementById('f-h');
        const heading = caixa.querySelector('h3');

        if (heading) {
          heading.textContent = 'Suas ações e pontuações';
        }

        const numero = valor => (
          Number.isFinite(Number(valor))
            ? Number(valor)
            : 0
        );

        const pontos = valor => (
          `${valor > 0 ? '+' : ''}${valor}`
        );

        const classe = valor => (
          valor > 0
            ? 'pos'
            : valor < 0
              ? 'neg'
              : 'tt-neutro'
        );

        historico.className = 'tt-tabela-area';

        historico.innerHTML = `
          <table>
            <thead>
              <tr>
                <th scope="col">Ação / evento</th>
                <th scope="col">Pontos</th>
                <th scope="col">Bônus</th>
                <th scope="col">Total</th>
              </tr>
            </thead>

            <tbody>
              ${
                (est.historico || []).map(h => {
                  const base = numero(h.pontos);
                  const bonus = numero(h.bonus);
                  const total = base + bonus;

                  return `
                    <tr>
                      <th scope="row">
                        ${esc(h.acao || '')}
                      </th>

                      <td class="${classe(base)}">
                        ${pontos(base)}
                      </td>

                      <td class="${classe(bonus)}">
                        ${pontos(bonus)}
                      </td>

                      <td class="${classe(total)}">
                        ${pontos(total)}
                      </td>
                    </tr>

                    ${
                      h.feedback
                        ? `
                          <tr class="tt-feedback">
                            <td colspan="4">
                              ${esc(h.feedback)}
                            </td>
                          </tr>
                        `
                        : ''
                    }
                  `;
                }).join('')
                || `
                  <tr>
                    <td colspan="4">
                      Nenhuma decisão registrada.
                    </td>
                  </tr>
                `
              }
            </tbody>
          </table>
        `;

        const botoes = document.getElementById(
          'reiniciar-fase1'
        ).parentElement;

        botoes.classList.add('tt-acoes-final');
        historico.after(botoes);

        const erro = document.getElementById('erro-reinicio');

        if (erro) {
          botoes.after(erro);
        }

        tela.hidden = false;
        tela.classList.add('on');

        posicionarSom();

        const formatou = (est.historico || []).some(h => (
          h.acao === 'Formatar Máquina'
        ));

        if (
          formatou
          && !derrotaTocada
          && !vitoriaTocada
        ) {
          derrotaTocada = true;
          vinheta(false);
        } else if (
          obj.total > 0
          && obj.concluidos === obj.total
        ) {
          celebrar();
        }
      };

      integrarCinemaFase1();

      if (est?.status === 'finalizado') {
        mostrarFinal();
      }
    }

    /* ---------- Inicialização ---------- */

    function integrar() {
      integrarFase1();
      posicionarSom();

      new MutationObserver(posicionarSom).observe(
        document.body,
        {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ['class', 'hidden']
        }
      );
    }

    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        integrar,
        {once: true}
      );
    } else {
      integrar();
    }
  }

  if (document.body) {
    iniciarApoio();
  } else {
    document.addEventListener(
      'DOMContentLoaded',
      iniciarApoio,
      {once: true}
    );
  }
})();