import type { Metadata } from "next";
import AgendaProfissional from "@/components/AgendaProfissional";
import { NOME_BARBEARIA } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: `Agenda | ${NOME_BARBEARIA}`,
  robots: { index: false, follow: false }, // não aparece no Google
};

export default function PaginaAgenda() {
  return <AgendaProfissional nome={NOME_BARBEARIA} />;
}
