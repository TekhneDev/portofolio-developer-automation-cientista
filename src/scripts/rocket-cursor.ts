/* =========================================================================
   rocket-cursor.ts — Cursor que vira um foguete quando o mouse se move
   -------------------------------------------------------------------------
   Parado: um anel. Em movimento, o anel se TRANSFORMA (morph ponto a ponto)
   no contorno de um foguete — bico cônico, corpo, aletas e bocal — que
   aponta para a direção do movimento. Uma janelinha aparece no corpo.
   Atrás do bocal sai uma CHAMA com cores de fogo (amarelo → laranja →
   vermelho) que tremula e cresce com a velocidade, mais algumas brasas.
   O foguete mantém as cores do site; só a chama é "fogo".

   Como funciona:
   - O contorno do foguete é um polígono (frente = +x) reamostrado em
     N pontos igualmente espaçados pelo perímetro, começando no bico.
   - O círculo tem os mesmos N pontos, começando em θ = 0 e no mesmo
     sentido. Interpolamos ponto a ponto: 0 = círculo, 1 = foguete.
   - A intensidade `s` vem da velocidade suavizada do ponteiro.
   - Tudo em SVG + transform, atualizado no gsap.ticker (sem reflow).
   - Só em desktop com mouse e sem "movimento reduzido" (quem chama decide).
   ========================================================================= */
import gsap from 'gsap';

const NS = 'http://www.w3.org/2000/svg';
const SIZE = 140;           // área do SVG (px)
const C = SIZE / 2;
const R0 = 14;              // raio do anel parado
const N = 96;               // pontos do contorno
const K = R0 * 1.15;        // escala do foguete (unidades → px)

/* Contorno do foguete em unidades (frente = +x), sentido: do bico para y<0. */
const ROCKET: [number, number][] = [
  [1.6, 0], [1.42, -0.15], [1.2, -0.28], [0.95, -0.37], [0.7, -0.42],     // bico (cone)
  [-0.72, -0.42],                                                           // corpo
  [-0.78, -0.46], [-1.12, -0.88], [-1.42, -0.9], [-1.22, -0.42],            // aleta de cima
  [-1.22, -0.3], [-1.36, -0.25], [-1.36, 0.25], [-1.22, 0.3],               // bocal
  [-1.22, 0.42], [-1.42, 0.9], [-1.12, 0.88], [-0.78, 0.46],                // aleta de baixo
  [-0.72, 0.42], [0.7, 0.42], [0.95, 0.37], [1.2, 0.28], [1.42, 0.15],      // corpo + bico
];
const NOZZLE_X = -1.36 * K;   // fim do bocal (onde nasce a chama)
const FIRE_ALPHA = 0.55;      // opacidade máxima da chama e das brasas

/** Reamostra um polígono fechado em `n` pontos igualmente espaçados no perímetro. */
function resample(poly: [number, number][], n: number): [number, number][] {
  const pts = [...poly, poly[0]];
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const out: [number, number][] = [];
  let j = 0, acc = 0;
  for (let i = 0; i < n; i++) {
    const d = (i / n) * total;
    while (acc + seg[j] < d) { acc += seg[j]; j++; }
    const t = (d - acc) / seg[j];
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t]);
  }
  return out;
}

const rocketPts = resample(ROCKET, N).map(([x, y]) => [x * K, y * K]);
// Círculo com os mesmos N pontos, começando em +x e indo para y<0 (mesmo sentido).
const circlePts = Array.from({ length: N }, (_, i) => {
  const a = -(i / N) * Math.PI * 2;
  return [Math.cos(a) * R0, Math.sin(a) * R0];
});

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export function mountRocketCursor(host: HTMLElement) {
  host.innerHTML = `
    <svg viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
      <defs>
        <!-- Chama: amarelo no bocal → laranja → vermelho na ponta -->
        <linearGradient id="cb-fire" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stop-color="#FFF3A6"/>
          <stop offset="0.35" stop-color="#FFB43B"/>
          <stop offset="0.75" stop-color="#FF5A2A"/>
          <stop offset="1" stop-color="#FF2E5B" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="cb-fire-core" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stop-color="#FFFFFF"/>
          <stop offset="0.5" stop-color="#FFE36E"/>
          <stop offset="1" stop-color="#FFB43B" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <g class="cursor__rocket">
        <path class="cursor__fire"/>
        <path class="cursor__fire-core"/>
        <circle class="cursor__ember"/><circle class="cursor__ember"/><circle class="cursor__ember"/>
        <path class="cursor__body"/>
        <circle class="cursor__window"/>
      </g>
    </svg>`;

  const g = host.querySelector<SVGGElement>('.cursor__rocket')!;
  const body = host.querySelector<SVGPathElement>('.cursor__body')!;
  const fire = host.querySelector<SVGPathElement>('.cursor__fire')!;
  const core = host.querySelector<SVGPathElement>('.cursor__fire-core')!;
  const win = host.querySelector<SVGCircleElement>('.cursor__window')!;
  const embers = [...host.querySelectorAll<SVGCircleElement>('.cursor__ember')];
  const emberLife = embers.map((_, i) => ({ t: i / embers.length, y: 0 }));

  /* --- Estado --- */
  const pos = { x: -300, y: -300 };
  const target = { x: -300, y: -300 };
  let vx = 0, vy = 0, angle = 0, s = 0, hot = 0, hotTarget = 0, t = 0;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    target.x = e.clientX; target.y = e.clientY;
    if (pos.x < -200) { pos.x = target.x; pos.y = target.y; }
  }, { passive: true });

  document.addEventListener('pointerover', (e) => {
    hotTarget = (e.target as HTMLElement).closest('a, button, summary, label, [data-magnetic]') ? 1 : 0;
  });

  /** Chama: gota que sai do bocal para trás; comprimento e ponta tremulam. */
  function flamePath(len: number, half: number, wob: number) {
    const x0 = C + NOZZLE_X + 1, x1 = x0 - len;
    return `M${x0},${C - half} C${x0 - len * 0.35},${C - half * 1.5} ${x1 + len * 0.2},${C - half * 0.5 + wob} ${x1},${C + wob}`
      + ` C${x1 + len * 0.2},${C + half * 0.5 + wob} ${x0 - len * 0.35},${C + half * 1.5} ${x0},${C + half} Z`;
  }

  gsap.ticker.add((_, deltaMs) => {
    const k = Math.min(deltaMs / 16.7, 3);
    t += deltaMs / 1000;

    // Segue o mouse com atraso suave e mede a velocidade.
    const px = pos.x, py = pos.y;
    pos.x += (target.x - pos.x) * Math.min(1, 0.28 * k);
    pos.y += (target.y - pos.y) * Math.min(1, 0.28 * k);
    const dx = (pos.x - px) / k, dy = (pos.y - py) / k;
    vx += (dx - vx) * 0.25; vy += (dy - vy) * 0.25;
    const speed = Math.hypot(vx, vy);
    s += (Math.min(speed / 11, 1) - s) * 0.2;
    if (speed > 0.6) {
      const a = Math.atan2(vy, vx);
      angle += Math.atan2(Math.sin(a - angle), Math.cos(a - angle)) * 0.25;
    }
    hot += (hotTarget - hot) * 0.15;

    // Morph círculo → foguete.
    const m = smooth(0.08, 0.5, s);
    const scale = 1 + hot * 0.6 * (1 - m);           // sobre links o anel cresce
    let d = '';
    for (let i = 0; i < N; i++) {
      const x = C + (circlePts[i][0] * (1 - m) + rocketPts[i][0] * m) * scale;
      const y = C + (circlePts[i][1] * (1 - m) + rocketPts[i][1] * m) * scale;
      d += `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
    }
    body.setAttribute('d', d + 'Z');

    // Janelinha do foguete.
    win.setAttribute('cx', (C + 0.38 * K * m).toFixed(2));
    win.setAttribute('cy', String(C));
    win.setAttribute('r', (0.17 * K * m).toFixed(2));
    win.style.opacity = String(m);

    // Chama de fogo: cresce com a velocidade e tremula (duas camadas).
    const fl = Math.max(0, s - 0.15) / 0.85;
    const flick = 0.75 + 0.25 * Math.sin(t * 38) * Math.sin(t * 23 + 1.3);
    const len = K * (0.5 + 1.9 * fl) * flick;
    const wob = Math.sin(t * 31) * 1.6 * fl;
    fire.setAttribute('d', flamePath(len, 0.27 * K, wob));
    core.setAttribute('d', flamePath(len * 0.55, 0.15 * K, wob * 0.6));
    // FIRE_ALPHA deixa a chama translúcida (o fundo aparece através dela).
    fire.style.opacity = String(Math.min(1, fl * 1.6) * m * FIRE_ALPHA);
    core.style.opacity = String(Math.min(1, fl * 1.8) * m * FIRE_ALPHA * 0.9);

    // Brasas: saem do bocal, derivam para trás e apagam.
    embers.forEach((e, i) => {
      const life = emberLife[i];
      life.t += (deltaMs / 1000) * (1.6 + i * 0.4);
      if (life.t > 1) { life.t = 0; life.y = (Math.random() - 0.5) * 0.5 * K; }
      const ex = C + NOZZLE_X - len * 0.6 - life.t * K * 1.6;
      e.setAttribute('cx', ex.toFixed(2));
      e.setAttribute('cy', (C + life.y + Math.sin(t * 9 + i) * 1.2).toFixed(2));
      e.setAttribute('r', (1.3 * (1 - life.t) + 0.3).toFixed(2));
      e.style.opacity = String(Math.max(0, fl - 0.2) * (1 - life.t) * m * FIRE_ALPHA);
    });

    g.setAttribute('transform', `rotate(${(angle * 180) / Math.PI} ${C} ${C})`);
    host.style.transform = `translate3d(${pos.x - C}px, ${pos.y - C}px, 0)`;
  });
}
