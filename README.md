# Carla Braga — Portfólio

Portfólio de desenvolvedora full stack. HTML, CSS e JavaScript puros (ES modules), fundo em WebGL2/GLSL escrito à mão. Sem build e sem dependências.

## Rodar localmente

Módulos ES precisam de servidor HTTP (abrir o arquivo direto não funciona):

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Estrutura

```
index.html      estrutura e seções
css/style.css   tokens de cor/tipo, layout e responsividade
js/data.js      TODO o conteúdo editável
js/main.js      renderização, navegação, overlay, filtro, preferências, som
js/field.js     shader do fundo (campo de fluxo)
js/panel.js     painel de calibração (botão "Calibrar" ou tecla C)
```

## O que editar

Tudo fica em `js/data.js`. Procure por `[EDITAR]`:

- `profile`: e-mail, WhatsApp (só dígitos, com DDI e DDD), cidade, LinkedIn e caminho do currículo
- `projects`: troque os exemplos por projetos reais. Mantenha o formato problema → solução → resultado medido
- `timeline`, `publications`, `awards`: empresas, instituições, datas e links reais
- Currículo: coloque o PDF em `assets/curriculo-carla-braga.pdf`

## Recursos

- Layout em 2 colunas no desktop, header fixo no tablet e menu em tela cheia no celular
- Tema claro/escuro, fonte monoespaçada e som (desligado por padrão), salvos no navegador
- Filtro da trajetória por área (Desenvolvimento, Automação, Pesquisa)
- Projetos abrem em overlay com contexto, stack e métricas
- `prefers-reduced-motion` desliga o fundo e as animações
- Foco visível, link "pular para o conteúdo", alvos de toque de 44px
