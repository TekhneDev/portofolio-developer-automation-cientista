# 06 · Mobile

O mobile é prioridade: a maior parte dos recrutadores abre o link do portfólio pelo celular (LinkedIn, WhatsApp, e-mail).

## Faixas de tela

| Faixa | Layout |
|---|---|
| **< 420 px** (celular pequeno) | Tudo em 1 coluna, inclusive disponibilidade e etapas. Botões de contato em largura total |
| **< 700 px** (celular) | Barra no topo com nome + botão "Menu". O menu abre em tela cheia, numerado e com letra grande. Projeto e painel ocupam a tela |
| **700–1099 px** (tablet / celular deitado largo) | Header fixo com nome, preferências e menu na horizontal |
| **≥ 1100 px** (desktop) | Sidebar fixa à esquerda + conteúdo rolando |
| **Altura < 500 px, deitado** | Hero menor, menu em 2 colunas e header deixa de ser fixo |

## Regras aplicadas

**Toque**
- Todo alvo de toque tem **≥ 44 × 44 px**: botões, links do menu, chips, resumo do FAQ e controles do painel.
- `touch-action: manipulation`: sem atraso de duplo toque.
- Sem o "flash" azul no toque (`-webkit-tap-highlight-color`).
- Efeitos de hover só em `@media (hover: hover)`. Com o dedo, nada fica "grudado".

**Tela e notch**
- `viewport-fit=cover` + `env(safe-area-inset-*)` no header, no menu, na janela de projeto, no painel e no rodapé.
- Altura com `100dvh`, que não pula quando a barra do navegador some.
- Cor da barra do navegador (`theme-color`) acompanha o tema.

**Navegação**
- Menu em tela cheia: trava a rolagem da página, deixa o conteúdo inerte, rola por dentro se a tela for baixa, fecha com Esc ou ao tocar num link.
- Âncoras param abaixo do header fixo, porque a altura dele é medida em JS (`--header-h`).

**Janela de projeto**
- Ocupa a tela toda.
- O cabeçalho com **"Fechar" fica fixo no topo**, sempre ao alcance.
- "Voltar aos projetos" em largura total no fim.
- A página de trás não rola.

**Painel de calibração**
- Vira uma **bottom sheet**: largura total, cantos arredondados no topo, rolagem interna até 72% da altura.
- Rótulo acima do controle, controles mais altos e botões em largura total.

**Tipografia**
- Toda a escala usa `clamp()`.
- Títulos de projeto também seguem a largura da lista (`cqi`, container query), então palavras longas como "ORQUESTRADOR" cabem em 360 px.
- `overflow-wrap: break-word` em textos, para URL ou nome longo não estourar.

**Desempenho (V2)**
- A cena 3D carrega **por último**, quando o navegador fica ocioso. O texto aparece antes.
- Celular: 9 mil partículas, DPR até 1.5, ~30 fps e sem bloom.
- Cena desligada com "economia de dados" ou "movimento reduzido".
- Rolagem suave (Lenis) só na roda do mouse. No toque, a rolagem é a nativa.
- Cursor em anel, spotlight e botões magnéticos só com mouse.
- Painel de calibração (Leva) como bottom sheet.

## Checklist antes de publicar

- [ ] 360 × 740: nada corta na horizontal, sem rolagem lateral
- [ ] 390 × 844 (iPhone) e 412 × 915 (Android)
- [ ] Celular deitado (844 × 390): menu e hero cabem
- [ ] Menu abre, fecha, trava a rolagem e o foco não escapa
- [ ] Página do projeto abre, o título cabe sem hífen e "Todos os projetos" volta para a lista
- [ ] Painel abre como bottom sheet e os controles respondem ao dedo
- [ ] Tema claro e escuro legíveis ao sol (contraste AA)
- [ ] Botão de WhatsApp abre o app com a mensagem pronta
- [ ] Lighthouse mobile: Performance ≥ 90, Acessibilidade 100

## Como testar

1. **Chrome DevTools:** `Ctrl+Shift+M` (modo dispositivo) → testar 360, 390, 412, 768 e 1024, nas duas orientações.
2. **No celular de verdade, na mesma rede Wi-Fi:**
   ```bash
   npm run dev -- --host
   # no celular: o endereço "Network" que aparecer no terminal
   ```
   No WSL, talvez seja preciso liberar a porta no Windows ou usar o IP do Windows.
3. **Lighthouse:** DevTools → Lighthouse → Mobile → Analisar.

**Automático:** `npm test` roda o Playwright em 360, 390, 844×390 (deitado), 768, 1440 e 1920 px. Ele verifica:
- que não há rolagem lateral;
- que os alvos de toque têm ≥ 44 px;
- o menu do celular;
- o filtro;
- a navegação para a página do projeto;
- o painel de calibração;
- que não há erros de JavaScript.
