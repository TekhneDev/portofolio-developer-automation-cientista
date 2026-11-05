/* =========================================================================
   shapes.ts — As quatro formas que a nuvem de partículas assume
   -------------------------------------------------------------------------
   Cada função devolve um Float32Array com `count * 3` números (x, y, z).
   Todas as formas têm o MESMO número de pontos: a partícula i da esfera
   vira a partícula i da rede, e assim por diante. O shader interpola.

   `vw` = largura visível da tela em unidades 3D (no plano z = 0). Usamos
   para que nada fique maior que a tela, principalmente no celular em pé.

   0. sphere  → dados brutos (hero)
   1. network → sistemas e integrações (projetos, lab)
   2. wave    → sinais de osciloscópio (trajetória, contratação)
   3. text    → a palavra "CARLA" (contato)
   ========================================================================= */

/** Gerador pseudoaleatório com semente: as formas saem iguais em toda visita. */
function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Esfera de Fibonacci (pontos bem distribuídos) com leve variação de raio. */
export function sphere(count: number, vw: number): Float32Array {
  const out = new Float32Array(count * 3);
  const r0 = Math.min(1.9, vw * 0.4);
  const rand = rng(7);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    const r = r0 * (0.92 + rand() * 0.16);
    out.set([Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r], i * 3);
  }
  return out;
}

/**
 * Rede: ~56 nós espalhados num volume; cada nó liga aos 2 vizinhos mais
 * próximos. 75% das partículas correm pelas arestas, 25% formam os nós.
 */
export function network(count: number, vw: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = rng(11);
  const W = Math.min(2.8, vw * 0.46), H = 1.9, D = 1.4;
  const nodes = Array.from({ length: 56 }, () => [(rand() * 2 - 1) * W, (rand() * 2 - 1) * H, (rand() * 2 - 1) * D]);

  const edges: [number, number][] = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => [j, (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2] as const)
      .filter(([j]) => j !== i)
      .sort((x, y) => x[1] - y[1])
      .slice(0, 2);
    near.forEach(([j]) => edges.push([i, j]));
  });

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (rand() < 0.75) {
      const [a, b] = edges[Math.floor(rand() * edges.length)];
      const t = rand();
      x = nodes[a][0] + (nodes[b][0] - nodes[a][0]) * t;
      y = nodes[a][1] + (nodes[b][1] - nodes[a][1]) * t;
      z = nodes[a][2] + (nodes[b][2] - nodes[a][2]) * t;
    } else {
      const n = nodes[Math.floor(rand() * nodes.length)];
      const s = 0.09;
      x = n[0] + (rand() - 0.5) * s; y = n[1] + (rand() - 0.5) * s; z = n[2] + (rand() - 0.5) * s;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/** Onda: 14 "traços" de osciloscópio empilhados em profundidade. */
export function wave(count: number, vw: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = rng(23);
  const traces = 14;
  const W = Math.min(3.4, vw * 0.55);
  for (let i = 0; i < count; i++) {
    const k = i % traces;
    const x = (rand() * 2 - 1) * W;
    const f = 1.2 + k * 0.18;
    const amp = 0.35 + 0.25 * Math.sin(k * 0.9);
    const y = Math.sin(x * f + k * 0.7) * amp * Math.exp(-(x * x) / (W * W * 1.4)) + (k - traces / 2) * 0.14;
    const z = (k / traces - 0.5) * 2.2 + (rand() - 0.5) * 0.02;
    out.set([x, y, z], i * 3);
  }
  return out;
}

/**
 * Texto: desenha a palavra num canvas 2D, lê os pixels preenchidos e
 * sorteia partículas sobre eles. A largura se ajusta à tela.
 */
export function text(count: number, vw: number, word = 'CARLA'): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = rng(31);

  const cw = 1024, ch = 300;
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Archivo (a fonte do site) se já carregou; senão, uma sans pesada do sistema.
  ctx.font = '900 230px Archivo, "Arial Black", sans-serif';
  ctx.fillText(word, cw / 2, ch / 2);

  const data = ctx.getImageData(0, 0, cw, ch).data;
  const filled: number[] = [];
  for (let y = 0; y < ch; y += 2) {
    for (let x = 0; x < cw; x += 2) {
      if (data[(y * cw + x) * 4 + 3] > 128) filled.push(x, y);
    }
  }
  if (!filled.length) return sphere(count, vw); // sem canvas 2D: cai para a esfera

  const width = Math.min(5.2, vw * 0.86);
  const scale = width / cw;
  for (let i = 0; i < count; i++) {
    const j = Math.floor(rand() * (filled.length / 2)) * 2;
    const x = (filled[j] - cw / 2) * scale + (rand() - 0.5) * scale * 2;
    const y = -(filled[j + 1] - ch / 2) * scale + (rand() - 0.5) * scale * 2;
    const z = (rand() - 0.5) * 0.25;
    out.set([x, y, z], i * 3);
  }
  return out;
}
