/* =========================================================================
   bus.ts — Comunicação entre partes do site que vivem em bundles diferentes
   -------------------------------------------------------------------------
   A cena 3D é uma ilha React; menu, preferências e animações são scripts
   comuns. Eles conversam por:
   - `sceneState` (objeto no window): valores lidos a cada quadro pela cena,
     como a forma-alvo das partículas (`morph`), escrita pelo scroll.
   - eventos no window: avisos pontuais (abrir painel, tema mudou).
   Guardar no window garante uma única instância mesmo se o Vite duplicar
   o módulo em chunks diferentes.
   ========================================================================= */

export interface SceneState {
  /** Forma-alvo: 0 esfera · 1 rede · 2 onda · 3 texto. Valores fracionados = transição. */
  morph: number;
}

declare global {
  interface Window { __cbScene?: SceneState }
}

export function sceneState(): SceneState {
  if (typeof window === 'undefined') return { morph: 0 };
  return (window.__cbScene ??= { morph: 0 });
}

/** Nomes dos eventos (detail entre parênteses). */
export const EVT = {
  /** Abrir/fechar painel de calibração (detail: { open?: boolean }; sem open = alternar). */
  panel: 'cb:panel',
  /** Painel abriu/fechou (detail: { open: boolean }) — para o botão "Calibrar" refletir o estado. */
  panelState: 'cb:panel-state',
  /** Tema claro/escuro mudou (sem detail). */
  theme: 'cb:theme',
  /** Travar/destravar a rolagem suave (detail: boolean) — menu do celular aberto. */
  lock: 'cb:lock',
  /** O layout mudou de altura (ex.: filtro) — ScrollTrigger precisa recalcular. */
  layout: 'cb:layout',
} as const;

export const emit = (name: string, detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(name, { detail }));
