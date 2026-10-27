/*
OBJETIVO: corrigir a inicialização da Fase 1, manter a narrativa e apresentar a orientação antes do cronômetro.
ARQUIVO: static/participante.js
COLE TODO O CONTEÚDO (substitui o arquivo inteiro).
*/

const $ = id => document.getElementById(id);
const sleep = ms => window.ttEsperar
  ? window.ttEsperar(ms)
  : new Promise(r => setTimeout(r, ms));

const esc = s => {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
};

const post = async (u, b = {}) => {
  const r = await fetch(u, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(b)
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.erro || `Falha HTTP ${r.status}`);
  return d;
};

let pid = localStorage.getItem('tt_pid'),
  est = null,
  faseVista = null,
  sel = null,
  mudo = false,
  ac = null,
  rt = 0,
  poll = null,
  ocupado = false,
  noticeTimer = null,
  dicaTimer = null,
  hintStart = 0,
  hintStage = 0,
  lastHintPhase = null,
  lastUsedCount = 0;

let pregame = 'inicio';

/* ---------- Botões da tela final (podem não existir nesta página) ---------- */

$('avancar-fase2')?.addEventListener('click', () => {
  location.assign('/fase2');
});

$('reiniciar-fase1')?.addEventListener('click', async () => {
  if (!confirm(
    'Reiniciar sua Fase 1? Sua tentativa da Fase 2 também será reiniciada. Os demais participantes serão mantidos.'
  )) return;

  const botao = $('reiniciar-fase1');
  const erro = $('erro-reinicio');
  botao.disabled = true;
  if (erro) erro.hidden = true;

  try {
    const resposta = await fetch('/api/participante/reiniciar', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({pid: localStorage.getItem('tt_pid')})
    });
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível reiniciar.');
    localStorage.removeItem('tt_pid');
    sessionStorage.removeItem('tt_ord');
    location.assign('/');
  } catch (e) {
    if (erro) {
      erro.textContent = e.message;
      erro.hidden = false;
    } else {
      alert(e.message);
    }
    botao.disabled = false;
  }
});

/* ---------- Áudio ---------- */

function bip(f, d, t = 'sine') {
  if (mudo) return;
  try {
    ac = ac || new AudioContext();
    if (ac.state === 'suspended') ac.resume();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = t;
    o.frequency.value = f;
    g.gain.value = .07;
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + d);
  } catch {}
}

function alarme() {
  [0, 250, 500, 750].forEach(t => {
    setTimeout(() => bip(880, .18, 'square'), t);
  });
}

function alternarSom() {
  mudo = !mudo;
  if ($('mudo')) $('mudo').textContent = mudo ? '🔇' : '🔊';
}

const fmt = s => (
  String(Math.floor(s / 60)).padStart(2, '0')
  + ':' + String(s % 60).padStart(2, '0')
);

/* ---------- Narração, avisos e dicas ---------- */

function narrar(t) {
  $('narr').textContent = t;
  $('narr').classList.add('on');
}

function pararNarracao() {
  $('narr').classList.remove('on');
}

function mostrarNotice(texto, tipo = 'alerta', titulo = null, duracao = 8000) {
  const n = $('notice');
  n.className = '';
  if (tipo === 'sucesso') n.classList.add('sucesso');
  if (tipo === 'info') n.classList.add('info');

  $('notice-title').textContent = titulo || (
    tipo === 'sucesso'
      ? '✅ AÇÃO CORRETA'
      : tipo === 'info'
        ? 'ℹ️ INFORMAÇÃO'
        : '⚠️ CONSEQUÊNCIA DA AÇÃO'
  );

  $('notice-text').textContent = texto;
  n.classList.add('on');
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => n.classList.remove('on'), duracao);
}

function mostrarDica(texto, duracao = 8500) {
  const d = $('dica');
  d.textContent = '💡 ' + texto;
  d.classList.add('on');
  clearTimeout(dicaTimer);
  dicaTimer = setTimeout(() => d.classList.remove('on'), duracao);
}

async function digitarTexto(el, texto, atraso = 80) {
  el.textContent = '';
  for (const ch of texto) {
    el.textContent += ch;
    bip(520, .02);
    await sleep(atraso);
  }
}

async function moverCursorPara(el) {
  const c = $('demo-cursor');
  const r = el.getBoundingClientRect();
  c.classList.add('on');
  c.style.left = (r.left + r.width * .55) + 'px';
  c.style.top = (r.top + r.height * .55) + 'px';
  await sleep(800);
}

async function clicarDemo(el) {
  await moverCursorPara(el);
  const c = $('demo-cursor');
  c.classList.add('click');
  bip(720, .05);
  await sleep(150);
  c.classList.remove('click');
  await sleep(250);
}

function esconderCursor() {
  $('demo-cursor')?.classList.remove('on');
}

/* ---------- Introdução e narrativa ---------- */

async function introFase() {
  $('inicio').classList.add('sumindo');
  await sleep(1100);
  $('inicio').hidden = true;
  $('faseintro').hidden = false;
  await sleep(50);
  $('faseintro').classList.add('on');
  await sleep(3000);
  $('faseintro').classList.remove('on');
  await sleep(800);
  $('faseintro').hidden = true;
}

async function introLogin() {
  $('winlogin').hidden = false;
  await sleep(50);
  $('winlogin').classList.add('on');
  $('login-status').textContent = 'Iniciando sessão do usuário...';
  await sleep(900);
  await digitarTexto($('login-user'), 'maria.silva', 90);
  $('login-status').textContent = 'Digitando senha...';
  await sleep(300);
  await digitarTexto($('login-pass'), '••••••••••', 90);
  $('login-status').textContent = 'Entrando no Windows...';
  await sleep(1200);
  $('preto').classList.add('on');
  await sleep(700);
  $('winlogin').classList.remove('on');
  await sleep(350);
  $('winlogin').hidden = true;
  $('desk').hidden = false;
  await sleep(250);
  $('preto').classList.remove('on');
  await sleep(700);
}

async function prepararInteracaoPosLogin() {
  pregame = 'aguarda_browser';
  $('desktop-browser').classList.add('guia');
  mostrarNotice(
    'Um novo e-mail acabou de chegar. Acesse o navegador para verificar a mensagem.',
    'info',
    '📧 NOVO E-MAIL RECEBIDO',
    10000
  );
  mostrarDica('Clique no ícone Navegador da área de trabalho.', 4000);
}

async function abrirNavegadorParticipante() {
  if (pregame !== 'aguarda_browser') return;
  pregame = 'aguarda_email';
  $('desktop-browser').classList.remove('guia');
  $('browser').classList.add('on');
  $('fav-email').classList.add('guia');
  mostrarDica('O navegador abriu no Goooogli. Clique no favorito E-mail.', 10000);
}

async function abrirEmailParticipante() {
  if (pregame !== 'aguarda_email') return;
  pregame = 'automatico';
  $('fav-email').classList.remove('guia');
  $('gooogli').style.display = 'none';
  $('mail-app').style.display = 'flex';
  $('address').textContent = 'https://webmail.empresa.local';
  await sleep(700);
  try {
    await phishingAutomatico();
  } catch (e) {
    console.error(e);
    mostrarNotice(e.message || 'Erro ao iniciar a fase.', 'alerta', 'Não foi possível continuar');
  }
}

/*
Liga os cliques por JS. Se o HTML já usa onclick, não há problema:
as funções acima têm trava por estado (pregame) e só executam uma vez.
*/
$('desktop-browser')?.addEventListener('click', abrirNavegadorParticipante);
$('fav-email')?.addEventListener('click', abrirEmailParticipante);

async function phishingAutomatico() {
  $('email-novo').classList.add('destacado');
  narrar('A usuária se desesperou, e infelizmente baixou o anexo e o executou...');
  await sleep(3500);
  pararNarracao();

  await clicarDemo($('email-novo'));
  $('email-novo').classList.remove('destacado');
  $('email-placeholder').style.display = 'none';
  $('email-body').classList.add('aberto');
  await sleep(4000);

  $('phish-link').classList.add('destacado');
  await clicarDemo($('phish-link'));
  $('phish-link').classList.remove('destacado');
  $('download-box').style.display = 'block';
  narrar('Maria clica no link e um arquivo começa a ser baixado.');

  for (let p = 0; p <= 100; p += 10) {
    $('download-bar').style.width = p + '%';
    await sleep(170);
  }

  await sleep(500);
  pararNarracao();
  $('browser').classList.remove('on');
  await sleep(400);

  $('execwin').classList.add('on');
  await clicarDemo($('arquivo-baixado'));
  $('exec-status').textContent = 'Executando arquivo...';
  $('arquivo-baixado').style.background = '#ffe1e1';
  $('arquivo-baixado').style.border = '2px solid #c92828';
  narrar('O arquivo DIVIDA_PENDENTE.pdf.exe é executado.');
  await sleep(2100);
  pararNarracao();

  $('execwin').classList.remove('on');
  esconderCursor();
  await sleep(600);

  $('bd').classList.add('on');
  $('flash').classList.add('on');
  $('bdi').classList.add('alerta');
  alarme();

  mostrarNotice(
    'O BitDefender detectou uma ameaça após a execução do arquivo.',
    'alerta',
    '⚠️ AMEAÇA DETECTADA',
    7000
  );

  await sleep(2600);
  narrar('O que deve ser feito primeiramente?');
  await sleep(3300);
  pararNarracao();

  $('bd').classList.remove('on');
  $('flash').classList.remove('on');

  await iniciarJogo();
}

/* ---------- Início do jogo (orientação antes do cronômetro) ---------- */

async function iniciarJogo() {
  clearInterval(poll);
  pregame = 'orientacao';

  try {
    $('grade').hidden = false;

    const r = await fetch('/api/orientacao/fase1', {cache: 'no-store'});
    const dados = await r.json();

    if (!r.ok) {
      throw new Error(dados.erro || 'Não foi possível preparar a orientação.');
    }

    est = {
      status: 'orientacao',
      acoes: dados.acoes,
      usadas: [],
      flags: []
    };

    renderGrade();

    if (window.TTUI && typeof window.TTUI.tutorialFase1 === 'function') {
      await window.TTUI.tutorialFase1();
    }
    fechar();

    await post('/api/iniciar', {pid});
    pregame = 'jogo';
    await atualizar();

    if (est?.status === 'jogando') {
      reiniciarRelogioDicas();
      clearInterval(poll);
      poll = setInterval(atualizar, 2000);
    }
  } catch (e) {
    console.error(e);
    mostrarNotice(e.message || 'Erro ao iniciar o jogo.', 'alerta', 'Não foi possível iniciar a Fase 1', 12000);
  }
}

async function comecar() {
  const nome = $('nome').value.trim();
  if (!nome) return;

  try {
    const entrada = await post('/api/entrar', {nome});
    pid = entrada.pid;
    localStorage.setItem('tt_pid', pid);
    sessionStorage.removeItem('tt_ord');
    bip(1, .01);
    await introFase();
    await introLogin();
    await prepararInteracaoPosLogin();
  } catch (e) {
    console.error(e);
    alert(e.message || 'Não foi possível entrar.');
  }
}

/* ---------- Grade de ações ---------- */

function renderGrade() {
  const ids = est.acoes.map(a => a.id);
  let ord;

  try {
    ord = JSON.parse(sessionStorage.getItem('tt_ord') || 'null');
  } catch {
    ord = null;
  }

  if (
    !Array.isArray(ord)
    || ord.length !== ids.length
    || new Set(ord).size !== ids.length
    || !ord.every(id => ids.includes(id))
  ) {
    ord = [...ids];
    for (let i = ord.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ord[i], ord[j]] = [ord[j], ord[i]];
    }
    sessionStorage.setItem('tt_ord', JSON.stringify(ord));
  }

  $('grade').innerHTML = ord.map(id => {
    const a = est.acoes.find(x => x.id === id);
    return `<div class="ic ${est.usadas.includes(id) ? 'usado' : ''} ${sel === id ? 'sel' : ''}" onclick="abrir('${id}')"><div class="img">${a.icone}</div>${esc(a.nome)}</div>`;
  }).join('');
}

function abrir(id) {
  if (pregame !== 'jogo' && pregame !== 'orientacao') return;
  sel = id;
  const a = est.acoes.find(x => x.id === id);
  $('d-ic').textContent = a.icone;
  $('d-nome').textContent = a.nome;
  $('d-desc').textContent = a.descricao;
  $('area').classList.add('aberto');
  $('detalhe').classList.add('on');
  renderGrade();
}

function fechar() {
  sel = null;
  $('area').classList.remove('aberto');
  $('detalhe').classList.remove('on');
  if (est && est.acoes) renderGrade();
}

/* ---------- Dicas ---------- */

function dicaContextual(nivel) {
  if (!est) return '';
  const f = est.flags || [];
  const u = est.usadas || [];

  if (!f.includes('isolou')) {
    if (u.includes('retirar_cabo')) {
      return nivel === 1
        ? 'Verifique se ainda existe outro meio de comunicação de rede.'
        : 'A máquina realmente está isolada de todos os meios de comunicação?';
    }
    if (u.includes('antivirus')) {
      return nivel === 1
        ? 'Detectar e conter são ações diferentes.'
        : 'Pense em como impedir que o equipamento continue se comunicando com outros recursos.';
    }
    if (u.includes('remover_instalador')) {
      return nivel === 1
        ? 'Pense no estado atual do equipamento, não apenas no arquivo que originou o incidente.'
        : 'Remover a origem não interrompe necessariamente aquilo que já está em execução.';
    }
    return nivel === 1
      ? 'Considere a prioridade quando um equipamento comprometido ainda possui acesso à rede.'
      : 'Pense primeiro em limitar a comunicação do equipamento com outros recursos.';
  }

  if (!f.includes('comunicou_soc')) {
    return nivel === 1
      ? 'Agora que o risco de propagação diminuiu, quem precisa ser informado?'
      : 'Pense no fluxo institucional responsável por registrar e investigar incidentes.';
  }

  if (!f.includes('preservou')) {
    return nivel === 1
      ? 'Quais informações serão necessárias para reconstruir o que aconteceu?'
      : 'Pense em registrar a sequência de eventos e ações.';
  }

  return '';
}

function reiniciarRelogioDicas() {
  hintStart = Date.now();
  hintStage = 0;
  lastHintPhase = est ? est.fase : null;
  lastUsedCount = est?.usadas?.length || 0;
  $('dica').classList.remove('on');
}

function verificarDicas() {
  if (!est || est.status !== 'jogando' || pregame !== 'jogo') return;

  if (lastHintPhase !== est.fase || lastUsedCount !== est.usadas.length) {
    reiniciarRelogioDicas();
    return;
  }

  const s = (Date.now() - hintStart) / 1000;

  if (hintStage === 0 && s >= 90) {
    const t = dicaContextual(1);
    if (t) mostrarDica(t);
    hintStage = 1;
  } else if (hintStage === 1 && s >= 150) {
    const t = dicaContextual(2);
    if (t) mostrarDica(t);
    hintStage = 2;
  }
}

/* ---------- Execução de ações ---------- */

async function executar() {
  if (pregame !== 'jogo' || !sel || ocupado) return;
  ocupado = true;

  try {
    const acaoSelecionada = sel;
    const r = await post('/api/executar', {pid, acao: sel});
    fechar();

    if (r.efeito === 'reboot') await reboot();

    if (r.objetivos) {
      $('obj').textContent =
        r.objetivos.concluidos + '/' + r.objetivos.total;
    }

    const titulos = {
      isolou: '✅ OBJETIVO CONCLUÍDO - CONTENÇÃO',
      comunicou_soc: '✅ OBJETIVO CONCLUÍDO - COMUNICAÇÃO',
      preservou: '✅ OBJETIVO CONCLUÍDO - PRESERVAÇÃO'
    };

    const flag = Object.keys(titulos).find(
      f => (r.novas_flags || []).includes(f)
    );

    mostrarNotice(
      r.consequencia,
      flag || r.objetivo_novo ? 'sucesso' : 'alerta',
      flag ? titulos[flag] : null
    );

    if (acaoSelecionada === 'retirar_cabo') {
      setTimeout(() => mostrarDica('A máquina realmente está isolada?'), 2600);
    }
    if (acaoSelecionada === 'remover_instalador') {
      setTimeout(() => mostrarDica('Remover a origem não interrompe necessariamente o que já foi executado.'), 2600);
    }
    if (acaoSelecionada === 'antivirus') {
      setTimeout(() => mostrarDica('Detectar e conter são ações diferentes.'), 2600);
    }

    if (
      r.finalizado
      && r.objetivos?.total > 0
      && r.objetivos.concluidos === r.objetivos.total
    ) {
      await sleep(2600);
      mostrarNotice(
        '3 de 3 objetivos essenciais foram concluídos.',
        'sucesso',
        '✅ FASE 1 CONCLUÍDA',
        5000
      );
      await sleep(2600);
    }

    await atualizar();
    if (est?.status === 'jogando') reiniciarRelogioDicas();
  } catch (e) {
    mostrarNotice(e.message, 'alerta', 'Não foi possível executar a ação');
    await atualizar();
  } finally {
    ocupado = false;
  }
}

async function reboot() {
  $('preto').classList.add('on');
  await sleep(2500);
  $('preto').classList.remove('on');
  $('bd').classList.add('on');
  $('flash').classList.add('on');
  alarme();
  await sleep(3000);
  $('bd').classList.remove('on');
  $('flash').classList.remove('on');
}

function caos() {
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      const e = document.createElement('div');
      e.className = 'err';
      e.style.left = Math.random() * 70 + '%';
      e.style.top = Math.random() * 60 + '%';
      e.innerHTML =
        '<b>Erro do sistema</b><p>Arquivos da pasta compartilhada foram alterados.</p>';
      document.body.appendChild(e);
      setTimeout(() => e.remove(), 9000);
    }, i * 700);
  }
}

/* ---------- Atualização de estado ---------- */

async function atualizar() {
  if (!pid) return;
  let r;

  try {
    r = await fetch('/api/estado/' + encodeURIComponent(pid));
  } catch {
    return;
  }

  if (r.status === 404) {
    localStorage.removeItem('tt_pid');
    location.reload();
    return;
  }

  est = await r.json();

  if (est.objetivos && $('obj')) {
    $('obj').textContent =
      est.objetivos.concluidos + '/' + est.objetivos.total;
  }

  if (est.status === 'finalizado') {
    clearInterval(poll);
    $('dica')?.classList.remove('on');
    mostrarFinal();
    return;
  }

  if (est.status !== 'jogando') return;

  if (faseVista !== null && est.fase !== faseVista) {
    const isolou = est.flags.includes('isolou');
    mostrarNotice(
      est.evento,
      isolou ? 'sucesso' : 'alerta',
      isolou ? '✅ OBJETIVO CONCLUÍDO - CONTENÇÃO' : '⚠️ O INCIDENTE EVOLUIU'
    );
    if (est.efeito_fase === 'caos') caos();
  }

  faseVista = est.fase;
  rt = est.restante_total;

  if ($('pts')) $('pts').textContent = est.pontos;

  if ($('rb')) {
    $('rb').style.width = est.risco + '%';
    $('rb').style.background = est.risco > 66
      ? '#ff4d4f'
      : est.risco > 33
        ? '#f5b942'
        : '#2ecc71';
  }

  const iso = est.flags.includes('isolou');
  if ($('net')) $('net').textContent = iso ? '🚫 Sem rede' : '🌐 Rede';
  $('bdi')?.classList.toggle('alerta', !iso && est.risco > 33);

  renderGrade();
  renderHistorico();
}

function renderHistorico() {
  const alvo = $('hist') || $('historico');
  if (!alvo || !est || !Array.isArray(est.historico)) return;

  alvo.innerHTML = est.historico.map(h => {
    const t = Number(h.pontos ?? h.delta ?? 0);
    const nome = h.nome || h.acao_nome || h.acao || '';
    return `<div class="h"><b>${esc(String(nome))}</b> <small>(${esc(String(h.tempo_s ?? 0))}s)</small><br><span class="${t >= 0 ? 'pos' : 'neg'}">${t >= 0 ? '+' : ''}${t} pts</span><br><i>${esc(h.feedback || '')}</i></div>`;
  }).join('');
}

/* ---------- Tela final ---------- */

function mostrarFinal() {
  pregame = 'final';
  clearInterval(poll);
  fechar();
  renderHistorico();

  if ($('pts')) $('pts').textContent = est.pontos;

  const tela = $('final') || $('tela-final');
  if (tela) {
    tela.hidden = false;
    tela.classList.add('on');
  }

  if ($('final-pontos')) $('final-pontos').textContent = est.pontos;

  if ($('final-obj') && est.objetivos) {
    $('final-obj').textContent =
      est.objetivos.concluidos + '/' + est.objetivos.total;
  }

  if ($('avancar-fase2')) $('avancar-fase2').hidden = false;
  if ($('reiniciar-fase1')) $('reiniciar-fase1').hidden = false;
}

/* ---------- Relógios ---------- */

setInterval(() => {
  if (pregame === 'jogo') rt = Math.max(0, rt - 1);
  if ($('tempo')) $('tempo').textContent = pregame === 'jogo' ? fmt(rt) : '--:--';
  if ($('relogio')) {
    $('relogio').textContent = new Date().toLocaleTimeString(
      'pt-BR',
      {hour: '2-digit', minute: '2-digit'}
    );
  }
}, 1000);

setInterval(verificarDicas, 5000);

/* ---------- Inicialização ---------- */

async function init() {
  if (pid) {
    try {
      const r = await fetch('/api/estado/' + encodeURIComponent(pid));
      if (r.ok) {
        const d = await r.json();
        if (d.status === 'jogando' || d.status === 'finalizado') {
          pregame = 'jogo';
          $('inicio').hidden = true;
          $('desk').hidden = false;
          $('grade').hidden = false;
          await atualizar();
          if (est?.status === 'jogando') {
            reiniciarRelogioDicas();
            clearInterval(poll);
            poll = setInterval(atualizar, 2000);
          }
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  $('inicio').hidden = false;
}

$('nome')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') comecar();
});

init();