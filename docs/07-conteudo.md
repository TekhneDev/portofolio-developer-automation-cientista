# 07 · Guia de conteúdo

Todo texto fica em `js/data.js`. Procure por `[EDITAR]`.

## Projetos: a fórmula

Recrutador e cliente PJ querem saber três coisas: **qual era o problema, o que você fez e quanto melhorou.**

| Campo | Como escrever | Exemplo |
|---|---|---|
| `title` | 2 a 4 palavras. Use `\n` para quebrar a linha | `'Orquestrador\nde Automações'` |
| `role` | Seu papel + área | `'Back-end · automação'` |
| `client` | Setor + "(confidencial)", se não puder citar o nome | `'Indústria de alimentos (confidencial)'` |
| `metric` | **Um** número que resume o impacto | `{ value: '−40 h/mês', label: 'trabalho manual eliminado' }` |
| `problem` | 1 a 2 frases, com a dor em números se possível | "…executadas à mão por três pessoas…" |
| `solution` | Verbo na 1ª pessoa + decisões técnicas | "Criei um orquestrador com filas, reprocessamento…" |
| `results` | 3 números com rótulo curto | `−87%` cancelamentos · `12 mil` pedidos/dia · `99,9%` disponibilidade |
| `stack` | 4 a 6 tecnologias principais | |
| `spark` | 8 a 12 pontos que mostrem a evolução da métrica | |
| `status` | `'producao'` ou `'experimento'` | |

**Métricas que funcionam bem:**
- Tempo economizado: h/mês, minutos por tarefa.
- Desempenho: p95 da API, tempo de carregamento.
- Qualidade: taxa de erro, incidentes, acurácia.
- Volume: pedidos/dia, usuários ativos.
- Dinheiro: custo de nuvem, receita, cancelamentos.

Se não houver número exato, use uma estimativa honesta com "~" (`~30 h/mês`). Nunca invente.

**Verbos fortes:** desenhei, implementei, migrei, automatizei, reduzi, integrei, liderei, padronizei.

## Trajetória

- `type`: `'dev'`, `'automacao'` ou `'pesquisa'` (é o que o filtro usa).
- `text`: o que você fazia, com escopo e tecnologias, sem lista de tarefas genéricas.
- Para trabalho PJ: `role: 'Desenvolvedora Front-end (PJ)'` e `org: 'Projetos sob demanda'` ou o nome do cliente.

## Formação

- `level`: `'Graduação'`, `'Pós-graduação lato sensu'`, `'MBA'`, `'Mestrado'` ou `'Doutorado'`.
- `status`: `'concluido'` ou `'andamento'`.
- `load`: carga horária ou bolsa (`'420 h'`, `'Bolsista CAPES'`).
- `work`: título do TCC ou dissertação, em uma frase que diga o resultado.

## Contratação (CLT × PJ)

Os textos atuais já estão prontos. Ajuste só se o seu modelo for diferente.

**CLT:** destaque dedicação, responsabilidade de ponta a ponta, code review e mentoria.

**PJ:** deixe explícito:
- Formato: escopo fechado ou banco de horas.
- Formalização: contrato, NDA e nota fiscal.
- Como as entregas acontecem: sprints de 2 semanas com demonstração.
- O que o cliente recebe no fim: código no repositório dele, documentação e handover.

## Perfil e contato

- `whatsapp`: só dígitos, com DDI e DDD, por exemplo `5511987654321`.
- `cv`: salve o PDF em `assets/` e ajuste o caminho.
- `availability`: mantenha honesto. Se não estiver disponível, troque o texto e `live: false`.

## Tom de voz

- Frases curtas, voz ativa e primeira pessoa.
- Nada de "apaixonada por tecnologia", "solucionadora de problemas" ou emoji.
- Número sempre que possível.
