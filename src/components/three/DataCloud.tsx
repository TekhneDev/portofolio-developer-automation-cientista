/* =========================================================================
   DataCloud.tsx — Porta de entrada leve da cena 3D (ilha client:only)
   -------------------------------------------------------------------------
   three.js + R3F + postprocessing + Leva somam ~330 KB (gzip). Para não
   atrasar o texto da página (LCP), este componente:
   1. renderiza nada no início;
   2. espera o navegador ficar ocioso (requestIdleCallback, ou 1,2 s);
   3. só então importa Scene.tsx (chunk separado) e monta a cena.
   ========================================================================= */
import { lazy, Suspense, useEffect, useState } from 'react';

const Scene = lazy(() => import('./Scene'));

export default function DataCloud() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 1200);
    return () => clearTimeout(t);
  }, []);

  return ready ? (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  ) : null;
}
