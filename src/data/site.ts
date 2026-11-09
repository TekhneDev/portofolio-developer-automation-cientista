/* =========================================================================
   site.ts — Conteúdo fixo do site (o que não é coleção)
   -------------------------------------------------------------------------
   Projetos, formação e trajetória ficam em src/content/ (um arquivo por item).
   Aqui ficam perfil, competências, lab, publicações, prêmios, contratação e FAQ.
   Procure por [EDITAR] e troque pelos dados reais.
   ========================================================================= */

export const profile = {
  name: 'Carla Braga',
  role: 'Desenvolvedora Full Stack',
  tagline: 'Aplicações web, APIs e as automações por trás delas.',
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
  cv: 'curriculo-carla-braga.pdf',         // [EDITAR] arquivo em public/
  repo: 'https://github.com/TekhneDev/portofolio-developer-automation-cientista',

  socials: [
    { label: 'GitHub', href: 'https://github.com/TekhneDev' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/' }, // [EDITAR]
    { label: 'E-mail', href: 'mailto:contato@carlabraga.dev' },  // [EDITAR]
  ],
};

/** Itens do menu: a ordem é a ordem real de leitura da página (por isso numerados). */
export const nav = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'lab', label: 'Lab' },
  { id: 'github', label: 'GitHub' },
  { id: 'trajetoria', label: 'Trajetória' },
  { id: 'contratacao', label: 'Contratação' },
  { id: 'contato', label: 'Contato' },
] as const;

/** Competências — uma linha de descrição + ferramentas. [EDITAR] */
export const skills = [
  { title: 'Front-end', text: 'Interfaces acessíveis e rápidas, com foco em Core Web Vitals.', tags: ['React', 'Astro', 'TypeScript', 'CSS moderno', 'Three.js'] },
  { title: 'Back-end e APIs', text: 'APIs REST e GraphQL documentadas, versionadas e testadas.', tags: ['Node.js', 'NestJS', 'Python', 'FastAPI', 'OpenAPI'] },
  { title: 'Dados', text: 'Modelagem relacional, filas e pipelines de ingestão.', tags: ['PostgreSQL', 'Redis', 'Kafka', 'dbt', 'BigQuery'] },
  { title: 'Automação e integrações', text: 'Integração entre ERP, CRM, e-commerce e chão de fábrica.', tags: ['RPA', 'Celery', 'Webhooks', 'OPC UA', 'Modbus'] },
  { title: 'Qualidade e DevOps', text: 'Testes automatizados, CI/CD e observabilidade desde o primeiro deploy.', tags: ['Vitest', 'Pytest', 'Playwright', 'Docker', 'GitHub Actions'] },
  { title: 'Ciência aplicada', text: 'Análise estatística, experimentos A/B e modelos de ML em produção.', tags: ['NumPy', 'pandas', 'scikit-learn', 'PyTorch', 'ONNX'] },
];

/** Lab — experimentos menores. `action: 'panel'` abre o painel do 3D. [EDITAR] */
export const lab: { title: string; text: string; tags: string[]; href?: string; action?: 'panel' }[] = [
  { title: 'Nuvem de dados em 3D', text: 'O fundo deste site: partículas em GLSL que mudam de forma com o scroll.', tags: ['Three.js', 'R3F', 'GLSL'], action: 'panel' },
  { title: 'CLI de scaffolding de automações', text: 'Gera módulos de automação com testes, logs e alertas já configurados.', tags: ['Python', 'Typer'] },
  { title: 'Simulador de CLP no navegador', text: 'Lógica ladder executada em JavaScript para treinar sem hardware.', tags: ['TypeScript', 'Canvas'] },
  { title: 'Benchmark de ORMs em Node.js', text: 'Comparação reprodutível de Prisma, Drizzle e Knex em cargas reais.', tags: ['Node.js', 'PostgreSQL'] },
];

/** Rótulos do filtro da trajetória (ids iguais ao campo `type` da coleção). */
export const timelineTypes = [
  { id: 'dev', label: 'Desenvolvimento' },
  { id: 'automacao', label: 'Automação' },
  { id: 'pesquisa', label: 'Pesquisa' },
] as const;

/** Publicações. [EDITAR] */
export const publications: { title: string; venue: string; year: number; href?: string }[] = [
  { title: 'Título do artigo sobre detecção de anomalias em séries temporais industriais', venue: 'Nome do periódico', year: 2021 },
  { title: 'Título do artigo sobre controle preditivo em processos térmicos', venue: 'Nome do congresso', year: 2020 },
];

/** Certificações e prêmios, agrupados por instituição. [EDITAR] */
export const awards = [
  { org: 'AWS', items: [{ title: 'Certified Developer — Associate', year: 2025 }] },
  { org: 'Hackathons', items: [{ title: '1º lugar — Hackathon de Indústria 4.0', year: 2023 }] },
  { org: 'Acadêmico', items: [{ title: 'Bolsa de iniciação científica', year: 2018 }] },
];

/** Modelos de contratação. */
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

/** Etapas de um projeto PJ (sequência real, por isso numerada). */
export const steps = [
  { title: 'Diagnóstico', text: 'Conversa de 30 minutos para entender objetivo, prazo e restrições técnicas.' },
  { title: 'Proposta', text: 'Escopo por escrito, estimativa, cronograma e valor. Sem custo.' },
  { title: 'Execução', text: 'Sprints de duas semanas com demonstração do que foi entregue.' },
  { title: 'Entrega', text: 'Deploy, documentação, treinamento do time e período de garantia.' },
];

/** Perguntas frequentes. */
export const faq = [
  { q: 'Você atua como CLT ou PJ?', a: 'Nos dois formatos. Em CLT, faço parte do time com dedicação integral. Em PJ, trabalho por projeto, com escopo e prazo definidos, ou por alocação mensal, sempre com contrato e nota fiscal.' },
  { q: 'Como você estima um projeto PJ?', a: 'Depois do diagnóstico, divido o escopo em entregas pequenas e estimo cada uma. A proposta traz o que está incluído, o que não está e como funcionam mudanças de escopo, que entram como aditivo.' },
  { q: 'Você assume sistemas que já existem?', a: 'Sim. Começo com uma auditoria técnica (código, dependências, testes e deploy) e entrego um relatório de riscos e prioridades antes de alterar qualquer coisa em produção.' },
  { q: 'Como é a comunicação durante o projeto?', a: 'Atualização semanal por escrito, quadro de tarefas compartilhado e uma reunião de demonstração ao fim de cada sprint.' },
  { q: 'O que é o fundo 3D do site?', a: 'Uma nuvem de partículas feita com Three.js e React Three Fiber, com shaders próprios. Ela muda de forma conforme você rola a página. Clique em “Calibrar” ou pressione C para ajustar cores, tamanho e velocidade.' },
];
