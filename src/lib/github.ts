/* =========================================================================
   github.ts — Integração com a API REST do GitHub
   -------------------------------------------------------------------------
   Roda no build (Astro estático): busca perfil e repositórios públicos e
   devolve só o que a seção GitHub precisa. Sem token funciona (60 req/h por
   IP); no CI o GITHUB_TOKEN do Actions é usado para não bater no limite.
   Se a API falhar, retorna null e a seção mostra só o link para o perfil.
   Detalhes por repositório (linguagens, README) são opcionais: se uma
   chamada falhar, o modal simplesmente mostra menos coisa.
   O navegador atualiza os números ao vivo (ver GitHub.astro).
   ========================================================================= */

export const GITHUB_USER = 'TekhneDev';
const API = 'https://api.github.com';

/** Bloco de texto extraído do README (sem HTML: renderizado como texto puro). */
export type ReadmeBlock = { type: 'h' | 'p' | 'li'; text: string };

export interface GhRepo {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  /** Linguagens em % do código (maior primeiro). */
  languages: { name: string; pct: number }[];
  topics: string[];
  license: string | null;
  stars: number;
  forks: number;
  createdAt: string;
  pushedAt: string;
  /** Imagem de prévia gerada pelo GitHub (1200×600). */
  preview: string;
  readme: ReadmeBlock[];
}

export interface GhData {
  login: string;
  name: string | null;
  avatar: string;
  url: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  stars: number;
  languages: { name: string; count: number }[];
  repos: GhRepo[];
}

function headers(accept = 'application/vnd.github+json') {
  const h: Record<string, string> = {
    Accept: accept,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'carla-braga-portfolio',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: headers() });
  if (!res.ok) throw new Error(`GitHub ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

/** Chamada opcional: devolve `fallback` em vez de lançar erro. */
async function maybe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}

async function getReadme(user: string, repo: string): Promise<string> {
  const res = await fetch(`${API}/repos/${user}/${repo}/readme`, { headers: headers('application/vnd.github.raw') });
  if (!res.ok) return '';
  return res.text();
}

/** Remove a marcação inline do Markdown, deixando só o texto legível. */
function inline(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')            // imagens
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')          // links → texto
    .replace(/<[^>]+>/g, '')                           // HTML
    .replace(/(\*\*|__|\*|_|~~|`)/g, '')               // ênfases e código
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converte o README em blocos simples (título, parágrafo, item de lista).
 * Pula código, tabelas, badges e o título principal (já mostrado no modal).
 */
export function readmeBlocks(md: string, max = 14): ReadmeBlock[] {
  const out: ReadmeBlock[] = [];
  let para: string[] = [];
  let inCode = false;
  const flush = () => {
    const t = inline(para.join(' '));
    if (t.length > 1) out.push({ type: 'p', text: t });
    para = [];
  };
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim().replace(/^(>\s?)+/, ''); // citações viram texto normal
    if (/^(```|~~~)/.test(line)) { inCode = !inCode; flush(); continue; }
    if (inCode) continue;
    if (!line || /^(\||-{3,}|={3,}|<!--)/.test(line)) { flush(); continue; }
    const h = line.match(/^(#{1,6})\s+(.*)/);
    if (h) { flush(); if (h[1].length > 1) out.push({ type: 'h', text: inline(h[2]) }); continue; }
    const li = line.match(/^([-*+]|\d+\.)\s+(.*)/);
    if (li) { flush(); const t = inline(li[2]); if (t) out.push({ type: 'li', text: t }); continue; }
    para.push(line);
  }
  flush();
  // Sem títulos órfãos no fim (seção cortada pelo limite).
  const blocks = out.filter((b) => b.text).slice(0, max);
  while (blocks.length && blocks[blocks.length - 1].type === 'h') blocks.pop();
  return blocks;
}

/* Cache em memória: no `astro dev` cada recarga renderiza a página de novo;
   sem isso, 14 chamadas por recarga estouram o limite de 60/h sem token. */
const TTL = 10 * 60 * 1000;
const cache = new Map<string, { at: number; data: Promise<GhData | null> }>();

/** Repositórios próprios (sem forks nem o README de perfil), mais recentes primeiro. */
export function getGithub(user = GITHUB_USER, limit = 6): Promise<GhData | null> {
  const key = `${user}:${limit}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  const data = fetchGithub(user, limit).then((d) => {
    if (!d) cache.delete(key); // falhou: tenta de novo na próxima
    return d;
  });
  cache.set(key, { at: Date.now(), data });
  return data;
}

async function fetchGithub(user: string, limit: number): Promise<GhData | null> {
  try {
    const [u, raw] = await Promise.all([
      get<any>(`/users/${user}`),
      get<any[]>(`/users/${user}/repos?per_page=100&sort=pushed&type=owner`),
    ]);
    const own = raw.filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== user.toLowerCase());

    const langCount = new Map<string, number>();
    for (const r of own) if (r.language) langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);

    const repos = await Promise.all(own.slice(0, limit).map(async (r): Promise<GhRepo> => {
      const [langs, md] = await Promise.all([
        maybe(get<Record<string, number>>(`/repos/${user}/${r.name}/languages`), {}),
        maybe(getReadme(user, r.name), ''),
      ]);
      const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
      return {
        name: r.name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage || null,
        language: r.language,
        languages: Object.entries(langs)
          .map(([name, bytes]) => ({ name, pct: Math.round((bytes / total) * 1000) / 10 }))
          .filter((l) => l.pct >= 0.5)
          .sort((a, b) => b.pct - a.pct),
        topics: r.topics ?? [],
        license: r.license?.spdx_id && r.license.spdx_id !== 'NOASSERTION' ? r.license.spdx_id : null,
        stars: r.stargazers_count,
        forks: r.forks_count,
        createdAt: r.created_at,
        pushedAt: r.pushed_at,
        preview: `https://opengraph.githubassets.com/1/${user}/${r.name}`,
        readme: readmeBlocks(md),
      };
    }));

    return {
      login: u.login,
      name: u.name,
      avatar: u.avatar_url,
      url: u.html_url,
      bio: u.bio,
      publicRepos: u.public_repos,
      followers: u.followers,
      stars: own.reduce((s, r) => s + r.stargazers_count, 0),
      languages: [...langCount].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
      repos,
    };
  } catch (e) {
    console.warn('[github] dados indisponíveis no build:', (e as Error).message);
    return null;
  }
}
