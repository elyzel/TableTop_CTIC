/*
OBJETIVO:
Executar as animações automaticamente e mostrar apenas
o aviso "Animação em andamento", sem controles de reprodução.
*/
(() => {
  'use strict';

  let ativa = false;
  let indicador = null;
  let fase1Integrada = false;

  function prepararIndicador() {
    if (indicador) return;

    const estilo = document.createElement('style');

    estilo.textContent = `
      .tt-anim-indicador {
        position: fixed;
        top: 12px;
        left: 64px;
        z-index: 10050;

        display: inline-flex;
        align-items: center;
        gap: 9px;

        max-width: calc(100vw - 88px);
        box-sizing: border-box;
        padding: 10px 13px;

        border: 1px solid #536c82;
        border-radius: 8px;
        background: #111d2cee;
        color: #fff;

        font: 13px/1.4 "Segoe UI", sans-serif;
        pointer-events: none;
      }

      .tt-anim-indicador[hidden] {
        display: none;
      }

      .tt-anim-indicador::before {
        content: "";
        flex: 0 0 8px;
        width: 8px;
        height: 8px;

        border-radius: 50%;
        background: #75caff;
        box-shadow: 0 0 9px #188cff;

        animation: tt-indicador-brilho 1.6s ease-in-out infinite;
      }

      @keyframes tt-indicador-brilho {
        0%, 100% {
          opacity: .55;
        }

        50% {
          opacity: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .tt-anim-indicador::before {
          animation: none;
        }
      }
    `;

    document.head.append(estilo);

    indicador = document.createElement('div');
    indicador.className = 'tt-anim-indicador';
    indicador.hidden = true;

    indicador.setAttribute('role', 'status');
    indicador.setAttribute('aria-live', 'polite');

    indicador.textContent = 'Animação em andamento';

    document.body.append(indicador);
  }

  function iniciar(nome, destino = null) {
    prepararIndicador();

    ativa = true;

    // Mantém o aviso visível também dentro do diálogo final.
    (destino || document.body).append(indicador);

    indicador.hidden = false;

    // A cena começa automaticamente.
    return Promise.resolve();
  }

  function encerrar() {
    ativa = false;

    if (!indicador) return;

    indicador.hidden = true;

    if (indicador.parentElement !== document.body) {
      document.body.append(indicador);
    }
  }

  function agendar(fn, ms) {
    return window.setTimeout(fn, ms);
  }

  function intervalo(fn, ms) {
    return window.setInterval(fn, ms);
  }

  function cancelar(token) {
    // No navegador, os dois temporizadores compartilham
    // o mesmo conjunto de identificadores.
    window.clearTimeout(token);
    window.clearInterval(token);
  }

  function esperar(ms, sinal = null) {
    return new Promise((resolve, reject) => {
      if (sinal?.aborted) {
        reject(
          new DOMException(
            'Animação cancelada',
            'AbortError'
          )
        );

        return;
      }

      const token = agendar(() => {
        sinal?.removeEventListener('abort', abortar);
        resolve();
      }, ms);

      function abortar() {
        cancelar(token);

        sinal?.removeEventListener('abort', abortar);

        reject(
          new DOMException(
            'Animação cancelada',
            'AbortError'
          )
        );
      }

      sinal?.addEventListener(
        'abort',
        abortar,
        {once: true}
      );
    });
  }

  function integrarFase1() {
    if (
      fase1Integrada ||
      !document.getElementById('desk')
    ) {
      return;
    }

    fase1Integrada = true;

    const introAnterior = introFase;

    introFase = async () => {
      await iniciar('Abertura da Fase 1');

      try {
        return await introAnterior();
      } catch (erro) {
        encerrar();
        throw erro;
      }
    };

    const prepararAnterior = prepararInteracaoPosLogin;

    prepararInteracaoPosLogin = async () => {
      encerrar();
      return prepararAnterior();
    };

    const phishingAnterior = phishingAutomatico;

    phishingAutomatico = async () => {
      await iniciar('Simulação do incidente');

      try {
        return await phishingAnterior();
      } finally {
        encerrar();
      }
    };

    const jogoAnterior = iniciarJogo;

    iniciarJogo = async () => {
      encerrar();
      return jogoAnterior();
    };
  }

  // Compatibilidade com as chamadas adicionadas anteriormente.
  // Estas funções não suspendem áudio nem animações.
  function registrarAudio() {}
  function pausar() {}
  function retomar() {}

  window.TTAnimacao = {
    iniciar,
    encerrar,
    esperar,
    agendar,
    intervalo,
    cancelar,
    integrarFase1,
    registrarAudio,
    pausar,
    retomar,

    get ativa() {
      return ativa;
    },

    get pausada() {
      return false;
    }
  };
})();