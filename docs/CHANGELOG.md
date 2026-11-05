# Changelog

## 2.0.0 — 2026-11-05 (V2)
### Adicionado
- Migração para **Astro 7** + TypeScript, com conteúdo em Content Collections: projetos em MDX, formação e trajetória em YAML, validados com Zod.
- **Página própria por projeto** (`/projetos/<slug>`) com estudo de caso, resultados animados e anterior/próximo. O título "voa" da lista até a página (View Transitions).
- **Cena 3D** (three.js + React Three Fiber + drei + postprocessing): nuvem de partículas que muda de forma conforme a seção (esfera → rede → onda → "CARLA") e reage ao cursor/toque. Qualidade adaptativa e carregamento depois do texto.
- **Calibração** com Leva (bottom sheet no celular).
- **GSAP:** SplitText no nome e nos títulos, reveals, sparklines que se desenham, contadores e linha da trajetória ligada ao scroll.
- **Lenis:** rolagem suave na roda do mouse.
- **Desktop:** cursor em anel e botões magnéticos.
- **Playwright:** 34 testes em 6 tamanhos de tela.
- **Deploy:** GitHub Pages via Actions, imagem de compartilhamento (OG), sitemap e favicon próprio.

### Corrigido durante os testes
- O painel de calibração ficava atrás do conteúdo e não recebia clique. Agora é renderizado por portal.
- Elementos ainda não revelados ficavam inacessíveis ao teclado. Os reveals usam só `opacity`.

## 1.1.0 — 2026-11-05
### Adicionado
- Pasta `docs/` com inspirações, ideação, design system, arquitetura, roadmap V2, guia mobile e guia de conteúdo.
- Comentários explicativos em todo o código (HTML, CSS, JS e shader GLSL).
- Mobile: suporte a notch (`safe-area`), janela de projeto com "Fechar" fixo no topo, painel como bottom sheet, layout para celular deitado, menu com conteúdo inerte e altura do header medida para as âncoras.
- Fundo limitado a ~30 fps no celular e desligado com "economia de dados".

### Alterado
- Hover que levanta elementos só em dispositivos com mouse.
- Números do menu não quebram mais em duas linhas.

## 2026-11-05
- **Formação:** graduação, pós-graduação e mestrado (`5456375`).
- **Fundo:** sempre abre com os valores calibrados, paleta rosa (`4b580a1`).
- **README** com instruções (`4417839`).
- **Site V1:** layout, fundo WebGL, projetos, trajetória, contratação e contato (`963f4f2`).

## 2026-11-04
- Documento de inspirações (`15a75d8`).
