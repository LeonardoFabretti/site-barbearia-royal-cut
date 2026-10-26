import type { NextRequest } from "next/server";

export const COOKIE_AGENDA = "agenda_acesso";

// A agenda do profissional mostra nome e celular dos clientes.
// - Sem AGENDA_SENHA no .env: fica aberta enquanto roda no computador (npm run dev),
//   mas fica fechada no site publicado, para não expor dados dos clientes.
// - Com AGENDA_SENHA: pede a senha uma vez e lembra pelo cookie.
export function situacaoDaAgenda(request: NextRequest): "liberada" | "pedir-senha" | "sem-senha" {
  const senha = process.env.AGENDA_SENHA;
  if (!senha) return process.env.NODE_ENV === "production" ? "sem-senha" : "liberada";
  return request.cookies.get(COOKIE_AGENDA)?.value === senha ? "liberada" : "pedir-senha";
}

export function respostaBloqueada(situacao: "pedir-senha" | "sem-senha") {
  return Response.json(
    {
      erro:
        situacao === "sem-senha"
          ? "A agenda está fechada: defina AGENDA_SENHA nas variáveis do site para abrir com senha."
          : "Digite a senha da agenda.",
      situacao,
    },
    { status: 401 },
  );
}
