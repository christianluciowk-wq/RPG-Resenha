/**
 * Único lugar para cadastrar capítulos, atualizações e anotações.
 */
window.CATALOGO = {
  capitulos: [
    {
      num: "I-II",
      title: "Lugar Nenhum",
      meta: "Era da Primeira Quebra — Capítulo 1",
      status: "breve",
      file: "cap-1-02.html",
    },
    {
      num: "I-I",
      title: "Boas-vindas não muito amigável",
      meta: "Era da Primeira Quebra — Prólogo",
      status: "novo",
      file: "cap-1-01.html",
    },
  ],
  atualizacoes: [
    {
      data: "2026-05-18",
      horario: "18:56",
      descricao: "Hot-fix: Correção de bugs menores e atualização da pagina anotações",
    },
    {
      data: "2026-05-17",
      horario: "18:30",
      descricao: "Refatoração completa do sistema de navegação e remoção do antigo sistema de comentários.",
    },
    {
      data: "2026-05-17",
      horario: "14:15",
      descricao: "Ajuste na paleta de cores para tons alaranjados e botões mais quadrados.",
    }
  ],
  anotacoes: [
    {
      titulo: "Separação de Capitulos",
      texto: "o primeiro número marca a quebra caso nao leia o subtítulo, o segundo marca o numero do capítulo, por exemplo: I-I é o primeiro capítulo da primeira quebra e II-I Seriao primeira capítulo da segunda quebra.",
    },
    {
      titulo: "As Quebras",
      texto: "São os pontos onde os quatro panteões tentam atacar a terra, eles tem três ataques, e o jeito que atacam pode ser comparado ao melhor de 3 já que: Primeiro ataque os 3 panteões estão ali para fazer um ritual para invocar este livro, se completo o livro fica preso na terra e em hipotese nenhuma consegue ser removido ou destruido, apos anos os panteões vem para a Segunda quebra (Observação importante: se a primeira invocação falhar a segunda também serve para invocar), caso haja sucesso as duas proximas quebras são de ataque uma mais forte que a outra.",
    },
    {
      titulo: "O Livro",
      texto: "Este livro é o que marca que o ritual da Primeira quebra foi completo e marca que o ultimo panteão, apocalipse aparecera apos os outros três.",
    }
  ]
};
