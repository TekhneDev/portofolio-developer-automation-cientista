/* =========================================================================
   ui.ts — Interações da interface (sem animação; essa fica em motion.ts)
   -------------------------------------------------------------------------
   Com View Transitions (ClientRouter) a página não recarrega: o HTML é
   trocado. Por isso tudo que depende do DOM roda em `astro:page-load`,
   e os listeners da página anterior são removidos com um AbortController
   em `astro:before-swap`.

   Itens:
   1. Navegação: seção ativa no menu + menu em tela cheia no celular
   2. Preferências: tema, som e "Calibrar" (cena 3D)
   3. Filtro da trajetória
   4. Copiar e-mail
   5. Altura do header (âncoras não ficam escondidas atrás dele)
   ========================================================================= */
import { EVT, emit } from '../lib/bus';

const root = document.documentElement;
const mobileQuery = matchMedia('(max-width: 699px)');
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

/** localStorage protegido (aba anônima / storage bloqueado não quebram nada). */
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* sem storage */ } },
};

/* ---------- Som: "blip" gerado na hora (Web Audio), desligado por padrão ---------- */
let soundOn = store.get('cb-sound') === 'on';
let audio: AudioContext | undefined;
export function blip(freq = 660) {
  if (!soundOn) return;
  audio ??= new AudioContext();
  const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.66, t + 0.06);
  g.gain.setValueAtTime(0.04, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  o.connect(g).connect(audio.destination);
  o.start(t);
  o.stop(t + 0.09);
}

/* =========================================================================
   Listeners GLOBAIS (registrados uma vez, valem para todas as páginas)
   ========================================================================= */

// Tecla C abre/fecha a calibração (ignorada ao digitar em campos).
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() !== 'c' || e.metaKey || e.ctrlKey || e.altKey) return;
  if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return;
  emit(EVT.panel);
});

// O botão "Calibrar" reflete se o painel está aberto.
window.addEventListener(EVT.panelState, (e) => {
  const open = (e as CustomEvent<{ open: boolean }>).detail.open;
  $('.pref[data-pref="panel"]')?.setAttribute('aria-pressed', String(open));
});

/* =========================================================================
   Profundidade do fundo na rolagem — fallback
   Onde o CSS já suporta animation-timeline: scroll(), nada aqui roda.
   Senão, escreve --depth (0 → 1) no <html>, no máximo uma vez por quadro.
   ========================================================================= */
if (!CSS.supports('animation-timeline: scroll()')) {
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
    root.style.setProperty('--depth', (p * (2 - p)).toFixed(3)); // ease-out: escurece cedo, assenta no fim
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue, { passive: true });
  document.addEventListener('astro:page-load', queue);
}

/* =========================================================================
   Inicialização por página
   ========================================================================= */
let page: AbortController | null = null;

document.addEventListener('astro:before-swap', () => {
  page?.abort();
  setMenu(false);
});

document.addEventListener('astro:page-load', () => {
  page?.abort();
  page = new AbortController();
  const { signal } = page;

  setupNav(signal);
  setupPrefs(signal);
  setupFilter(signal);
  setupCopy(signal);
  setupHeaderHeight(signal);
});

/* ---------- 1. Navegação ---------- */
function setMenu(open: boolean) {
  const btn = $('.menu-btn');
  root.classList.toggle('menu-open', open);
  btn?.setAttribute('aria-expanded', String(open));
  const label = $('.menu-btn__label');
  if (label) label.textContent = open ? 'Fechar' : 'Menu';
  const main = $('main');
  if (main) main.inert = open;           // conteúdo atrás não recebe foco/toque
  emit(EVT.lock, open);                   // pausa a rolagem suave
  if (open) $('.nav__list a')?.focus({ preventScroll: true });
}

function setupNav(signal: AbortSignal) {
  const links = $$<HTMLAnchorElement>('.nav__list a');

  // Seção ativa: a que cruza a faixa entre 40% e 45% da altura da tela.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.toggleAttribute('aria-current', a.dataset.section === en.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach((a) => { const s = document.getElementById(a.dataset.section!); if (s) io.observe(s); });
  signal.addEventListener('abort', () => io.disconnect());

  const btn = $('.menu-btn');
  btn?.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')), { signal });
  links.forEach((a) => a.addEventListener('click', () => setMenu(false), { signal }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); btn?.focus(); }
  }, { signal });
  // Girou o celular / alargou a janela: fecha o menu mobile.
  mobileQuery.addEventListener('change', (e) => { if (!e.matches) setMenu(false); }, { signal });
}

/* ---------- 2. Preferências ---------- */
function setupPrefs(signal: AbortSignal) {
  const btn = (k: string) => $(`.pref[data-pref="${k}"]`)!;

  const syncTheme = () => {
    const light = root.dataset.theme === 'light';
    btn('theme').setAttribute('aria-pressed', String(light));
    $<HTMLMetaElement>('meta[name="theme-color"]')!.content = light ? '#F5F0FB' : '#0E0A14';
  };
  const syncSound = () => btn('sound').setAttribute('aria-pressed', String(soundOn));

  btn('theme').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    store.set('cb-theme', root.dataset.theme);
    syncTheme();
    emit(EVT.theme);
    blip(700);
  }, { signal });

  btn('sound').addEventListener('click', () => {
    soundOn = !soundOn;
    store.set('cb-sound', soundOn ? 'on' : 'off');
    syncSound();
    blip(880);
  }, { signal });

  // Calibrar: no celular o botão fica dentro do menu, então fecha o menu antes.
  btn('panel').addEventListener('click', () => {
    if (mobileQuery.matches) setMenu(false);
    emit(EVT.panel);
  }, { signal });

  // Card do Lab "Nuvem de dados em 3D" também abre o painel.
  $$('[data-action="panel"]').forEach((b) => b.addEventListener('click', () => emit(EVT.panel, { open: true }), { signal }));

  syncTheme(); syncSound();
}

/* ---------- 3. Filtro da trajetória (multi-seleção; mínimo 1 ligado) ---------- */
function setupFilter(signal: AbortSignal) {
  const box = $('.filter');
  if (!box) return;
  const msg = $('.filter__msg')!;
  box.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-type]');
    if (!b) return;
    const on = b.getAttribute('aria-pressed') === 'true';
    if (on && $$('.filter [aria-pressed="true"]').length === 1) {
      msg.textContent = 'Mantenha pelo menos uma área selecionada.';
      return;
    }
    msg.textContent = '';
    b.setAttribute('aria-pressed', String(!on));
    const active = $$('.filter [aria-pressed="true"]').map((x) => x.dataset.type);
    $$('.timeline .tl').forEach((li) => (li.hidden = !active.includes(li.dataset.type)));
    emit(EVT.layout);
    blip(780);
  }, { signal });
}

/* ---------- 4. Copiar e-mail ---------- */
function setupCopy(signal: AbortSignal) {
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const status = $('.contact__status');
    const value = b.dataset.copy!;
    try {
      await navigator.clipboard.writeText(value);
      if (status) status.textContent = 'E-mail copiado.';
    } catch {
      if (status) status.textContent = `Não foi possível copiar. Use ${value}.`;
    }
    blip(990);
  }, { signal }));
}

/* ---------- 5. Altura do header → --header-h ---------- */
function setupHeaderHeight(signal: AbortSignal) {
  const header = $('.side');
  if (!header) return;
  const update = () => root.style.setProperty('--header-h', `${header.offsetHeight}px`);
  const ro = new ResizeObserver(update);
  ro.observe(header);
  signal.addEventListener('abort', () => ro.disconnect());
  update();
}
