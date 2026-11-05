/* =========================================================================
   Scene.tsx — Cena 3D de fundo ("nuvem de dados")
   (carregada sob demanda por DataCloud.tsx, depois que a página fica ociosa)
   -------------------------------------------------------------------------
   Stack: three.js + React Three Fiber (R3F) + drei + postprocessing + Leva.

   O que acontece:
   - Milhares de partículas (quantidade depende do aparelho) mudam de forma
     conforme a seção visível: esfera → rede → onda → "CARLA".
     A forma-alvo vem de sceneState().morph, escrita pelo GSAP ScrollTrigger
     em scripts/motion.ts.
   - O cursor (ou o dedo) empurra as partículas.
   - Atrás delas, uma "luz granulada" (inspirada no p5aholic): faixa de luz
     difusa feita de grão fixo, do lado esquerdo, que se move devagar.
   - Painel "Calibração" (Leva) ajusta paleta, tamanho, velocidade etc.
     Abre pelo botão Calibrar / tecla C (evento cb:panel).

   Mobile e desempenho:
   - Níveis de qualidade: baixa 9 mil, média 22 mil, alta 45 mil partículas.
     "Automática" escolhe pela largura da tela e cai um nível se o FPS
     despencar (PerformanceMonitor do drei).
   - Celular: ~30 fps (frameloop "demand" + relógio próprio), DPR ≤ 1.5,
     sem bloom.
   - Sem WebGL, com "movimento reduzido" ou "economia de dados": a cena
     não é montada; fica só o fundo em CSS.
   ========================================================================= */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Leva, useControls, button } from 'leva';
import * as THREE from 'three';
import { sphere, network, wave, text } from './shapes';
import { vertex, fragment } from './shaders';
import { createGrain } from './grain';
import { sceneState, EVT, emit } from '../../lib/bus';

/* ---------- Configuração ---------- */

type Tier = 'low' | 'mid' | 'high';
const COUNTS: Record<Tier, number> = { low: 9000, mid: 22000, high: 45000 };
const TIERS: Tier[] = ['low', 'mid', 'high'];

/** Valores com que a cena sempre abre (nada é salvo entre visitas). */
const DEFAULTS = {
  paleta: 'rosa',
  tamanho: 2.0,
  velocidade: 0.4,
  turbulencia: 1,
  cursor: 1.2,
  opacidade: 0.5,
  brilho: 0.9,
  grao: 0.5,
  qualidade: 'auto',
  forma: 'auto',
};

/** Paleta → variáveis CSS (cor 1, cor 2, destaque). As cores mudam com o tema. */
const PALETTES: Record<string, [string, string, string]> = {
  rosa: ['--rosa', '--roxo', '--lilas'],
  lilas: ['--lilas', '--rosa', '--neon'],
  neon: ['--neon-escuro', '--neon', '--lilas'],
};

const isMobile = () => window.innerWidth < 700;
const autoTier = (): Tier => (window.innerWidth < 700 ? 'low' : window.innerWidth < 1100 ? 'mid' : 'high');

/** Lê as 3 cores da paleta a partir do CSS do tema ativo. */
function readColors(palette: string): THREE.Color[] {
  const cs = getComputedStyle(document.documentElement);
  return (PALETTES[palette] ?? PALETTES.rosa).map((v) => new THREE.Color(cs.getPropertyValue(v).trim() || '#ffffff'));
}

/** Pode rodar 3D? WebGL disponível, movimento liberado e sem economia de dados. */
export function canRender3D(): boolean {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/* =========================================================================
   Particles — geometria + material + animação por quadro
   ========================================================================= */
interface ParticlesProps {
  count: number;
  cfg: typeof DEFAULTS;
  light: boolean;
}

function Particles({ count, cfg, light }: ParticlesProps) {
  const { viewport, camera, gl, size } = useThree();
  const group = useRef<THREE.Group>(null!);
  const pointer = useRef({ x: 0, y: 0, active: 0 });

  // Largura visível no plano z=0, arredondada (evita recriar formas a cada pixel).
  const vw = Math.round(viewport.getCurrentViewport(camera, [0, 0, 0]).width * 4) / 4;

  /* --- Geometria: as 4 formas como atributos do mesmo BufferGeometry --- */
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const s = sphere(count, vw);
    g.setAttribute('position', new THREE.BufferAttribute(s, 3)); // usado só para bounding
    g.setAttribute('aSphere', new THREE.BufferAttribute(s, 3));
    g.setAttribute('aNet', new THREE.BufferAttribute(network(count, vw), 3));
    g.setAttribute('aWave', new THREE.BufferAttribute(wave(count, vw), 3));
    g.setAttribute('aText', new THREE.BufferAttribute(text(count, vw), 3));
    const r = new Float32Array(count);
    for (let i = 0; i < count; i++) r[i] = Math.random();
    g.setAttribute('aRand', new THREE.BufferAttribute(r, 1));
    // A nuvem se move no shader; uma esfera grande evita que o three a "corte".
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
    return g;
  }, [count, vw]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  /* --- Material (uniforms atualizados por quadro, sem recriar) --- */
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uSize: { value: DEFAULTS.tamanho },
      uPixelRatio: { value: 1 },
      uTurb: { value: 1 },
      uMouseForce: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uC1: { value: new THREE.Color() },
      uC2: { value: new THREE.Color() },
      uC3: { value: new THREE.Color() },
      uOpacity: { value: 0.7 },
    },
  }), []);

  useEffect(() => () => material.dispose(), [material]);

  // Tema escuro: brilho somado (additive). Claro: mistura normal (aditivo some no branco).
  useEffect(() => {
    material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    material.needsUpdate = true;
    const [a, b, c] = readColors(cfg.paleta);
    material.uniforms.uC1.value.copy(a);
    material.uniforms.uC2.value.copy(b);
    material.uniforms.uC3.value.copy(c);
  }, [light, cfg.paleta, material]);

  /* --- Ponteiro: mouse ou dedo, em coordenadas normalizadas (-1..1) --- */
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.current.active = performance.now();
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', move);
    };
  }, []);

  /* --- Loop por quadro --- */
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const morph = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = material.uniforms;

    // Forma: "auto" segue o scroll; o painel pode fixar uma forma.
    const target = cfg.forma === 'auto' ? sceneState().morph : Number(cfg.forma);
    morph.current = THREE.MathUtils.damp(morph.current, target, 2.2, dt);
    u.uMorph.value = morph.current;

    u.uTime.value += dt * cfg.velocidade * 2.5;
    u.uSize.value = cfg.tamanho * (isMobile() ? 1.25 : 1);
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uTurb.value = cfg.turbulencia;
    // No celular o texto fica sobre a nuvem: partículas mais discretas.
    u.uOpacity.value = cfg.opacidade * (light ? 0.75 : 1) * (isMobile() ? 0.7 : 1);

    // Cursor → ponto no plano z=0 (desprojeção a partir da câmera).
    tmp.set(pointer.current.x, pointer.current.y, 0.5).unproject(state.camera);
    tmp.sub(state.camera.position).normalize();
    const dist = -state.camera.position.z / tmp.z;
    u.uMouse.value.copy(state.camera.position).add(tmp.multiplyScalar(dist));
    // O empurrão some 1,5 s depois do último movimento (importante no toque).
    const active = performance.now() - pointer.current.active < 1500 ? cfg.cursor : 0;
    u.uMouseForce.value = THREE.MathUtils.damp(u.uMouseForce.value, active, 4, dt);

    // Rotação lenta, que para quando o texto se forma (para ficar legível).
    const textW = THREE.MathUtils.smoothstep(morph.current, 2.4, 3);
    const g = group.current;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, (1 - textW) * Math.sin(u.uTime.value * 0.08) * 0.9, 2, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, (1 - textW) * 0.18, 2, dt);

    // Desktop: a nuvem fica à direita (longe do texto do hero); o "CARLA"
    // centraliza na coluna de conteúdo. Em todas as telas, o texto desce
    // para a área livre abaixo do e-mail/botões de contato.
    const desktop = size.width >= 1100;
    const offsetX = desktop ? vw * (0.24 - textW * 0.08) : 0;
    const offsetY = -textW * (desktop ? 1.35 : 1.1);
    g.position.x = THREE.MathUtils.damp(g.position.x, offsetX, 3, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, offsetY, 3, dt);
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

/* =========================================================================
   GrainCanvas — luz granulada num <canvas> próprio, atrás das partículas
   (ver grain.ts para o porquê de não ficar dentro da cena R3F).
   ========================================================================= */
function GrainCanvas({ cfg, light }: { cfg: typeof DEFAULTS; light: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const grain = useRef<ReturnType<typeof createGrain>>(null);

  useEffect(() => {
    if (!ref.current) return;
    grain.current = createGrain(ref.current, { intensity: cfg.grao, speed: cfg.velocidade, tint: '#C9A7FF' });
    return () => grain.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atualiza parâmetros sem recriar o contexto WebGL.
  useEffect(() => {
    const g = grain.current;
    if (!g) return;
    const cs = getComputedStyle(document.documentElement);
    // No tema claro o grão é escuro sobre fundo claro: mais discreto para não brigar com o texto.
    g.params.intensity = cfg.grao * (light ? 0.55 : 1);
    g.params.speed = cfg.velocidade;
    // Lilás claro no tema escuro; tinta (grafite-roxo) no claro.
    g.params.tint = (light ? cs.getPropertyValue('--ink') : cs.getPropertyValue('--lilas')).trim() || '#C9A7FF';
  }, [cfg.grao, cfg.velocidade, light]);

  return <canvas ref={ref} className="scene__grain" aria-hidden="true" />;
}

/* =========================================================================
   MobileClock — no celular o Canvas usa frameloop="demand"; este relógio
   pede um quadro a cada ~33 ms (≈30 fps), economizando bateria e GPU.
   ========================================================================= */
function MobileClock() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let id = 0, last = 0;
    const tick = (t: number) => {
      id = requestAnimationFrame(tick);
      if (t - last >= 33) { last = t; invalidate(); }
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [invalidate]);
  return null;
}

/* =========================================================================
   Painel (Leva) — controles da cena, em português
   ========================================================================= */
function useCloudControls() {
  const [cfg, set] = useControls(() => ({
    paleta: { label: 'Paleta', value: DEFAULTS.paleta, options: { Rosa: 'rosa', Lilás: 'lilas', Neon: 'neon' } },
    forma: { label: 'Forma', value: DEFAULTS.forma, options: { 'Seguir o scroll': 'auto', Esfera: '0', Rede: '1', Onda: '2', Texto: '3' } },
    tamanho: { label: 'Tamanho', value: DEFAULTS.tamanho, min: 0.5, max: 6, step: 0.1 },
    velocidade: { label: 'Velocidade', value: DEFAULTS.velocidade, min: 0, max: 1.5, step: 0.01 },
    turbulencia: { label: 'Turbulência', value: DEFAULTS.turbulencia, min: 0, max: 4, step: 0.05 },
    cursor: { label: 'Cursor', value: DEFAULTS.cursor, min: 0, max: 3, step: 0.05 },
    opacidade: { label: 'Opacidade', value: DEFAULTS.opacidade, min: 0.1, max: 1, step: 0.01 },
    brilho: { label: 'Brilho', value: DEFAULTS.brilho, min: 0, max: 3, step: 0.05 },
    grao: { label: 'Luz granulada', value: DEFAULTS.grao, min: 0, max: 1.5, step: 0.05 },
    qualidade: { label: 'Qualidade', value: DEFAULTS.qualidade, options: { Automática: 'auto', Baixa: 'low', Média: 'mid', Alta: 'high' } },
    'Restaurar padrão': button(() => set(DEFAULTS)),
  }));
  return cfg as unknown as typeof DEFAULTS;
}

/** Tema do Leva alinhado à paleta do site. */
const levaTheme = {
  colors: {
    elevation1: '#120D19', elevation2: '#17111F', elevation3: '#2B2238',
    accent1: '#8B3DFF', accent2: '#C9A7FF', accent3: '#FF5FA2',
    highlight1: '#A99DB8', highlight2: '#EEE8F5', highlight3: '#FFFFFF',
    vivid1: '#39FF88',
  },
  fonts: { mono: '"IBM Plex Mono", ui-monospace, monospace', sans: '"IBM Plex Sans", system-ui, sans-serif' },
  radii: { xs: '2px', sm: '2px', lg: '4px' },
  sizes: { rootWidth: '100%', controlWidth: '58%' },
  fontSizes: { root: '12px' },
};

/* =========================================================================
   Scene — componente exportado (montado por DataCloud.tsx)
   ========================================================================= */
export default function Scene() {
  const [enabled] = useState(canRender3D);
  const [light, setLight] = useState(() => document.documentElement.dataset.theme === 'light');
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(isMobile);
  const [autoLevel, setAutoLevel] = useState<Tier>(autoTier);
  const [dpr, setDpr] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const cfg = useCloudControls();

  const maxDpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
  const tier: Tier = cfg.qualidade === 'auto' ? autoLevel : (cfg.qualidade as Tier);

  /* Tema, tamanho de tela e abertura do painel chegam por eventos. */
  useEffect(() => {
    const onTheme = () => setLight(document.documentElement.dataset.theme === 'light');
    const onResize = () => { setMobile(isMobile()); setAutoLevel((t) => (TIERS.indexOf(autoTier()) < TIERS.indexOf(t) ? autoTier() : t)); };
    const onPanel = (e: Event) => {
      const want = (e as CustomEvent<{ open?: boolean }>).detail?.open;
      setOpen((o) => (typeof want === 'boolean' ? want : !o));
    };
    window.addEventListener(EVT.theme, onTheme);
    window.addEventListener(EVT.panel, onPanel);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener(EVT.theme, onTheme);
      window.removeEventListener(EVT.panel, onPanel);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  /* Painel: foco ao abrir, Esc fecha, devolve o foco a quem abriu. */
  useEffect(() => {
    emit(EVT.panelState, { open });
    if (open) {
      returnFocus.current = document.activeElement;
      requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
    (returnFocus.current as HTMLElement | null)?.focus?.({ preventScroll: true });
  }, [open]);

  // Sem suporte: só o painel informativo (os controles não têm efeito).
  // O painel vai para #calib-root (fora da camada da cena, que fica atrás de tudo).
  const portal = (node: ReactNode) => {
    const target = document.getElementById('calib-root');
    return target ? createPortal(node, target) : node;
  };

  if (!enabled) {
    return open ? portal(
      <div className="calib" role="dialog" aria-label="Calibração da cena" ref={panelRef} tabIndex={-1}>
        <header className="calib__head">
          <h2 className="calib__title">Calibração da cena</h2>
          <button type="button" className="calib__close" onClick={() => setOpen(false)}>Fechar</button>
        </header>
        <p className="calib__note">A cena 3D está desligada porque o navegador não suporta WebGL ou o aparelho pediu menos animação / economia de dados.</p>
      </div>
    ) : null;
  }

  return (
    <>
      {portal(
        <div className="calib" role="dialog" aria-label="Calibração da cena" hidden={!open} ref={panelRef} tabIndex={-1}>
          <header className="calib__head">
            <h2 className="calib__title">Calibração da cena</h2>
            <button type="button" className="calib__close" onClick={() => setOpen(false)}>Fechar</button>
          </header>
          <div className="calib__body">
            <Leva fill flat titleBar={false} theme={levaTheme} hideCopyButton />
          </div>
        </div>,
      )}

      <GrainCanvas cfg={cfg} light={light} />
      <Canvas
        className="scene__canvas"
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={Math.min(dpr * maxDpr, maxDpr)}
        frameloop={mobile ? 'demand' : 'always'}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        {/* Se o FPS cair, reduz a resolução; se cair muito, um nível de quantidade. */}
        <PerformanceMonitor
          onChange={({ factor }) => setDpr(0.7 + 0.3 * factor)}   // piso de 70% da resolução
          onFallback={() => setAutoLevel('low')}
          onDecline={() => setAutoLevel((t) => TIERS[Math.max(0, TIERS.indexOf(t) - 1)])}
        />
        {mobile && <MobileClock />}
        <Particles count={COUNTS[tier]} cfg={cfg} light={light} />
        {/* Bloom só no desktop, tema escuro e qualidade alta (é o efeito mais caro). */}
        {!mobile && !light && tier === 'high' && cfg.brilho > 0 && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={cfg.brilho} luminanceThreshold={0.42} luminanceSmoothing={0.3} />
          </EffectComposer>
        )}
      </Canvas>
    </>
  );
}
