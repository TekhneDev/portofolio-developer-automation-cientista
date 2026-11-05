/* =========================================================================
   rocket-cursor.ts — Cursor que vira "foguete" conforme a velocidade
   -------------------------------------------------------------------------
   Parado: um anel. Em movimento, o anel se deforma na direção do mouse:
   - a FRENTE continua arredondada (o bico);
   - a TRASEIRA estica e afina (o corpo);
   - perto da cauda surgem duas ALETAS;
   - atrás aparece uma pequena PROPULSÃO (3 pontos tremulando) e uma
     FAÍSCA de 4 pontas.
   Quanto mais rápido o mouse, mais forte a deformação ("intensidade").

   Como funciona:
   - O contorno é uma curva polar r(θ) com 56 pontos, onde θ = 0 aponta
     para a direção do movimento. A deformação é uma soma de termos em
     cos θ controlados pela velocidade suavizada `s` (0..1).
   - A cada quadro (gsap.ticker) recalculamos o atributo `d` do <path> e
     giramos o grupo para a direção do movimento. Nada de layout/reflow:
     só transform + atributo SVG.
   - Só em desktop com mouse e sem "movimento reduzido" (quem chama decide).
   ========================================================================= */
import gsap from 'gsap';

const NS = 'http://www.w3.org/2000/svg';
const SIZE = 120;            // área do SVG (px); o anel tem raio R0 no centro
const C = SIZE / 2;
const R0 = 14;               // raio do anel parado
const POINTS = 56;

export function mountRocketCursor(host: HTMLElement) {
  host.innerHTML = '';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute('width', String(SIZE));
  svg.setAttribute('height', String(SIZE));

  const g = document.createElementNS(NS, 'g');           // girado na direção do movimento
  const body = document.createElementNS(NS, 'path');     // contorno do foguete
  body.setAttribute('class', 'cursor__body');
  const flames = [0, 1, 2].map(() => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('class', 'cursor__flame');
    g.appendChild(c);
    return c;
  });
  const spark = document.createElementNS(NS, 'path');    // faísca de 4 pontas
  spark.setAttribute('class', 'cursor__spark');
  spark.setAttribute('d', 'M0,-5 L1.2,-1.2 L5,0 L1.2,1.2 L0,5 L-1.2,1.2 L-5,0 L-1.2,-1.2 Z');
  g.append(body, spark);
  svg.appendChild(g);
  host.appendChild(svg);

  /* --- Estado --- */
  const pos = { x: -200, y: -200 };      // posição desenhada (persegue o mouse)
  const target = { x: -200, y: -200 };
  let vx = 0, vy = 0;                     // velocidade suavizada (px/quadro)
  let angle = 0;                          // direção (rad)
  let s = 0;                              // intensidade 0..1
  let hot = 0, hotTarget = 0;             // sobre link/botão: anel cresce
  let t = 0;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    target.x = e.clientX; target.y = e.clientY;
    if (pos.x < -100) { pos.x = target.x; pos.y = target.y; } // primeira aparição sem "voo"
  }, { passive: true });

  document.addEventListener('pointerover', (e) => {
    hotTarget = (e.target as HTMLElement).closest('a, button, summary, label, [data-magnetic]') ? 1 : 0;
  });

  /** Raio do contorno no ângulo θ (θ = 0 → frente). */
  function radius(theta: number) {
    const c = Math.cos(theta);
    const back = Math.max(0, -c);                         // 0 na frente, 1 atrás
    const stretch = 1 + s * 2.1 * back ** 2.2;           // corpo alongado
    const squeeze = 1 - s * 0.3 * Math.sin(theta) ** 2;   // afina dos lados
    // Aletas: dois "bicos" perto da cauda (θ ≈ ±145°).
    const fin = s * 0.55 * (Math.exp(-((Math.abs(theta) - 2.55) ** 2) / 0.012));
    return R0 * (1 + hot * 0.7) * stretch * squeeze + R0 * fin;
  }

  function shape() {
    let d = '';
    for (let i = 0; i <= POINTS; i++) {
      const th = -Math.PI + (i / POINTS) * Math.PI * 2;
      const r = radius(th);
      // θ = 0 aponta para +x (direita); o grupo é girado depois.
      const x = C + Math.cos(th) * r;
      const y = C + Math.sin(th) * r;
      d += `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
    }
    return d + 'Z';
  }

  gsap.ticker.add((_, deltaMs) => {
    const k = Math.min(deltaMs / 16.7, 3);               // normaliza por 60 fps
    t += deltaMs / 1000;

    // Segue o mouse com atraso suave.
    const px = pos.x, py = pos.y;
    pos.x += (target.x - pos.x) * Math.min(1, 0.28 * k);
    pos.y += (target.y - pos.y) * Math.min(1, 0.28 * k);
    const dx = (pos.x - px) / k, dy = (pos.y - py) / k;

    vx += (dx - vx) * 0.25; vy += (dy - vy) * 0.25;
    const speed = Math.hypot(vx, vy);
    s += (Math.min(speed / 11, 1) - s) * 0.2;            // ~11 px/quadro = intensidade máxima
    if (speed > 0.6) {
      // Gira pelo caminho mais curto (evita "piruetas" ao cruzar ±180°).
      const a = Math.atan2(vy, vx);
      let diff = a - angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      angle += diff * 0.25;
    }
    hot += (hotTarget - hot) * 0.15;

    body.setAttribute('d', shape());
    g.setAttribute('transform', `rotate(${(angle * 180) / Math.PI} ${C} ${C})`);

    // Propulsão: 3 pontos atrás da cauda, tremulando; somem quando parado.
    const tail = R0 * (1 + s * 2.1);
    flames.forEach((f, i) => {
      const off = tail + 5 + i * 6 + Math.sin(t * 30 + i * 2) * 1.5 * s;
      f.setAttribute('cx', (C - off).toFixed(2));
      f.setAttribute('cy', (C + Math.sin(t * 22 + i) * 1.2 * s).toFixed(2));
      f.setAttribute('r', ((2.2 - i * 0.55) * (0.4 + s)).toFixed(2));
      f.style.opacity = String(Math.max(0, s - 0.15 - i * 0.12) * 1.4);
    });

    // Faísca: aparece com velocidade alta, girando de leve.
    const sp = Math.max(0, s - 0.45) * 1.8;
    spark.setAttribute('transform',
      `translate(${(C - tail - 26).toFixed(2)} ${(C - 6).toFixed(2)}) rotate(${(t * 90) % 360}) scale(${(0.6 + sp * 0.6).toFixed(2)})`);
    spark.style.opacity = String(Math.min(1, sp));

    host.style.transform = `translate3d(${pos.x - C}px, ${pos.y - C}px, 0)`;
  });
}
