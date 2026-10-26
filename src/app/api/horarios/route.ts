import type { NextRequest } from "next/server";
import { buscarProfissional, buscarServico, horariosLivres } from "@/lib/agenda";

// GET /api/horarios?servico=1&data=2026-10-27
export async function GET(request: NextRequest) {
  const servicoId = Number(request.nextUrl.searchParams.get("servico"));
  const data = request.nextUrl.searchParams.get("data") ?? "";

  if (!Number.isInteger(servicoId) || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return Response.json({ erro: "Escolha um serviço e uma data." }, { status: 400 });
  }

  const [servico, profissional] = await Promise.all([buscarServico(servicoId), buscarProfissional()]);
  if (!servico || !profissional) {
    return Response.json({ erro: "Serviço não encontrado." }, { status: 404 });
  }

  const horarios = await horariosLivres(profissional.id, data, servico.duracao_min);
  return Response.json({ horarios });
}
