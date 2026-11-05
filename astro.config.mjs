// @ts-check
/* =========================================================================
   astro.config.mjs — configuração do Astro
   -------------------------------------------------------------------------
   - site/base: endereço do GitHub Pages. O repositório não é "usuario.github.io",
     então o site fica em /<nome-do-repo>/. Para publicar na raiz de um
     domínio próprio (ou na Vercel), rode o build com BASE_PATH=/
   - react: ilhas interativas (cena 3D com React Three Fiber)
   - mdx:   estudos de caso dos projetos em .mdx
   - sitemap: gera sitemap-index.xml para buscadores
   ========================================================================= */
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const base = process.env.BASE_PATH ?? '/portofolio-developer-automation-cientista';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://tekhnedev.github.io',
  base,
  trailingSlash: 'ignore',
  integrations: [react(), mdx(), sitemap()],
  // Pré-carrega páginas quando o link entra na tela (navegação instantânea).
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
