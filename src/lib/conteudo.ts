// Textos, fotos e dados fixos do site. Troque à vontade: é só editar e salvar.

export const NOME_BARBEARIA = "Royal Cut";
export const SLOGAN = "Tradição, estilo e precisão em cada corte. Agende online em poucos segundos.";

export const QUEM_SOMOS = {
  titulo: "Tradição e estilo em cada detalhe",
  texto: [
    "Somos uma barbearia feita para quem gosta de se cuidar sem perder tempo. Aqui, cada corte é pensado para o seu estilo, com atenção aos detalhes do começo ao fim.",
    "E agora com espaço feminino: cortes, escova e tratamentos para ela, com o mesmo padrão Royal. Ambiente confortável, produtos de qualidade e hora marcada.",
  ],
  destaques: [
    { titulo: "Hora marcada", texto: "Sem fila e sem espera" },
    { titulo: "Agenda online", texto: "Marque a qualquer hora" },
    { titulo: "Produtos de qualidade", texto: "Para cabelo e barba" },
  ],
};

const foto = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=75`;

export const FOTO_TOPO = foto("1585747860715-2ba37e788b70"); // interior da barbearia
export const FOTO_AGENDAMENTO = foto("1512690459411-b9245aed614b"); // cadeira de barbeiro
export const FOTO_AGENDAMENTO_FEMININO = foto("1595476108010-b4d1f102b1b1"); // salão feminino

// Foto e descrição de cada serviço, pelo nome cadastrado no Supabase (sem acento e minúsculo).
const SERVICOS: Record<string, { foto: string; descricao: string }> = {
  "corte masculino": {
    foto: foto("1622286342621-4bd786c2447c"),
    descricao: "Corte na tesoura ou na máquina, com acabamento na navalha.",
  },
  "corte e barba": {
    foto: foto("1599351431202-1e0f0137899a"),
    descricao: "O combo completo: corte do seu jeito e barba alinhada.",
  },
  barba: {
    foto: foto("1532710093739-9470acff878f"),
    descricao: "Barba desenhada com toalha quente, navalha e hidratação.",
  },
};

// Espaço feminino: os serviços aparecem como cardápio, separados nestes grupos
// (pelo nome cadastrado no Supabase). Serviço feminino sem grupo cai em "Outros".
// `alto: true` faz o card ocupar duas linhas no computador (para o grupo com mais itens),
// e a ordem abaixo monta: [Cortes | Coloração] [Tratamentos | Coloração] [Alisamentos | Penteados].
export const GRUPOS_FEMININOS = [
  {
    titulo: "Cortes e escova",
    foto: foto("1580618672591-eb180b1a973f"),
    servicos: ["corte feminino", "corte + escova", "escova"],
  },
  {
    titulo: "Coloração",
    foto: foto("1492106087820-71f1a00d2b11"),
    servicos: ["coloracao completa", "pintura de raiz", "tonalizacao", "mechas", "luzes", "morena iluminada"],
    alto: true,
  },
  {
    titulo: "Tratamentos",
    foto: foto("1634449571010-02389ed0f9b0"),
    servicos: ["hidratacao", "reconstrucao"],
  },
  {
    titulo: "Alisamentos",
    foto: foto("1522337360788-8b13dee7a37e"),
    servicos: ["progressiva", "selagem"],
  },
  {
    titulo: "Penteados",
    foto: foto("1562322140-8baeececf3df"),
    servicos: ["penteado", "penteado de noiva"],
  },
];

export const FOTO_OUTROS_FEMININOS = foto("1560066984-138dadb4c035");

// Textos das duas seções de serviços.
export const SECOES_DE_SERVICOS = {
  masculino: {
    rotulo: "Barbearia",
    titulo: ["Cortes, barba e", "cuidado"],
    texto: "Escolha o serviço e agende direto pelo site.",
  },
  feminino: {
    rotulo: "Espaço feminino",
    titulo: ["Beleza com", "assinatura Royal"],
    texto: "Cortes, escova e tratamentos para os seus fios, com o mesmo cuidado e a hora marcada.",
  },
};

const SERVICO_PADRAO = {
  foto: foto("1621605815971-fbc98d665033"),
  descricao: "Atendimento com hora marcada e acabamento caprichado.",
};

export function normalizar(nome: string) {
  return nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function detalhesDoServico(nome: string) {
  return SERVICOS[normalizar(nome)] ?? SERVICO_PADRAO;
}

// ⚠️ EXEMPLOS para ver o visual: troque pelas avaliações reais dos seus clientes
// (do Google ou do Instagram) antes de colocar o site no ar.
export const AVALIACOES = [
  { nome: "Rafael S.", nota: 5, servico: "Corte e barba", texto: "Atendimento impecável. Saí com o corte exatamente como eu queria e a barba ficou perfeita." },
  { nome: "Lucas M.", nota: 5, servico: "Corte masculino", texto: "Agendei pelo site em um minuto e fui atendido no horário certinho. Virei cliente." },
  { nome: "Thiago R.", nota: 5, servico: "Barba", texto: "A toalha quente faz toda a diferença. Barba alinhada e sem irritação nenhuma." },
  { nome: "Bruno A.", nota: 4, servico: "Corte masculino", texto: "Ambiente muito agradável e profissional caprichoso. Recomendo." },
  { nome: "Gabriel P.", nota: 5, servico: "Corte e barba", texto: "Melhor barbearia da região. Atenção a cada detalhe do degradê." },
  { nome: "Felipe C.", nota: 5, servico: "Corte masculino", texto: "Levei meu filho e os dois saímos satisfeitos. Pontual e muito educado." },
  { nome: "Diego L.", nota: 5, servico: "Barba", texto: "Nunca minha barba ficou tão bem desenhada. Vale cada centavo." },
  { nome: "André V.", nota: 5, servico: "Corte e barba", texto: "Agenda online facilita demais. Escolho o horário e pronto." },
  { nome: "Marcos T.", nota: 4, servico: "Corte masculino", texto: "Corte moderno e bem feito. Já marquei o próximo." },
];

// ⚠️ Troque pelo endereço real: ele também é usado para mostrar o mapa.
export const ENDERECO = {
  linha1: "Av. Paulista, 1578",
  linha2: "Bela Vista, São Paulo - SP",
};
