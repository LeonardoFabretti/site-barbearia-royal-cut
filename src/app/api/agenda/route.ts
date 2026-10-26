import type { NextRequest } from "next/server";
import { respostaBloqueada, situacaoDaAgenda } from "@/lib/acessoAgenda";
import { agendamentosDoDia } from "@/lib/agenda";

// GET /api/agenda?data=2026-10-28 → agendamentos do dia, para a página /agenda
export async function GET(request: NextRequest) {
  const situacao = situacaoDaAgenda(request);
  if (situacao !== "liberada") return respostaBloqueada(situacao);

  const data = request.nextUrl.searchParams.get("data") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return Response.json({ erro: "Data inválida." }, { status: 400 });
  }
  return Response.json({ agendamentos: await agendamentosDoDia(data) });
}
