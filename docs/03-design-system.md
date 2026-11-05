# 03 · Design system

Todos os valores ficam em `css/style.css`, no bloco `:root` (tema escuro, que é o padrão) e em `:root[data-theme="light"]`.

## Cores

| Token | Escuro | Claro | Uso |
|---|---|---|---|
| `--bg` | `#0E0A14` | `#F5F0FB` | Fundo da página |
| `--surface` | `#17111F` | `#FFFFFF` | Cards, janela de projeto, painel |
| `--ink` | `#EEE8F5` | `#1A1024` | Texto principal |
| `--muted` | `#A99DB8` | `#5D5070` | Texto secundário, datas |
| `--line` | `#2B2238` | `#DCD1EB` | Divisórias e bordas |
| `--roxo` | `#8B3DFF` | `#6A1FE0` | Botão ativo, links no tema claro |
| `--lilas` | `#C9A7FF` | `#9A6BF0` | Links no escuro, tags, sparklines |
| `--rosa` | `#FF5FA2` | `#D21F6C` | Rótulos, hover, status "experimento" |
| `--neon` | `#39FF88` | `#1FD177` | Botão principal, seção ativa, foco |
| `--neon-escuro` | `#0FA968` | `#08794A` | Status "produção" no tema claro (contraste AA) |

**Regras de cor:**
- O verde neon nunca é usado como cor de texto sobre fundo claro. Nesse caso entra o `--neon-escuro`.
- Botão com fundo neon ou lilás sempre leva texto escuro (`#0E0A14`).
- O foco do teclado é sempre um contorno de 2 px em `--neon`.

## Tipografia

| Papel | Fonte | Onde |
|---|---|---|
| Display | **Archivo**, com eixo de largura (`font-stretch` 100–125%) e peso 700–900 | Nome, títulos de projeto, números |
| Texto | **IBM Plex Sans** 400/500/600 | Parágrafos |
| Dados | **IBM Plex Mono** 400/500 | Datas, métricas, rótulos, menu, painel |

O botão **Mono** troca `--f-text` por Plex Mono no site inteiro.

**Escala fluida** (usa `clamp()`, então cresce e diminui com a tela):

| Token | Mínimo → máximo | Uso |
|---|---|---|
| `--s-1` | 0.78 → 0.84 rem | Legendas, rótulos |
| `--s0` | 1 → 1.08 rem | Texto |
| `--s1` | 1.15 → 1.35 rem | Lede, títulos pequenos |
| `--s2` | 1.5 → 2.1 rem | Títulos de card |
| `--s-proj` | 2.1 → 4.9 rem | Títulos de projeto (também limitado por `cqi`) |
| `--s-hero` | 3.6 → 10 rem | Nome no hero |

## Espaço e forma

- `--gutter`: margem lateral de 16 px (celular) a 64 px (desktop).
- `--radius`: 2 px em tudo. Chips e filtros são a exceção: formato pílula (999px).
- Sem sombras. A profundidade vem das bordas `--line` e das grades de 1 px.

## Componentes

| Componente | Classe | Observação |
|---|---|---|
| Botão | `.btn`, `.btn--solid`, `.btn--sm` | Altura mínima de 44 px |
| Preferência | `.pref` + `aria-pressed` | Liga/desliga |
| Chip de filtro | `.chip-btn` + `aria-pressed` | Multi-seleção |
| Tag | `.tags li` | Tecnologias |
| Status | `.status--producao`, `.status--experimento` | Com `.led` |
| Sparkline | `.spark` | SVG gerado em `main.js` |
| Grade de células | `.skills`, `.avail`, `.steps`, `.facts` | Gap de 1 px sobre `--line`, que vira a linha divisória |

## Movimento

- `--spring`: curva `linear()` com leve "quique", usada em botões, barras do menu e entrada da janela de projeto.
- `--ease`: entradas suaves (hero, fades).
- **Uma ousadia só:** o fundo WebGL. O resto é discreto.
- Efeitos de hover (levantar, deslocar) só em `@media (hover: hover)`. No toque, eles "grudariam".
- `prefers-reduced-motion`: desliga o fundo, o spotlight e reduz as transições a 0.01 ms.
