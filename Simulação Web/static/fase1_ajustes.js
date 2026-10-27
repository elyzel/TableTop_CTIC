/*
BLOCO 6
ARQUIVO NOVO: static/fase1_ajustes.js
COLE TODO O CONTEÚDO.

Este arquivo adapta as funções existentes da Fase 1.
Carregue-o depois do script principal de participante.html.
*/

(() => {
  let controle = null;
  let emIntro = false;
  let finalizando = false;
  let timer = null;
  let falaAtual = '';

  const reduz = matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const pular = document.createElement('button');

  pular.textContent = 'Pular animação';
  pular.hidden = true;
  pular.type = 'button';

  pular.style.cssText = (
    'position:fixed;right:24px;top:24px;z-index:300;' +
    'padding:12px 18px;background:#111;color:#fff;' +
    'border:1px solid #aaa;border-radius:6px;cursor:pointer'
  );

  document.body.append(pular);

  const estilo = document.createElement('style');

  estilo.textContent = `
    #narr {
      position: fixed;
      inset: auto 0 0 !important;
      transform: none !important;
      width: 100%;
      max-width: none;
      min-height: 110px;
      padding: 24px 6vw;
      background: rgba(0,0,0,.96);
      color: #fff;
      border-radius: 0;
      border-top: 1px solid #555;
      font: clamp(18px,2.3vw,25px)/1.5 Georgia,serif;
      text-align: center;
      text-shadow: none;
      z-index: 250;
      pointer-events: none;
      opacity: 0;
      transition: opacity .25s;
    }

    #narr.on {
      opacity: 1;
      transform: none !important;
      pointer-events: auto;
      cursor: pointer;
    }

    @media (prefers-reduced-motion: reduce) {
      #narr {
        transition: none;
      }
    }
  `;

  document.head.append(estilo);

  // Esperas canceláveis durante a abertura.
  // Evita que a animação continue alterando a tela após pular.
  window.ttEsperar = ms => new Promise(
    (resolve, reject) => {
      const sinal = emIntro
        ? controle?.signal
        : null;

      if (sinal?.aborted) {
        reject(
          new DOMException(
            'Abertura pulada',
            'AbortError'
          )
        );
        return;
      }

      const id = setTimeout(() => {
        sinal?.removeEventListener(
          'abort',
          cancelar
        );

        resolve();
      }, ms);

      function cancelar() {
        clearTimeout(id);

        reject(
          new DOMException(
            'Abertura pulada',
            'AbortError'
          )
        );
      }

      sinal?.addEventListener(
        'abort',
        cancelar,
        { once: true }
      );
    }
  );

  const original = {
    introFase,
    comecar,
    abrirEmailParticipante,
    iniciarJogo
  };

  narrar = texto => {
    clearInterval(timer);
    falaAtual = texto;

    const n = document.getElementById('narr');

    n.textContent = '';
    n.classList.add('on');

    if (reduz) {
      n.textContent = texto;
      return;
    }

    let i = 0;

    timer = setInterval(() => {
      n.textContent = texto.slice(0, ++i);

      window.TTUI?.toque(texto[i - 1]);

      if (i >= texto.length) {
        clearInterval(timer);
      }
    }, 18);
  };

  pararNarracao = () => {
    clearInterval(timer);

    document.getElementById('narr')
      .classList.remove('on');
  };

  document.getElementById('narr')
    .addEventListener('click', () => {
      clearInterval(timer);

      document.getElementById('narr')
        .textContent = falaAtual;
    });

  introFase = async () => {
    emIntro = true;
    finalizando = false;
    controle = new AbortController();

    const r = await fetch('/api/animacoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pid })
    });

    const d = await r.json();

    if (!r.ok) {
      throw new Error(
        d.erro || 'Falha ao consultar animações.'
      );
    }

    pular.hidden = !d.fase1;
    pular.disabled = false;

    document.querySelector(
      '#faseintro h1'
    ).innerHTML = 'Fase 1<br>Máquina Contaminada';

    document.getElementById('inicio')
      .classList.add('sumindo');

    await sleep(1100);

    document.getElementById('inicio').hidden = true;
    document.getElementById('faseintro').hidden = false;

    await sleep(80);

    document.getElementById('faseintro')
      .classList.add('on');

    // 1,6 segundo de entrada + 6,5 segundos para ler.
    await sleep(4100);

    document.getElementById('faseintro')
      .classList.remove('on');

    await sleep(1600);

    document.getElementById('faseintro').hidden = true;
  };

  const loginAnterior = introLogin;

  introLogin = async () => {
    narrar(
      'Maria inicia mais um dia de trabalho. ' +
      'Tudo parece seguir a rotina...'
    );

    await loginAnterior();
    pararNarracao();
  };

  const posLoginAnterior = prepararInteracaoPosLogin;

  prepararInteracaoPosLogin = async () => {
    await posLoginAnterior();

    narrar(
      'Uma nova mensagem acaba de chegar. ' +
      'Abra o navegador e consulte o e-mail.'
    );
  };

  let iniciando = false;

  comecar = async () => {
    if (iniciando || emIntro) return;

    iniciando = true;

    try {
      await original.comecar();
    } catch (e) {
      if (e.name !== 'AbortError') {
        emIntro = false;
        pular.hidden = true;
        alert(e.message);
      }
    } finally {
      iniciando = false;
    }
  };

  abrirEmailParticipante = async () => {
    try {
      await original.abrirEmailParticipante();
    } catch (e) {
      if (e.name !== 'AbortError') {
        alert(e.message);
      }
    }
  };

  iniciarJogo = async () => {
    if (finalizando) return;

    finalizando = true;
    emIntro = false;
    pular.hidden = true;

    pararNarracao();

    ['faseintro', 'winlogin'].forEach(id => {
      const n = document.getElementById(id);

      n.classList.remove('on');
      n.hidden = true;
    });

    [
      'browser',
      'execwin',
      'bd',
      'flash',
      'preto',
      'notice',
      'dica',
      'demo-cursor'
    ].forEach(id => {
      document.getElementById(id)
        ?.classList.remove('on');
    });

    document.getElementById('inicio').hidden = true;
    document.getElementById('desk').hidden = false;

    await original.iniciarJogo();
  };

  pular.onclick = async () => {
    if (!emIntro || pular.disabled) return;

    pular.disabled = true;
    controle.abort();

    try {
      await iniciarJogo();
    } catch (e) {
      alert(e.message);
    }
  };
})();