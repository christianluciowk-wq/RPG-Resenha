/**
 * Único lugar para cadastrar capítulos e personagens.
 * Novo capítulo: 1) acrescente um objeto em capitulos  2) copie templates/capitulo.html → pages/capitulos/cap-XX.html e troque __TITULO__, __META__, __CONTEUDO__.
 * Novo personagem: 1) acrescente em personagensPorEra → lista  2) copie templates/personagem.html → pages/personagens/<id>.html e troque os __...__.
 */
window.CATALOGO = {
  capitulos: [
    {
      num: "I-I",
      title: "Boas-vindas não muito amigável",
      meta: "Era da Primeira Quebra, Prólogo",
      status: "novo",
      file: "cap-1-01.html",
    },
    {
      num: "I-II",
      title: "Cartas na mesa do abismo",
      meta: "Era da Primeira Quebra, Capítulo II",
      status: "breve",
      file: "cap-1-02.html",
    },
  ],
  personagensPorEra: [
    {
      era: "Era da Fratura",
      lista: [
        {
          id: "alves",
          nome: "Alves, o Cartógrafo do Vão",
          desc: "Homem de tinta que some e mapas que mentem por omissão; assina tudo como quem desafia o silêncio.",
          file: "alves.html",
          img: "alves.jpg",
        },
        {
          id: "mira",
          nome: "Mira Duschene",
          desc: "Cirurgiã de memória ritual: vende esquecimento como piedade, mas nunca se aplica o remédio a si.",
          file: "mira.html",
          img: "mira.jpg",
        },
      ],
    },
    {
      era: "Era do Pacto Quebrado",
      lista: [
        {
          id: "arquivista",
          nome: "O Arquivista Sem Olhos",
          desc: "Entidade ou cargo: comparece quando um título já apagado do mundo é pronunciado em voz alta.",
          file: "arquivista.html",
          img: "arquivista.jpg",
        },
        {
          id: "nomes-rasurados",
          nome: "Sete nomes rasurados",
          desc: "Manchas no papel onde deveriam haver assinaturas; a contagem não admite um oitavo nome.",
          file: "nomes-rasurados.html",
          img: "nomes-rasurados.jpg",
        },
      ],
    },
  ],
};
