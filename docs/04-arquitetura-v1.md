# 04 · Arquitetura V1

Site estático, sem build e sem dependências. Precisa só de um servidor HTTP simples, porque os ES modules não funcionam em `file://`.

```
index.html      casca das seções, metadados, script de tema no <head>
css/style.css   tokens, layout, componentes, responsivo
js/data.js      TODO o conteúdo (único arquivo a editar no dia a dia)
js/main.js      monta as seções e liga as interações
js/field.js     fundo WebGL2 (shader de campo de fluxo)
js/panel.js     painel "Calibração do campo"
docs/           esta documentação
```

## Fluxo de carregamento

```
<head>
  └─ script inline: aplica tema/fonte salvos ANTES da pintura (sem flash)
<body>
  └─ main.js (module, carrega depois do HTML)
       1. render()           data.js → HTML de todas as seções
       2. createField()      só se: WebGL2 ok + sem "movimento reduzido" + sem "economia de dados"
       3. createPanel()      painel de calibração (desabilitado se não houver fundo)
       4. setupNav()         seção ativa + menu em tela cheia no celular
       5. setupSheet()       janela de detalhe do projeto
       6. setupFilter()      filtro da trajetória
       7. setupPrefs()       tema / mono / som / tecla C
       8. setupContact()     copiar e-mail
       9. setupSpot()        brilho do cursor (só com mouse)
      10. setupHeaderHeight() mede o header → --header-h (âncoras)
       └─ .is-ready no <html> → animação de entrada do hero
```

## Módulos

### `data.js`
Exporta objetos e listas: `profile`, `skills`, `projects`, `lab`, `timelineTypes`, `timeline`, `education`, `publications`, `awards`, `hiring`, `steps`, `faq`. Não tem lógica. Os comentários `[EDITAR]` marcam o que trocar.

### `main.js`
- **Utilitários:** `$`, `$$`, `esc()` (escapa HTML) e `store` (localStorage protegido com try/catch).
- **Geradores de marcação:** `sparkline()`, `status()`, `stackedTitle()`, `tags()`.
- **Detalhe do projeto:** usa `<dialog>.showModal()`, que já prende o foco, fecha com Esc e deixa o fundo inerte. Ao fechar, o foco volta para a linha do projeto.
- **Menu do celular:** marca o `<main>` como `inert` enquanto está aberto e fecha sozinho se a tela passar de 700 px.
- **Som:** oscilador Web Audio, sem arquivos de áudio. Desligado por padrão.

### `field.js`
- Triângulo de tela cheia + fragment shader com **fbm** (5 oitavas) e **domain warping** em duas etapas.
- **Isolinhas** com antialias via `fwidth`. Uma linha a cada 5 recebe a cor de destaque.
- Resolução interna de 50% (celular) ou 75% (desktop). No celular, limite de ~30 fps.
- Pausa quando a aba fica oculta.
- `DEFAULTS` define os valores com que o site sempre abre.

### `panel.js`
- Monta os controles a partir de `CONTROLS` e `PALETTES`.
- Escreve direto em `field.params` via `field.set()`.
- Não salva nada entre visitas.
- Devolve o foco a quem abriu.

## O que fica salvo no navegador

| Chave | Valor | Para quê |
|---|---|---|
| `cb-theme` | `dark` / `light` | Tema escolhido |
| `cb-font` | `mono` / `sans` | Fonte |
| `cb-sound` | `on` / `off` | Som |

O fundo **não** é salvo: sempre volta aos valores padrão.

## Como rodar

```bash
python3 -m http.server 8000
# http://localhost:8000
```
