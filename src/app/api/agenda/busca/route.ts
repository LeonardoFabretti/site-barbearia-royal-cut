import type { NextRequest } from "next/server";
import { respostaBloqueada, situacaoDaAgenda } from "@/lib/acessoAgenda";
import { buscarAgendamentos } from "@/lib/agenda";

// GET /api/agenda/busca?q=leonardo → agendamentos desse cliente (pelo nome ou celular)
export async function GET(request: NextRequest) {
  const situacao = situacaoDaAgenda(request);
  if (situacao !== "liberada") return respostaBloqueada(situacao);

  const termo = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (termo.length < 2) return Response.json({ resultados: [] });
  return Response.json({ resultados: await buscarAgendamentos(termo) });
}
