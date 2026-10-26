import type { NextRequest } from "next/server";
import { respostaBloqueada, situacaoDaAgenda } from "@/lib/acessoAgenda";
import { prisma } from "@/lib/prisma";

const STATUS_VALIDOS = ["confirmado", "cancelado", "concluido"];

// PATCH /api/agenda/12  { status: "concluido" | "cancelado" | "confirmado" }
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/agenda/[id]">) {
  const situacao = situacaoDaAgenda(request);
  if (situacao !== "liberada") return respostaBloqueada(situacao);

  const { id } = await ctx.params;
  const corpo = await request.json().catch(() => null);
  const status = String(corpo?.status ?? "");
  if (!/^\d+$/.test(id) || !STATUS_VALIDOS.includes(status)) {
    return Response.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  try {
    await prisma.agendamentos.update({ where: { id: BigInt(id) }, data: { status } });
    return Response.json({ ok: true });
  } catch (erro) {
    // Reabrir um cancelado pode bater na trava se o horário já foi pego por outra pessoa.
    const texto = String(erro);
    if (texto.includes("23P01") || texto.includes("sem_horario_duplicado")) {
      return Response.json({ erro: "Esse horário já foi pego por outro cliente." }, { status: 409 });
    }
    console.error("Erro ao atualizar agendamento", erro);
    return Response.json({ erro: "Não foi possível atualizar agora." }, { status: 500 });
  }
}
