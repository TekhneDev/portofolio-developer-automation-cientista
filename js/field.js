/* Campo de fluxo — fundo WebGL2.
   Ruído fractal com distorção de domínio desenhado como isolinhas,
   lembrando traços de sinal. O cursor intensifica as linhas por perto. */

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uFreq;
uniform float uWarp;
uniform float uDensity;
uniform float uGlow;
uniform float uAlpha;
uniform vec3  uC1;
uniform vec3  uC2;
uniform vec3  uC3;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y;
  vec2 p  = uv * uFreq;
  float t = uTime;

  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.12)),
                fbm(p + vec2(5.2, 1.3) - t * 0.09));
  vec2 r = vec2(fbm(p + uWarp * q + vec2(1.7, 9.2) + t * 0.05),
                fbm(p + uWarp * q + vec2(8.3, 2.8)));
  float f = fbm(p + uWarp * r);

  float v = f * uDensity;
  float w = fwidth(v);
  float d = 0.5 - abs(fract(v) - 0.5);          // distância até a isolinha
  float line = 1.0 - smoothstep(w * 0.4, w * 1.4, d);

  // A cada 5 linhas, uma linha de destaque em verde.
  float major = step(4.5, mod(floor(v), 5.0));

  vec2 m = uMouse * vec2(uRes.x / uRes.y, 1.0);
  float near = 1.0 - smoothstep(0.0, 0.42, distance(uv, m));

  vec3 col = mix(uC1, uC2, smoothstep(0.25, 0.75, f));
  col = mix(col, uC3, major * 0.85);

  float a = line * (uAlpha + near * uGlow * 0.6) * (0.55 + 0.45 * major);
  a = clamp(a, 0.0, 1.0);
  outColor = vec4(col * a, a);
}`;

// Valores com que o site sempre abre.
export const DEFAULTS = {
  freq: 3.35,
  warp: 1.3,
  density: 16,
  speed: 0.4,
  glow: 1.55,
  alpha: 0.22,
  palette: 'rosa',
};

function hexToRgb(hex) {
  const h = hex.trim().replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

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

export function createField(canvas, initial = {}) {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['uRes', 'uTime', 'uMouse', 'uFreq', 'uWarp', 'uDensity', 'uGlow', 'uAlpha', 'uC1', 'uC2', 'uC3']
    .forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

  const params = { ...DEFAULTS, ...initial };
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let colors = [[0.7, 0.6, 1], [1, 0.4, 0.6], [0.2, 1, 0.5]];
  let time = 0, last = performance.now(), raf = 0, running = false;

  function resize() {
    const small = innerWidth < 700;
    const scale = Math.min(devicePixelRatio || 1, 1.5) * (small ? 0.5 : 0.75);
    canvas.width = Math.max(1, Math.round(innerWidth * scale));
    canvas.height = Math.max(1, Math.round(innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    const map = {
      lilas: ['--lilas', '--rosa', '--neon'],
      rosa: ['--rosa', '--roxo', '--lilas'],
      neon: ['--neon-escuro', '--neon', '--lilas'],
    }[params.palette] || ['--lilas', '--rosa', '--neon'];
    colors = map.map((v) => hexToRgb(cs.getPropertyValue(v) || '#ffffff'));
  }

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

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt * params.speed;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    draw();
    raf = requestAnimationFrame(frame);
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

  addEventListener('resize', () => { resize(); draw(); });
  addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX / innerWidth;
    mouse.ty = 1 - e.clientY / innerHeight;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!api.paused) start();
  });

  const api = {
    params,
    paused: false,
    set(key, value) {
      params[key] = value;
      if (key === 'palette') readColors();
      if (!running) draw();
    },
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
