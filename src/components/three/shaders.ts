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
   1. Um CÍRCULO grande, com o centro fora da tela à esquerda — aparece
      "cortado" pela borda. Iluminado de um lado (como uma esfera/planeta),
      com a borda levemente mais clara.
   2. Animação leve: o raio "respira" e o centro flutua alguns pixels;
      uma névoa (ruído de 3 oitavas) desliza devagar por dentro.
   2b. ONDAS: anéis concêntricos saem do centro e atravessam o círculo,
      como ondulação na água. Eles adensam o grão nas cristas e deslocam
      os pontos alguns pixels na direção da onda (o grão "escorre" junto).
   3. Grão: cada pixel compara a luz com um número aleatório FIXO daquele
      pixel (pontilhismo). O grão não pisca — só a luz se move.
   Distâncias em "alturas de tela" (corrige a proporção), então o círculo
   é sempre redondo. O grão é por pixel de CSS (divide por uPixelRatio).
   ========================================================================= */

export const grainFragment = /* glsl */ `
uniform float uTime;
uniform vec2  uRes;        // tamanho do canvas em pixels
uniform float uPixelRatio;
uniform vec2  uMouse;      // cursor em 0..1
uniform vec3  uTint;       // cor do grão (tema)
uniform float uIntensity;  // 0 = desligado
uniform float uRadius;     // raio do círculo (em alturas de tela)

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
  vec2 q = vec2(uv.x * aspect, uv.y);              // coordenadas "redondas"

  // Centro fora da tela à esquerda (~35% do raio para fora), flutuando de leve.
  float R = uRadius * (1.0 + 0.025 * sin(t * 0.21));
  vec2 c = vec2(-R * 0.35 + 0.012 * sin(t * 0.13), 0.52 + 0.025 * cos(t * 0.09));
  vec2 d = q - c;
  float dist = length(d);

  // Disco com borda suave (1 = dentro, 0 = fora).
  float disc = 1.0 - smoothstep(R - 0.035, R + 0.005, dist);

  // Ondas concêntricas indo para fora. Um leve "tremor" angular deixa os
  // anéis orgânicos em vez de perfeitamente circulares.
  float ang = atan(d.y, d.x);
  float phase = dist * 38.0 - t * 1.6 + 0.35 * sin(ang * 5.0 + t * 0.4);
  float crest = pow(0.5 + 0.5 * sin(phase), 3.0);     // cristas mais finas

  // Sombreamento de esfera: mais luz no lado de cima/direita, aro claro.
  vec2 n = d / R;
  float lit = clamp(dot(n, normalize(vec2(0.75, 0.55))), 0.0, 1.0);
  float rim = smoothstep(0.7, 1.0, dist / R);
  float shade = 0.32 + 0.45 * lit + 0.3 * rim;

  // Névoa deslizando por dentro do círculo.
  float fog = fbm(q * 2.2 + vec2(t * 0.02, -t * 0.015));
  float light = disc * shade * (0.55 + 0.6 * fog) * (0.25 + 1.45 * crest);

  // Leve reforço perto do cursor (só dentro do círculo).
  vec2 m = (uv - uMouse) * vec2(aspect, 1.0);
  light += disc * 0.12 * exp(-dot(m, m) * 8.0);

  light = clamp(light * uIntensity, 0.0, 1.0);

  // Grão: pontos acesos onde o aleatório fixo do pixel é menor que a luz.
  // Dentro do círculo o padrão do grão é deslocado até ~3 px na direção
  // radial, acompanhando a onda — os pontos parecem ondular.
  vec2 push = (d / max(dist, 1e-4)) * sin(phase) * 3.0 * disc;
  float g = hash(floor((gl_FragCoord.xy / uPixelRatio) + push));
  float dotOn = step(g, light * light * 0.95);

  float alpha = dotOn * 0.5 + light * 0.05;     // grão + véu bem fraco
  gl_FragColor = vec4(uTint, alpha);
}
`;
