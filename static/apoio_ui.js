/*
OBJETIVO: habilitar o som automaticamente e fornecer os tutoriais das duas fases sem gastar pontos.
ARQUIVO: static/apoio_ui.js
SUBSTITUA TODO O CONTEÚDO.
*/
(() => {
  'use strict';

  if (window.TTUI) return;

  function iniciarApoio() {
    if (window.TTUI) return;

    let audio = null;
    let som = true;
    let ultimoSom = 0;
    let guiaAtivo = false;

    const somBotao = document.createElement('button');
    somBotao.type = 'button';
    somBotao.className = 'tt-som';

    function rotuloSom() {
      somBotao.textContent =
        'Som de digitação: ' + (som ? 'ligado' : 'desligado');
      somBotao.setAttribute('aria-pressed', String(som));
    }

    async function ativarAudio() {
      if (!som) return;

      try {
        const Contexto = window.AudioContext || window.webkitAudioContext;
        if (!Contexto) return;
        audio ||= new Contexto();

        if (audio.state === 'suspended') {
          await audio.resume();
        }
      } catch {
        // O navegador pode aguardar a primeira interação.
      }
    }

    rotuloSom();
    document.body.append(somBotao);

    somBotao.onclick = () => {
      som = !som;
      rotuloSom();
      if (som) void ativarAudio();
    };

    for (const evento of ['pointerdown', 'keydown', 'touchend']) {
      document.addEventListener(
        evento,
        () => { void ativarAudio(); },
        {capture: true, passive: true}
      );
    }

    void ativarAudio();

    function toque(letra) {
      if (
        !som
        || !audio
        || audio.state !== 'running'
        || !letra?.trim()
      ) return;

      const agora = audio.currentTime;
      if (agora - ultimoSom < .055) return;
      ultimoSom = agora;

      const o = audio.createOscillator();
      const g = audio.createGain();

      o.type = 'sine';
      o.frequency.setValueAtTime(620, agora);
      o.frequency.exponentialRampToValueAtTime(360, agora + .025);

      g.gain.setValueAtTime(.0001, agora);
      g.gain.exponentialRampToValueAtTime(.018, agora + .003);
      g.gain.exponentialRampToValueAtTime(.0001, agora + .03);

      o.connect(g);
      g.connect(audio.destination);
      o.start(agora);
      o.stop(agora + .035);
    }

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

          if (restaurarTab === null) alvo.removeAttribute('tabindex');
          else alvo.setAttribute('tabindex', restaurarTab);

          if (restaurarRole === null) alvo.removeAttribute('role');
          else alvo.setAttribute('role', restaurarRole);

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

          if (focoAnterior?.isConnected) focoAnterior.focus();
          resolve();
        }

        function mostrar() {
          if (indice >= etapas.length) {
            concluir();
            return;
          }

          const etapa = etapas[indice];
          const hospedeiro =
            document.querySelector('dialog[open]') || document.body;

          hospedeiro.append(moldura, painel);

          titulo.textContent =
            `Orientação ${indice + 1} de ${etapas.length}`;

          texto.textContent = etapa.texto;
          extra.replaceChildren();
          proximo.hidden = etapa.modo !== 'continuar';

          if (etapa.exemploMarcas) {
            const exemplo = document.createElement('button');
            exemplo.type = 'button';

            const labels = [
              'Sem marca',
              '❄ Frio — normal',
              '🌡 Morno — estranho',
              '🔥 Quente — suspeito'
            ];

            let m = 0;
            exemplo.textContent = labels[0];

            exemplo.onclick = () => {
              m = (m + 1) % labels.length;
              exemplo.textContent = labels[m];
            };

            const aviso = document.createElement('small');
            aviso.textContent =
              'Exemplo demonstrativo: não altera suas evidências.';

            extra.append(exemplo, aviso);
          }

          posicionar();
          alvo?.scrollIntoView({block: 'center', behavior: 'auto'});
          posicionar();

          if (etapa.modo === 'continuar') proximo.focus();
          else alvo?.focus();
        }

        function avancar() {
          if (fim) return;
          removerAlvo();
          indice++;
          transicao = false;
          mostrar();
        }

        function capturar(e) {
          if (fim || painel.contains(e.target)) return;

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
              ...(etapas[indice].modo !== 'continuar' && alvo ? [alvo] : []),
              ...painel.querySelectorAll('button:not([hidden])')
            ];

            const atual = itens.indexOf(document.activeElement);
            const proximoIndice = (
              atual + (e.shiftKey ? -1 : 1) + itens.length
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
            'custa pontos. Perguntas já feitas permanecem no prontuário ' +
            'e ficam bloqueadas para esse servidor.'
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
            'Após uma consulta, o resultado aparece nesta tabela. ' +
            'Em cada célula preenchida, clique em Sem marca para ' +
            'alternar entre Frio, Morno e Quente. Experimente o exemplo abaixo.'
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