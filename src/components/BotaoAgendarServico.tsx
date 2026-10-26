"use client";

import type { ReactNode } from "react";

export const EVENTO_AGENDAR = "agendar-servico";

const ESTILO_PADRAO =
  "mt-6 flex items-center justify-center gap-2 rounded-full border border-dourado/60 py-3 font-semibold text-dourado-texto transition-all hover:bg-dourado hover:text-sobre-dourado";

// Leva até o agendamento, no fim da página, já com este serviço escolhido.
export default function BotaoAgendarServico({
  servicoId,
  className = ESTILO_PADRAO,
  children,
  rotulo,
}: {
  servicoId: number;
  className?: string;
  children?: ReactNode;
  rotulo?: string;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      onClick={() => {
        window.dispatchEvent(new CustomEvent(EVENTO_AGENDAR, { detail: servicoId }));
        document.getElementById("agendar")?.scrollIntoView({ behavior: "smooth" });
      }}
      className={className}
    >
      {children ?? (
        <>
          Agendar este serviço
          <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
        </>
      )}
    </button>
  );
}
