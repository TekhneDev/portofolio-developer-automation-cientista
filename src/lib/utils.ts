/* =========================================================================
   utils.ts — Funções pequenas usadas em vários componentes
   ========================================================================= */

/**
 * Monta um caminho interno respeitando o `base` do Astro
 * (no GitHub Pages o site mora em /<repo>/, não na raiz).
 * @example url('projetos/portal') → '/portofolio-.../projetos/portal'
 */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

/**
 * Caminho SVG (atributo `d`) de uma sparkline.
 * Os valores são normalizados entre mínimo e máximo, então qualquer escala serve.
 * Retorna também a posição do último ponto, onde desenhamos o círculo.
 */
export function sparkPath(points: number[], w = 72, h = 22) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const xy = points.map((p, i) => [
    (i / (points.length - 1)) * (w - 4) + 2,
    h - 2 - ((p - min) / span) * (h - 4),
  ]);
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lx, ly] = xy[xy.length - 1];
  return { d, lx, ly, w, h };
}

/** Divide um título com \n em linhas (para o título "empilhado"). */
export const lines = (t: string) => t.split('\n');

/** Rótulos dos status. */
export const STATUS_LABEL = { producao: 'Em produção', experimento: 'Experimento' } as const;
export const EDU_LABEL = { concluido: 'Concluído', andamento: 'Em andamento' } as const;
