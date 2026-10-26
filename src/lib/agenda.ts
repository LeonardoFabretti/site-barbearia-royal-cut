import { prisma } from "@/lib/prisma";

export const FUSO = "America/Sao_Paulo";
// Quantos dias para frente o cliente consegue agendar.
export const DIAS_DISPONIVEIS = 21;

export type Categoria = "masculino" | "feminino";

export type Servico = {
  id: number;
  nome: string;
  preco: number;
  duracaoMin: number;
  categoria: Categoria;
};

export type Horario = {
  inicio: string; // ISO (UTC), o valor que vai para o banco
  hora: string; // "14:30", no horário de Brasília
};

// Data de hoje em Brasília, no formato "AAAA-MM-DD".
export function hojeEmBrasilia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(new Date());
}

// Dia da semana de uma data "AAAA-MM-DD" (0 = domingo), igual à coluna `dia_semana`.
export function diaDaSemana(data: string) {
  return new Date(`${data}T12:00:00Z`).getUTCDay();
}

export function horaEmBrasilia(instante: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
  }).format(instante);
}

export function dataEmBrasilia(instante: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(instante);
}

// Por enquanto a barbearia tem um profissional só: o primeiro ativo.
export async function buscarProfissional() {
  return prisma.profissionais.findFirst({
    where: { ativo: true },
    orderBy: { id: "asc" },
  });
}

export async function listarServicos(): Promise<Servico[]> {
  const servicos = await prisma.servicos.findMany({
    where: { ativo: true },
    orderBy: { id: "asc" },
  });
  return servicos.map((s) => ({
    id: Number(s.id),
    nome: s.nome,
    preco: Number(s.preco),
    duracaoMin: s.duracao_min,
    categoria: s.categoria === "feminino" ? "feminino" : "masculino",
  }));
}

export async function buscarServico(id: number) {
  const servico = await prisma.servicos.findUnique({ where: { id: BigInt(id) } });
  if (!servico || !servico.ativo) return null;
  return servico;
}

// Dias da semana em que o profissional trabalha (ex.: [2, 3, 4, 5, 6]).
export async function diasDeTrabalho(profissionalId: bigint) {
  const linhas = await prisma.expediente.findMany({
    where: { profissional_id: profissionalId },
    select: { dia_semana: true },
    distinct: ["dia_semana"],
  });
  return linhas.map((l) => l.dia_semana);
}

const NOMES_DOS_DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

// As colunas `time` chegam como data em 1970 (UTC): só a hora interessa.
function hhmm(hora: Date) {
  return hora.toISOString().slice(11, 16);
}

// Horário de funcionamento da semana, ex.: [{ dia: "Terça", periodos: "09:00–12:00 · 13:00–19:00" }].
export async function horarioDeFuncionamento(profissionalId: bigint) {
  const linhas = await prisma.expediente.findMany({
    where: { profissional_id: profissionalId },
    orderBy: [{ dia_semana: "asc" }, { inicio: "asc" }],
  });
  // Segunda primeiro e domingo por último, como costuma aparecer em placas.
  return [1, 2, 3, 4, 5, 6, 0].map((dia) => {
    const periodos = linhas.filter((l) => l.dia_semana === dia);
    return {
      dia: NOMES_DOS_DIAS[dia],
      periodos: periodos.length
        ? periodos.map((p) => `${hhmm(p.inicio)}–${hhmm(p.fim)}`).join(" · ")
        : "Fechado",
    };
  });
}

// A mesma consulta testada no SQL Editor: expediente do dia, de 30 em 30 min,
// só onde o serviço inteiro cabe, sem bater em agendamento ativo e só no futuro.
export async function horariosLivres(
  profissionalId: bigint,
  data: string,
  duracaoMin: number,
): Promise<Horario[]> {
  const linhas = await prisma.$queryRaw<{ inicio: Date }[]>`
    with periodos as (
      select
        (${data}::date + e.inicio) at time zone ${FUSO} as abre,
        (${data}::date + e.fim) at time zone ${FUSO} as fecha
      from expediente e
      where e.profissional_id = ${profissionalId}
        and e.dia_semana = extract(dow from ${data}::date)
    ),
    candidatos as (
      select
        gs as inicio,
        gs + make_interval(mins => ${duracaoMin}::int) as fim
      from periodos,
           generate_series(abre, fecha - make_interval(mins => ${duracaoMin}::int), interval '30 minutes') gs
    )
    select c.inicio
    from candidatos c
    where c.inicio > now()
      and not exists (
        select 1
        from agendamentos a
        where a.profissional_id = ${profissionalId}
          and a.status <> 'cancelado'
          and tstzrange(a.inicio, a.fim) && tstzrange(c.inicio, c.fim)
      )
    order by c.inicio
  `;

  return linhas.map((l) => ({
    inicio: l.inicio.toISOString(),
    hora: horaEmBrasilia(l.inicio),
  }));
}

export type AgendamentoDoDia = {
  id: number;
  inicio: string;
  hora: string;
  horaFim: string;
  cliente: string;
  celular: string;
  servico: string;
  categoria: Categoria;
  preco: number;
  status: "confirmado" | "cancelado" | "concluido";
};

// Agendamentos de um dia ("AAAA-MM-DD"), do horário de Brasília (sem horário de verão: -03:00).
export async function agendamentosDoDia(data: string): Promise<AgendamentoDoDia[]> {
  const inicioDoDia = new Date(`${data}T00:00:00-03:00`);
  const fimDoDia = new Date(inicioDoDia.getTime() + 86_400_000);
  const linhas = await prisma.agendamentos.findMany({
    where: { inicio: { gte: inicioDoDia, lt: fimDoDia } },
    include: { clientes: true, servicos: true },
    orderBy: { inicio: "asc" },
  });
  return linhas.map((a) => ({
    id: Number(a.id),
    inicio: a.inicio.toISOString(),
    hora: horaEmBrasilia(a.inicio),
    horaFim: horaEmBrasilia(a.fim),
    cliente: a.clientes.nome,
    celular: a.clientes.celular,
    servico: a.servicos.nome,
    categoria: a.servicos.categoria === "feminino" ? "feminino" : "masculino",
    preco: Number(a.preco),
    status: a.status === "cancelado" || a.status === "concluido" ? a.status : "confirmado",
  }));
}

export type ResultadoDaBusca = AgendamentoDoDia & { data: string };

// Busca agendamentos pelo nome do cliente (sem diferenciar maiúsculas) ou pelo celular,
// do último mês em diante, em ordem de data.
export async function buscarAgendamentos(termo: string): Promise<ResultadoDaBusca[]> {
  const texto = termo.trim();
  const digitos = texto.replace(/\D/g, "");
  const filtros: { nome?: { contains: string; mode: "insensitive" }; celular?: { contains: string } }[] = [
    { nome: { contains: texto, mode: "insensitive" } },
  ];
  if (digitos.length >= 4) filtros.push({ celular: { contains: digitos } });

  const linhas = await prisma.agendamentos.findMany({
    where: {
      inicio: { gte: new Date(Date.now() - 30 * 86_400_000) },
      clientes: { OR: filtros },
    },
    include: { clientes: true, servicos: true },
    orderBy: { inicio: "asc" },
    take: 50,
  });
  return linhas.map((a) => ({
    id: Number(a.id),
    data: dataEmBrasilia(a.inicio),
    inicio: a.inicio.toISOString(),
    hora: horaEmBrasilia(a.inicio),
    horaFim: horaEmBrasilia(a.fim),
    cliente: a.clientes.nome,
    celular: a.clientes.celular,
    servico: a.servicos.nome,
    categoria: a.servicos.categoria === "feminino" ? "feminino" : "masculino",
    preco: Number(a.preco),
    status: a.status === "cancelado" || a.status === "concluido" ? a.status : "confirmado",
  }));
}

// Celular só com números, com DDD (10 ou 11 dígitos).
export function limparCelular(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  return digitos.length === 10 || digitos.length === 11 ? digitos : null;
}

// A trava `sem_horario_duplicado` do banco recusa horário sobreposto com o código 23P01.
// O Prisma embrulha esse erro, então procuramos o código ou o nome da trava nele.
export function ehHorarioOcupado(erro: unknown) {
  const texto = (() => {
    try {
      return `${String(erro)} ${JSON.stringify(erro)}`;
    } catch {
      return String(erro);
    }
  })();
  return texto.includes("23P01") || texto.includes("sem_horario_duplicado");
}
