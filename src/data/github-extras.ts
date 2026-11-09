/* =========================================================================
   github-extras.ts — Fotos, prints e texto próprio para o modal de cada
   repositório da seção GitHub. [EDITAR]
   -------------------------------------------------------------------------
   A chave é o nome do repositório, igual ao do GitHub.
   - resumo: substitui o trecho do README (um parágrafo por item).
   - imagens: coloque os arquivos em public/github/<repo>/ e liste aqui
     (caminho relativo a public/). A primeira vira a imagem principal;
     sem imagens, o modal usa a prévia gerada pelo GitHub.
   ========================================================================= */

export interface RepoImage { src: string; alt: string; legenda?: string }
export interface RepoExtra { resumo?: string[]; imagens?: RepoImage[] }

export const githubExtras: Record<string, RepoExtra> = {
  // Exemplo:
  // 'bewear': {
  //   resumo: ['E-commerce completo...', 'Destaques: ...'],
  //   imagens: [
  //     { src: 'github/bewear/home.png', alt: 'Página inicial da loja', legenda: 'Home com catálogo' },
  //     { src: 'github/bewear/checkout.png', alt: 'Checkout em etapas' },
  //   ],
  // },
};
