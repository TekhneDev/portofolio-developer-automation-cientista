# Inspirações de Front-end — Portfólio Dev + Automação + Cientista

> Registro dos sites de referência para o design do portfólio.
> Criado em: 2026-11-04
>
> ⚠️ Análise feita a partir do conteúdo textual das páginas (sem CSS renderizado).
> Cores, fontes e animações exatas devem ser conferidas abrindo cada site no navegador.

---

## Sites indicados pela Carla

### 1. Van Holtz Co. — https://vanholtz.co/

**O que é:** estúdio/dev freelancer de front-end (Portland, remoto) focado em experiências digitais animadas, responsivas e interativas. Muito premiado (Awwwards, FWA, CSSDA, Webby).

**Estrutura:**
- Header com logo + navegação **numerada** (`01 about`, `02 journal`, `03–05` redes sociais)
- Intro com statement de posicionamento
- Lista de serviços: direção técnica, front-end, Craft CMS, consultoria
- Lista de trabalhos (8 case studies, cada um com página `/work/...`)
- Lista de prêmios agrupados por premiação
- Footer com e-mail de contato e crédito de design

**Ideias para pegar:**
- [ ] Navegação numerada estilo editorial (`01`, `02`, `03`…)
- [ ] Títulos de projeto com quebras de linha manuais / hifenização — tipografia grande e "empilhada"
- [ ] Seção de prêmios/certificações agrupada por instituição
- [ ] Bloco de disponibilidade ("remoto, baseado em X, disponível desde Y")

---

### 2. Barreto Lopes — https://barretolopes.com/

**O que é:** portfólio brasileiro de dev Full Stack + UX Designer + Propriedade Intelectual. Feito em Django/Python, HTML/CSS e JS, código aberto no GitHub.

**Estrutura (single page com âncoras):**
- Hero: "Oi, eu sou" + nome grande + tagline com áreas de atuação + LinkedIn/GitHub + imagem
- **Sobre:** imagem + blocos curtos com subtítulos ("Multidisciplinar"), CTA de currículo, botão "Saiba mais"
- **Competências:** cards empilhados (título + descrição de uma linha)
- **Portfolio:** grid de thumbnails → clique abre **overlay/modal** com cliente, descrição, links (GitHub, demo, case no blog), botões `×` e "Voltar"
- **Experiência:** **filtro com toggles** "Profissional" / "Acadêmica" que alterna timelines
- Prêmios, publicações, prévia do blog (imagem, título, categoria, data, "Leia mais")
- **Contato:** CTA de WhatsApp + e-mail + telefone + ícones sociais
- Rota separada `/blog`

**Ideias para pegar:**
- [ ] **Filtro Profissional / Acadêmica na experiência** — perfeito pro lado "cientista"
- [ ] Seção de **publicações** (artigos científicos, papers)
- [ ] Projetos em overlay sem sair da página, com link pro case completo
- [ ] Cards de competências curtos
- [ ] CTA direto de WhatsApp (público brasileiro)
- [ ] Hero em português com tom próximo ("Oi, eu sou…")

---

### 3. Keita Yamada (p5aholic) — https://p5aholic.me/projects/

**O que é:** designer & developer japonês, referência em creative coding / WebGL. Premiado no Awwwards.

**Estrutura:**
- Header: nome + "Designer & Developer"
- Navegação numerada com marcador de ponto: Home, Projects, Info, Contact, FAQ, Copycats
- Lista de projetos cronológica reversa: nome **bold**, data, créditos (Dev/Design + colaborador linkado)
- Página **Info** em formato Q&A (efeito de fundo, uso do código, recursos de estudo, libs)
- Página **Copycats** (sites que copiaram o código dele)
- Links para subdomínios de experimentos/playground

**Stack / efeitos:**
- **Fundo WebGL com three.js + shaders GLSL**
- **GSAP** para animações
- **Tweakpane** (painel para ajustar parâmetros do efeito em tempo real)
- **Alpine.js** para interatividade leve
- Toggles de **Light/Dark** e **fonte Monospaced**

**Ideias para pegar:**
- [ ] Fundo WebGL generativo (ex.: partículas / rede neural / campo de dados — combina com cientista)
- [ ] Painel tipo Tweakpane para o visitante "brincar" com os parâmetros (vibe laboratório/experimento)
- [ ] Toggle de fonte monoespaçada (estética terminal/código)
- [ ] Lista de projetos minimalista: título grande + data + créditos
- [ ] Página FAQ/Info em Q&A
- [ ] Seção "Lab / Experimentos" separada dos projetos principais

---

## Referências extras (pesquisadas antes)

| Site | Destaque |
|---|---|
| https://brittanychiang.com | Layout 2 colunas com sidebar sticky, nav ativa com linha, spotlight que segue o cursor, cards que esmaecem vizinhos |
| https://www.joshwcomeau.com | Micro-interações com física de mola, toggle de som, dark mode com imagens próprias, lista "Popular Content", easter eggs |
| https://leerob.com | Minimalismo extremo, só texto, notas organizadas por tema, contato direto |

---

## Síntese — o que misturar

| Elemento | Origem | Uso no portfólio |
|---|---|---|
| Navegação numerada `01 / 02 / 03` | Van Holtz + p5aholic | Menu principal |
| Fundo WebGL com shaders | p5aholic | Hero — visual de dados/rede neural |
| Painel de parâmetros (Tweakpane) | p5aholic | Easter egg "laboratório" |
| Toggle light/dark + monospace | p5aholic + Josh | Preferências do visitante |
| Tipografia grande e empilhada nos projetos | Van Holtz | Lista de projetos |
| Filtro Profissional / Acadêmica | Barreto Lopes | Experiência (dev × pesquisa) |
| Seção de publicações | Barreto Lopes | Papers / artigos científicos |
| Projeto em overlay + link para case | Barreto Lopes | Detalhe dos projetos |
| Sidebar sticky + spotlight do cursor | Brittany | Alternativa de layout |
| Contato direto (e-mail / WhatsApp) | Barreto Lopes + Lee | Footer |

**Toque próprio:** cada projeto de automação mostra uma métrica de impacto (ex.: `−40h/mês`, `acurácia 94%`), mini sparkline e badge de status (✅ produção / 🧪 experimento).

## Stack candidata
- Next.js ou Astro + Tailwind
- three.js + GLSL (fundo), GSAP (animação), Tweakpane (painel)

## Próximos passos
- [ ] Abrir cada site no navegador e anotar cores/fontes reais
- [ ] Definir paleta e tipografia
- [ ] Escolher stack
- [ ] Wireframe da home
