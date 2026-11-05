/* =========================================================================
   panel.js — Painel de calibração do fundo
   -------------------------------------------------------------------------
   Inspirado no Tweakpane do p5aholic.me: deixa o visitante "brincar" com os
   parâmetros do shader em tempo real. Abre pelo botão "Calibrar" ou pela
   tecla C; fecha com "Fechar" ou Esc.

   - Desktop: cartão flutuante no canto inferior direito.
   - Mobile: vira uma "bottom sheet" de largura total, com rolagem interna
     e controles maiores para o dedo (ver .panel em style.css).
   - Nada é salvo: toda visita começa com os DEFAULTS de field.js.
   ========================================================================= */
import { DEFAULTS } from './field.js';

/** Controles deslizantes: chave do parâmetro, rótulo e limites. */
const CONTROLS = [
  { key: 'freq', label: 'Frequência', min: 0.4, max: 4, step: 0.05 },
  { key: 'warp', label: 'Ruído', min: 0, max: 4, step: 0.05 },
  { key: 'density', label: 'Densidade', min: 4, max: 32, step: 1 },
  { key: 'speed', label: 'Velocidade', min: 0, max: 1.5, step: 0.01 },
  { key: 'glow', label: 'Resposta ao cursor', min: 0, max: 2, step: 0.05 },
  { key: 'alpha', label: 'Intensidade', min: 0, max: 0.8, step: 0.01 },
];

/** Paletas disponíveis (o mapeamento de cores fica em field.js → readColors). */
const PALETTES = [
  { id: 'lilas', label: 'Lilás' },
  { id: 'rosa', label: 'Rosa' },
  { id: 'neon', label: 'Neon' },
];

/** Formata o valor exibido: 2 casas para passos decimais, inteiro caso contrário. */
const fmt = (v, step) => (step < 1 ? Number(v).toFixed(2) : String(v));

/**
 * Monta o painel dentro de `el`.
 * @param {HTMLElement} el    elemento <aside id="panel">
 * @param {object|null} field API retornada por createField (null = sem WebGL)
 * @param {{ onToggle?: (open: boolean) => void }} [opts]
 * @returns {{ open(): void, close(): void, toggle(): void, readonly isOpen: boolean }}
 */
export function createPanel(el, field, { onToggle } = {}) {
  const off = field ? '' : 'disabled';

  /* --- Markup --- */
  el.innerHTML = `
    <header class="panel__head">
      <h2 class="panel__title">Calibração do campo</h2>
      <button type="button" class="panel__close" data-close>Fechar</button>
    </header>
    ${field ? '' : '<p class="panel__note">Seu navegador não suporta WebGL2 ou as animações estão reduzidas. O fundo está desligado.</p>'}
    <div class="panel__rows">
      ${CONTROLS.map((c) => `
        <label class="panel__row">
          <span class="panel__label">${c.label}</span>
          <input type="range" name="${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" ${off}>
          <output class="panel__val" data-out="${c.key}"></output>
        </label>`).join('')}
      <fieldset class="panel__row panel__pal" ${off}>
        <legend class="panel__label">Paleta</legend>
        ${PALETTES.map((p) => `
          <label class="chip"><input type="radio" name="palette" value="${p.id}"><span>${p.label}</span></label>`).join('')}
      </fieldset>
    </div>
    <div class="panel__foot">
      <button type="button" class="btn btn--sm" data-pause ${off}>Pausar</button>
      <button type="button" class="btn btn--sm" data-reset ${off}>Restaurar padrão</button>
    </div>`;

  // Sem WebGL, usamos uma cópia dos padrões só para preencher os controles.
  const params = field ? field.params : { ...DEFAULTS };

  /** Copia os valores atuais dos parâmetros para os controles da tela. */
  function sync() {
    CONTROLS.forEach((c) => {
      el.querySelector(`input[name="${c.key}"]`).value = params[c.key];
      el.querySelector(`[data-out="${c.key}"]`).textContent = fmt(params[c.key], c.step);
    });
    el.querySelectorAll('input[name="palette"]').forEach((r) => (r.checked = r.value === params.palette));
  }

  /* --- Eventos dos controles (delegação: um listener para todos) --- */
  el.addEventListener('input', (e) => {
    if (!field) return;
    const { name, value } = e.target;
    if (name === 'palette') {
      field.set('palette', value);
    } else if (name) {
      const c = CONTROLS.find((x) => x.key === name);
      field.set(name, Number(value));
      el.querySelector(`[data-out="${name}"]`).textContent = fmt(value, c.step);
    }
  });

  el.querySelector('[data-close]').addEventListener('click', () => close());

  const pauseBtn = el.querySelector('[data-pause]');
  pauseBtn.addEventListener('click', () => {
    if (!field) return;
    if (field.paused) { field.play(); pauseBtn.textContent = 'Pausar'; }
    else { field.pause(); pauseBtn.textContent = 'Retomar'; }
  });

  el.querySelector('[data-reset]').addEventListener('click', () => {
    if (!field) return;
    Object.entries(DEFAULTS).forEach(([k, v]) => field.set(k, v));
    sync();
  });

  /* --- Abrir / fechar --- */
  let isOpen = false;
  let returnFocus = null; // elemento que estava focado antes de abrir

  function open() {
    isOpen = true;
    returnFocus = document.activeElement;
    el.hidden = false;
    // Espera um quadro para a transição CSS de entrada funcionar.
    requestAnimationFrame(() => el.classList.add('is-open'));
    el.querySelector('input:not([disabled]), button').focus({ preventScroll: true });
    onToggle?.(true);
  }

  function close() {
    isOpen = false;
    el.classList.remove('is-open');
    el.hidden = true;
    onToggle?.(false);
    // Devolve o foco para quem abriu (acessibilidade de teclado).
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

  sync();
  return { open, close, toggle: () => (isOpen ? close() : open()), get isOpen() { return isOpen; } };
}
