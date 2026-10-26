/*
OBJETIVO: ocultar o cursor real e o demonstrativo e bloquear cliques,
toques e teclado durante as animações automáticas das duas fases.
Mantém o controle de áudio e Pular animação disponíveis.

ARQUIVO NOVO: static/bloqueio_animacoes.js
CRIE ESTE ARQUIVO E COLE TODO O CONTEÚDO.

Depois, substitua os dois arquivos HTML apresentados abaixo.
Os arquivos de áudio, narração e tempos de leitura permanecem como estão.
Após salvar, atualize o navegador com Ctrl + F5.

VALIDAÇÃO: sintaxe e comportamentos verificados com DOM simulado.
Confira os efeitos e as interações no navegador.
*/
(() => {
  'use strict';

  if (window.TTBloqueioAnimacoes) return;

  window.TTBloqueioAnimacoes = true;

  function iniciar() {
    let bloqueado = false;
    let focoAnterior = null;

    const estilo = document.createElement('style');

    estilo.textContent = `
      body.tt-animacao-bloqueada,
      body.tt-animacao-bloqueada * {
        cursor: none !important;
      }

      body.tt-animacao-bloqueada [data-tt-controle-animacao],
      body.tt-animacao-bloqueada [data-tt-controle-animacao] * {
        cursor: pointer !important;
      }

      body.tt-animacao-bloqueada {
        user-select: none;
      }
    `;

    document.head.append(estilo);

    function emAnimacao() {
      const final = document.getElementById('final');

      if (final && !final.hidden) {
        return false;
      }

      const intro2 = document.querySelector(
        '.interrog-intro'
      );

      return (
        document.body.dataset.ttModo === 'historia'
        || !!(intro2 && !intro2.hidden)
      );
    }

    function controlesPermitidos() {
      return [
        ...document.querySelectorAll('button')
      ].filter(botao => {
        const permitido =
          botao.classList.contains('tt-volume')
          || botao.classList.contains('interrog-skip')
          || botao.textContent.trim() === 'Pular animação';

        const visivel =
          !botao.disabled
          && !botao.closest('[hidden], [inert]')
          && botao.getClientRects().length > 0;

        if (permitido) {
          botao.setAttribute(
            'data-tt-controle-animacao',
            ''
          );
        }

        return permitido && visivel;
      });
    }

    function permitido(
      alvo,
      controles = controlesPermitidos()
    ) {
      return controles.some(botao =>
        botao === alvo || botao.contains(alvo)
      );
    }

    function sincronizar() {
      const novo = emAnimacao();
      const controles = controlesPermitidos();
      const mudou = novo !== bloqueado;

      bloqueado = novo;

      if (
        document.body.classList.contains(
          'tt-animacao-bloqueada'
        ) !== novo
      ) {
        document.body.classList.toggle(
          'tt-animacao-bloqueada',
          novo
        );
      }

      if (!mudou) return;

      if (novo) {
        focoAnterior = document.activeElement;

        if (!permitido(document.activeElement, controles)) {
          document.activeElement?.blur?.();

          controles[0]?.focus({
            preventScroll: true
          });
        }
      } else {
        if (
          focoAnterior?.isConnected
          && !focoAnterior.closest('[hidden], [inert]')
          && focoAnterior.getClientRects().length > 0
        ) {
          focoAnterior.focus({
            preventScroll: true
          });
        } else if (
          document.activeElement?.closest('[hidden]')
        ) {
          document.activeElement.blur();
        }

        focoAnterior = null;
      }
    }

    function impedir(evento) {
      evento.preventDefault();
      evento.stopImmediatePropagation();
    }

    function controlarEvento(evento) {
      sincronizar();

      if (!bloqueado) return;

      // Preserva os atalhos do próprio navegador.
      const tecla = String(
        evento.key || ''
      ).toLowerCase();

      if (
        evento.type.startsWith('key')
        && (
          tecla === 'f5'
          || tecla === 'f12'
          || (
            (evento.ctrlKey || evento.metaKey)
            && [
              'r', 'l', 't', 'w', 'n', '+', '-', '0'
            ].includes(tecla)
          )
        )
      ) return;

      const controles = controlesPermitidos();

      // Durante a animação, Tab circula apenas
      // entre o áudio e Pular animação.
      if (
        evento.type === 'keydown'
        && evento.key === 'Tab'
      ) {
        impedir(evento);

        if (!controles.length) return;

        const atual = controles.indexOf(
          document.activeElement
        );

        const proximo = atual < 0
          ? (
            evento.shiftKey
              ? controles.length - 1
              : 0
          )
          : (
            atual
            + (evento.shiftKey ? -1 : 1)
            + controles.length
          ) % controles.length;

        controles[proximo].focus({
          preventScroll: true
        });

        return;
      }

      if (permitido(evento.target, controles)) return;

      impedir(evento);
    }

    function controlarFoco(evento) {
      if (!emAnimacao()) return;

      const controles = controlesPermitidos();

      if (permitido(evento.target, controles)) return;

      evento.stopImmediatePropagation();
      evento.target?.blur?.();

      controles[0]?.focus({
        preventScroll: true
      });
    }

    const eventos = [
      'pointerdown',
      'pointerup',
      'mousedown',
      'mouseup',
      'click',
      'dblclick',
      'contextmenu',
      'touchstart',
      'touchend',
      'touchmove',
      'wheel',
      'keydown',
      'keypress',
      'keyup',
      'beforeinput',
      'dragstart',
      'drop'
    ];

    for (const nome of eventos) {
      document.addEventListener(
        nome,
        controlarEvento,
        {
          capture: true,
          passive: false
        }
      );
    }

    document.addEventListener(
      'focusin',
      controlarFoco,
      true
    );

    new MutationObserver(sincronizar).observe(
      document.body,
      {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: [
          'class',
          'hidden',
          'disabled',
          'data-tt-modo',
          'inert'
        ]
      }
    );

    sincronizar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      iniciar,
      {once: true}
    );
  } else {
    iniciar();
  }
})();