# 05 · Roadmap V2 — framework, 3D e mais interação

> Objetivo: migrar o site atual (HTML/CSS/JS puro) para uma stack profissional,
> com cena 3D interativa, animações orquestradas e responsividade em todos os tamanhos,
> mantendo a identidade visual (roxo, lilás, rosa, verde neon) e o conteúdo já escrito.
> Data: 2026-11-05

---

## 1. Stack recomendada

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Astro** + TypeScript | Feito para sites de conteúdo: entrega HTML estático e só carrega JS onde precisa ("ilhas"). Carrega rápido e tira nota alta no Lighthouse |
| Componentes interativos | **React 19** dentro do Astro | Mostra React no portfólio (o que mais pedem em vaga) e é a base do ecossistema 3D |
| 3D | **three.js** + **React Three Fiber** + **drei** | Padrão de mercado para 3D na web. O drei traz ajustes de desempenho prontos (`PerformanceMonitor`, `AdaptiveDpr`) |
| Pós-processamento | **@react-three/postprocessing** | Bloom suave nos pontos neon |
| Painel de ajustes | **Leva** | Substitui o "Calibrar". Painel no estilo Tweakpane, feito para R3F |
| Animação | **GSAP** (ScrollTrigger, SplitText, Flip) | Hoje é 100% gratuito, plugins incluídos. Revelação no scroll, letras animadas, transição de layout |
| Scroll suave | **Lenis** | Scroll suave sincronizado com o GSAP. Desliga com `prefers-reduced-motion` |
| Transição entre páginas | **Astro View Transitions** | O card do projeto "vira" a página do estudo de caso |
| Conteúdo | **Content Collections** do Astro + MDX + Zod | Cada projeto vira um arquivo `.mdx` com campos validados. Substitui o `data.js` |
| Estilo | CSS com tokens (o atual, migrado) | Mantém a identidade. Tailwind é opcional se você quiser listar no currículo |
| Qualidade | ESLint, Prettier, Playwright (testes visuais), Lighthouse CI | Para o próprio repositório também servir de vitrine |
| Deploy | GitHub Actions → **GitHub Pages** ou **Vercel** | Link público com deploy automático a cada push |

**Alternativa: Next.js.** Também funciona e é muito pedido em vaga. Para portfólio, porém, ele manda mais JavaScript por padrão e o ganho não compensa. Com Astro + React você mostra React do mesmo jeito.

As versões exatas ficam fixadas no `package.json` na instalação, sempre a estável mais recente. O R3F 9 exige React 19.

---

## 2. A cena 3D (elemento assinatura)

**Ideia: "nuvem de dados".** Um campo de 20 a 60 mil partículas, nas cores da paleta, que **muda de forma conforme o scroll**:

| Seção | Forma das partículas | Ligação com você |
|---|---|---|
| Hero | Esfera pulsando, que reage ao mouse | Dados brutos |
| Projetos | Malha de nós conectados (rede) | Sistemas e integrações |
| Trajetória | Onda / sinal de osciloscópio | Engenharia de automação |
| Contato | Partículas formam o texto "Carla" | Assinatura |

**Interação:**
- O mouse "empurra" as partículas.
- No celular, o efeito vem do toque e da inclinação do aparelho (giroscópio, com permissão).
- O painel Leva ajusta cor, tamanho, velocidade e quantidade.
- A troca de forma acontece no shader (GPU), animada pelo GSAP ScrollTrigger.

**Desempenho:**
- A cena 3D só carrega depois do conteúdo principal (`client:idle`).
- Fica numa ilha separada, então o texto aparece na hora.
- Se o FPS cair, o `PerformanceMonitor` reduz partículas e resolução automaticamente.
- Sem WebGL ou com movimento reduzido: aparece uma imagem estática da cena.

---

## 3. Interações novas

- **Títulos:** entram letra por letra com SplitText. Os títulos dos projetos ganham distorção leve ao passar o mouse.
- **Cursor personalizado** só no desktop (anel que cresce em links), com botões "magnéticos" que puxam o cursor.
- **Página própria por projeto** (`/projetos/portal-de-operacoes`) com estudo de caso completo, aberta com View Transition a partir do card.
- **Contadores animados** nas métricas (−40 h/mês sobe ao aparecer na tela).
- **Linha do tempo** que se desenha conforme o scroll (DrawSVG).
- **Menu do celular** com animação de entrada em cascata (GSAP).
- **Ficam como estão:** tema claro/escuro, fonte mono, som e filtro da trajetória.

---

## 4. Responsividade

| Faixa | Layout | 3D |
|---|---|---|
| 360–699 px (celular) | 1 coluna, menu em tela cheia, toque ≥ 44 px | ≤ 15 mil partículas, DPR 1, sem bloom |
| 700–1099 px (tablet) | Header fixo, grids de 2 colunas | ~30 mil partículas, DPR até 1.5 |
| 1100–1599 px (desktop) | Sidebar fixa + conteúdo | 60 mil partículas, bloom |
| ≥ 1600 px (telas grandes) | Conteúdo centralizado, tipografia limitada por `clamp()` | Igual ao desktop |

- Tipografia e espaçamento fluidos (`clamp()` e container queries).
- Testes automáticos com Playwright em 360, 390, 768, 1024, 1440 e 1920 px.
- Meta no Lighthouse mobile: ≥ 90 em Performance e 100 em Acessibilidade.

---

## 5. Estrutura de pastas

```
src/
  components/
    three/         DataCloud.tsx, shaders/, Scene.tsx
    ui/            Nav, ProjectCard, Filter, ThemeToggle...
  content/
    projetos/      portal-de-operacoes.mdx, ...
    formacao/      mestrado.md, ...
  layouts/         Base.astro
  pages/           index.astro, projetos/[slug].astro
  styles/          tokens.css, global.css
public/            curriculo.pdf, og.png, poster-3d.webp
```

---

## 6. Etapas (um commit por etapa)

Cada etapa só termina quando o critério de pronto passa **também no celular** (ver [06-mobile.md](06-mobile.md)).

| # | Etapa | Entrega | Pronto quando |
|---|---|---|---|
| 1 | **Base** | Astro + TS + React, tokens CSS migrados, layout e navegação atuais | O site fica idêntico à V1 em 360, 768 e 1440 px. Lighthouse mobile ≥ 95 |
| 2 | **Conteúdo** | Content Collections (Zod), projetos em MDX, página `/projetos/[slug]` | Adicionar um projeto = criar 1 arquivo. Build falha se faltar campo obrigatório |
| 3 | **3D** | Cena R3F "nuvem de dados", painel Leva, níveis de qualidade e imagem estática de reserva | ≥ 50 fps em celular intermediário. A cena só carrega depois do texto (LCP intacto) |
| 4 | **Animações** | GSAP (ScrollTrigger, SplitText), Lenis, View Transitions, troca de forma ligada ao scroll | Tudo desliga com "movimento reduzido". Sem engasgo ao rolar no celular |
| 5 | **Polimento** | Cursor customizado (só desktop), botões magnéticos, contadores, testes Playwright | Testes visuais em 6 larguras passando. Acessibilidade 100 |
| 6 | **Deploy** | GitHub Actions → Pages ou Vercel, OG image, sitemap | Link público. Prévia correta ao compartilhar no WhatsApp e no LinkedIn |

### Ideias guardadas para depois
- Modo "terminal": digitar comandos (`projetos`, `contato`) para navegar.
- Versão em inglês (i18n do Astro) para vagas internacionais.
- Blog técnico com artigos em MDX.
- Partículas reagindo ao giroscópio do celular (pede permissão no iOS).

O rodapé muda para algo como: "Astro · React · Three.js · GSAP", com links para o código.

---

## Fontes

- [React Three Fiber — GitHub](https://github.com/pmndrs/react-three-fiber)
- [Webflow torna o GSAP 100% gratuito](https://webflow.com/blog/gsap-becomes-free)
- [Astro vs Next.js em 2026 — Cosmic](https://www.cosmicjs.com/blog/astro-vs-nextjs-2026)
- [Astro vs Next.js em 2026 — Kunal Ganglani](https://www.kunalganglani.com/blog/astro-vs-nextjs-2026.md)
- [Guia de migração WebGPU + Three.js (2026) — Utsubo](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)
