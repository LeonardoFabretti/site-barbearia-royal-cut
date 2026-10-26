import { cookies } from "next/headers";
import { COOKIE_AGENDA } from "@/lib/acessoAgenda";

// POST /api/agenda/entrar  { senha } → guarda a senha num cookie por 30 dias
export async function POST(request: Request) {
  const senhaCerta = process.env.AGENDA_SENHA;
  const corpo = await request.json().catch(() => null);
  if (!senhaCerta || String(corpo?.senha ?? "") !== senhaCerta) {
    return Response.json({ erro: "Senha incorreta." }, { status: 401 });
  }
  (await cookies()).set(COOKIE_AGENDA, senhaCerta, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return Response.json({ ok: true });
}
