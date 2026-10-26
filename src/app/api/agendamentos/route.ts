import { prisma } from "@/lib/prisma";
import {
  buscarProfissional,
  buscarServico,
  dataEmBrasilia,
  ehHorarioOcupado,
  horariosLivres,
  limparCelular,
} from "@/lib/agenda";

const HORARIO_OCUPADO = "Esse horário acabou de ser preenchido. Escolha outro, por favor.";

// POST /api/agendamentos  { servicoId, inicio, nome, celular }
export async function POST(request: Request) {
  const corpo = await request.json().catch(() => null);
  const servicoId = Number(corpo?.servicoId);
  const inicio = new Date(String(corpo?.inicio ?? ""));
  const nome = String(corpo?.nome ?? "").trim();
  const celular = limparCelular(String(corpo?.celular ?? ""));

  if (!Number.isInteger(servicoId) || Number.isNaN(inicio.getTime())) {
    return Response.json({ erro: "Escolha o serviço e o horário." }, { status: 400 });
  }
  if (nome.length < 2) {
    return Response.json({ erro: "Digite seu nome." }, { status: 400 });
  }
  if (!celular) {
    return Response.json({ erro: "Digite um celular válido, com DDD." }, { status: 400 });
  }

  const [servico, profissional] = await Promise.all([buscarServico(servicoId), buscarProfissional()]);
  if (!servico || !profissional) {
    return Response.json({ erro: "Serviço não encontrado." }, { status: 404 });
  }

  // Confere de novo no servidor: o horário precisa estar dentro do expediente e ainda livre.
  const livres = await horariosLivres(profissional.id, dataEmBrasilia(inicio), servico.duracao_min);
  if (!livres.some((h) => h.inicio === inicio.toISOString())) {
    return Response.json({ erro: HORARIO_OCUPADO }, { status: 409 });
  }

  const fim = new Date(inicio.getTime() + servico.duracao_min * 60_000);

  try {
    // Quem já agendou antes é reconhecido pelo celular; o nome é atualizado.
    const cliente = await prisma.clientes.upsert({
      where: { celular },
      update: { nome },
      create: { nome, celular },
    });

    const agendamento = await prisma.agendamentos.create({
      data: {
        profissional_id: profissional.id,
        servico_id: servico.id,
        cliente_id: cliente.id,
        inicio,
        fim,
        preco: servico.preco,
      },
    });

    return Response.json({ id: Number(agendamento.id) }, { status: 201 });
  } catch (erro) {
    // Duas pessoas confirmaram o mesmo horário quase juntas: a trava do banco barrou a segunda.
    if (ehHorarioOcupado(erro)) {
      return Response.json({ erro: HORARIO_OCUPADO }, { status: 409 });
    }
    console.error("Erro ao gravar agendamento", erro);
    return Response.json({ erro: "Não foi possível agendar agora. Tente de novo." }, { status: 500 });
  }
}
