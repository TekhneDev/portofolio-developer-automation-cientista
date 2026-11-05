# 04 · Arquitetura (V2)

Site estático gerado pelo **Astro 7**: o HTML sai pronto do build, e só as partes interativas carregam JavaScript.

## Stack e por que cada peça

| Peça | Papel |
|---|---|
| **Astro 7** | Gera HTML estático. Faz o roteamento (`/` e `/projetos/[slug]`), as Content Collections e as View Transitions |
| **React 19** | Usado só na ilha da cena 3D (`client:only`) |
| **three.js + React Three Fiber** | Renderiza a nuvem de partículas |
| **drei** | `PerformanceMonitor`: baixa a resolução ou a quantidade quando o FPS cai |
| **@react-three/postprocessing** | Bloom (brilho) no desktop |
| **Leva** | Painel "Calibração da cena" |
| **GSAP** (ScrollTrigger, SplitText) | Entradas, reveals, contadores, linha da trajetória e forma da nuvem por seção |
| **Lenis** | Rolagem suave na roda do mouse. No toque, a rolagem é a nativa |
| **MDX + Zod** | Estudos de caso com campos validados no build |
| **Playwright** | Testes em 6 tamanhos de tela |
| **GitHub Actions** | Build e deploy no GitHub Pages |

## Fluxo de uma visita

```
1. HTML estático chega (texto, links, layout)    → aparece na hora
2. script inline no <head> aplica tema/fonte      → sem "piscar"
3. ui.ts + motion.ts (≈55 KB gzip)                → menu, preferências, animações
4. DataCloud.tsx (leve) espera o navegador ficar ocioso
5. importa Scene.tsx (≈330 KB gzip: three + R3F + Leva) → monta a cena 3D
```

A cena **nunca** atrasa o texto: ela carrega por último e aparece com fade.

## Navegação com View Transitions

- `<ClientRouter />` no `Base.astro` troca só o conteúdo, sem recarregar a página.
- O título do projeto tem `transition:name="title-<slug>"` na lista e na página, então ele "voa" de um lugar para o outro.
- A cena 3D e o painel têm `transition:persist`: continuam vivos entre as páginas, sem recarregar a GPU.
- Scripts se reinicializam em `astro:page-load`. Listeners da página anterior são removidos (AbortController e `gsap.context().revert()`).

## Comunicação entre ilha React e scripts (`src/lib/bus.ts`)

| Canal | De → para | Para quê |
|---|---|---|
| `sceneState().morph` | motion.ts → Scene | Forma-alvo (0 esfera · 1 rede · 2 onda · 3 texto) |
| `cb:panel` | ui.ts → Scene | Abrir/fechar a calibração |
| `cb:panel-state` | Scene → ui.ts | Botão "Calibrar" mostra se está aberto |
| `cb:theme` | ui.ts → Scene | Recarregar as cores do tema |
| `cb:lock` | ui.ts → motion.ts | Pausar o Lenis com o menu do celular aberto |
| `cb:layout` | ui.ts → motion.ts | Recalcular o ScrollTrigger após o filtro |

## Cena 3D (`src/components/three/`)

- **`shapes.ts`:** gera as 4 formas com o mesmo número de pontos. A largura de cada uma respeita a tela (`vw`), então nada estoura no celular em pé.
- **`shaders.ts`:**
  - O vertex shader interpola entre as formas, com atraso por partícula, aplica turbulência e empurra as partículas para longe do cursor.
  - O fragment shader desenha discos suaves.
- **`Scene.tsx`:**
  - Geometria e material criados uma vez, com uniforms atualizados por quadro.
  - Mistura aditiva no tema escuro e normal no claro.
  - Desktop: a nuvem fica à direita do texto. Mobile: fica mais discreta.
  - Celular: ~30 fps (`frameloop="demand"` + relógio próprio), sem bloom.
  - O painel vai por portal para `#calib-root`, porque a camada da cena fica atrás do conteúdo e não recebe cliques.
- **`DataCloud.tsx`:** carrega a `Scene` de forma preguiçosa, depois que o navegador fica ocioso.

| Qualidade | Partículas | Quando |
|---|---|---|
| Baixa | 9 000 | < 700 px ou FPS baixo |
| Média | 22 000 | 700–1099 px |
| Alta | 45 000 | ≥ 1100 px (com bloom) |

## Animação (`src/scripts/motion.ts`)

- Reveals usam **só `opacity`**. Assim o conteúdo ainda não revelado continua clicável e acessível pelo teclado. Bug encontrado pelos testes e corrigido.
- SplitText com máscara no nome (por letra) e nos títulos (por palavra).
- Contadores leem o número do texto ("−95%", "0,3%", "12 mil") e preservam prefixo, sufixo e vírgula.
- Com "movimento reduzido": nenhuma animação, nenhum Lenis e nenhuma cena 3D.

## Conteúdo

| Coleção | Onde | Schema |
|---|---|---|
| `projetos` | `src/content/projetos/*.mdx` | `src/content.config.ts` |
| `formacao` | `src/content/formacao.yaml` | idem |
| `trajetoria` | `src/content/trajetoria.yaml` | idem |
| Resto | `src/data/site.ts` | Tipos TypeScript |

## O que fica salvo no navegador

| Chave | Valor |
|---|---|
| `cb-theme` | `dark` / `light` |
| `cb-font` | `mono` / `sans` |
| `cb-sound` | `on` / `off` |

A calibração da cena **não** é salva: toda visita começa nos valores padrão.

## Histórico

A V1 (HTML, CSS e JS puros, com shader 2D de isolinhas) está no histórico do Git até o commit `cac8e0a`.
