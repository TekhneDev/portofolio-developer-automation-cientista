/* =========================================================================
   github.ts — Integração com a API REST do GitHub
   -------------------------------------------------------------------------
   Roda no build (Astro estático): busca perfil e repositórios públicos e
   devolve só o que a seção GitHub precisa. Sem token funciona (60 req/h por
   IP); no CI o GITHUB_TOKEN do Actions é usado para não bater no limite.
   Se a API falhar, retorna null e a seção mostra só o link para o perfil.
   O navegador atualiza os números ao vivo (ver GitHub.astro).
   ========================================================================= */

export const GITHUB_USER = 'TekhneDev';
const API = 'https://api.github.com';

export interface GhRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
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

async function get<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'carla-braga-portfolio',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

/** Repositórios próprios (sem forks nem o README de perfil), mais recentes primeiro. */
export async function getGithub(user = GITHUB_USER, limit = 6): Promise<GhData | null> {
  try {
    const [u, raw] = await Promise.all([
      get<any>(`/users/${user}`),
      get<any[]>(`/users/${user}/repos?per_page=100&sort=pushed&type=owner`),
    ]);
    const own = raw.filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== user.toLowerCase());

    const langCount = new Map<string, number>();
    for (const r of own) if (r.language) langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);

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
      repos: own.slice(0, limit).map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        pushedAt: r.pushed_at,
      })),
    };
  } catch (e) {
    console.warn('[github] dados indisponíveis no build:', (e as Error).message);
    return null;
  }
}
