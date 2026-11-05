/* =========================================================================
   CONTEÚDO DO SITE
   Todo texto do portfólio vive aqui. Procure por [EDITAR] e troque pelos
   seus dados reais. Os exemplos já estão escritos no tom certo para
   recrutadores (CLT) e clientes (PJ): contexto → decisão técnica → resultado
   medido. Mantenha esse formato ao substituir.
   ========================================================================= */

export const profile = {
  name: 'Carla Braga',
  role: 'Desenvolvedora Full Stack',
  lede:
    'Desenvolvo aplicações web de ponta a ponta — interface, API e banco de dados — ' +
    'e as automações que mantêm a operação rodando. Venho da ciência e da engenharia ' +
    'de automação: meço antes de otimizar e escrevo código pensado para produção.',

  availability: [
    { label: 'Status', value: 'Disponível para novas oportunidades', live: true },
    { label: 'Regime', value: 'CLT ou PJ' },
    { label: 'Local', value: 'São Paulo, SP · remoto ou híbrido' }, // [EDITAR] cidade
    { label: 'Resposta', value: 'Em até 1 dia útil' },
  ],

  email: 'contato@carlabraga.dev',          // [EDITAR]
  whatsapp: '5511999999999',               // [EDITAR] DDI + DDD + número, só dígitos
  whatsappMsg: 'Olá, Carla! Vi seu portfólio e gostaria de conversar sobre',
  cv: 'assets/curriculo-carla-braga.pdf',  // [EDITAR] coloque o PDF nessa pasta

  socials: [
    { label: 'GitHub', href: 'https://github.com/TekhneDev' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/' }, // [EDITAR]
    { label: 'E-mail', href: 'mailto:contato@carlabraga.dev' },  // [EDITAR]
  ],
};

/* Competências — uma linha de descrição + ferramentas. [EDITAR] */
export const skills = [
  {
    title: 'Front-end',
    text: 'Interfaces acessíveis e rápidas, com foco em Core Web Vitals.',
    tags: ['React', 'Next.js', 'TypeScript', 'CSS moderno', 'WebGL'],
  },
  {
    title: 'Back-end e APIs',
    text: 'APIs REST e GraphQL documentadas, versionadas e testadas.',
    tags: ['Node.js', 'NestJS', 'Python', 'FastAPI', 'OpenAPI'],
  },
  {
    title: 'Dados',
    text: 'Modelagem relacional, filas e pipelines de ingestão.',
    tags: ['PostgreSQL', 'Redis', 'Kafka', 'dbt', 'BigQuery'],
  },
  {
    title: 'Automação e integrações',
    text: 'Integração entre ERP, CRM, e-commerce e chão de fábrica.',
    tags: ['RPA', 'Celery', 'Webhooks', 'OPC UA', 'Modbus'],
  },
  {
    title: 'Qualidade e DevOps',
    text: 'Testes automatizados, CI/CD e observabilidade desde o primeiro deploy.',
    tags: ['Jest', 'Pytest', 'Playwright', 'Docker', 'GitHub Actions'],
  },
  {
    title: 'Ciência aplicada',
    text: 'Análise estatística, experimentos A/B e modelos de ML em produção.',
    tags: ['NumPy', 'pandas', 'scikit-learn', 'PyTorch', 'ONNX'],
  },
];

/* Projetos — `title` aceita \n para quebrar a linha no título gigante.
   `spark` são pontos da mini-linha (qualquer escala, é normalizada).
   `status`: 'producao' | 'experimento'.                         [EDITAR] */
export const projects = [
  {
    id: 'portal-operacoes',
    title: 'Portal de\nOperações',
    year: 2025,
    role: 'Full stack · líder técnica',
    client: 'Empresa de logística (confidencial)',
    period: '6 meses',
    status: 'producao',
    metric: { value: 'p95 180 ms', label: 'tempo de resposta da API' },
    spark: [42, 38, 40, 31, 28, 24, 22, 19, 18, 18],
    stack: ['Next.js', 'TypeScript', 'NestJS', 'PostgreSQL', 'WebSocket', 'AWS'],
    problem:
      'A operação acompanhava entregas em planilhas atualizadas manualmente, com até 2 horas de atraso entre o evento e a informação.',
    solution:
      'Desenhei e implementei um painel em tempo real com eventos via WebSocket, API em NestJS com cache em Redis e controle de acesso por perfil. Deploy em contêineres com pipeline de CI/CD e testes end-to-end.',
    results: [
      { value: '−95%', label: 'atraso da informação' },
      { value: '180 ms', label: 'p95 da API' },
      { value: '320', label: 'usuários ativos/dia' },
    ],
    links: { github: '', demo: '', case: '' }, // [EDITAR]
  },
  {
    id: 'orquestrador',
    title: 'Orquestrador\nde Automações',
    year: 2025,
    role: 'Back-end · automação',
    client: 'Indústria de alimentos (confidencial)',
    period: '4 meses',
    status: 'producao',
    metric: { value: '−40 h/mês', label: 'trabalho manual eliminado' },
    spark: [10, 14, 18, 22, 27, 31, 36, 38, 40, 40],
    stack: ['Python', 'FastAPI', 'Celery', 'Redis', 'Docker', 'Grafana'],
    problem:
      'Rotinas de conciliação, emissão de relatórios e integração com o ERP eram executadas à mão por três pessoas, com retrabalho frequente.',
    solution:
      'Criei um orquestrador de tarefas com filas, reprocessamento automático e trilha de auditoria. Cada automação é um módulo versionado com testes e alertas de falha no Slack.',
    results: [
      { value: '40 h', label: 'economizadas por mês' },
      { value: '0,3%', label: 'taxa de falha' },
      { value: '14', label: 'rotinas automatizadas' },
    ],
    links: { github: '', demo: '', case: '' },
  },
  {
    id: 'integracao-erp',
    title: 'Integração\nde Pedidos',
    year: 2024,
    role: 'Back-end · ERP e e-commerce',
    client: 'Varejo omnichannel (confidencial)',
    period: '3 meses',
    status: 'producao',
    metric: { value: '12 mil', label: 'pedidos sincronizados/dia' },
    spark: [3, 4, 5, 7, 6, 8, 9, 11, 12, 12],
    stack: ['Node.js', 'NestJS', 'RabbitMQ', 'PostgreSQL', 'OpenAPI'],
    problem:
      'Estoque e pedidos divergiam entre a loja virtual e o ERP, gerando vendas sem estoque e cancelamentos.',
    solution:
      'Implementei uma camada de integração orientada a eventos, com idempotência, retentativas com backoff e painel de reconciliação para o time financeiro.',
    results: [
      { value: '−87%', label: 'cancelamentos por ruptura' },
      { value: '12 mil', label: 'pedidos/dia' },
      { value: '99,9%', label: 'disponibilidade' },
    ],
    links: { github: '', demo: '', case: '' },
  },
  {
    id: 'qualidade-dados',
    title: 'Painel de\nQualidade de Dados',
    year: 2024,
    role: 'Front-end · dados',
    client: 'Projeto interno',
    period: '2 meses',
    status: 'producao',
    metric: { value: '−62%', label: 'incidentes de dados' },
    spark: [30, 28, 26, 22, 19, 17, 14, 13, 12, 11],
    stack: ['React', 'TypeScript', 'dbt', 'BigQuery', 'D3.js'],
    problem:
      'Erros em tabelas de origem só eram percebidos quando um relatório executivo saía errado.',
    solution:
      'Construí testes de dados no dbt e um painel em React que mostra a saúde de cada tabela, com histórico, responsável e alerta automático.',
    results: [
      { value: '−62%', label: 'incidentes' },
      { value: '4 min', label: 'tempo de detecção' },
      { value: '180', label: 'tabelas monitoradas' },
    ],
    links: { github: '', demo: '', case: '' },
  },
  {
    id: 'inspecao-visual',
    title: 'Inspeção\nVisual com IA',
    year: 2023,
    role: 'Pesquisa · ML',
    client: 'Projeto de pesquisa aplicada',
    period: '5 meses',
    status: 'experimento',
    metric: { value: '94%', label: 'acurácia em validação' },
    spark: [61, 68, 72, 79, 83, 86, 89, 91, 93, 94],
    stack: ['Python', 'PyTorch', 'OpenCV', 'ONNX Runtime', 'FastAPI'],
    problem:
      'A inspeção de defeitos em linha de produção era visual e amostral, deixando passar peças com falha.',
    solution:
      'Treinei uma rede convolucional com dados rotulados na própria linha, exportei para ONNX e servi o modelo em uma API leve rodando em hardware de borda.',
    results: [
      { value: '94%', label: 'acurácia' },
      { value: '35 ms', label: 'inferência por peça' },
      { value: '100%', label: 'das peças inspecionadas' },
    ],
    links: { github: '', demo: '', case: '' },
  },
];

/* Lab — experimentos menores. [EDITAR] */
export const lab = [
  {
    title: 'Campo de fluxo em GLSL',
    text: 'O fundo deste site. Ruído fractal com distorção de domínio, sem bibliotecas.',
    tags: ['WebGL2', 'GLSL'],
    href: '#',
    action: 'panel',
  },
  {
    title: 'CLI de scaffolding de automações',
    text: 'Gera módulos de automação com testes, logs e alertas já configurados.',
    tags: ['Python', 'Typer'],
    href: '',
  },
  {
    title: 'Simulador de CLP no navegador',
    text: 'Lógica ladder executada em JavaScript para treinar sem hardware.',
    tags: ['TypeScript', 'Canvas'],
    href: '',
  },
  {
    title: 'Benchmark de ORMs em Node.js',
    text: 'Comparação reprodutível de Prisma, Drizzle e Knex em cargas reais.',
    tags: ['Node.js', 'PostgreSQL'],
    href: '',
  },
];

/* Trajetória — `type`: 'dev' | 'automacao' | 'pesquisa'. [EDITAR] */
export const timelineTypes = [
  { id: 'dev', label: 'Desenvolvimento' },
  { id: 'automacao', label: 'Automação' },
  { id: 'pesquisa', label: 'Pesquisa' },
];

export const timeline = [
  {
    type: 'dev',
    period: '2024 — atual',
    role: 'Desenvolvedora Full Stack',
    org: 'Empresa X',
    text: 'Desenvolvimento de produtos web em Next.js e NestJS, desenho de APIs, revisão de código e definição de padrões de testes e CI/CD para o time.',
    tags: ['Next.js', 'NestJS', 'PostgreSQL', 'AWS'],
  },
  {
    type: 'automacao',
    period: '2022 — 2024',
    role: 'Engenheira de Automação',
    org: 'Empresa Y',
    text: 'Automação de processos industriais e administrativos, integração de CLP e SCADA com sistemas web e coleta de dados de sensores em tempo real.',
    tags: ['Python', 'OPC UA', 'Node-RED', 'Grafana'],
  },
  {
    type: 'dev',
    period: '2021 — 2022',
    role: 'Desenvolvedora Front-end (PJ)',
    org: 'Projetos sob demanda',
    text: 'Landing pages, dashboards e sistemas internos para pequenas e médias empresas, do levantamento de requisitos à publicação.',
    tags: ['React', 'TypeScript', 'Vercel'],
  },
  {
    type: 'pesquisa',
    period: '2019 — 2021',
    role: 'Pesquisadora',
    org: 'Universidade Z',
    text: 'Modelagem e análise de dados experimentais, pipelines reprodutíveis em Python e publicação de resultados em periódicos e congressos.',
    tags: ['Python', 'Estatística', 'LaTeX'],
  },
  {
    type: 'pesquisa',
    period: '2015 — 2019',
    role: 'Graduação em Engenharia de Controle e Automação',
    org: 'Universidade Z',
    text: 'Trabalho de conclusão em controle preditivo aplicado a processos térmicos.',
    tags: ['MATLAB', 'Controle', 'Instrumentação'],
  },
];

/* Publicações. [EDITAR] */
export const publications = [
  {
    title: 'Título do artigo sobre detecção de anomalias em séries temporais industriais',
    venue: 'Nome do periódico',
    year: 2021,
    href: '',
  },
  {
    title: 'Título do artigo sobre controle preditivo em processos térmicos',
    venue: 'Nome do congresso',
    year: 2020,
    href: '',
  },
];

/* Certificações e prêmios, agrupados por instituição. [EDITAR] */
export const awards = [
  { org: 'AWS', items: [{ title: 'Certified Developer — Associate', year: 2025 }] },
  { org: 'Hackathons', items: [{ title: '1º lugar — Hackathon de Indústria 4.0', year: 2023 }] },
  { org: 'Acadêmico', items: [{ title: 'Bolsa de iniciação científica', year: 2018 }] },
];

/* Modelos de contratação. */
export const hiring = [
  {
    id: 'clt',
    title: 'CLT',
    for: 'Para empresas que querem uma desenvolvedora dedicada ao time.',
    items: [
      'Dedicação integral ao produto e participação nos rituais do time',
      'Responsabilidade de ponta a ponta: da tarefa ao deploy e monitoramento',
      'Code review, documentação técnica e mentoria de pessoas júnior',
      'Ponte entre produto, dados e operação, com visão de automação',
    ],
    format: 'Presencial, híbrido ou remoto · início a combinar',
  },
  {
    id: 'pj',
    title: 'PJ',
    for: 'Para projetos com escopo definido ou alocação por período.',
    items: [
      'Proposta com escopo, entregáveis, cronograma e valor fechado',
      'Ou alocação mensal por banco de horas, com relatório de horas',
      'Contrato de prestação de serviço, NDA e emissão de nota fiscal',
      'Entrega com código no seu repositório, documentação e handover',
    ],
    format: 'Remoto · sprints de 2 semanas · suporte pós-entrega opcional',
  },
];

/* Etapas de um projeto PJ (sequência real, por isso numerada). */
export const steps = [
  { title: 'Diagnóstico', text: 'Conversa de 30 minutos para entender objetivo, prazo e restrições técnicas.' },
  { title: 'Proposta', text: 'Escopo por escrito, estimativa, cronograma e valor. Sem custo.' },
  { title: 'Execução', text: 'Sprints de duas semanas com demonstração do que foi entregue.' },
  { title: 'Entrega', text: 'Deploy, documentação, treinamento do time e período de garantia.' },
];

/* FAQ. */
export const faq = [
  {
    q: 'Você atua como CLT ou PJ?',
    a: 'Nos dois formatos. Em CLT, faço parte do time com dedicação integral. Em PJ, trabalho por projeto, com escopo e prazo definidos, ou por alocação mensal, sempre com contrato e nota fiscal.',
  },
  {
    q: 'Como você estima um projeto PJ?',
    a: 'Depois do diagnóstico, divido o escopo em entregas pequenas e estimo cada uma. A proposta traz o que está incluído, o que não está e como funcionam mudanças de escopo, que entram como aditivo.',
  },
  {
    q: 'Você assume sistemas que já existem?',
    a: 'Sim. Começo com uma auditoria técnica (código, dependências, testes e deploy) e entrego um relatório de riscos e prioridades antes de alterar qualquer coisa em produção.',
  },
  {
    q: 'Como é a comunicação durante o projeto?',
    a: 'Atualização semanal por escrito, quadro de tarefas compartilhado e uma reunião de demonstração ao fim de cada sprint.',
  },
  {
    q: 'O que é o fundo animado do site?',
    a: 'Um campo de fluxo escrito em GLSL, sem bibliotecas. Clique em “Calibrar” ou pressione C para ajustar frequência, ruído e densidade.',
  },
];
