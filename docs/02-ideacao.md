# 02 · Ideação e decisões

## Quem e para quê

- **Pessoa:** Carla Braga, cientista e engenheira de automação.
- **Foco do portfólio:** **desenvolvimento** (full stack). Ciência e automação entram como diferencial, não como tema principal.
- **Público:**
  1. Recrutadores e gestores de tecnologia (vagas **CLT**).
  2. Empresas e clientes que contratam por projeto (**PJ**).
- **Missão da página:** em poucos segundos, mostrar que a Carla entrega software em produção, com resultado medido, e deixar claro como contratá-la.

## Conceito

**"Bancada de instrumentação."** O site é de dev, mas o visual vem do mundo da engenharia:
- O fundo parece traço de osciloscópio ou mapa topográfico de dados.
- O status dos projetos aparece como LED.
- O painel de ajustes do fundo se chama "Calibração", como um instrumento.
- As mini-linhas (sparklines) dos projetos repetem o traço do fundo, para o site inteiro ter uma linguagem visual só.

## Linha do tempo das decisões

| Quando | Decisão | Motivo |
|---|---|---|
| 04/11 | Estudar 3 portfólios clássicos (Brittany Chiang, Josh Comeau, Lee Robinson) | Ter referência de mercado |
| 04/11 | Usar como base as referências da Carla: Van Holtz, Barreto Lopes e p5aholic | Escolha dela, com a estética que ela quer |
| 04/11 | **Recriar os padrões com código próprio, sem copiar o código dos sites** | Direitos autorais e originalidade. O p5aholic tem até uma página que expõe quem copiou o código dele |
| 04/11 | Descartar "fundo preto + destaque laranja-vermelho" | É a cara de site gerado por IA. A ideia era evitar isso |
| 05/11 | Paleta trocada para **roxo, lilás, rosa, verde neon e verde neon escuro** | Pedido da Carla |
| 05/11 | Nome **Carla Braga** | Pedido da Carla |
| 05/11 | Exemplos de conteúdo escritos em tom profissional, com `[EDITAR]` só nos comentários | O site já pode ir ao ar sem marcações visíveis |
| 05/11 | Seção **Contratação** com CLT × PJ, etapas e FAQ | Pedido da Carla: falar direto com quem contrata |
| 05/11 | Fundo sempre abre com os valores calibrados pela Carla (paleta rosa) | Pedido da Carla. Nada é salvo entre visitas |
| 05/11 | Seção **Formação** com graduação, pós e mestrado | Pedido da Carla |
| 05/11 | Planejar a **V2** com framework e 3D | Mais profissional e interativo. Ver [roadmap](05-roadmap-v2.md) |
| 05/11 | **Mobile como prioridade** | Pedido da Carla. Ver [guia mobile](06-mobile.md) |

## O que veio de cada referência

| Padrão | Origem | Onde está no site |
|---|---|---|
| Menu numerado estilo editorial | Van Holtz, p5aholic | Sidebar e menu do celular (01 a 06) |
| Títulos gigantes empilhados | Van Holtz | Lista de projetos |
| Bloco de disponibilidade | Van Holtz | Hero: status, regime, local, resposta |
| "Oi, eu sou" + cards de competências | Barreto Lopes | Seção 01 |
| Projeto abre por cima da página | Barreto Lopes | Janela de detalhe (`<dialog>`) |
| Filtro da experiência por tipo | Barreto Lopes | Trajetória (Desenvolvimento / Automação / Pesquisa) |
| Publicações e contato por WhatsApp | Barreto Lopes | Seções 04 e 06 |
| Fundo WebGL generativo + painel de parâmetros | p5aholic | Fundo + "Calibrar" |
| Botões de tema claro/escuro e fonte mono | p5aholic | Preferências |
| Seção Lab e FAQ | p5aholic | Seções 03 e 05 |
| Sidebar fixa com seção ativa + brilho no cursor | Brittany Chiang | Layout desktop |
| Micro-interações com mola + som opcional | Josh Comeau | Botões, chips, som desligado por padrão |
| Texto enxuto | Lee Robinson | Todos os textos |

## Diferencial próprio

Cada projeto mostra **uma métrica de impacto**, uma **sparkline** e um **status**. O recrutador vê o resultado antes de ler a descrição.
