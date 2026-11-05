/* =========================================================================
   field.js — Campo de fluxo (fundo animado em WebGL2)
   -------------------------------------------------------------------------
   O QUE FAZ
   Desenha, atrás de todo o conteúdo, linhas de contorno ("isolinhas") de um
   ruído fractal que se deforma com o tempo. O visual lembra traços de sinal
   de um osciloscópio ou um mapa topográfico de dados.

   COMO FUNCIONA (resumo)
   1. Um único triângulo cobre a tela inteira (truque mais barato que um quad).
   2. O fragment shader calcula, para cada pixel, um valor de ruído `f`
      usando fbm (soma de várias camadas de ruído) com "domain warping"
      (o ruído distorce as coordenadas de outro ruído → formas orgânicas).
   3. `f * densidade` vira uma grade de níveis; perto de cada número inteiro
      desenhamos uma linha fina, com antialias via `fwidth`.
   4. A cada 5 linhas, uma linha "principal" ganha a 3ª cor (verde neon).
   5. Perto do cursor as linhas ficam mais fortes (spotlight).

   DESEMPENHO / MOBILE
   - O canvas é renderizado em resolução reduzida (50% no celular, 75% no
     desktop) e esticado via CSS. Linhas finas suaves escondem a diferença.
   - No celular o loop roda a ~30 fps em vez de 60 → metade do gasto de GPU
     e bateria, sem diferença perceptível num fundo lento.
   - O loop pausa quando a aba fica oculta.
   - Se o navegador não tiver WebGL2, `createField` retorna null e o site
     segue normalmente sem fundo.
   ========================================================================= */

/* ---------- Shaders (GLSL ES 3.00) ---------- */

// Vertex shader: só repassa a posição; a geometria é um triângulo gigante.
const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Fragment shader: todo o desenho acontece aqui, pixel a pixel.
const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  uRes;      // resolução do canvas em pixels
uniform float uTime;     // tempo acumulado (já multiplicado pela velocidade)
uniform vec2  uMouse;    // cursor normalizado 0..1 (y para cima)
uniform float uFreq;     // escala do ruído: maior = formas menores
uniform float uWarp;     // força da distorção de domínio ("ruído")
uniform float uDensity;  // quantidade de linhas de contorno
uniform float uGlow;     // quanto o cursor reforça as linhas
uniform float uAlpha;    // intensidade base das linhas
uniform vec3  uC1;       // cor 1 (vales)
uniform vec3  uC2;       // cor 2 (picos)
uniform vec3  uC3;       // cor das linhas principais

// Hash barato: transforma uma coordenada em um número pseudoaleatório 0..1.
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Value noise 2D com interpolação suave (curva de Hermite).
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

// fbm: 5 oitavas de ruído, cada uma com o dobro da frequência e metade da
// amplitude. A rotação entre oitavas evita artefatos alinhados à grade.
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
  return v;
}

void main() {
  // Coordenadas com proporção correta (divide pela altura, não pela largura).
  vec2 uv = gl_FragCoord.xy / uRes.y;
  vec2 p  = uv * uFreq;
  float t = uTime;

  // Domain warping em duas etapas (técnica de Inigo Quilez):
  // q distorce p, r distorce p+q, e o resultado final usa r.
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.12)),
                fbm(p + vec2(5.2, 1.3) - t * 0.09));
  vec2 r = vec2(fbm(p + uWarp * q + vec2(1.7, 9.2) + t * 0.05),
                fbm(p + uWarp * q + vec2(8.3, 2.8)));
  float f = fbm(p + uWarp * r);

  // Isolinhas: distância até o inteiro mais próximo de v, com antialias.
  float v = f * uDensity;
  float w = fwidth(v);                           // tamanho de 1 pixel em "v"
  float d = 0.5 - abs(fract(v) - 0.5);           // distância até a isolinha
  float line = 1.0 - smoothstep(w * 0.4, w * 1.4, d);

  // A cada 5 linhas, uma linha de destaque (cor 3).
  float major = step(4.5, mod(floor(v), 5.0));

  // Spotlight: 1 no cursor, 0 a partir de 0.42 de distância.
  vec2 m = uMouse * vec2(uRes.x / uRes.y, 1.0);
  float near = 1.0 - smoothstep(0.0, 0.42, distance(uv, m));

  vec3 col = mix(uC1, uC2, smoothstep(0.25, 0.75, f));
  col = mix(col, uC3, major * 0.85);

  float a = line * (uAlpha + near * uGlow * 0.6) * (0.55 + 0.45 * major);
  a = clamp(a, 0.0, 1.0);
  outColor = vec4(col * a, a);                   // alpha pré-multiplicado
}`;

/* ---------- Parâmetros padrão ----------
   Valores com que o site SEMPRE abre (nada é salvo entre visitas).
   O botão "Restaurar padrão" do painel volta para estes números. */
export const DEFAULTS = {
  freq: 3.35,
  warp: 1.3,
  density: 16,
  speed: 0.4,
  glow: 1.55,
  alpha: 0.22,
  palette: 'rosa',
};

/** Converte "#RRGGBB" (ou "#RGB") em [r, g, b] de 0 a 1, formato do GLSL. */
function hexToRgb(hex) {
  const h = hex.trim().replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Compila um shader; em caso de erro, mostra o log no console e retorna null. */
function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

/**
 * Cria o campo de fluxo em um <canvas>.
 * @param {HTMLCanvasElement} canvas
 * @param {Partial<typeof DEFAULTS>} [initial] parâmetros iniciais opcionais
 * @returns {null | {
 *   params: typeof DEFAULTS, paused: boolean,
 *   set(key: string, value: any): void, refreshColors(): void,
 *   pause(): void, play(): void, start(): void, stop(): void
 * }} API de controle, ou null se WebGL2 não estiver disponível.
 */
export function createField(canvas, initial = {}) {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false });
  if (!gl) return null;

  /* --- Programa de shader --- */
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  /* --- Geometria: um triângulo que passa das bordas e cobre a tela --- */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  /* --- Localização dos uniforms (lidas uma vez) --- */
  const U = {};
  ['uRes', 'uTime', 'uMouse', 'uFreq', 'uWarp', 'uDensity', 'uGlow', 'uAlpha', 'uC1', 'uC2', 'uC3']
    .forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

  /* --- Estado --- */
  const params = { ...DEFAULTS, ...initial };
  // Cursor com suavização: (x, y) persegue (tx, ty) a cada quadro.
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let colors = [[0.7, 0.6, 1], [1, 0.4, 0.6], [0.2, 1, 0.5]];
  let time = 0, last = performance.now(), raf = 0, running = false;
  let lastDraw = 0;

  // No celular, desenha no máximo ~30 quadros por segundo (economia de bateria).
  const isSmall = () => innerWidth < 700;
  const minFrameMs = () => (isSmall() ? 1000 / 30 : 0);

  /** Ajusta o tamanho interno do canvas à tela, em resolução reduzida. */
  function resize() {
    const scale = Math.min(devicePixelRatio || 1, 1.5) * (isSmall() ? 0.5 : 0.75);
    canvas.width = Math.max(1, Math.round(innerWidth * scale));
    canvas.height = Math.max(1, Math.round(innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  /** Lê as cores da paleta atual a partir das variáveis CSS do tema ativo. */
  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    const map = {
      lilas: ['--lilas', '--rosa', '--neon'],
      rosa: ['--rosa', '--roxo', '--lilas'],
      neon: ['--neon-escuro', '--neon', '--lilas'],
    }[params.palette] || ['--lilas', '--rosa', '--neon'];
    colors = map.map((v) => hexToRgb(cs.getPropertyValue(v) || '#ffffff'));
  }

  /** Envia os uniforms e desenha um quadro. */
  function draw() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, time);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform1f(U.uFreq, params.freq);
    gl.uniform1f(U.uWarp, params.warp);
    gl.uniform1f(U.uDensity, params.density);
    gl.uniform1f(U.uGlow, params.glow);
    gl.uniform1f(U.uAlpha, params.alpha);
    gl.uniform3fv(U.uC1, colors[0]);
    gl.uniform3fv(U.uC2, colors[1]);
    gl.uniform3fv(U.uC3, colors[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Loop de animação. `dt` é limitado para não "pular" ao voltar de uma pausa. */
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - lastDraw < minFrameMs()) return;     // limitador de fps no mobile
    lastDraw = now;

    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt * params.speed;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    draw();
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  /* --- Eventos --- */
  addEventListener('resize', () => { resize(); draw(); });

  // pointermove cobre mouse, caneta e toque (no toque, o brilho segue o dedo).
  addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX / innerWidth;
    mouse.ty = 1 - e.clientY / innerHeight;
  }, { passive: true });

  // Pausa com a aba oculta; volta sozinho, a menos que o usuário tenha pausado.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!api.paused) start();
  });

  /* --- API pública --- */
  const api = {
    params,
    paused: false,
    /** Altera um parâmetro; se o loop estiver parado, redesenha uma vez. */
    set(key, value) {
      params[key] = value;
      if (key === 'palette') readColors();
      if (!running) draw();
    },
    /** Chamar após trocar o tema (as cores CSS mudam). */
    refreshColors() { readColors(); if (!running) draw(); },
    pause() { api.paused = true; stop(); },
    play() { api.paused = false; start(); },
    start,
    stop,
  };

  resize();
  readColors();
  draw();
  return api;
}
