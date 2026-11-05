/* =========================================================================
   shaders.ts — GLSL da nuvem de partículas
   -------------------------------------------------------------------------
   VERTEX: posiciona cada partícula.
   1. Lê as 4 formas (atributos aSphere, aNet, aWave, aText).
   2. uMorph (0..3) diz entre quais duas formas estamos e quanto já andou.
      Cada partícula tem um atraso próprio (aRand) → a transição "escorre"
      em vez de mudar tudo de uma vez.
   3. Turbulência: um balanço senoidal suave, diferente por partícula.
   4. Cursor: empurra as partículas para fora num raio gaussiano.
   5. Tamanho do ponto diminui com a distância (perspectiva).

   FRAGMENT: desenha cada ponto como um disco com borda suave; ~8% das
   partículas usam a cor de destaque (uC3), o resto mistura uC1 → uC2.
   ========================================================================= */

export const vertex = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uSize;
uniform float uPixelRatio;
uniform float uTurb;
uniform float uMouseForce;
uniform vec3  uMouse;

attribute vec3 aSphere;
attribute vec3 aNet;
attribute vec3 aWave;
attribute vec3 aText;
attribute float aRand;

varying float vRand;
varying float vFade;

vec3 shapeAt(float i) {
  if (i < 0.5) return aSphere;
  if (i < 1.5) return aNet;
  if (i < 2.5) return aWave;
  return aText;
}

void main() {
  float m  = clamp(uMorph, 0.0, 3.0);
  float i0 = floor(m);
  float i1 = min(i0 + 1.0, 3.0);
  // Atraso por partícula: as primeiras começam antes, as últimas depois.
  float f  = smoothstep(0.0, 1.0, clamp(fract(m) * 1.5 - aRand * 0.5, 0.0, 1.0));
  if (m >= 3.0) f = 0.0;

  vec3 p = mix(shapeAt(i0), shapeAt(i1), f);

  // Turbulência suave (menor quando o texto está formado, para ficar legível).
  float textW = smoothstep(2.4, 3.0, m);
  float t = uTime;
  p += uTurb * (1.0 - textW * 0.8) * 0.06 * vec3(
    sin(t * 0.7 + aRand * 40.0 + p.y * 1.3),
    cos(t * 0.6 + aRand * 30.0 + p.x * 1.1),
    sin(t * 0.5 + aRand * 20.0)
  );

  // Repulsão do cursor (no plano da tela).
  vec4 world = modelMatrix * vec4(p, 1.0);
  vec2 d = world.xy - uMouse.xy;
  float push = uMouseForce * exp(-dot(d, d) * 1.6);
  world.xy += normalize(d + 1e-4) * push * 0.5;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.55 + aRand * 0.9) * (6.0 / -mv.z);

  vRand = aRand;
  vFade = smoothstep(9.0, 3.5, -mv.z);   // partículas mais longe ficam mais fracas
}
`;

export const fragment = /* glsl */ `
uniform vec3  uC1;
uniform vec3  uC2;
uniform vec3  uC3;
uniform float uOpacity;

varying float vRand;
varying float vFade;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.05, d);
  vec3 col = vRand < 0.08 ? uC3 : mix(uC1, uC2, vRand);
  gl_FragColor = vec4(col, a * uOpacity * vFade);
}
`;
