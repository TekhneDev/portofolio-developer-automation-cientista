/* =========================================================================
   motion.ts — Animações (GSAP + ScrollTrigger + SplitText) e rolagem (Lenis)
   -------------------------------------------------------------------------
   Regra de ouro: com "movimento reduzido" ligado NADA aqui anima — o
   conteúdo aparece direto e a rolagem é a nativa.
   Reveals usam só `opacity` (nunca visibility/display): o conteúdo ainda
   não revelado continua acessível ao teclado e a leitores de tela.

   O que roda em cada página (astro:page-load):
   1. Entrada do hero: nome letra por letra (SplitText) + lede, disponibilidade, botões
   2. Títulos de seção: palavras sobem com máscara ao entrar na tela
   3. Reveal: [data-reveal] e filhos de [data-reveal-group] em cascata
   4. Sparklines se "desenham"; números de resultado contam de 0 até o valor
   5. Linha da trajetória cresce com o scroll (scrub)
   6. Forma da nuvem 3D segue a seção visível ([data-morph])
   7. Desktop com mouse: cursor "foguete" + botões magnéticos

   Lenis (rolagem suave) só atua em roda do mouse/trackpad; no toque a
   rolagem continua nativa (melhor no celular).
   ========================================================================= */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { sceneState, EVT } from '../lib/bus';
import { mountRocketCursor } from './rocket-cursor';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* =========================================================================
   Lenis — criado uma vez e mantido entre páginas
   ========================================================================= */
let lenis: Lenis | null = null;

if (!reduce) {
  lenis = new Lenis({ autoRaf: false, lerp: 0.12, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Menu do celular aberto → pausa a rolagem suave.
  window.addEventListener(EVT.lock, (e) => ((e as CustomEvent<boolean>).detail ? lenis!.stop() : lenis!.start()));

  // Links âncora (#projetos…) com rolagem suave, descontando o header fixo.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = document.querySelector(a.getAttribute('href')!);
    if (!target) return;
    e.preventDefault();
    const header = window.innerWidth < 1100 ? (parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 0) : 0;
    lenis!.scrollTo(target as HTMLElement, { offset: -(header + 16) });
    history.pushState(null, '', a.hash);
  });
}

/* =========================================================================
   Cursor "foguete" (só desktop com mouse): anel que estica na direção do
   movimento e vira foguete com a velocidade. Ver rocket-cursor.ts.
   ========================================================================= */
if (finePointer && !reduce) {
  const host = document.querySelector<HTMLElement>('.cursor');
  if (host) {
    root.classList.add('has-cursor');
    host.classList.add('is-hidden'); // só aparece no primeiro movimento do mouse
    mountRocketCursor(host);
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse') host.classList.remove('is-hidden');
    }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      host.classList.toggle('is-hot', !!(e.target as HTMLElement).closest('a, button, summary, label, [data-magnetic]'));
    });
    document.addEventListener('pointerleave', () => host.classList.add('is-hidden'));
    document.addEventListener('pointerenter', () => host.classList.remove('is-hidden'));
  }
}

/* =========================================================================
   Por página
   ========================================================================= */
let ctx: gsap.Context | null = null;
const splits: SplitText[] = [];

// Filtro da trajetória mudou a altura da página → recalcula os gatilhos.
window.addEventListener(EVT.layout, () => ScrollTrigger.refresh());

document.addEventListener('astro:before-swap', () => {
  ctx?.revert();
  splits.splice(0).forEach((s) => s.revert());
});

document.addEventListener('astro:page-load', () => {
  root.classList.add('is-ready');
  setupMorph();
  if (reduce) return;

  lenis?.resize();
  ctx = gsap.context(() => {
    heroIntro();
    sectionTitles();
    reveals();
    sparklines();
    counters();
    timelineLine();
    if (finePointer) magnetic();
  });
  // Recalcula posições depois que as fontes carregam (alturas mudam).
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
});

/* ---------- 1. Hero ---------- */
function heroIntro() {
  const name = document.querySelector('.hero__name');
  if (!name) return;
  const split = SplitText.create(name, { type: 'chars', mask: 'chars' });
  splits.push(split);
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from(split.chars, { yPercent: 110, duration: 1.1, stagger: 0.035 })
    .from('.hero .eyebrow, .hero__lede, .avail, .hero__cta', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.25);
}

/* ---------- 2. Títulos de seção ---------- */
function sectionTitles() {
  document.querySelectorAll<HTMLElement>('.sec__head [data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', mask: 'words' });
    splits.push(split);
    gsap.from(split.words, {
      yPercent: 100, duration: 0.8, ease: 'power4.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ---------- 3. Reveal ---------- */
function reveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 32, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
  gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
    gsap.from(group.children, {
      y: 28, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07,
      scrollTrigger: { trigger: group, start: 'top 88%', once: true },
    });
  });
}

/* ---------- 4a. Sparklines se desenham ---------- */
function sparklines() {
  gsap.utils.toArray<SVGSVGElement>('[data-draw]').forEach((svg) => {
    const path = svg.querySelector('path');
    const dot = svg.querySelector('circle');
    if (!path) return;
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(dot, { scale: 0, transformOrigin: 'center' });
    gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 92%', once: true } })
      .to(path, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' })
      .to(dot, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, '-=0.2');
  });
}

/* ---------- 4b. Contadores: "−95%", "12 mil", "0,3%"… contam de 0 ---------- */
function counters() {
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const raw = el.textContent ?? '';
    const m = raw.match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return;
    const [prefix, suffix] = [raw.slice(0, m.index), raw.slice(m.index! + m[0].length)];
    const decimals = (m[1].split(/[.,]/)[1] ?? '').length;
    const target = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
    const fmt = (v: number) => prefix + v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    const obj = { v: 0 };
    el.textContent = fmt(0);
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out',
      onUpdate: () => (el.textContent = fmt(obj.v)),
      onComplete: () => (el.textContent = raw),   // garante o texto original exato
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/* ---------- 5. Linha da trajetória ---------- */
function timelineLine() {
  const line = document.querySelector('.timeline__line');
  if (!line) return;
  gsap.fromTo(line, { scaleY: 0 }, {
    scaleY: 1, ease: 'none', transformOrigin: 'top',
    scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 60%', scrub: true },
  });
}

/* ---------- 6. Forma da nuvem por seção ---------- */
function setupMorph() {
  const sections = document.querySelectorAll<HTMLElement>('[data-morph]');
  // Página com um único bloco (estudo de caso): fixa a forma.
  if (sections.length === 1) { sceneState().morph = Number(sections[0].dataset.morph); return; }
  if (reduce) return; // sem cena 3D, não precisa
  sections.forEach((s) => {
    ScrollTrigger.create({
      trigger: s, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) sceneState().morph = Number(s.dataset.morph); },
    });
  });
}

/* ---------- 7. Botões magnéticos ---------- */
function magnetic() {
  gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.25);
      y((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}
