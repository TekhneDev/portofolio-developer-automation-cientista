/* =========================================================================
   grain.ts — "Luz granulada" em WebGL puro (sem three.js)
   -------------------------------------------------------------------------
   Inspirado no fundo do p5aholic.me: uma faixa de luz difusa, do lado
   esquerdo, desenhada com grão fixo, que se move devagar.

   Por que um canvas separado e não um objeto dentro da cena R3F?
   Desenhar o grão no mesmo framebuffer das partículas (que usam mistura
   aditiva + bloom) apagava as partículas em alguns aparelhos. Em canvas
   próprio, cada camada é composta pelo navegador de forma independente.

   Custo: 1 triângulo de tela cheia, ruído de 3 oitavas, sem texturas.
   - Resolução = pixels de CSS (DPR 1): o grão fica com 1 px real e o
     custo não cresce em telas retina.
   - Celular: ~24 fps (a luz se move muito devagar; não dá para notar).
   - Pausa com a aba oculta.
   ========================================================================= */
import { grainFragment } from './shaders';

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Converte o fragment shader (GLSL 1 do three) para GLSL ES 3.00.
const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
in vec2 vUv;
${grainFragment
  .replace('varying vec2 vUv;', '')
  .replace('gl_FragColor', 'outColor')}`;

export interface GrainParams {
  intensity: number;   // 0 = desligado
  speed: number;       // multiplicador de velocidade
  tint: string;        // cor CSS (#RRGGBB)
}

export function createGrain(canvas: HTMLCanvasElement, params: GrainParams) {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: false, antialias: false, alpha: true });
  if (!gl) return null;

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  // Triângulo que cobre a tela inteira.
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = Object.fromEntries(
    ['uTime', 'uRes', 'uPixelRatio', 'uMouse', 'uTint', 'uIntensity', 'uCenter'].map((n) => [n, gl.getUniformLocation(prog, n)]),
  );

  const mouse = { x: 0.2, y: 0.6, tx: 0.2, ty: 0.6 };
  let time = 0, last = performance.now(), lastDraw = 0, raf = 0, running = false;

  const hex = (h: string) => {
    const n = parseInt(h.trim().replace('#', ''), 16) || 0xc9a7ff;
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };

  function resize() {
    canvas.width = Math.max(1, innerWidth);
    canvas.height = Math.max(1, innerHeight);
    gl!.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw() {
    const w = innerWidth;
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform1f(U.uTime, time);
    gl!.uniform2f(U.uRes, canvas.width, canvas.height);
    gl!.uniform1f(U.uPixelRatio, 1);
    gl!.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl!.uniform3fv(U.uTint, hex(params.tint));
    // Celular: faixa encostada na borda e mais fraca (o texto ocupa a tela).
    gl!.uniform1f(U.uIntensity, params.intensity * (w < 700 ? 0.7 : 1));
    gl!.uniform1f(U.uCenter, w < 700 ? 0.08 : w < 1100 ? 0.14 : 0.2);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const minMs = innerWidth < 700 ? 1000 / 24 : 1000 / 60;
    if (now - lastDraw < minMs) return;
    lastDraw = now;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt * (0.4 + params.speed);
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    draw();
  }

  const onMove = (e: PointerEvent) => { mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight; };
  const onVis = () => (document.hidden ? stop() : start());
  addEventListener('resize', resize);
  addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('visibilitychange', onVis);

  function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  start();

  return {
    params,
    destroy() {
      stop();
      removeEventListener('resize', resize);
      removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
