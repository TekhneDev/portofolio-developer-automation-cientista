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
  // Nunca menor que ~1,5 px de tela: em resolução reduzida (aparelho fraco)
  // as partículas não podem sumir.
  gl_PointSize = max(uSize * uPixelRatio * (0.55 + aRand * 0.9) * (6.0 / -mv.z), 1.5);

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

/* =========================================================================
   GRÃO DE LUZ — inspirado no fundo do p5aholic.me
   -------------------------------------------------------------------------
   Fragment shader usado por grain.ts (canvas próprio, atrás das partículas):
   1. Uma faixa de luz difusa na diagonal, do lado esquerdo, que "respira"
      e desliza devagar.
   2. Névoa: ruído fractal leve (3 oitavas) modulando a faixa.
   3. Grão: cada pixel compara a luz com um número aleatório FIXO daquele
      pixel ("pontilhismo"/dithering). Onde há mais luz, mais pontos acesos.
      O grão não pisca — só a luz se move — o que deixa o efeito calmo.
   O grão é calculado por pixel de CSS (divide por uPixelRatio), então tem
   o mesmo tamanho em telas comuns e retina.
   ========================================================================= */

export const grainFragment = /* glsl */ `
uniform float uTime;
uniform vec2  uRes;        // tamanho do canvas em pixels
uniform float uPixelRatio;
uniform vec2  uMouse;      // cursor em 0..1
uniform vec3  uTint;       // cor do grão (tema)
uniform float uIntensity;  // 0 = desligado
uniform float uCenter;     // posição horizontal da faixa (0..1)

varying vec2 vUv;

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
  for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float t = uTime;

  // Faixa diagonal: inclina com a altura e desliza devagar para os lados.
  float x = uv.x - uCenter - 0.06 * sin(t * 0.11) + (uv.y - 0.5) * 0.32;
  float band = exp(-x * x * 26.0);         // faixa estreita

  // Névoa que se move dentro da faixa.
  float fog = fbm(vec2(uv.x * aspect, uv.y) * 1.6 + vec2(t * 0.025, -t * 0.018));
  float light = band * (0.35 + 0.85 * fog);

  // Um pouco de luz extra perto do cursor.
  vec2 m = (uv - uMouse) * vec2(aspect, 1.0);
  light += 0.18 * exp(-dot(m, m) * 6.0);

  // Escurece em direção à base (como um feixe vindo de cima).
  light *= mix(0.55, 1.0, uv.y);
  light = clamp(light * uIntensity, 0.0, 1.0);

  // Grão: pontos acesos onde o aleatório fixo do pixel é menor que a luz.
  float g = hash(floor(gl_FragCoord.xy / uPixelRatio));
  float dotOn = step(g, light * light * 0.9);

  float alpha = dotOn * 0.42 + light * 0.05;    // grão + véu bem fraco
  gl_FragColor = vec4(uTint, alpha);
}
`;
