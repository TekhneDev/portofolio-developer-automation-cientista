# Carla Braga — Portfólio

Portfólio de desenvolvedora full stack, com formação em ciência e engenharia de automação.

**Stack:** Astro 7 · React 19 · TypeScript · three.js + React Three Fiber + drei + postprocessing · Leva · GSAP (ScrollTrigger, SplitText) · Lenis · MDX + Content Collections · Playwright · GitHub Actions.

## Rodar localmente

Requer Node.js 22 ou mais novo.

```bash
npm install
npm run dev        # http://localhost:4321/portofolio-developer-automation-cientista/
npm run build      # gera o site estático em dist/
npm run preview    # serve o dist/ para conferir o build
npm test           # build + testes em 6 tamanhos de tela (360 → 1920)
```

Para testar no celular, na mesma rede Wi-Fi: `npm run dev -- --host` e abra o endereço "Network" que aparecer.

## Onde editar o conteúdo

| O quê | Arquivo |
|---|---|
| Projetos (um arquivo por projeto, com estudo de caso) | `src/content/projetos/*.mdx` |
| Formação | `src/content/formacao.yaml` |
| Trajetória profissional | `src/content/trajetoria.yaml` |
| Perfil, contato, competências, lab, publicações, prêmios, CLT/PJ, FAQ | `src/data/site.ts` |
| Currículo em PDF | `public/curriculo-carla-braga.pdf` |

Procure por `[EDITAR]`. Os campos são validados no build: se faltar algo obrigatório, o build avisa qual arquivo e qual campo.

**Novo projeto:** copie um `.mdx` de `src/content/projetos/`, troque o nome do arquivo (ele vira a URL) e edite.

## Estrutura

```
src/
  components/
    sections/   Hero, Projects, Lab, Trajectory, Hiring, Contact
    three/      DataCloud (carregador leve), Scene (R3F + Leva), shapes, shaders
    ui/         Tags, Status, Sparkline, SectionHead
    Sidebar.astro, Footer.astro
  content/      projetos/*.mdx, formacao.yaml, trajetoria.yaml
  content.config.ts   schemas (Zod) das coleções
  data/site.ts        conteúdo fixo
  layouts/Base.astro  <head>, View Transitions, cena 3D, scripts
  lib/                utils (url, sparkline), bus (comunicação entre ilhas)
  pages/              index.astro, projetos/[slug].astro
  scripts/            ui.ts (menu, preferências, filtro) · motion.ts (GSAP + Lenis)
  styles/global.css   design system + responsivo
tests/site.spec.ts    Playwright
docs/                 ideação, design system, arquitetura, roadmap, mobile
```

## Publicação

Cada push na `main` publica no GitHub Pages (`.github/workflows/deploy.yml`).
É preciso ativar uma vez em **Settings → Pages → Source: GitHub Actions**.

Endereço: https://tekhnedev.github.io/portofolio-developer-automation-cientista/

Para domínio próprio ou Vercel, rode o build com `BASE_PATH=/` e `SITE_URL=https://seu-dominio`.

## Documentação

Ideação, decisões, design system, arquitetura, roadmap e guia mobile ficam em [`docs/`](docs/README.md).
