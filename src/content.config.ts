/* =========================================================================
   content.config.ts — Coleções de conteúdo (Content Collections)
   -------------------------------------------------------------------------
   Cada coleção tem um "loader" (de onde vêm os arquivos) e um "schema"
   (Zod) que valida os campos. Se faltar um campo obrigatório ou o tipo
   estiver errado, o build FALHA com uma mensagem dizendo qual arquivo e
   qual campo — assim nada quebrado vai para o ar.

   - projetos:   um arquivo .mdx por projeto em src/content/projetos/
                 (frontmatter = dados; corpo = estudo de caso)
   - formacao:   lista em src/content/formacao.yaml
   - trajetoria: lista em src/content/trajetoria.yaml
   ========================================================================= */
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const projetos = defineCollection({
  loader: glob({ base: './src/content/projetos', pattern: '**/*.mdx' }),
  schema: z.object({
    /** Título curto; use \n para quebrar a linha no título gigante. */
    title: z.string(),
    /** Ordem de exibição na home (menor primeiro). */
    order: z.number().int(),
    year: z.number().int(),
    role: z.string(),
    client: z.string(),
    period: z.string(),
    status: z.enum(['producao', 'experimento']),
    /** Métrica principal exibida na lista. */
    metric: z.object({ value: z.string(), label: z.string() }),
    /** Pontos da sparkline (qualquer escala; é normalizada). */
    spark: z.array(z.number()).min(2),
    problem: z.string(),
    solution: z.string(),
    /** Números de resultado (animados de 0 até o valor ao aparecer na tela). */
    results: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).min(1),
    stack: z.array(z.string()).min(1),
    links: z.object({
      github: z.string().url().optional(),
      demo: z.string().url().optional(),
      case: z.string().url().optional(),
    }).default({}),
  }),
});

const formacao = defineCollection({
  loader: file('src/content/formacao.yaml'),
  schema: z.object({
    order: z.number().int(),
    level: z.string(),
    course: z.string(),
    org: z.string(),
    period: z.string(),
    load: z.string().optional(),
    status: z.enum(['concluido', 'andamento']),
    work: z.string(),
    tags: z.array(z.string()),
  }),
});

const trajetoria = defineCollection({
  loader: file('src/content/trajetoria.yaml'),
  schema: z.object({
    order: z.number().int(),
    type: z.enum(['dev', 'automacao', 'pesquisa']),
    period: z.string(),
    role: z.string(),
    org: z.string(),
    text: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { projetos, formacao, trajetoria };
