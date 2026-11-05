import {
  profile, skills, projects, lab, timeline, timelineTypes,
  publications, awards, hiring, steps, faq,
} from './data.js';
import { createField } from './field.js';
import { createPanel } from './panel.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* sem storage */ } },
};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;

/* ---------- Sparkline ---------- */
function sparkline(points, w = 72, h = 22) {
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const xy = points.map((p, i) => [
    (i / (points.length - 1)) * (w - 4) + 2,
    h - 2 - ((p - min) / span) * (h - 4),
  ]);
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lx, ly] = xy[xy.length - 1];
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
    <path d="${d}" /><circle cx="${lx}" cy="${ly}" r="2.2" /></svg>`;
}

const STATUS = { producao: 'Em produção', experimento: 'Experimento' };
const status = (s) => `<span class="status status--${s}"><span class="led"></span>${STATUS[s]}</span>`;
const stackedTitle = (t) => t.split('\n').map((l) => `<span>${esc(l)}</span>`).join('');

/* ---------- Render ---------- */
function render() {
  $('#lede').textContent = profile.lede;
  $('#year').textContent = new Date().getFullYear();
  $('#cv-link').href = profile.cv;

  $('#avail').innerHTML = profile.availability.map((a) => `
    <div><dt>${esc(a.label)}</dt><dd>${a.live ? '<span class="led led--live"></span>' : ''}${esc(a.value)}</dd></div>`).join('');

  $('#socials').innerHTML = profile.socials.map((s) => `
    <li><a href="${esc(s.href)}" ${s.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${esc(s.label)}</a></li>`).join('');

  $('#skills').innerHTML = skills.map((s) => `
    <li class="skill">
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.text)}</p>
      <ul class="tags">${s.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </li>`).join('');

  $('#projects').innerHTML = projects.map((p, i) => `
    <li>
      <button type="button" class="proj" data-id="${esc(p.id)}" aria-haspopup="dialog">
        <span class="proj__i">${String(i + 1).padStart(2, '0')}</span>
        <span class="proj__title">${stackedTitle(p.title)}</span>
        <span class="proj__meta">
          <span class="proj__year">${p.year}</span>
          <span class="proj__role">${esc(p.role)}</span>
        </span>
        <span class="proj__data">
          <span class="proj__metric"><strong>${esc(p.metric.value)}</strong> ${esc(p.metric.label)}</span>
          ${sparkline(p.spark)}
          ${status(p.status)}
        </span>
      </button>
    </li>`).join('');

  $('#lab-list').innerHTML = lab.map((l) => {
    const inner = `
      <h3>${esc(l.title)}</h3>
      <p>${esc(l.text)}</p>
      <ul class="tags">${l.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    if (l.action === 'panel') return `<li><button type="button" class="lab__item" data-action="panel">${inner}<span class="lab__go">Abrir calibração</span></button></li>`;
    if (l.href) return `<li><a class="lab__item" href="${esc(l.href)}" target="_blank" rel="noopener">${inner}<span class="lab__go">Ver código</span></a></li>`;
    return `<li><div class="lab__item">${inner}<span class="lab__go lab__go--muted">Em breve</span></div></li>`;
  }).join('');

  $('#filter').innerHTML = timelineTypes.map((t) => `
    <button type="button" class="chip-btn" data-type="${t.id}" aria-pressed="true">${esc(t.label)}</button>`).join('');

  $('#timeline').innerHTML = timeline.map((t) => `
    <li class="tl" data-type="${t.type}">
      <span class="tl__period">${esc(t.period)}</span>
      <div class="tl__body">
        <h3>${esc(t.role)} <span class="tl__org">· ${esc(t.org)}</span></h3>
        <p>${esc(t.text)}</p>
        <ul class="tags">${t.tags.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
      <span class="tl__type">${esc(timelineTypes.find((x) => x.id === t.type)?.label)}</span>
    </li>`).join('');

  $('#pubs').innerHTML = publications.map((p) => `
    <li>
      ${p.href ? `<a href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : `<span>${esc(p.title)}</span>`}
      <span class="pubs__meta">${esc(p.venue)} · ${p.year}</span>
    </li>`).join('');

  $('#awards').innerHTML = awards.map((g) => `
    <div class="awards__group">
      <h4>${esc(g.org)}</h4>
      <ul>${g.items.map((i) => `<li><span>${esc(i.title)}</span><span class="awards__y">${i.year}</span></li>`).join('')}</ul>
    </div>`).join('');

  $('#hire').innerHTML = hiring.map((h) => `
    <article class="hire__card hire__card--${h.id}">
      <h3>${esc(h.title)}</h3>
      <p class="hire__for">${esc(h.for)}</p>
      <ul>${h.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      <p class="hire__fmt">${esc(h.format)}</p>
    </article>`).join('');

  $('#steps').innerHTML = steps.map((s, i) => `
    <li><span class="steps__n">${i + 1}</span><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></li>`).join('');

  $('#faq').innerHTML = faq.map((f) => `
    <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');

  $('#mail').href = `mailto:${profile.email}`;
  $('#mail').textContent = profile.email;
  $('#whats').href = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(profile.whatsappMsg)}`;
}

/* ---------- Som (desligado por padrão) ---------- */
let soundOn = store.get('cb-sound') === 'on';
let audio;
function blip(freq = 660) {
  if (!soundOn) return;
  audio ??= new (window.AudioContext || window.webkitAudioContext)();
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

/* ---------- Detalhe do projeto ---------- */
function openProject(id, trigger) {
  const p = projects.find((x) => x.id === id);
  if (!p) return;
  const sheet = $('#sheet');
  const link = (href, label) => href ? `<a class="btn" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>` : '';
  const links = [link(p.links.github, 'Código no GitHub'), link(p.links.demo, 'Ver demo'), link(p.links.case, 'Ler estudo de caso')].join('');

  $('#sheet-body').innerHTML = `
    <header class="sheet__head">
      <p class="eyebrow">${p.year} · ${esc(p.role)}</p>
      <button type="button" class="sheet__close" data-close>Fechar <kbd>Esc</kbd></button>
    </header>
    <h2 class="sheet__title" id="sheet-title">${stackedTitle(p.title)}</h2>
    <div class="sheet__status">${status(p.status)}</div>
    <dl class="facts">
      <div><dt>Cliente</dt><dd>${esc(p.client)}</dd></div>
      <div><dt>Duração</dt><dd>${esc(p.period)}</dd></div>
      <div><dt>Papel</dt><dd>${esc(p.role)}</dd></div>
    </dl>
    <div class="sheet__cols">
      <section><h3>Problema</h3><p>${esc(p.problem)}</p></section>
      <section><h3>Solução</h3><p>${esc(p.solution)}</p></section>
    </div>
    <h3 class="sheet__sub">Resultado</h3>
    <ul class="results">${p.results.map((r) => `<li><strong>${esc(r.value)}</strong><span>${esc(r.label)}</span></li>`).join('')}</ul>
    <h3 class="sheet__sub">Stack</h3>
    <ul class="tags tags--lg">${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    ${links ? `<div class="sheet__links">${links}</div>` : ''}
    <button type="button" class="btn sheet__back" data-close>Voltar aos projetos</button>`;

  sheet.showModal();
  sheet.scrollTop = 0;
  blip(520);

  const onClose = () => { trigger?.focus(); sheet.removeEventListener('close', onClose); };
  sheet.addEventListener('close', onClose);
}

function setupSheet() {
  const sheet = $('#sheet');
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet || e.target.closest('[data-close]')) sheet.close();
  });
  $('#projects').addEventListener('click', (e) => {
    const btn = e.target.closest('.proj');
    if (btn) openProject(btn.dataset.id, btn);
  });
}

/* ---------- Filtro da trajetória ---------- */
function setupFilter() {
  const msg = $('#filter-msg');
  $('#filter').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-type]');
    if (!btn) return;
    const pressed = $$('#filter [aria-pressed="true"]');
    if (btn.getAttribute('aria-pressed') === 'true' && pressed.length === 1) {
      msg.textContent = 'Mantenha pelo menos uma área selecionada.';
      return;
    }
    msg.textContent = '';
    btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    const on = $$('#filter [aria-pressed="true"]').map((b) => b.dataset.type);
    $$('#timeline .tl').forEach((li) => (li.hidden = !on.includes(li.dataset.type)));
    blip(780);
  });
}

/* ---------- Navegação: seção ativa + menu mobile ---------- */
function setupNav() {
  const links = $$('.nav__list a');
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      map.get(en.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });

  const btn = $('.menu-btn');
  const setMenu = (open) => {
    root.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    $('.menu-btn__label').textContent = open ? 'Fechar' : 'Menu';
  };
  btn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  links.forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); btn.focus(); }
  });
}

/* ---------- Preferências ---------- */
function setupPrefs(field, panel) {
  const btn = (k) => $(`.pref[data-pref="${k}"]`);
  const syncTheme = () => {
    const light = root.dataset.theme === 'light';
    btn('theme').setAttribute('aria-pressed', String(light));
    $('meta[name="theme-color"]').content = light ? '#F5F0FB' : '#0E0A14';
    field?.refreshColors();
  };
  const syncFont = () => btn('font').setAttribute('aria-pressed', String(root.dataset.font === 'mono'));
  const syncSound = () => btn('sound').setAttribute('aria-pressed', String(soundOn));

  btn('theme').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    store.set('cb-theme', root.dataset.theme);
    syncTheme();
  });
  btn('font').addEventListener('click', () => {
    if (root.dataset.font === 'mono') delete root.dataset.font; else root.dataset.font = 'mono';
    store.set('cb-font', root.dataset.font || 'sans');
    syncFont();
  });
  btn('sound').addEventListener('click', () => {
    soundOn = !soundOn;
    store.set('cb-sound', soundOn ? 'on' : 'off');
    syncSound();
    blip(880);
  });
  btn('panel').addEventListener('click', () => panel.toggle());

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'c' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable]') || $('#sheet').open) return;
    panel.toggle();
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="panel"]')) panel.open();
  });

  syncTheme(); syncFont(); syncSound();
}

/* ---------- Copiar e-mail ---------- */
function setupContact() {
  const status = $('#copy-status');
  $('#copy-mail').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      status.textContent = 'E-mail copiado.';
    } catch {
      status.textContent = `Não foi possível copiar. Use ${profile.email}.`;
    }
    blip(990);
  });
}

/* ---------- Spotlight do cursor ---------- */
function setupSpot() {
  if (!matchMedia('(hover: hover)').matches) return;
  let raf = 0, x = 0, y = 0;
  addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      root.style.setProperty('--mx', `${x}px`);
      root.style.setProperty('--my', `${y}px`);
      raf = 0;
    });
  }, { passive: true });
}

/* ---------- Init ---------- */
render();

let field = null;
if (!reduceMotion.matches) {
  field = createField($('#field'));
  field?.start();
}
if (!field) root.classList.add('no-field');

const panel = createPanel($('#panel'), field, {
  onToggle: (open) => $('.pref[data-pref="panel"]').setAttribute('aria-pressed', String(open)),
});

setupNav();
setupSheet();
setupFilter();
setupPrefs(field, panel);
setupContact();
setupSpot();
requestAnimationFrame(() => root.classList.add('is-ready'));
